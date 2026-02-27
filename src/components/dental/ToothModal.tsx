import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToothRecord, FileAttachment, DENTAL_TEMPLATES } from '@/types/dental';
import { Upload, X, FileText, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ToothModalProps {
  isOpen: boolean;
  onClose: () => void;
  toothNumber: number;
  record?: ToothRecord;
  onSave: (record: Partial<ToothRecord>) => void;
}

export function ToothModal({ isOpen, onClose, toothNumber, record, onSave }: ToothModalProps) {
  const [templateId, setTemplateId] = useState(record?.templateId || '');
  const [description, setDescription] = useState(record?.description || '');
  const [notes, setNotes] = useState(record?.notes || '');
  const [files, setFiles] = useState<FileAttachment[]>(record?.files || []);

  useEffect(() => {
    setTemplateId(record?.templateId || '');
    setDescription(record?.description || '');
    setNotes(record?.notes || '');
    setFiles(record?.files || []);
  }, [record, toothNumber]);

  const handleTemplateChange = (value: string) => {
    setTemplateId(value);
    const template = DENTAL_TEMPLATES.find(t => t.id === value);
    if (template) {
      setDescription(template.description);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newFile: FileAttachment = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          data: reader.result as string,
          uploadedAt: new Date().toISOString(),
        };
        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSave = () => {
    onSave({
      toothNumber,
      templateId,
      description,
      notes,
      files,
    });
    onClose();
  };

  const handleClear = () => {
    setTemplateId('');
    setDescription('');
    setNotes('');
    setFiles([]);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
              {toothNumber}
            </span>
            Зуб №{toothNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Шаблон стану</Label>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть стан" />
              </SelectTrigger>
              <SelectContent>
                {DENTAL_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <span>{template.label}</span>                      
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Опис</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Додайте опис"
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Додаткові примітки</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Додайте примітки"
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Вкладення</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Натисніть для завантаження файлів
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Зображення, PDF або документи
                </p>
              </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 mt-3">
                {files.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {getFileIcon(file.type)}
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClear}>
            Очистити
          </Button>
          <Button variant="outline" onClick={onClose}>
            Скасувати
          </Button>
          <Button onClick={handleSave}>
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
