import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    getPatientNotifications,
    subscribeToNotifications,
    clearPatientNotifications,
    VitalAlert
} from './PatientVitalMonitor';

interface DashboardAlertsProps {
    patientId: string | null;
}

const DashboardAlerts = ({ patientId }: DashboardAlertsProps) => {
    const [alerts, setAlerts] = useState<VitalAlert[]>([]);

    useEffect(() => {
        if (!patientId) return;
        const pid = parseInt(patientId);
        if (isNaN(pid)) return;

        const updateAlerts = () => {
            setAlerts(getPatientNotifications(pid));
        };

        // Initial load
        updateAlerts();

        // Subscribe to updates
        const unsubscribe = subscribeToNotifications(updateAlerts);
        return () => { unsubscribe(); };
    }, [patientId]);

    const handleDismiss = (patientId: number) => {
        clearPatientNotifications(patientId);
    };

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-3 mb-6 animate-fade-in-down">
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                    className={`border-l-4 ${alert.severity === 'critical' ? 'border-l-red-600 bg-red-50' : 'border-l-orange-500 bg-orange-50'} shadow-sm relative pr-12`}
                >
                    <div className="flex items-start gap-3">
                        {alert.severity === 'critical' ? (
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <AlertTitle className={`font-bold flex items-center gap-2 ${alert.severity === 'critical' ? 'text-red-900' : 'text-orange-900'}`}>
                                {alert.severity === 'critical' ? 'CRITICAL ALERT' : 'WARNING'}
                                <span className="text-xs font-normal opacity-80 px-2 py-0.5 rounded-full bg-white/50 border border-black/5">
                                    Patient ID: #{alert.patientId}
                                </span>
                            </AlertTitle>
                            <AlertDescription className={`font-medium mt-1 ${alert.severity === 'critical' ? 'text-red-800' : 'text-orange-800'}`}>
                                <span className="font-bold">{alert.vital}</span> is {alert.type.toUpperCase()}
                                <span className="mx-2 px-2 py-0.5 bg-white/50 rounded font-mono font-bold">
                                    {alert.value}
                                </span>
                                <span className="text-xs opacity-70 font-normal">
                                    at {new Date(alert.timestamp).toLocaleTimeString()}
                                </span>
                            </AlertDescription>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 hover:bg-black/5"
                        onClick={() => handleDismiss(alert.patientId)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            ))}
        </div>
    );
};

export default DashboardAlerts;
