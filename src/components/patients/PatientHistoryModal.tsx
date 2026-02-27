import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { Edit2, Plus, Trash2, User, Stethoscope, Calendar } from 'lucide-react';

interface PatientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string | null;
}

const actionIcons = {
  create: <Plus className="w-4 h-4" />,
  edit: <Edit2 className="w-4 h-4" />,
  delete: <Trash2 className="w-4 h-4" />,
};

const actionLabels = {
  create: 'Створення',
  edit: 'Редагування',
  delete: 'Видалення',
};

const targetLabels = {
  patient: 'Пацієнт',
  tooth: 'Зубна карта',
  visit: 'Візит',
};

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  edit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function PatientHistoryModal({ isOpen, onClose, patientId }: PatientHistoryModalProps) {
  const { patients } = useClinic();
  const patient = patientId ? patients.find(p => p.id === patientId) : null;
  const history = (patient?.changeHistory || []).slice().sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Історія змін — {patient?.lastName} {patient?.firstName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Історія змін порожня
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {history.map(entry => (
                <div key={entry.id} className="flex gap-3 p-3 rounded-lg border bg-card">
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${actionColors[entry.action]}`}>
                    {actionIcons[entry.action]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {actionLabels[entry.action]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {targetLabels[entry.target]}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1 text-foreground">{entry.details}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {entry.userName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.timestamp).toLocaleString('uk-UA')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
