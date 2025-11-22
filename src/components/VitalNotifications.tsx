import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, AlertTriangle, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VitalRecord {
  created_at: string;
  hr: number | null;
  pulse: number | null;
  spo2: number | null;
  etco2: number | null;
  abp: string | null;
  pap: string | null;
  awrr: number | null;
  patient_id?: number;
}

interface PatientInfo {
  patient_id: number;
  patient_name: string;
}

interface VitalAlert {
  id: string;
  type: 'high' | 'low';
  vital: string;
  value: string | number;
  timestamp: string;
  severity: 'warning' | 'critical';
}

// Normal ranges for vitals based on medical standards
const VITAL_RANGES = {
  HR: { min: 60, max: 100, low: 60, high: 100 },
  Pulse: { min: 60, max: 100, low: 60, high: 100 },
  SpO2: { min: 95, max: 100, low: 90, high: 100 }, // 100% is max, no high alert
  ABP_Sys: { min: 90, max: 120, low: 90, high: 120 },
  PAP_Dia: { min: 4, max: 12, low: 4, high: 12 },
  EtCO2: { min: 35, max: 45, low: 35, high: 45 },
  awRR: { min: 12, max: 20, low: 12, high: 20 },
};

interface VitalNotificationsProps {
  vitals: VitalRecord[];
  compact?: boolean;
  patient?: PatientInfo | null;
}

const VitalNotifications = ({ vitals, compact = false, patient }: VitalNotificationsProps) => {
  const [alerts, setAlerts] = useState<VitalAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const alarmAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const previousAlertIdsRef = React.useRef<Set<string>>(new Set());

  // Audio removed - no alarm sound

  useEffect(() => {
    if (vitals.length === 0) return;

    const latestVital = vitals[vitals.length - 1];
    const newAlerts: VitalAlert[] = [];

    // Check HR (< 60 low, 60-100 normal, > 100 high)
    if (latestVital.hr !== null) {
      if (latestVital.hr < VITAL_RANGES.HR.low || latestVital.hr > VITAL_RANGES.HR.high) {
        newAlerts.push({
          id: `hr-${latestVital.created_at}`,
          type: latestVital.hr < VITAL_RANGES.HR.low ? 'low' : 'high',
          vital: 'HR',
          value: latestVital.hr,
          timestamp: latestVital.created_at,
          severity: latestVital.hr < 50 || latestVital.hr > 120 ? 'critical' : 'warning',
        });
      }
    }

    // Check Pulse (< 60 low, 60-100 normal, > 100 high)
    if (latestVital.pulse !== null) {
      if (latestVital.pulse < VITAL_RANGES.Pulse.low || latestVital.pulse > VITAL_RANGES.Pulse.high) {
        newAlerts.push({
          id: `pulse-${latestVital.created_at}`,
          type: latestVital.pulse < VITAL_RANGES.Pulse.low ? 'low' : 'high',
          vital: 'Pulse',
          value: latestVital.pulse,
          timestamp: latestVital.created_at,
          severity: latestVital.pulse < 50 || latestVital.pulse > 120 ? 'critical' : 'warning',
        });
      }
    }

    // Check SpO2 (< 90 low, 95-100 normal, 100% is max - no high alert)
    if (latestVital.spo2 !== null) {
      if (latestVital.spo2 < VITAL_RANGES.SpO2.low) {
        newAlerts.push({
          id: `spo2-${latestVital.created_at}`,
          type: 'low',
          vital: 'SpO2',
          value: latestVital.spo2,
          timestamp: latestVital.created_at,
          severity: latestVital.spo2 < 85 ? 'critical' : 'warning',
        });
      }
    }

    // Check ABP Sys (< 90 low, 90-120 normal, > 120 high)
    if (latestVital.abp) {
      const abpSys = parseInt(latestVital.abp.split('/')[0]);
      if (!isNaN(abpSys)) {
        if (abpSys < VITAL_RANGES.ABP_Sys.low || abpSys > VITAL_RANGES.ABP_Sys.high) {
          newAlerts.push({
            id: `abp-${latestVital.created_at}`,
            type: abpSys < VITAL_RANGES.ABP_Sys.low ? 'low' : 'high',
            vital: 'ABP Sys',
            value: abpSys,
            timestamp: latestVital.created_at,
            severity: abpSys < 70 || abpSys > 180 ? 'critical' : 'warning',
          });
        }
      }
    }

    // Check PAP Dia (< 4 low, 4-12 normal, > 12 high)
    if (latestVital.pap) {
      const papDia = parseInt(latestVital.pap.split('/')[1]);
      if (!isNaN(papDia)) {
        if (papDia < VITAL_RANGES.PAP_Dia.low || papDia > VITAL_RANGES.PAP_Dia.high) {
          newAlerts.push({
            id: `pap-${latestVital.created_at}`,
            type: papDia < VITAL_RANGES.PAP_Dia.low ? 'low' : 'high',
            vital: 'PAP Dia',
            value: papDia,
            timestamp: latestVital.created_at,
            severity: papDia < 2 || papDia > 20 ? 'critical' : 'warning',
          });
        }
      }
    }

    // Check EtCO2 (< 35 low, 35-45 normal, > 45 high)
    if (latestVital.etco2 !== null) {
      if (latestVital.etco2 < VITAL_RANGES.EtCO2.low || latestVital.etco2 > VITAL_RANGES.EtCO2.high) {
        newAlerts.push({
          id: `etco2-${latestVital.created_at}`,
          type: latestVital.etco2 < VITAL_RANGES.EtCO2.low ? 'low' : 'high',
          vital: 'EtCO2',
          value: latestVital.etco2,
          timestamp: latestVital.created_at,
          severity: latestVital.etco2 < 25 || latestVital.etco2 > 55 ? 'critical' : 'warning',
        });
      }
    }

    // Check awRR (< 12 low, 12-20 normal, > 20 high)
    if (latestVital.awrr !== null) {
      if (latestVital.awrr < VITAL_RANGES.awRR.low || latestVital.awrr > VITAL_RANGES.awRR.high) {
        newAlerts.push({
          id: `awrr-${latestVital.created_at}`,
          type: latestVital.awrr < VITAL_RANGES.awRR.low ? 'low' : 'high',
          vital: 'awRR',
          value: latestVital.awrr,
          timestamp: latestVital.created_at,
          severity: latestVital.awrr < 8 || latestVital.awrr > 25 ? 'critical' : 'warning',
        });
      }
    }

    // Update alerts, keeping only the latest for each vital type
    setAlerts((prevAlerts) => {
      const vitalTypes = new Set(newAlerts.map(a => a.vital));
      const filteredPrev = prevAlerts.filter(a => !vitalTypes.has(a.vital));
      const updatedAlerts = [...filteredPrev, ...newAlerts].filter(a => !dismissedAlerts.has(a.id));

      // Play alarm if new alerts appeared
      const newAlertIds = new Set(updatedAlerts.map(a => a.id));
      const hasNewAlerts = Array.from(newAlertIds).some(id => !previousAlertIdsRef.current.has(id));

      if (hasNewAlerts && updatedAlerts.length > 0) {
        // Play audio if available
        if (alarmAudioRef.current) {
          alarmAudioRef.current.play().catch(() => { });
        }

        // Trigger Toast Notifications for new alerts
        updatedAlerts.forEach(alert => {
          if (newAlertIds.has(alert.id)) {
            toast(
              <div className="flex flex-col gap-1.5">
                {patient && (
                  <div className="text-xs font-semibold text-muted-foreground border-b pb-1">
                    Patient: {patient.patient_name} (ID: #{patient.patient_id})
                  </div>
                )}
                <span className="font-bold flex items-center gap-2">
                  {alert.severity === 'critical' ? 'CRITICAL ALERT' : 'Vital Warning'}
                  {alert.severity === 'critical' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                </span>
                <span>
                  {alert.vital} is {alert.type === 'high' ? 'High' : 'Low'}: <strong>{alert.value}</strong>
                </span>
              </div>,
              {
                duration: alert.severity === 'critical' ? 10000 : 5000,
                position: 'top-right',
                style: {
                  borderLeft: alert.severity === 'critical' ? '4px solid red' : '4px solid orange',
                }
              }
            );
          }
        });
      }

      previousAlertIdsRef.current = newAlertIds;
      return updatedAlerts;
    });
  }, [vitals, dismissedAlerts]);

  const dismissAlert = (id: string) => {
    setDismissedAlerts((prev) => new Set([...prev, id]));
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const activeAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));

  if (activeAlerts.length === 0) {
    return (
      <div className={compact ? "p-4" : "p-6"}>
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className={compact ? "text-lg font-bold text-foreground" : "text-xl font-bold text-foreground"}>Vital Alerts</h2>
        </div>
        <p className="text-sm text-muted-foreground">All vitals are normal</p>
      </div>
    );
  }

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className={compact ? "text-lg font-bold text-foreground" : "text-xl font-bold text-foreground"}>Vital Alerts</h2>
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
            {activeAlerts.length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {activeAlerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.severity === 'critical' ? 'destructive' : 'default'}
            className="relative"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {alert.severity === 'critical' ? (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <div className="flex-1">
                  <AlertTitle className="flex items-center gap-2">
                    {alert.vital} - {alert.type === 'high' ? 'High' : 'Low'}
                    {alert.severity === 'critical' && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-destructive text-destructive-foreground">
                        CRITICAL
                      </span>
                    )}
                  </AlertTitle>
                  <AlertDescription className="mt-1">
                    <div className="flex items-center gap-2">
                      {alert.type === 'high' ? (
                        <TrendingUp className="w-4 h-4 text-destructive" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <span>
                        Value: <strong>{alert.value}</strong> at{' '}
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </AlertDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => dismissAlert(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Alert>
        ))}
      </div>
    </>
  );

  if (compact) {
    return <div className="p-4">{content}</div>;
  }

  return <Card className="p-6 bg-card border-border">{content}</Card>;
};

export default VitalNotifications;

