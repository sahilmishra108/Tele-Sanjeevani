# Tele-Sanjeevani Monitoring Platform

A comprehensive telemedicine platform for real-time patient vital signs monitoring using advanced OCR technology and AI-powered analysis.

##  Features

- **Real-Time Camera Monitoring**: Live camera feed with automatic vital signs extraction every 3 seconds
- **Video Processing**: Upload and analyze video files to extract vital signs data
- **Comprehensive Dashboard**: View historical data, trends, and analytics with interactive charts
- **Real-Time Notifications**: Get alerts for abnormal vital signs readings
- **Data Export**: Export monitoring data to CSV for further analysis
- **Responsive Design**: Works seamlessly across desktop and mobile devices

##  Architecture

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Routing**: React Router DOM
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Theming**: Next Themes for dark/light mode support

### Backend
- **Database**: Supabase (PostgreSQL)
- **Real-Time**: Supabase real-time subscriptions
- **Edge Functions**: Deno-based serverless functions
- **OCR Processing**: Advanced text recognition for medical monitor displays

### Key Components

#### Camera Feed (`CameraFeed.tsx`)
- Accesses device camera for live monitoring
- Captures frames every 3 seconds
- Processes images using OCR to extract vital signs
- Displays real-time KPIs and latest readings

#### Video Processor (`VideoProcessor.tsx`)
- Drag-and-drop video file upload
- Extracts frames at regular intervals
- Batch processes frames for vital signs extraction
- Generates CSV reports with timestamped data

#### Dashboard (`Dashboard.tsx`)
- Historical data visualization with charts
- Date range filtering
- Average calculations and trends
- Real-time data table with export functionality
- Vital signs notifications and alerts

#### OCR Engine (`ocr.ts`)
- Integrates with Supabase Edge Functions
- Processes images using predefined Regions of Interest (ROIs)
- Extracts vital signs: HR, Pulse, SpO2, ABP, PAP, EtCO2, awRR
- Handles batch processing for video analysis

##  Database Schema

```sql
CREATE TABLE public.vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hr INTEGER,
  pulse INTEGER,
  spo2 INTEGER,
  abp TEXT,
  pap TEXT,
  etco2 INTEGER,
  awrr INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT NOT NULL CHECK (source IN ('camera', 'video')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

##  Setup and Installation

### Prerequisites
- Node.js 18+
- npm or bun
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vitalview-dash
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

4. **Supabase Setup**
   - Create a new Supabase project
   - Run the migration file to create the vitals table
   - Deploy the Edge Function for OCR processing

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   ```

##  Usage

### Real-Time Monitoring
1. Navigate to the "Camera" tab
2. Click "Start Capture" to begin live monitoring
3. Grant camera permissions when prompted
4. View real-time vital signs extraction and display

### Video Analysis
1. Go to the "Video" tab
2. Drag and drop a video file or click to upload
3. Click "Extract & Download CSV" to process the video
4. View extracted data in the table and download results

### Dashboard Analytics
1. Access the "Dashboard" tab
2. Filter data by date range
3. View charts and trends
4. Export data to CSV for external analysis

##  Data Flow

1. **Camera/Video Input** → Image/Video capture
2. **Frame Extraction** → Convert to base64 images
3. **OCR Processing** → Edge Function processes images using AI
4. **Data Extraction** → Vital signs parsed from medical displays
5. **Database Storage** → Real-time insertion into Supabase
6. **Frontend Updates** → Live dashboard updates via subscriptions
7. **Visualization** → Charts, tables, and notifications

##  UI Components

The application uses Shadcn/ui components built on Radix UI primitives:
- Accordion, Alert Dialog, Avatar, Badge
- Button, Calendar, Card, Carousel
- Checkbox, Collapsible, Command, Context Menu
- Dialog, Drawer, Dropdown Menu, Form
- Hover Card, Input, Label, Menubar
- Navigation Menu, Pagination, Popover
- Progress, Radio Group, Scroll Area, Select
- Separator, Sheet, Skeleton, Slider
- Switch, Table, Tabs, Textarea
- Toast, Toggle, Tooltip, etc.

##  Security & Privacy

- HIPAA-compliant data handling practices
- Secure API key management through Supabase secrets
- Row Level Security enabled on database tables
- Client-side data validation with Zod schemas

##  Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### Supabase Deployment
- Push database migrations
- Deploy Edge Functions
- Configure environment variables

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Acknowledgments

- PATH organization for healthcare technology support
- Supabase for backend infrastructure
- Open source community for React, TypeScript, and UI libraries
