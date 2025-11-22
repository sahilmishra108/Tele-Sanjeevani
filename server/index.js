import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createWorker } from 'tesseract.js';
import { HfInference } from '@huggingface/inference';
import sharp from 'sharp';

import nodemailer from 'nodemailer';

dotenv.config();

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use host/port for other providers
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("Email service not configured (skipping):", error.message);
  } else {
    console.log("Email service is ready to take our messages");
  }
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vitalview',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('join-patient', (patientId) => {
    socket.join(`patient-${patientId}`);
    console.log(`Client joined patient-${patientId}`);
  });
});

// --- OCR & AI Logic ---

// Primary AI-based OCR extraction (Hugging Face)
async function extractWithPrimaryAI(imageBase64, rois) {
  try {
    if (!process.env.HUGGING_FACE_API_KEY) {
      console.warn('HUGGING_FACE_API_KEY not set; skipping primary AI extraction.');
      return null;
    }

    const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);
    const model = "Qwen/Qwen2.5-VL-7B-Instruct";

    // Ensure base64 has the prefix for the API or strip it if sending as raw buffer?
    // The HF SDK chatCompletion with image_url supports data URIs.
    // imageBase64 usually comes in as "data:image/jpeg;base64,..." from the frontend.

    const prompt = `Analyze this medical monitor screen. Extract the following vital signs: HR, Pulse, SpO2, ABP (systolic/diastolic/mean), PAP (systolic/diastolic/mean), EtCO2, awRR.
    
    The Regions of Interest (ROIs) provided are:
    ${rois.map(r => `${r.label}: ${JSON.stringify(r)}`).join('\n')}
    
    Return ONLY a JSON object with keys: HR, Pulse, SpO2, ABP, PAP, EtCO2, awRR.
    Values should be numbers, or strings for BP (e.g., "120/80/90"). Use null if not visible. Do not include markdown formatting like \`\`\`json.`;

    const response = await hf.chatCompletion({
      model: model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const text = response.choices[0].message.content;
    console.log("Hugging Face Raw Response:", text);

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Hugging Face OCR Error:", error);
    return null;
  }
}

// Intelligent selection: Choose most accurate values from both OCR sources
function selectMostAccurate(aiRes, tesseractRes) {
  const finalVitals = {};

  // Helper function to validate vital sign values
  const isValidValue = (key, value) => {
    if (!value || value === null) return false;

    // Define reasonable ranges for each vital
    const ranges = {
      HR: { min: 30, max: 200 },
      Pulse: { min: 30, max: 200 },
      SpO2: { min: 70, max: 100 },
      EtCO2: { min: 10, max: 80 },
      awRR: { min: 5, max: 40 }
    };

    if (ranges[key]) {
      const numValue = parseInt(value);
      return numValue >= ranges[key].min && numValue <= ranges[key].max;
    }

    return true; // For ABP, PAP - accept if present
  };

  // Merge both results, preferring valid AI results, fallback to Tesseract
  const allKeys = new Set([
    ...Object.keys(aiRes || {}),
    ...Object.keys(tesseractRes || {})
  ]);

  allKeys.forEach(key => {
    const aiValue = aiRes?.[key];
    const tesseractValue = tesseractRes?.[key];

    // Prefer AI if valid
    if (isValidValue(key, aiValue)) {
      finalVitals[key] = aiValue;
    }
    // Fallback to Tesseract if AI invalid or missing
    else if (isValidValue(key, tesseractValue)) {
      finalVitals[key] = tesseractValue;
    }
    // If both invalid, use AI (might be null)
    else {
      finalVitals[key] = aiValue || tesseractValue || null;
    }
  });

  return finalVitals;
}

async function extractWithTesseract(imageBase64, rois) {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, 'base64');
    const metadata = await sharp(imgBuffer).metadata();

    const worker = await createWorker('eng');
    const results = {};

    for (const roi of rois) {
      // Convert relative (0-1) to absolute pixels
      const left = Math.floor(roi.x * metadata.width);
      const top = Math.floor(roi.y * metadata.height);
      const width = Math.floor(roi.w * metadata.width);
      const height = Math.floor(roi.h * metadata.height);

      // Ensure valid bounds
      if (width > 0 && height > 0) {
        const { data: { text } } = await worker.recognize(imgBuffer, {
          rectangle: { left, top, width, height }
        });
        // Clean text (keep numbers and /)
        const cleanText = text.replace(/[^0-9\/]/g, '');
        results[roi.label] = cleanText || null;
      }
    }

    await worker.terminate();

    // Map ROI labels to standard keys if needed
    // Assuming ROI labels match keys: HR, Pulse, SpO2, ABP, PAP, EtCO2, awRR
    return results;
  } catch (error) {
    console.error("Tesseract Error:", error);
    return null;
  }
}

// --- Routes ---

app.get('/api/patients', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM patients');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/patients', async (req, res) => {
  try {
    const { patient_name, age, gender, diagnosis, admission_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO patients (patient_name, age, gender, diagnosis, admission_date) VALUES (?, ?, ?, ?, ?)',
      [patient_name, age, gender, diagnosis, admission_date]
    );
    res.json({ id: result.insertId, message: 'Patient added successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM patients WHERE patient_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const patientId = req.params.id;

    // Check if patient exists
    const [patient] = await pool.query('SELECT * FROM patients WHERE patient_id = ?', [patientId]);
    if (patient.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Delete patient (CASCADE will automatically delete vitals and update beds)
    await pool.query('DELETE FROM patients WHERE patient_id = ?', [patientId]);

    res.json({
      success: true,
      message: `Patient ${patient[0].patient_name} and all associated data deleted successfully`
    });
  } catch (e) {
    console.error('Error deleting patient:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/beds', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT beds.*, patients.patient_name 
      FROM beds 
      LEFT JOIN patients ON beds.patient_id = patients.patient_id
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/send-alert', async (req, res) => {
  const { email, phone, alert } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone required' });
  }

  try {
    if (email) {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[SIMULATION] Sending email to ${email}:`, alert);
        return res.json({ success: true, message: 'Email simulated (configure credentials to send real email)' });
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `URGENT: Vital Alert - ${alert.vital} ${alert.type.toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: ${alert.severity === 'critical' ? '#d32f2f' : '#f57c00'};">
              ${alert.severity === 'critical' ? 'CRITICAL ALERT' : 'Vital Warning'}
            </h2>
            <p><strong>Patient ID:</strong> #${alert.patientId}</p>
            <p><strong>Vital Sign:</strong> ${alert.vital}</p>
            <p><strong>Status:</strong> ${alert.type.toUpperCase()}</p>
            <p><strong>Value:</strong> <span style="font-size: 1.2em; font-weight: bold;">${alert.value}</span></p>
            <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
            <hr>
            <p style="font-size: 0.8em; color: #666;">
              This is an automated message from VitalView Tele-Sanjeevani.
              Please check the dashboard immediately.
            </p>
            <a href="http://localhost:5173/dashboard?patientId=${alert.patientId}" 
               style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
              View Dashboard
            </a>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${email}`);
    }

    // SMS logic would go here (e.g., Twilio)
    if (phone) {
      console.log(`[SIMULATION] Sending SMS to ${phone}:`, alert);
    }

    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/extract-vitals', async (req, res) => {
  const { imageBase64, rois, patientId } = req.body;

  console.log("Starting Parallel OCR...");

  const [aiRes, tesseractRes] = await Promise.all([
    extractWithPrimaryAI(imageBase64, rois),
    extractWithTesseract(imageBase64, rois)
  ]);

  console.log("Hugging Face OCR:", aiRes);
  console.log("Tesseract:", tesseractRes);

  // Intelligent Merge Strategy: Choose most accurate values
  const finalVitals = selectMostAccurate(aiRes, tesseractRes);

  // Fallback logic handled in selectMostAccurate function

  // Save to DB if patientId is present
  if (patientId && finalVitals) {
    // ... save logic ...
    // But usually the frontend confirms before saving.
    // We'll just return the data for now.
  }

  res.json({ vitals: finalVitals });
});

app.post('/api/vitals', async (req, res) => {
  try {
    // Check if request body is an array (batch insert from video) or single object (from camera)
    const isArray = Array.isArray(req.body);
    const vitalsArray = isArray ? req.body : [req.body];

    const insertedVitals = [];

    for (const vitalData of vitalsArray) {
      const { patient_id, hr, pulse, spo2, abp, pap, etco2, awrr, source, created_at } = vitalData;

      // Use provided created_at or current time, convert to MySQL datetime format
      const isoTimestamp = created_at || new Date().toISOString();
      const timestamp = isoTimestamp.replace('T', ' ').replace('Z', '').substring(0, 19);

      const query = `INSERT INTO vitals (patient_id, hr, pulse, spo2, abp, pap, etco2, awrr, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await pool.query(query, [patient_id, hr, pulse, spo2, abp, pap, etco2, awrr, source, timestamp]);

      const newVital = {
        vital_id: result.insertId,
        patient_id,
        hr,
        pulse,
        spo2,
        abp,
        pap,
        etco2,
        awrr,
        source,
        created_at: timestamp
      };

      insertedVitals.push(newVital);

      // Emit to specific patient room
      if (patient_id) {
        io.to(`patient-${patient_id}`).emit('vital-update', newVital);
      }
      // Also emit to global for overview
      io.emit('vital-update-global', newVital);
    }

    // Return single object or array based on input
    res.json({
      success: true,
      vital: isArray ? insertedVitals : insertedVitals[0],
      count: insertedVitals.length
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/vitals', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const [rows] = await pool.query('SELECT * FROM vitals ORDER BY created_at DESC LIMIT ?', [limit]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/vitals/:patientId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vitals WHERE patient_id = ? ORDER BY created_at DESC LIMIT 100', [req.params.patientId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
