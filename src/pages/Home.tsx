import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Camera, FileVideo, ArrowRight, Stethoscope, Check } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40">
      {/* Header with PATH Logo */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm animate-fade-in">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 animate-slide-in-right">
            <img
              src="/PATH_Logo_Color (1).png"
              alt="PATH Logo"
              className="h-10 w-auto transition-transform hover:scale-105"
            />
          </div>
          <Link to="/patients" className="animate-slide-in-right group" style={{ animationDelay: '0.1s' }}>
            <Button className="bg-[#0066CC] hover:bg-[#0052A3] text-white shadow-md hover:shadow-lg transition-all hover:scale-105">
              Patient Records
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Tele-ICU Style Banner Section */}
      <div className="pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative w-full h-[600px] md:h-[700px] rounded-3xl overflow-hidden mb-12 shadow-2xl border-2 border-white/20 animate-scale-in">
            {/* Split Layout Container */}
            <div className="grid md:grid-cols-2 h-full">
              {/* Left Section - Text Content */}
              <div className="relative bg-gradient-to-br from-[#1e3a5f] via-[#1e4a6f] to-[#1e3a5f] p-8 md:p-12 lg:p-16 flex flex-col justify-center overflow-hidden">
                {/* Grid Pattern Background */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px'
                }}></div>

                {/* Star Pattern Background */}
                <div className="absolute inset-0 opacity-15" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }}></div>

                {/* Content */}
                <div className="relative z-10 animate-fade-in-up">
                  {/* Title */}
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-tight">
                    Tele-Sanjeevani
                  </h1>
                  <div className="mb-6">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#4fc3f7] mb-2">
                      Monitoring
                    </h2>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#4fc3f7]">
                      Platform
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="text-white/90 text-base md:text-lg lg:text-xl mb-8 leading-relaxed max-w-lg">
                    Advanced telemedicine infrastructure delivering real-time vital signs monitoring and comprehensive analytics for critical care environments.
                  </p>

                  {/* View Patient Records Button */}
                  <Link to="/patients" className="inline-block mb-10">
                    <Button size="lg" className="bg-white text-[#1e3a5f] hover:bg-white/90 text-base md:text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 group">
                      <FileVideo className="w-5 h-5 mr-2" />
                      View Patient Records
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>

                  {/* Features with Checkmarks */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-base md:text-lg font-medium">Advanced OCR Technology</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-base md:text-lg font-medium">Real-time Data Extraction</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Hospital Image */}
              <div className="relative hidden md:block">
                <img
                  src="/Gemini_Generated_Image_6xwqr56xwqr56xwq.png"
                  alt="ICU Monitoring Room"
                  className="w-full h-full object-cover"
                />
                {/* Subtle overlay for better text contrast if needed */}
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1e3a5f]/10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6 animate-scale-in">
              <Stethoscope className="w-4 h-4 text-[#0066CC]" />
              <span className="text-sm font-medium text-[#0066CC]">Healthcare Technology</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 max-w-3xl mx-auto mb-6 leading-tight">
              Patient-Centric Vital Signs Monitoring
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Access comprehensive patient records with real-time vital signs monitoring, video analysis, and detailed health analytics—all organized by patient.
            </p>
          </div>

          {/* Single Patient Records Card */}
          <div className="flex justify-center mt-20">
            <Link to="/patients" className="block max-w-md w-full">
              <Card className="p-10 hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 bg-white hover:border-[#0066CC] group cursor-pointer animate-fade-in-up">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0066CC] to-[#00897B] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg mx-auto">
                  <FileVideo className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4 text-center">Patient Records</h3>
                <p className="text-slate-600 leading-relaxed mb-6 text-center">
                  View all patients and access their comprehensive dashboards including real-time monitoring, video analysis, and vital signs history.
                </p>
                <div className="flex items-center justify-center text-[#0066CC] font-semibold text-lg group-hover:translate-x-2 transition-transform">
                  View All Patients
                  <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </Card>
            </Link>
          </div>


        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 mt-24 border-t-4 border-[#0066CC]">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-300 text-base">
            Powered by <strong className="text-white font-semibold">PATH</strong>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

