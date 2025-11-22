import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Activity, ArrowRight } from "lucide-react";
import AddPatientDialog from "@/components/AddPatientDialog";
import DeletePatientDialog from "@/components/DeletePatientDialog";

interface Patient {
    patient_id: number;
    patient_name: string;
    age: number;
    gender: string;
    diagnosis: string;
    admission_date: string;
}

const PatientRecords = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/patients');
            const data = await res.json();
            setPatients(data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Patient Records</h1>
                    <div className="flex gap-3">
                        <AddPatientDialog onPatientAdded={fetchPatients} />
                        <Link to="/">
                            <Button variant="outline">Back to Home</Button>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading patients...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {patients.map((patient) => (
                            <Card key={patient.patient_id} className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl font-semibold text-slate-800">
                                            {patient.patient_name}
                                        </CardTitle>
                                        <User className="text-blue-500 w-5 h-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-slate-600">
                                        <div className="flex justify-between">
                                            <span>ID:</span>
                                            <span className="font-mono font-medium">#{patient.patient_id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Age/Gender:</span>
                                            <span>{patient.age} / {patient.gender}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Diagnosis:</span>
                                            <span className="font-medium text-slate-800">{patient.diagnosis}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Admitted:</span>
                                            <span>{new Date(patient.admission_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                        <Link to={`/dashboard?patientId=${patient.patient_id}`}>
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                                <span>View Dashboard</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <DeletePatientDialog
                                            patientId={patient.patient_id}
                                            patientName={patient.patient_name}
                                            onPatientDeleted={fetchPatients}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientRecords;
