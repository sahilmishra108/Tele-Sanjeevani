import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface VitalRecord {
    patient_id?: number;
    created_at: string;
    hr: number | null;
    pulse: number | null;
    spo2: number | null;
    etco2: number | null;
    abp: string | null;
    pap: string | null;
    awrr: number | null;
}

interface PatientInfo {
    patient_id: number;
    patient_name: string;
}

export interface VitalAlert {
    id: string;
    patientId: number;
    vital: string;
    value: string | number;
    type: 'high' | 'low';
    severity: 'warning' | 'critical';
    timestamp: string;
}

interface PatientVitalMonitorProps {
    vitals: VitalRecord[];
    patient: PatientInfo | null;
}

// Normal ranges for vitals based on medical standards
const VITAL_RANGES = {
    HR: { low: 60, high: 100, criticalLow: 50, criticalHigh: 120 },
    Pulse: { low: 60, high: 100, criticalLow: 50, criticalHigh: 120 },
    SpO2: { low: 90, high: 100, criticalLow: 85, criticalHigh: 100 },
    ABP_Sys: { low: 90, high: 120, criticalLow: 70, criticalHigh: 180 },
    PAP_Dia: { low: 4, high: 12, criticalLow: 2, criticalHigh: 20 },
    EtCO2: { low: 35, high: 45, criticalLow: 25, criticalHigh: 55 },
    awRR: { low: 12, high: 20, criticalLow: 8, criticalHigh: 25 },
};

// Store notifications per patient in memory
const patientNotifications = new Map<number, VitalAlert[]>();
const listeners = new Set<() => void>();

export const subscribeToNotifications = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

const notifyListeners = () => {
    listeners.forEach(listener => listener());
};

const PatientVitalMonitor = ({ vitals, patient }: PatientVitalMonitorProps) => {
    const previousVitalsRef = useRef<Set<string>>(new Set());
    const lastCheckTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        if (!patient || vitals.length === 0) return;

        const latestVital = vitals[vitals.length - 1];
        const patientId = patient.patient_id;

        // Only check vitals that are newer than our last check
        const vitalTime = new Date(latestVital.created_at).getTime();
        if (vitalTime <= lastCheckTimeRef.current) return;

        lastCheckTimeRef.current = vitalTime;

        const newAlerts: VitalAlert[] = [];

        // Check HR
        if (latestVital.hr !== null) {
            if (latestVital.hr < VITAL_RANGES.HR.low || latestVital.hr > VITAL_RANGES.HR.high) {
                const alertId = `${patientId}-hr-${latestVital.created_at}`;
                if (!previousVitalsRef.current.has(alertId)) {
                    newAlerts.push({
                        id: alertId,
                        patientId,
                        vital: 'HR',
                        value: latestVital.hr,
                        type: latestVital.hr < VITAL_RANGES.HR.low ? 'low' : 'high',
                        severity: latestVital.hr < VITAL_RANGES.HR.criticalLow || latestVital.hr > VITAL_RANGES.HR.criticalHigh ? 'critical' : 'warning',
                        timestamp: latestVital.created_at,
                    });
                    previousVitalsRef.current.add(alertId);
                }
            }
        }

        // Check Pulse
        if (latestVital.pulse !== null) {
            if (latestVital.pulse < VITAL_RANGES.Pulse.low || latestVital.pulse > VITAL_RANGES.Pulse.high) {
                const alertId = `${patientId}-pulse-${latestVital.created_at}`;
                if (!previousVitalsRef.current.has(alertId)) {
                    newAlerts.push({
                        id: alertId,
                        patientId,
                        vital: 'Pulse',
                        value: latestVital.pulse,
                        type: latestVital.pulse < VITAL_RANGES.Pulse.low ? 'low' : 'high',
                        severity: latestVital.pulse < VITAL_RANGES.Pulse.criticalLow || latestVital.pulse > VITAL_RANGES.Pulse.criticalHigh ? 'critical' : 'warning',
                        timestamp: latestVital.created_at,
                    });
                    previousVitalsRef.current.add(alertId);
                }
            }
        }

        // Check SpO2
        if (latestVital.spo2 !== null) {
            if (latestVital.spo2 < VITAL_RANGES.SpO2.low) {
                const alertId = `${patientId}-spo2-${latestVital.created_at}`;
                if (!previousVitalsRef.current.has(alertId)) {
                    newAlerts.push({
                        id: alertId,
                        patientId,
                        vital: 'SpO2',
                        value: latestVital.spo2,
                        type: 'low',
                        severity: latestVital.spo2 < VITAL_RANGES.SpO2.criticalLow ? 'critical' : 'warning',
                        timestamp: latestVital.created_at,
                    });
                    previousVitalsRef.current.add(alertId);
                }
            }
        }

        // Check ABP Sys
        if (latestVital.abp) {
            const abpSys = parseInt(latestVital.abp.split('/')[0]);
            if (!isNaN(abpSys) && (abpSys < VITAL_RANGES.ABP_Sys.low || abpSys > VITAL_RANGES.ABP_Sys.high)) {
                const alertId = `${patientId}-abp-${latestVital.created_at}`;
                if (!previousVitalsRef.current.has(alertId)) {
                    newAlerts.push({
                        id: alertId,
                        patientId,
                        vital: 'ABP Sys',
                        value: abpSys,
                        type: abpSys < VITAL_RANGES.ABP_Sys.low ? 'low' : 'high',
                        severity: abpSys < VITAL_RANGES.ABP_Sys.criticalLow || abpSys > VITAL_RANGES.ABP_Sys.criticalHigh ? 'critical' : 'warning',
                        timestamp: latestVital.created_at,
                    });
                    previousVitalsRef.current.add(alertId);
                }
            }
        }

        // Check PAP Dia
        if (latestVital.pap) {
            const papDia = parseInt(latestVital.pap.split('/')[1]);
            if (!isNaN(papDia) && (papDia < VITAL_RANGES.PAP_Dia.low || papDia > VITAL_RANGES.PAP_Dia.high)) {
                const alertId = `${patientId}-pap-${latestVital.created_at}`;
                if (!previousVitalsRef.current.has(alertId)) {
                    newAlerts.push({
                        id: alertId,
                        patientId,
                        vital: 'PAP Dia',
                        value: papDia,
                        type: papDia < VITAL_RANGES.PAP_Dia.low ? 'low' : 'high',
                        severity: papDia < VITAL_RANGES.PAP_Dia.criticalLow || papDia > VITAL_RANGES.PAP_Dia.criticalHigh ? 'critical' : 'warning',
                        timestamp: latestVital.created_at,
                    });
                    previousVitalsRef.current.add(alertId);
                }
            }
        }

        // Check EtCO2
        if (latestVital.etco2 !== null) {
            if (latestVital.etco2 < VITAL_RANGES.EtCO2.low || latestVital.etco2 > VITAL_RANGES.EtCO2.high) {
                const alertId = `${patientId}-etco2-${latestVital.created_at}`;
                if (!previousVitalsRef.current.has(alertId)) {
                    newAlerts.push({
                        id: alertId,
                        patientId,
                        vital: 'EtCO2',
                        value: latestVital.etco2,
                        type: latestVital.etco2 < VITAL_RANGES.EtCO2.low ? 'low' : 'high',
                        severity: latestVital.etco2 < VITAL_RANGES.EtCO2.criticalLow || latestVital.etco2 > VITAL_RANGES.EtCO2.criticalHigh ? 'critical' : 'warning',
                        timestamp: latestVital.created_at,
                    });
                    previousVitalsRef.current.add(alertId);
                }
            }
        }

        // Check awRR
        if (latestVital.awrr !== null) {
            if (latestVital.awrr < VITAL_RANGES.awRR.low || latestVital.awrr > VITAL_RANGES.awRR.high) {
                const alertId = `${patientId}-awrr-${latestVital.created_at}`;
                if (!previousVitalsRef.current.has(alertId)) {
                    newAlerts.push({
                        id: alertId,
                        patientId,
                        vital: 'awRR',
                        value: latestVital.awrr,
                        type: latestVital.awrr < VITAL_RANGES.awRR.low ? 'low' : 'high',
                        severity: latestVital.awrr < VITAL_RANGES.awRR.criticalLow || latestVital.awrr > VITAL_RANGES.awRR.criticalHigh ? 'critical' : 'warning',
                        timestamp: latestVital.created_at,
                    });
                    previousVitalsRef.current.add(alertId);
                }
            }
        }

        // Store alerts for this patient
        if (newAlerts.length > 0) {
            const existingAlerts = patientNotifications.get(patientId) || [];
            const existingIds = new Set(existingAlerts.map(a => a.id));
            const uniqueNewAlerts = newAlerts.filter(a => !existingIds.has(a.id));

            if (uniqueNewAlerts.length > 0) {
                patientNotifications.set(patientId, [...existingAlerts, ...uniqueNewAlerts]);
                notifyListeners();

                // Show toast notifications for new alerts
                uniqueNewAlerts.forEach(alert => {
                    toast(
                        <div className="flex flex-col gap-1.5">
                            <div className="text-xs font-semibold text-muted-foreground border-b pb-1">
                                Patient: {patient.patient_name} (ID: #{patient.patient_id})
                            </div>
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

                    // Send Remote Notification (Email/SMS) if configured
                    // Only for critical alerts to avoid spam
                    if (alert.severity === 'critical') {
                        const email = localStorage.getItem("notify_email");
                        const phone = localStorage.getItem("notify_phone");

                        if (email || phone) {
                            // Simple throttling: check if we sent an alert for this vital in the last 5 minutes
                            const throttleKey = `last_notify_${patientId}_${alert.vital}`;
                            const lastSent = localStorage.getItem(throttleKey);
                            const now = Date.now();

                            if (!lastSent || now - parseInt(lastSent) > 5 * 60 * 1000) {
                                fetch('http://localhost:3000/api/send-alert', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        email,
                                        phone,
                                        alert: { ...alert, patientId }
                                    })
                                }).catch(err => console.error("Failed to send remote alert:", err));

                                localStorage.setItem(throttleKey, now.toString());
                            }
                        }
                    }
                });
            }
        }
    }, [vitals, patient]);

    // This component doesn't render anything - it just monitors vitals
    return null;
};

// Export function to get notifications for a specific patient
export const getPatientNotifications = (patientId: number): VitalAlert[] => {
    return patientNotifications.get(patientId) || [];
};

// Export function to clear notifications for a specific patient
export const clearPatientNotifications = (patientId: number): void => {
    patientNotifications.delete(patientId);
    notifyListeners();
};

export const getAllNotifications = (): VitalAlert[] => {
    const allAlerts: VitalAlert[] = [];
    patientNotifications.forEach((alerts) => {
        allAlerts.push(...alerts);
    });
    return allAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addManualAlert = (patientId: number, alert: VitalAlert) => {
    const existingAlerts = patientNotifications.get(patientId) || [];
    patientNotifications.set(patientId, [...existingAlerts, alert]);
    notifyListeners();
};

export default PatientVitalMonitor;
