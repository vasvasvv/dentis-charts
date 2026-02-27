import React, { useState } from 'react';
import { useClinic } from '@/context/ClinicContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Calendar as CalendarIcon, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { VisitModal } from '@/components/patients/VisitModal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VisitHistoryProps {
  patientId: string;
}

export function VisitHistory({ patientId }: VisitHistoryProps) {
  const { patients, deleteVisit } = useClinic();
  const { canPerformAction } = useAuth();
  const [isAddingVisit, setIsAddingVisit] = useState(false);
  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return null;

  const sortedVisits = [...patient.visits].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const pastVisits = sortedVisits.filter(v => v.type === 'past');
  const futureVisits = sortedVisits.filter(v => v.type === 'future');

  // Get dates that have visits for calendar highlighting
  const visitDates = patient.visits.map(v => new Date(v.date));
  const futureDates = futureVisits.map(v => new Date(v.date));
  const pastDates = pastVisits.map(v => new Date(v.date));

  const handleDeleteConfirm = () => {
    if (deletingVisitId) {
      deleteVisit(patientId, deletingVisitId);
      setDeletingVisitId(null);
    }
  };

  return (
    <div className="border-t mt-4 pt-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-3">
        <div className="flex items-center gap-2 justify-start">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Історія візитів</h3>
          <Badge variant="secondary" className="text-xs">
            {patient.visits.length}
          </Badge>
        </div>

        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-9 w-9 p-0 flex items-center justify-center border rounded-md"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {canPerformAction('edit', 'patient') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingVisit(true);
              }}
            >
              <Plus className="w-3 h-3 mr-1" />
              Додати візит
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={uk}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                future: futureDates,
                past: pastDates,
              }}
              modifiersClassNames={{
                future: 'bg-primary/20 text-primary font-medium',
                past: 'bg-muted text-muted-foreground',
              }}
            />
          </div>

          {/* Visits List */}
          <div className="space-y-3">
            {/* Future visits */}
            {futureVisits.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-primary">Заплановані</span>
                </div>
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {futureVisits.map(visit => (
                      <div
                        key={visit.id}
                        className="flex items-center justify-between p-2 rounded-md bg-primary/5 text-xs group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <CalendarIcon className="w-3 h-3 text-primary shrink-0" />
                          <span className="font-medium">
                            {format(new Date(visit.date), 'dd MMM yyyy', { locale: uk })}
                          </span>
                          {visit.notes && (
                            <span className="text-muted-foreground truncate">
                              — {visit.notes}
                            </span>
                          )}
                        </div>
                        {canPerformAction('delete', 'patient') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                            onClick={() => setDeletingVisitId(visit.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Past visits */}
            {pastVisits.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Минулі</span>
                </div>
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {pastVisits.map(visit => (
                      <div
                        key={visit.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-xs group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <CalendarIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">
                            {format(new Date(visit.date), 'dd MMM yyyy', { locale: uk })}
                          </span>
                          {visit.notes && (
                            <span className="text-muted-foreground truncate">
                              — {visit.notes}
                            </span>
                          )}
                        </div>
                        {canPerformAction('delete', 'patient') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                            onClick={() => setDeletingVisitId(visit.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {sortedVisits.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Візитів ще немає</p>
              </div>
            )}
          </div>
        </div>
      )}

      <VisitModal
        isOpen={isAddingVisit}
        onClose={() => setIsAddingVisit(false)}
        patientId={patientId}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deletingVisitId !== null} onOpenChange={() => setDeletingVisitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити візит</AlertDialogTitle>
            <AlertDialogDescription>
              Ви впевнені, що хочете видалити цей візит? Цю дію неможливо скасувати.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
