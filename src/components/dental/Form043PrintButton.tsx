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

  const handlePrint = () => {
    // Створюємо HTML-контент форми 043 з даними пацієнта
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      // Формуємо HTML для друку
      const printContent = `
        <!DOCTYPE html>
        <html lang="uk">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Форма 043/О - Стоматологічна карта</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
              border-bottom: 1px solid #000;
              padding-bottom: 10px;
            }
            .form-title { 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .form-number { 
              font-size: 14px; 
              margin-bottom: 10px;
            }
            .patient-info { 
              margin: 15px 0;
            }
            .info-row { 
              display: flex; 
              margin: 5px 0;
            }
            .info-label { 
              min-width: 150px; 
              font-weight: bold;
            }
            .info-value { 
              flex: 1;
            }
            .signature-section { 
              margin-top: 30px;
            }
            .signature-line { 
              margin: 20px 0; 
              border-top: 1px solid #000;
              width: 300px;
            }
            .print-button { 
              position: absolute; 
              top: 10px; 
              right: 10px; 
              padding: 5px 10px; 
              background: #007bff; 
              color: white; 
              border: none; 
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">Друкувати</button>
          
          <div class="header">
            <div class="form-title">МЕДИЧНА ДОКУМЕНТАЦІЯ</div>
            <div class="form-number">Форма № 043/О</div>
            <div class="form-title">Стоматологічна амбулаторна карта</div>
          </div>
          
          <div class="patient-info">
            <div class="info-row">
              <div class="info-label">Прізвище, ім'я, по-батькові:</div>
              <div class="info-value">${patient.lastName} ${patient.firstName} ${patient.middleName || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Дата народження:</div>
              <div class="info-value">${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('uk-UA') : ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Адреса:</div>
              <div class="info-value">${patient.address || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Телефон:</div>
              <div class="info-value">${formatPhoneForDisplay(patient.phone)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Місце роботи/навчання:</div>
              <div class="info-value">${patient.workplace || ''}</div>
            </div>
          </div>
          
          <div class="signature-section">
            <div>Лікар-стоматолог _________________________</div>
            <div class="signature-line"></div>
            <div>Підпис ________________ Печать ________________</div>
            <div>Дата заповнення _______ _______ 20___ р.</div>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Автоматично показуємо діалог друку
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
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