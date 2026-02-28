import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToothRecord, DENTAL_TEMPLATES } from '@/types/dental';
import { Badge } from '@/components/ui/badge';

interface ToothModalProps {
  isOpen: boolean;
  onClose: () => void;
  toothNumber: number;
  record?: ToothRecord;
  onSave: (record: Partial<ToothRecord>) => void;
}

export function ToothModal({ isOpen, onClose, toothNumber, record, onSave }: ToothModalProps) {
  const [templateId, setTemplateId] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Синхронізація з record при відкритті
  useEffect(() => {
    if (isOpen) {
      setTemplateId(record?.templateId || '');
      setDescription(record?.description || '');
      setNotes(record?.notes || '');
    }
  }, [isOpen, record, toothNumber]);

  const handleTemplateChange = (value: string) => {
    setTemplateId(value);
    if (value === '__clear__') {
      setTemplateId('');
      setDescription('');
      return;
    }
    const template = DENTAL_TEMPLATES.find(t => t.id === value);
    if (template) {
      setDescription(template.description);
    }
  };

  const handleSave = () => {
    onSave({
      toothNumber,
      templateId,
      description,
      notes,
      files: record?.files || [],
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleClear = () => {
    setTemplateId('');
    setDescription('');
    setNotes('');
  };

  const currentTemplate = DENTAL_TEMPLATES.find(t => t.id === templateId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
              {toothNumber}
            </span>
            Зуб №{toothNumber}
            {currentTemplate && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {currentTemplate.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Шаблон стану */}
          <div className="space-y-2">
            <Label>Стан зуба</Label>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть стан зуба" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__clear__">— Очистити —</SelectItem>
                {DENTAL_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Опис */}
          <div className="space-y-2">
            <Label>Опис</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Детальний опис стану зуба..."
              rows={2}
            />
          </div>

          {/* Примітки */}
          <div className="space-y-2">
            <Label>Додаткові примітки</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Примітки до лікування, рекомендації..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" type="button" onClick={handleClear}>
            Очистити
          </Button>
          <Button variant="outline" type="button" onClick={onClose}>
            Скасувати
          </Button>
          <Button type="button" onClick={handleSave}>
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
