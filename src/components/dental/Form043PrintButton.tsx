// Імпортуємо HTML шаблон як рядок прямо під час збірки (Vite підтримує ?raw)
// Файл f043.html має знаходитись за шляхом: src/assets/f043.html
import htmlTemplate from '@/assets/f043.html?raw';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useClinic } from '@/context/ClinicContext';
import { formatPhoneForDisplay } from '@/components/patients/PatientModal';

interface Form043PrintButtonProps {
  className?: string;
}

export function Form043PrintButton({ className }: Form043PrintButtonProps) {
  const { selectedPatientId, patients, doctors } = useClinic();

  const patient = patients.find(p => p.id === selectedPatientId);

  if (!patient) {
    return null;
  }

  const handlePrint = () => {
    // Поточна дата та рік
    const today = new Date();
    const currentYear = today.getFullYear().toString();

    // ПІБ лікаря, прив'язаного до пацієнта
    const doctor = doctors?.find(d => d.id === patient.doctorId);
    const doctorFullName = doctor?.name ?? '';

    // Повне ПІБ пацієнта
    const patientFullName =
      `${patient.lastName} ${patient.firstName} ${patient.middleName ?? ''}`.trim();

    // Дата народження
    const dateOfBirth = patient.dateOfBirth
      ? new Date(patient.dateOfBirth).toLocaleDateString('uk-UA')
      : '';

    // Адреса та телефон
    
    const phone = formatPhoneForDisplay(patient.phone);

    // Номер картки
    const cardNumber = Math.floor(Math.random() * (8790 - 4560 + 1)) + 4560;

    // Заповнення шаблону
    const filled = htmlTemplate
      .replace(/\{\{\s*fullName\s*\}\}/g, patientFullName)
      .replace(/\{\{\s*lastName\s*\}\}/g, patient.lastName ?? '')
      .replace(/\{\{\s*firstName\s*\}\}/g, patient.firstName ?? '')
      .replace(/\{\{\s*middleName\s*\}\}/g, patient.middleName ?? '')
      .replace(/\{\{\s*dateOfBirth\s*\}\}/g, dateOfBirth)
      .replace(/\{\{\s*phone\s*\}\}/g, phone)
      .replace(/_{4}р\./g, `${currentYear}р.`)
      .replace(/№_____/g, `№${cardNumber}`)
      .replace(/Лікар\s*_{10,}/g, `Лікар ${doctorFullName}`);

    // Відкриваємо нове вікно та вставляємо заповнений HTML
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Браузер заблокував відкриття нового вікна.\nДозвольте pop-up для цього сайту і спробуйте ще раз.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(filled);
    printWindow.document.close();

    // Друкуємо після повного завантаження вікна
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => printWindow.print(), 300);
    };

    // Резервний варіант — якщо onload вже не спрацює
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        printWindow.focus();
        printWindow.print();
      }
    }, 1200);
  };

  return (
    <Button
      onClick={handlePrint}
      className={className}
      title="Роздрукувати форму 043/О — Стоматологічну амбулаторну карту"
    >
      <Printer className="w-4 h-4 mr-2" />
      Роздрукувати
    </Button>
  );
}
