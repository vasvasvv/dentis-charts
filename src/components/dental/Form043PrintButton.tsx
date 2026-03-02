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

  const handlePrint = async () => {
    try {
      // Завантажуємо HTML шаблон форми 043
      const response = await fetch('/src/assets/f043.html');
      if (!response.ok) {
        throw new Error(`Не вдалося завантажити шаблон: ${response.status}`);
      }
      const htmlContent = await response.text();

      // Поточна дата та рік
      const today = new Date();
      const currentYear = today.getFullYear().toString();
      const todayFormatted = today.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // ПІБ лікаря прив'язаного до пацієнта


      // Повне ПІБ пацієнта
      const patientFullName =
        `${patient.lastName} ${patient.firstName} ${patient.middleName || ''}`.trim();

      // Дата народження
      const dateOfBirth = patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toLocaleDateString('uk-UA')
        : '';

      // Адреса
     

      // Телефон
      const phone = formatPhoneForDisplay(patient.phone);

      // Номер картки (id або cardNumber пацієнта)
    

      // Заповнення шаблону
      let filled = htmlContent
        // ПІБ пацієнта
        .replace(/\{\{\s*fullName\s*\}\}/g, patientFullName)
        .replace(/\{\{\s*lastName\s*\}\}/g, patient.lastName || '')
        .replace(/\{\{\s*firstName\s*\}\}/g, patient.firstName || '')
        .replace(/\{\{\s*middleName\s*\}\}/g, patient.middleName || '')

        // Дата народження
        .replace(/\{\{\s*dateOfBirth\s*\}\}/g, dateOfBirth)

        // Адреса та телефон
        
        .replace(/\{\{\s*phone\s*\}\}/g, phone)

        // Рік (рядок "____р." у шаблоні)
        .replace(/_{4}р\./g, `${currentYear}р.`)

        // Номер картки (рядок "№_____" у шаблоні)
       

        // Лікар (рядок "Лікар ____________…" — замінюємо підкреслення після слова "Лікар ")
    

        // Сьогоднішня дата де є шаблонний тег (якщо є)
        .replace(/\{\{\s*today\s*\}\}/g, todayFormatted)
        .replace(/\{\{\s*currentYear\s*\}\}/g, currentYear);

      // Відкриваємо нове вікно та друкуємо
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Браузер заблокував відкриття нового вікна. Дозвольте pop-up для цього сайту.');
        return;
      }

      printWindow.document.open();
      printWindow.document.write(filled);
      printWindow.document.close();

      // Чекаємо завантаження ресурсів (зображень, стилів) і тільки тоді друкуємо
      printWindow.addEventListener('load', () => {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
      });

      // Резервний варіант якщо подія load вже відбулась
      if (printWindow.document.readyState === 'complete') {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (error) {
      console.error('Помилка завантаження шаблону форми 043:', error);
      alert('Помилка завантаження шаблону форми 043/О. Перевірте консоль для деталей.');
    }
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
