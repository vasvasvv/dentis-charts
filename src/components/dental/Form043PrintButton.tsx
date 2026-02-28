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
          <title>Форма 043/О - Стоматологічна амбулаторна карта</title>
          <style>
            body {
              font-family: Times New Roman, serif;
              margin: 20px;
              line-height: 1.4;
              font-size: 14px;
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
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              border: 1px solid #000;
              padding: 5px;
              vertical-align: top;
            }
            .no-border {
              border: none;
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
            .fill-blanks {
              border-bottom: 1px solid #000;
            }
            .center {
              text-align: center;
            }
            .bold {
              font-weight: bold;
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

          <table>
            <tr>
              <td class="no-border" colspan="3">
                <strong>Прізвище, ім'я, по-батькові:</strong>
                <span class="fill-blanks">${patient.lastName} ${patient.firstName} ${patient.middleName || ''}</span>
              </td>
            </tr>
            <tr>
              <td class="no-border" width="33%">
                <strong>Дата народження:</strong>
                <span class="fill-blanks">${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('uk-UA') : ''}</span>
              </td>
              <td class="no-border" width="33%">
                <strong>Стать:</strong>
                <span class="fill-blanks"></span>
              </td>
              <td class="no-border" width="34%">
                <strong>Паспорт:</strong>
                <span class="fill-blanks"></span>
              </td>
            </tr>
            <tr>
              <td class="no-border" colspan="3">
                <strong>Адреса:</strong>
                <span class="fill-blanks"></span>
              </td>
            </tr>
            <tr>
              <td class="no-border" width="50%">
                <strong>Місце роботи/навчання:</strong>
                <span class="fill-blanks"></span>
              </td>
              <td class="no-border" width="50%">
                <strong>Телефон:</strong>
                <span class="fill-blanks">${formatPhoneForDisplay(patient.phone)}</span>
              </td>
            </tr>
          </table>

          <table>
            <tr>
              <th width="15%" class="center">Дата заповнення</th>
              <th width="15%" class="center">Причина звернення</th>
              <th width="40%" class="center">Об'єктивне дослідження</th>
              <th width="15%" class="center">Діагноз</th>
              <th width="15%" class="center">Лікування</th>
            </tr>
            <tr>
              <td height="100">&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td height="100">&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td height="100">&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td height="100">&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td height="100">&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          </table>

          <div style="margin-top: 20px;">
            <p><strong>Алергічні реакції:</strong> <span class="fill-blanks"></span></p>
            <p><strong>Хронічні захворювання:</strong> <span class="fill-blanks"></span></p>
            <p><strong>Ліки, що приймає:</strong> <span class="fill-blanks"></span></p>
          </div>

          <table style="margin-top: 20px;">
            <tr>
              <th width="10%" class="center">Зуб</th>
              <th width="15%" class="center">Діагноз</th>
              <th width="25%" class="center">Лікування</th>
              <th width="25%" class="center">Пломба</th>
              <th width="25%" class="center">Примітка</th>
            </tr>
            <tr>
              <td class="center">18</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">17</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">16</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">15</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">14</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">13</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">12</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">11</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">21</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">22</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">23</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">24</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">25</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">26</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">27</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">28</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">48</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">47</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">46</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">45</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">44</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">43</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">42</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">41</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">31</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">32</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">33</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">34</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">35</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">36</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">37</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="center">38</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          </table>

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