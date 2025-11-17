import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ROI {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  unit?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, rois } = await req.json();
    
    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    // Get Gemini API key from environment variables (keep it confidential)
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured. Please set it in your Supabase project secrets.');
    }

    // Build detailed prompt with ROI information
    const roiDescriptions = rois.map((roi: ROI) => 
      `${roi.label}: located at coordinates (${(roi.x * 100).toFixed(0)}%, ${(roi.y * 100).toFixed(0)}%) with dimensions ${(roi.width * 100).toFixed(0)}% x ${(roi.height * 100).toFixed(0)}%${roi.unit ? `, unit: ${roi.unit}` : ''}`
    ).join('\n');

    const prompt = `You are analyzing a medical patient monitor display. Extract the exact numerical values for the following vital signs from their specific screen locations:

${roiDescriptions}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no explanations or markdown
- Extract ONLY the numeric values you can clearly see
- For blood pressure readings (ABP, PAP), return as "systolic/diastolic/mean" format (e.g., "120/80/93")
- If a value is not clearly visible, use null
- Be precise with the numbers shown on the display

Return JSON format:
{
  "HR": number or null,
  "Pulse": number or null,
  "SpO2": number or null,
  "ABP": "sys/dia/mean" or null,
  "PAP": "sys/dia/mean" or null,
  "EtCO2": number or null,
  "awRR": number or null
}`;

    // Convert base64 image for Gemini API (remove data URL prefix if present)
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    console.log('Sending request to Gemini API...');

    // Use Gemini API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
            responseMimeType: 'application/json'
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      console.error('No content in Gemini response:', JSON.stringify(data, null, 2));
      throw new Error('No content in Gemini API response');
    }

    // Parse the JSON response, cleaning any markdown formatting
    let vitalsData;
    try {
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      vitalsData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse vitals data:', content);
      throw new Error('Failed to parse vitals from response');
    }

    return new Response(JSON.stringify({ vitals: vitalsData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-vitals function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});