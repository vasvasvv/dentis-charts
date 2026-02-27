import React, { useState } from 'react';
import { Tooth } from './Tooth';
import { ToothModal } from './ToothModal';
import { VisitHistory } from './VisitHistory';
import { UPPER_TEETH, LOWER_TEETH, ToothRecord } from '@/types/dental';
import { useClinic } from '@/context/ClinicContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar } from 'lucide-react';
import { formatPhoneForDisplay } from '@/components/patients/PatientModal';

export function DentalChart() {
  const { patients, selectedPatientId, updateToothRecord, addHistoryEntry } = useClinic();
  const { canPerformAction, currentUser } = useAuth();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  
  const patient = patients.find(p => p.id === selectedPatientId);
  
  if (!patient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-xl">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Пацієнт не обраний</h3>
          <p className="text-muted-foreground">Оберіть пацієнта зі списку для перегляду зубної карти</p>
        </div>
      </div>
    );
  }

  const getToothRecord = (toothNumber: number): ToothRecord | undefined => {
    return patient.dentalChart.find(t => t.toothNumber === toothNumber);
  };

  const handleToothClick = (toothNumber: number) => {
    if (canPerformAction('edit', 'dental')) {
      setSelectedTooth(toothNumber);
    }
  };

  const handleSaveRecord = (record: Partial<ToothRecord>) => {
    if (selectedTooth !== null) {
      updateToothRecord(patient.id, selectedTooth, record);
      addHistoryEntry(patient.id, {
        userId: currentUser?.id || '',
        userName: currentUser?.name || 'Невідомий',
        action: 'edit',
        target: 'tooth',
        details: `Зуб №${selectedTooth}: ${record.description || 'оновлено'}`,
      });
    }
  };

  const issueCount = patient.dentalChart.filter(t => t.description || t.notes || t.files.length > 0).length;

  return (
    <Card className="flex-1 overflow-hidden animate-fade-in bg-muted/5">
      <CardHeader className="border-b bg-card p-3 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <CardTitle className="font-heading text-lg md:text-xl">
              {patient.lastName} {patient.firstName} {patient.middleName || ''}
            </CardTitle>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1 text-xs md:text-sm text-muted-foreground">
              {patient.dateOfBirth && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  {new Date(patient.dateOfBirth).toLocaleDateString('uk-UA')}
                </span>
              )}
              <span>{formatPhoneForDisplay(patient.phone)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {issueCount > 0 && (
              <Badge variant="destructive" className="text-xs">{issueCount} проблем</Badge>
            )}
            <Badge variant="secondary" className="text-xs">32 зуби</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-2 md:p-6 overflow-auto">
        <div className="min-w-[280px]">
          {/* Upper teeth - aligned to bottom */}
          <div className="mb-2">
            <div className="text-[10px] md:text-xs font-medium text-muted-foreground mb-1 text-center">Верхня щелепа</div>
            <div className="flex justify-center items-end gap-0 flex-nowrap overflow-auto py-[5px]">
              {UPPER_TEETH.map((num) => (
                <Tooth
                  key={num}
                  number={num}
                  isUpper={true}
                  record={getToothRecord(num)}
                  isSelected={selectedTooth === num}
                  onClick={() => handleToothClick(num)}
                  alignBottom={true}
                />
              ))}
            </div>
          </div>
          
          {/* Lower teeth - aligned to top */}
          <div>
            <div className="flex justify-center items-start gap-0 flex-nowrap overflow-auto py-[5px]">
              {LOWER_TEETH.map((num) => (
                <Tooth
                  key={num}
                  number={num}
                  isUpper={false}
                  record={getToothRecord(num)}
                  isSelected={selectedTooth === num}
                  onClick={() => handleToothClick(num)}
                  alignBottom={false}
                />
              ))}
            </div>
            <div className="text-[10px] md:text-xs font-medium text-muted-foreground mt-1 text-center">Нижня щелепа</div>
          </div>
        </div>
        
        {/* Visit History */}
        <VisitHistory patientId={patient.id} />
      </CardContent>

      {/* Tooth Modal */}
      <ToothModal
        isOpen={selectedTooth !== null}
        onClose={() => setSelectedTooth(null)}
        toothNumber={selectedTooth || 0}
        record={selectedTooth ? getToothRecord(selectedTooth) : undefined}
        onSave={handleSaveRecord}
      />
    </Card>
  );
}
