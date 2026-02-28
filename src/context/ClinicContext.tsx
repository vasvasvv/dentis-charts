import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Patient, Doctor, ToothRecord, Visit, ChangeHistoryEntry } from '@/types/dental';
import { useAuth } from './AuthContext';

interface ClinicContextType {
  clinicName: string;
  doctors: Doctor[];
  patients: Patient[];
  selectedDoctorId: string | null;
  selectedPatientId: string | null;
  setSelectedDoctorId: (id: string | null) => void;
  setSelectedPatientId: (id: string | null) => void;
  addPatient: (patient: any) => Promise<void>;
  updatePatient: (patientId: string, patient: any) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  addVisit: (patientId: string, visit: any) => Promise<void>;
  deleteVisit: (patientId: string, visitId: string) => Promise<void>;
  updateToothRecord: (patientId: string, toothNumber: number, record: Partial<ToothRecord>) => Promise<void>;
  getPatients: () => Promise<void>;
  getPatientDetails: (id: string) => Promise<void>;
  getPatientsByDoctor: (doctorId: string) => Patient[];
  addHistoryEntry: (patientId: string, entry: any) => void;
}

const API_URL = 'https://YOUR_CLOUDFLARE_WORKER_SUBDOMAIN.YOUR_NAMESPACE.workers.dev';
const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [clinicName] = useState('Dentis');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const getDoctors = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Fetch doctors error:', err);
    }
  }, [token, selectedDoctorId]);

  const getPatients = useCallback(async () => {
    if (!token) {
      setPatients([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        setPatients([]);
        return;
      }
      
      const data = await res.json();
      
      // Sanitizing data to ensure UI components don't crash
      const patientList = Array.isArray(data) ? data : [];
      const sanitized = patientList.map((p: any) => ({
        ...p,
        id: p.id.toString(),
        doctorId: p.doctor_id?.toString() || '',
        dentalChart: p.dentalChart || [],
        visits: p.visits || [],
        changeHistory: p.changeHistory || [],
        createdAt: p.created_at || new Date().toISOString(),
        updatedAt: p.updated_at || new Date().toISOString()
      }));
      
      setPatients(sanitized);
    } catch (err) {
      console.error('Fetch error:', err);
      setPatients([]);
    }
  }, [token]);

  useEffect(() => {
    getPatients();
    getDoctors();
  }, [getPatients, getDoctors]);

  const addPatient = useCallback(async (patientData: any) => {
    if (!token) return;
    await fetch(`${API_URL}/api/patients`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    });
    await getPatients();
  }, [token, getPatients]);

  const updatePatient = useCallback(async (patientId: string, patientData: any) => {
    if (!token) return;
    await fetch(`${API_URL}/api/patients/${patientId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    });
    await getPatients();
  }, [token, getPatients]);

  const deletePatient = useCallback(async (patientId: string) => {
    if (!token) return;
    await fetch(`${API_URL}/api/patients/${patientId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    await getPatients();
  }, [token, getPatients]);

  const getPatientsByDoctor = useCallback((doctorId: string) => {
    return patients.filter(p => p.doctorId === doctorId);
  }, [patients]);

  const addHistoryEntry = useCallback((patientId: string, entry: any) => {
    // Update local patient history
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          changeHistory: [
            {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              ...entry
            },
            ...p.changeHistory
          ]
        };
      }
      return p;
    }));
  }, []);

  const addVisit = useCallback(async (patientId: string, visit: any) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/patients/${patientId}/visits`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visit)
      });
      await getPatients(); // Refresh patient list to get updated visits
    } catch (error) {
      console.error('Add visit error:', error);
    }
  }, [token, getPatients]);

  const deleteVisit = useCallback(async (patientId: string, visitId: string) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/patients/${patientId}/visits/${visitId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      await getPatients(); // Refresh patient list to get updated visits
    } catch (error) {
      console.error('Delete visit error:', error);
    }
  }, [token, getPatients]);

  const updateToothRecord = useCallback(async (patientId: string, toothNumber: number, record: any) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/patients/${patientId}/teeth`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tooth_number: toothNumber, ...record })
      });
      await getPatients(); // Refresh to get updated dental chart
    } catch (error) {
      console.error('Update tooth record error:', error);
    }
  }, [token, getPatients]);

  return (
    <ClinicContext.Provider value={{
      clinicName,
      doctors,
      patients,
      selectedDoctorId,
      selectedPatientId,
      setSelectedDoctorId,
      setSelectedPatientId,
      addPatient,
      updatePatient,
      deletePatient,
      addVisit,
      deleteVisit,
      updateToothRecord,
      getPatients,
      getPatientDetails: async () => {},
      getPatientsByDoctor,
      addHistoryEntry,
    }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}
