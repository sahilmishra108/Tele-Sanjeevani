import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Mail, Smartphone, BellRing } from "lucide-react";
import { toast } from "sonner";
import { addManualAlert } from "./PatientVitalMonitor";
import { useSearchParams } from "react-router-dom";

export const NotificationSettings = () => {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const savedEmail = localStorage.getItem("notify_email");
        const savedPhone = localStorage.getItem("notify_phone");
        if (savedEmail) setEmail(savedEmail);
        if (savedPhone) setPhone(savedPhone);
    }, []);

    const handleSave = () => {
        localStorage.setItem("notify_email", email);
        localStorage.setItem("notify_phone", phone);
        toast.success("Notification settings saved");
        setIsOpen(false);
    };

    const handleTestAlert = () => {
        const patientId = searchParams.get("patientId");
        const pid = patientId ? parseInt(patientId) : 1;

        addManualAlert(pid, {
            id: `test-${Date.now()}`,
            patientId: pid,
            vital: 'HR',
            value: 145,
            type: 'high',
            severity: 'critical',
            timestamp: new Date().toISOString()
        });

        toast.success("Test alert sent! Check the notification bell.");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Remote Notifications</DialogTitle>
                    <DialogDescription>
                        Configure where you want to receive alerts when you are away from the dashboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={handleTestAlert} className="gap-2 text-xs">
                            <BellRing className="h-3 w-3" />
                            Simulate Test Alert
                        </Button>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <div className="col-span-3 relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="doctor@hospital.com"
                                className="pl-9"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            Phone
                        </Label>
                        <div className="col-span-3 relative">
                            <Smartphone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+1234567890"
                                className="pl-9"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground col-span-4 pl-4">
                        * Notifications will be sent via email. SMS support requires carrier gateway configuration.
                    </p>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
