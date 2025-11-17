import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/Dashboard";
import CameraFeed from "@/components/CameraFeed";
import VideoProcessor from "@/components/VideoProcessor";
import NotificationBell from "@/components/NotificationBell";
import { Activity, Camera, FileVideo } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const [defaultTab, setDefaultTab] = useState("dashboard");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["dashboard", "camera", "video"].includes(tab)) {
      setDefaultTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-teal-50/20 animate-fade-in">
      {/* Top-left logo */}
      <div className="absolute top-4 left-4 z-10 animate-slide-in-right">
        <Link to="/" className="transition-transform hover:scale-105">
          <img 
            src="/PATH_Logo_Color (1).png" 
            alt="PATH Logo" 
            className="h-12 w-auto"
          />
        </Link>
      </div>

      {/* Top-right notification bell and home */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3 animate-slide-in-right">
        <NotificationBell />
        <Link to="/">
          <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50 transition-all hover:scale-105">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
      </div>

      <div className="p-6 pt-20">
        <div className="max-w-7xl mx-auto space-y-6">
        <Tabs defaultValue={defaultTab} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <FileVideo className="w-4 h-4" />
              Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="camera" className="space-y-6">
            <CameraFeed />
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            <VideoProcessor />
          </TabsContent>
        </Tabs>

          {/* Footer */}
          <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border mt-8">
            <p>Powered by <strong>PATH</strong></p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

