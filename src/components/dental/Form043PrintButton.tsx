import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useClinic } from '@/context/ClinicContext';
import { formatPhoneForDisplay } from '@/components/patients/PatientModal';

interface Form043PrintButtonProps {
  className?: string;
}

export function Form043PrintButton({ className }: Form043PrintButtonProps) {
  const { selectedPatientId, patients } = useClinic();

  const patient = patients.find(p => p.id === selectedPatientId);

  if (!patient) {
    return null;
  }

 const handlePrint = async () => {
    try {
      // Завантажуємо HTML файл з формою 043
      const response = await fetch('/src/assets/f043.html');
      const htmlContent = await response.text();

      // Заповнюємо шаблон даними пацієнта
      const filledHtmlContent = htmlContent
        .replace(/\{\{\s*lastName\s*\}\}/g, patient.lastName || '')
        .replace(/\{\{\s*firstName\s*\}\}/g, patient.firstName || '')
        .replace(/\{\{\s*middleName\s*\}\}/g, patient.middleName || '')
        .replace(/\{\{\s*fullName\s*\}\}/g, `${patient.lastName} ${patient.firstName} ${patient.middleName || ''}`)
        .replace(/\{\{\s*dateOfBirth\s*\}\}/g, patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('uk-UA') : '')
        .replace(/\{\{\s*phone\s*\}\}/g, formatPhoneForDisplay(patient.phone))


      // Створюємо нове вікно для друку
      const printWindow = window.open('', '_blank');

      if (printWindow) {
        printWindow.document.write(filledHtmlContent);

        printWindow.document.close();

        // Чекаємо, поки контент завантажиться, і викликаємо друк
        printWindow.onload = () => {
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }
    } catch (error) {
      console.error('Error loading PDF template:', error);
      alert('Помилка завантаження шаблону форми 043/О');
    }
  };

  return (
    <Button
      onClick={handlePrint}
      className={className}
      title="Роздрукувати форму 043/О - Стоматологічну амбулаторну карту"
    >
      <Printer className="w-4 h-4 mr-2" />
      Роздрукувати
    </Button>
  );
}