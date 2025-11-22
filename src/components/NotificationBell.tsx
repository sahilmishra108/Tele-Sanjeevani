import { useEffect, useState } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    getPatientNotifications,
    getAllNotifications,
    subscribeToNotifications,
    clearPatientNotifications,
    VitalAlert
} from './PatientVitalMonitor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { NotificationSettings } from './NotificationSettings';

interface NotificationBellProps {
    patientId?: string | null;
}

const NotificationBell = ({ patientId }: NotificationBellProps) => {
    const [notifications, setNotifications] = useState<VitalAlert[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const updateNotifications = () => {
            if (patientId) {
                const pid = parseInt(patientId);
                if (!isNaN(pid)) {
                    setNotifications(getPatientNotifications(pid));
                }
            } else {
                setNotifications(getAllNotifications());
            }
        };

        // Initial load
        updateNotifications();

        // Subscribe to updates
        const unsubscribe = subscribeToNotifications(updateNotifications);

        return () => { unsubscribe(); };
    }, [patientId]);

    const handleClear = () => {
        if (patientId) {
            const pid = parseInt(patientId);
            if (!isNaN(pid)) {
                clearPatientNotifications(pid);
            }
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && (
                        <Badge
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600"
                        >
                            {notifications.length}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                    <div className="flex items-center gap-2">
                        <NotificationSettings />
                        {patientId && notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                onClick={handleClear}
                            >
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            {notifications.map((alert) => (
                                <Alert
                                    key={alert.id}
                                    variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                                    className="relative"
                                >
                                    <div className="flex items-start gap-3">
                                        {alert.severity === 'critical' ? (
                                            <AlertTriangle className="w-4 h-4 mt-1" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 mt-1 text-yellow-500" />
                                        )}
                                        <div className="flex-1 space-y-1">
                                            <AlertTitle className="text-sm font-medium flex items-center gap-2">
                                                {alert.vital}
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${alert.type === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {alert.type.toUpperCase()}
                                                </span>
                                            </AlertTitle>
                                            <AlertDescription className="text-xs">
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="font-bold">{alert.value}</span>
                                                    <span className="text-muted-foreground">
                                                        {new Date(alert.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </AlertDescription>
                                        </div>
                                    </div>
                                </Alert>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
