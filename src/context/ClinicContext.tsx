import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
  updateVisit: (patientId: string, visitId: string, visit: any) => Promise<void>;
  deleteVisit: (patientId: string, visitId: string) => Promise<void>;
  updateToothRecord: (patientId: string, toothNumber: number, record: Partial<ToothRecord>) => Promise<void>;
  getPatients: () => Promise<void>;
  getPatientDetails: (id: string) => Promise<void>;
  getPatientsByDoctor: (doctorId: string) => Patient[];
  addHistoryEntry: (patientId: string, entry: any) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://dentis-cards-api.nesterenkovasil9.workers.dev';

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

// ─── Нормалізація візиту з API → тип Visit фронту ────────────────────────────
// API повертає: { id, visitDate, type, reason, notes, doctor_id, doctorName }
// Фронт очікує: { id, date, type, notes, doctorId }
function normalizeVisit(v: any): Visit {
  return {
    id: v.id?.toString() || '',
    date: v.visitDate || v.date || '',
    type: v.type === 'past' ? 'past' : 'future',
    notes: v.notes || v.reason || '',
    doctorId: v.doctor_id?.toString() || v.doctorId?.toString() || '',
  };
}

// ─── Нормалізація зуба з API → тип ToothRecord фронту ────────────────────────
// API повертає: { tooth_number, status, notes }
// Фронт очікує: { toothNumber, description, templateId, notes, files, updatedAt }
function normalizeTooth(t: any): ToothRecord {
  return {
    toothNumber: t.toothNumber ?? t.tooth_number,
    description: t.description || t.status || '',
    templateId: t.templateId || '',
    notes: t.notes || '',
    files: Array.isArray(t.files) ? t.files : [],
    updatedAt: t.updatedAt || t.updated_at || new Date().toISOString(),
  };
}

// ─── Нормалізація пацієнта з API ──────────────────────────────────────────────
function normalizePatient(p: any): Patient {
  return {
    ...p,
    id: p.id?.toString() || '',
    doctorId: p.doctor_id?.toString() || p.doctorId?.toString() || '',
    dentalChart: Array.isArray(p.dentalChart) ? p.dentalChart.map(normalizeTooth) : [],
    visits: Array.isArray(p.visits) ? p.visits.map(normalizeVisit) : [],
    changeHistory: Array.isArray(p.changeHistory) ? p.changeHistory : [],
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
    updatedAt: p.updated_at || p.updatedAt || new Date().toISOString(),
  };
}

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [clinicName] = useState('Dentis');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // ── Лікарі: без selectedDoctorId в deps щоб уникнути нескінченного циклу ──
  const doctorsLoadedRef = useRef(false);

  const getDoctors = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setDoctors(list.map((d: any) => ({
          id: d.id?.toString() || '',
          name: d.name || d.fullName || '',
          specialty: d.specialty || 'Лікар',
        })));
        // Встановити першого лікаря тільки при першому завантаженні
        if (!doctorsLoadedRef.current && list.length > 0) {
          setSelectedDoctorId(list[0].id.toString());
          doctorsLoadedRef.current = true;
        }
      }
    } catch (err) {
      console.error('Fetch doctors error:', err);
    }
  }, [token]); // ← тільки token, без selectedDoctorId

  const getPatients = useCallback(async () => {
    if (!token) {
      setPatients([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) { setPatients([]); return; }
      const data = await res.json();
      setPatients(Array.isArray(data) ? data.map(normalizePatient) : []);
    } catch (err) {
      console.error('Fetch patients error:', err);
      setPatients([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      getPatients();
      getDoctors();
    }
  }, [token]); // ← тільки token, щоб не перезавантажувати при кожній зміні

  // ── Пацієнти ──────────────────────────────────────────────────────────────

  const addPatient = useCallback(async (patientData: any) => {
    if (!token) return;
    await fetch(`${API_URL}/api/patients`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        middleName: patientData.middleName || null,
        gender: patientData.gender || null,
        phone: patientData.phone,
        dateOfBirth: patientData.dateOfBirth,
        email: patientData.email || null,
        address: patientData.address || null,
        notes: patientData.notes || null,
        doctorId: patientData.doctorId,
      })
    });
    await getPatients();
  }, [token, getPatients]);

  const updatePatient = useCallback(async (patientId: string, patientData: any) => {
    if (!token) return;
    // Знайти поточного пацієнта щоб заповнити обов'язкові поля
    const existing = patients.find(p => p.id === patientId);
    await fetch(`${API_URL}/api/patients/${patientId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: patientData.firstName ?? existing?.firstName,
        lastName: patientData.lastName ?? existing?.lastName,
        middleName: patientData.middleName ?? existing?.middleName ?? null,
        gender: patientData.gender ?? existing?.gender ?? null,
        phone: patientData.phone ?? existing?.phone,
        dateOfBirth: patientData.dateOfBirth ?? existing?.dateOfBirth,
        email: patientData.email ?? null,
        address: patientData.address ?? null,
        notes: patientData.notes ?? null,
        doctorId: patientData.doctorId ?? existing?.doctorId,
      })
    });
    await getPatients();
  }, [token, getPatients, patients]);

  const deletePatient = useCallback(async (patientId: string) => {
    if (!token) return;
    await fetch(`${API_URL}/api/patients/${patientId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await getPatients();
  }, [token, getPatients]);

  const getPatientsByDoctor = useCallback((doctorId: string) => {
    return patients.filter(p => p.doctorId === doctorId);
  }, [patients]);

  const addHistoryEntry = useCallback((patientId: string, entry: any) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          changeHistory: [
            { id: Date.now().toString(), timestamp: new Date().toISOString(), ...entry },
            ...p.changeHistory
          ]
        };
      }
      return p;
    }));
  }, []);

  // ── Візити ────────────────────────────────────────────────────────────────

  const addVisit = useCallback(async (patientId: string, visit: any) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/patients/${patientId}/visits`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitDate: visit.date || visit.visitDate,
          type: visit.type || 'future',
          reason: visit.reason || null,
          notes: visit.notes || null,
          doctorId: visit.doctorId || visit.doctor_id,
        })
      });
      await getPatients();
    } catch (error) {
      console.error('Add visit error:', error);
    }
  }, [token, getPatients]);

  const updateVisit = useCallback(async (patientId: string, visitId: string, visit: any) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/patients/${patientId}/visits/${visitId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitDate: visit.date || visit.visitDate,
          type: visit.type || 'future',
          reason: visit.reason || null,
          notes: visit.notes || null,
          doctorId: visit.doctorId || visit.doctor_id,
        })
      });
      await getPatients();
    } catch (error) {
      console.error('Update visit error:', error);
    }
  }, [token, getPatients]);

  const deleteVisit = useCallback(async (patientId: string, visitId: string) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/patients/${patientId}/visits/${visitId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await getPatients();
    } catch (error) {
      console.error('Delete visit error:', error);
    }
  }, [token, getPatients]);

  // ── Зуби ──────────────────────────────────────────────────────────────────

  const updateToothRecord = useCallback(async (patientId: string, toothNumber: number, record: any) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/patients/${patientId}/teeth`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tooth_number: toothNumber,
          // API зберігає в полі "status" — використовуємо description як status
          status: record.description || record.status || '',
          notes: record.notes || '',
        })
      });
      await getPatients();
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
      updateVisit,
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
