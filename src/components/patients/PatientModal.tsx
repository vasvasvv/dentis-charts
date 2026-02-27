import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinic } from '@/context/ClinicContext';
import { useAuth } from '@/context/AuthContext';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string | null;
}

function formatPhoneForSave(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('380') && digits.length === 12) {
    return '+' + digits;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return '+38' + digits;
  }
  if (digits.length === 9) {
    return '+380' + digits;
  }
  return phone;
}

export function formatPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('380')) {
    return `+38 (0${digits.slice(3, 5)})-${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
  }
  return phone;
}

export function PatientModal({ isOpen, onClose, patientId }: PatientModalProps) {
  const { patients, selectedDoctorId, doctors, addPatient, updatePatient, addHistoryEntry } = useClinic();
  const { currentUser } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [gender, setGender] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [doctorId, setDoctorId] = useState('');

  const isEditing = !!patientId;
  const existingPatient = patientId ? patients.find(p => p.id === patientId) : null;

  useEffect(() => {
    if (existingPatient) {
      setFirstName(existingPatient.firstName);
      setLastName(existingPatient.lastName);
      setMiddleName(existingPatient.middleName || '');
      setGender(existingPatient.gender || '');
      setPhone(existingPatient.phone);
      setDateOfBirth(existingPatient.dateOfBirth);
      setDoctorId(existingPatient.doctorId);
    } else {
      setFirstName('');
      setLastName('');
      setMiddleName('');
      setGender('');
      setPhone('');
      setDateOfBirth('');
      setDoctorId(selectedDoctorId === 'all' ? '' : selectedDoctorId || '');
    }
  }, [existingPatient, isOpen, selectedDoctorId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctorId) return;

    const formattedPhone = formatPhoneForSave(phone);

    if (isEditing && patientId) {
      const changes: string[] = [];
      if (existingPatient) {
        if (existingPatient.firstName !== firstName) changes.push(`Ім'я: ${existingPatient.firstName} → ${firstName}`);
        if (existingPatient.lastName !== lastName) changes.push(`Прізвище: ${existingPatient.lastName} → ${lastName}`);
        if ((existingPatient.middleName || '') !== middleName) changes.push(`По-батькові: ${existingPatient.middleName || '—'} → ${middleName || '—'}`);
        if (existingPatient.phone !== formattedPhone) changes.push(`Телефон: ${existingPatient.phone} → ${formattedPhone}`);
        if (existingPatient.dateOfBirth !== dateOfBirth) changes.push(`Дата народження змінена`);
        if (existingPatient.doctorId !== doctorId) changes.push(`Лікар змінений`);
        if ((existingPatient.gender || '') !== gender) changes.push(`Стать: ${existingPatient.gender === 'male' ? 'Ч' : existingPatient.gender === 'female' ? 'Ж' : '—'} → ${gender === 'male' ? 'Ч' : gender === 'female' ? 'Ж' : '—'}`);
      }

      updatePatient(patientId, {
        firstName,
        lastName,
        middleName,
        gender: gender as 'male' | 'female' | undefined || undefined,
        phone: formattedPhone,
        dateOfBirth,
        doctorId,
      });

      if (changes.length > 0) {
        addHistoryEntry(patientId, {
          userId: currentUser?.id || '',
          userName: currentUser?.name || 'Невідомий',
          action: 'edit',
          target: 'patient',
          details: changes.join('; '),
        });
      }
    } else {
      addPatient({
        firstName,
        lastName,
        middleName,
        gender: gender as 'male' | 'female' | undefined || undefined,
        phone: formattedPhone,
        dateOfBirth,
        doctorId,
      });
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEditing ? 'Редагувати пацієнта' : 'Додати нового пацієнта'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Прізвище</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder=""
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">Ім'я</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder=""
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div className="space-y-2">
              <Label htmlFor="middleName">По-батькові</Label>
              <Input
                id="middleName"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <Label>Стать</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Ч</SelectItem>
                  <SelectItem value="female">Ж</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Номер телефону</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+380 або 0XX..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Дата народження</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Лікар</Label>
            <Select value={doctorId} onValueChange={setDoctorId} required>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть лікаря" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(doc => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-10 border-2 md:w-auto w-full order-2 sm:order-1">
              Скасувати
            </Button>
            <Button type="submit" className="h-10 border-2 md:w-auto w-full order-1 sm:order-2" disabled={!doctorId}>
              {isEditing ? 'Зберегти зміни' : 'Додати пацієнта'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
