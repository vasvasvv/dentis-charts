import React, { useState } from 'react';
import { useClinic } from '@/context/ClinicContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { VisitModal } from './VisitModal';
import { cn } from '@/lib/utils';

interface VisitListProps {
  patientId: string;
}

export function VisitList({ patientId }: VisitListProps) {
  const { patients, deleteVisit } = useClinic();
  const { canPerformAction } = useAuth();
  const [isAddingVisit, setIsAddingVisit] = useState(false);
  
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return null;

  const sortedVisits = [...patient.visits].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const pastVisits = sortedVisits.filter(v => v.type === 'past');
  const futureVisits = sortedVisits.filter(v => v.type === 'future');

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Візити</span>
        {canPerformAction('edit', 'patient') && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setIsAddingVisit(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Додати
          </Button>
        )}
      </div>

      {futureVisits.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Заплановані</span>
          {futureVisits.map(visit => (
            <div
              key={visit.id}
              className="flex items-center justify-between p-2 rounded-md bg-primary/5 text-xs group"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-primary" />
                <span>{new Date(visit.date).toLocaleDateString('uk-UA')}</span>
              </div>
              {canPerformAction('delete', 'patient') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteVisit(patientId, visit.id)}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {pastVisits.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Минулі</span>
          {pastVisits.slice(0, 3).map(visit => (
            <div
              key={visit.id}
              className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-xs group"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">{new Date(visit.date).toLocaleDateString('uk-UA')}</span>
              </div>
              {visit.notes && (
                <Badge variant="secondary" className="text-[10px]">
                  {visit.notes.slice(0, 15)}...
                </Badge>
              )}
            </div>
          ))}
          {pastVisits.length > 3 && (
            <span className="text-[10px] text-muted-foreground pl-2">
              +{pastVisits.length - 3} інших візитів
            </span>
          )}
        </div>
      )}

      {sortedVisits.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">Візитів немає</p>
      )}

      <VisitModal
        isOpen={isAddingVisit}
        onClose={() => setIsAddingVisit(false)}
        patientId={patientId}
      />
    </div>
  );
}
