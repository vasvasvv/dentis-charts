import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinic } from '@/context/ClinicContext';

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  // Опціонально — для редагування існуючого візиту
  visitId?: string;
  initialDate?: string;
  initialType?: 'past' | 'future';
  initialNotes?: string;
  initialDoctorId?: string;
}

export function VisitModal({
  isOpen,
  onClose,
  patientId,
  visitId,
  initialDate = '',
  initialType = 'future',
  initialNotes = '',
  initialDoctorId,
}: VisitModalProps) {
  const { selectedDoctorId, doctors, addVisit, updateVisit } = useClinic();

  const [date, setDate] = useState(initialDate);
  const [type, setType] = useState<'past' | 'future'>(initialType);
  const [notes, setNotes] = useState(initialNotes);
  const [doctorId, setDoctorId] = useState(initialDoctorId || selectedDoctorId || '');

  const isEditing = !!visitId;

  // Синхронізувати стан при відкритті модалки
  useEffect(() => {
    if (isOpen) {
      setDate(initialDate);
      setType(initialType);
      setNotes(initialNotes);
      setDoctorId(initialDoctorId || selectedDoctorId || (doctors.length > 0 ? doctors[0].id : ''));
    }
  }, [isOpen, initialDate, initialType, initialNotes, initialDoctorId, selectedDoctorId, doctors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !date) return;

    const visitData = {
      date,       // ← фронт використовує "date"
      type,
      notes,
      doctorId,
    };

    if (isEditing && visitId) {
      await updateVisit(patientId, visitId, visitData);
    } else {
      await addVisit(patientId, visitData);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEditing ? 'Редагувати візит' : 'Додати візит'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="visitDate">Дата</Label>
            <Input
              id="visitDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Тип візиту</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as 'past' | 'future')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="future" id="future" />
                <Label htmlFor="future" className="font-normal cursor-pointer">Запланований (майбутній)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="past" id="past" />
                <Label htmlFor="past" className="font-normal cursor-pointer">Завершений (минулий)</Label>
              </div>
            </RadioGroup>
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

          <div className="space-y-2">
            <Label htmlFor="notes">Примітки</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Додайте примітки до візиту..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={!doctorId || !date}>
              {isEditing ? 'Зберегти' : 'Додати візит'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
