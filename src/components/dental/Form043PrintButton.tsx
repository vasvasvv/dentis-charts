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

// ─── Відповідність: статус зуба в БД → умовне позначення форми 043 ────────────
// С-карієс, Р-пульпіт, Pt-періодонтит, R-корінь, A-відсутній,
// Cd-коронка, Pl-пломба, F-фасетка, ar-штучний зуб, r-реставрація,
// pin-штифт, I-імплантація, Dc-зубний камінь
function statusToCode(status: string): string {
  if (!status) return '';
  const s = status.toLowerCase().trim();
  if (s.includes('карієс') || s === 'c' || s === 'каріє') return 'C';
  if (s.includes('пульпіт') || s === 'p') return 'P';
  if (s.includes('періодонтит') || s === 'pt') return 'Pt';
  if (s.includes('відсутн') || s === 'a') return 'A';
  if (s.includes('корінь') || s.includes('корен') || s === 'r') return 'R';
  if (s.includes('коронка') || s === 'cd') return 'Cd';
  if (s.includes('пломба') || s === 'pl') return 'Pl';
  if (s.includes('фасетка') || s === 'f') return 'F';
  if (s.includes('штучний') || s === 'ar') return 'ar';
  if (s.includes('реставрація') || s === 'r' || s.includes('рестав')) return 'r';
  if (s.includes('штифт') || s === 'pin') return 'pin';
  if (s.includes('імплант') || s === 'i') return 'I';
  if (s.includes('камінь') || s === 'dc') return 'Dc';
  if (s.includes('здоров') || s === 'норма' || s === 'ok' || s === '') return '';
  return status; // повертаємо як є якщо невідомий статус
}

// ─── Порядок зубів у рядку таблиці форми 043 (зліва направо) ────────────────
// Верхня щелепа: 18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28
// Нижня щелепа: 48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38
const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// top px координати рядків на сторінці 2 (з HTML)
// Рядок "чисельник" (стан на час огляду) — верхня щелепа: top=268, нижня: top=577
// Рядок "знаменник" (після лікування)   — верхня щелепа: top=307, нижня: top=617
// left координати для кожного зуба (16 колонок):
const TOOTH_LEFTS = [128, 274, 331, 388, 445, 503, 560, 617, 674, 731, 789, 846, 903, 960, 1018, 1075];

export function Form043PrintButton({ className }: Form043PrintButtonProps) {
  const { selectedPatientId, patients, doctors } = useClinic();

  const patient = patients.find(p => p.id === selectedPatientId);

  if (!patient) {
    return null;
  }

  const handlePrint = () => {
    const today = new Date();
    const currentYear = today.getFullYear().toString();

    // ── Лікар ────────────────────────────────────────────────────────────────
    const doctor = doctors?.find(d => d.id === patient.doctorId);
    const doctorFullName = doctor?.name ?? '';

    // ── ПІБ пацієнта ─────────────────────────────────────────────────────────
    const patientFullName =
      `${patient.lastName} ${patient.firstName} ${patient.middleName ?? ''}`.trim();

    // ── Стать: чол=1, жін=2 ──────────────────────────────────────────────────
    const genderCode = patient.gender === 'male' ? '1' : patient.gender === 'female' ? '2' : '';

    // ── Дата народження: ДД.ММ.РР (6 клітинок, крапка після 2-ї і 4-ї) ─────
    let dobCells = ['', '', '', '', '', ''];
    if (patient.dateOfBirth) {
      const dob = new Date(patient.dateOfBirth);
      const dd = String(dob.getDate()).padStart(2, '0');
      const mm = String(dob.getMonth() + 1).padStart(2, '0');
      const yy = String(dob.getFullYear()).slice(-2);
      dobCells = [dd[0], dd[1], mm[0], mm[1], yy[0], yy[1]];
    }

    // ── Телефон з +38 ─────────────────────────────────────────────────────────
    const rawPhone = formatPhoneForDisplay(patient.phone ?? '');
    // Якщо вже починається з +38 — залишаємо, якщо ні — додаємо
    const phone = rawPhone.startsWith('+38')
      ? rawPhone
      : rawPhone
        ? `+38${rawPhone.replace(/^\+?38/, '')}`
        : '';

    // ── Номер картки ──────────────────────────────────────────────────────────
    const cardNumber = Math.floor(Math.random() * (8790 - 4560 + 1)) + 4560;

    // ── Зубна карта: будуємо рядок додаткових даних під таблицею ─────────────
    const dentalChart: Record<number, string> = {};
    if (Array.isArray(patient.dentalChart)) {
      for (const tooth of patient.dentalChart) {
        const num = tooth.toothNumber ?? tooth.tooth_number;
        const status = tooth.status ?? tooth.description ?? '';
        if (num && status) {
          dentalChart[num] = statusToCode(status);
        }
      }
    }

    // Формуємо текстовий опис зубів для рядка під таблицею
    const toothNotes: string[] = [];
    for (const [num, code] of Object.entries(dentalChart)) {
      if (code && code !== '') {
        toothNotes.push(`${num}: ${code}`);
      }
    }
    const toothNotesText = toothNotes.length > 0 ? toothNotes.join(', ') : '';

    // ── Заповнення шаблону ───────────────────────────────────────────────────
    let filled = htmlTemplate

      // ПІБ
      .replace(/\{\{\s*fullName\s*\}\}/g, patientFullName)
      .replace(/\{\{\s*lastName\s*\}\}/g, patient.lastName ?? '')
      .replace(/\{\{\s*firstName\s*\}\}/g, patient.firstName ?? '')
      .replace(/\{\{\s*middleName\s*\}\}/g, patient.middleName ?? '')

      // Рік і номер картки
      .replace(/_{4}р\./g, `${currentYear}р.`)
      .replace(/№_____/g, `№${cardNumber}`)

      // Лікар
      .replace(/Лікар\s*_{10,}/g, `Лікар ${doctorFullName}`)

      // Адреса, телефон — замінюємо поле адреси тільки телефоном
      .replace(
        /(<p[^>]*>)\s*&#160;\s*(<\/p>)(\s*<p[^>]*top:399px;left:378px[^>]*>)/,
        `$1${phone}$2$3`
      );

    // ── Стать: вставляємо цифру в клітинку після тексту ─────────────────────
    // Клітинка для статі: top:372, left:378 (перша порожня після тексту "Стать:")
    filled = filled.replace(
      /(<p style="position:absolute;top:372px;left:378px[^>]*>)\s*&#160;\s*(<\/p>)/,
      `$1${genderCode}$2`
    );

    // ── Дата народження: заповнюємо 6 клітинок (left: 732,771,810,849,888,927) ─
    const dobLefts = [732, 771, 810, 849, 888, 927];
    dobLefts.forEach((left, i) => {
      // кожна парна клітинка (індекс 1,3,5) отримує крапку після цифри
      const val = i % 2 === 1 ? `${dobCells[i]}.` : dobCells[i];
      filled = filled.replace(
        new RegExp(`(<p style="position:absolute;top:372px;left:${left}px[^>]*>)\\s*&#160;\\s*(<\\/p>)`),
        `$1${val}$2`
      );
    });

    // ── Зубна карта: чисельник — стан на час огляду (рядки top:268 і top:577) ─
    // Верхня щелепа (top:268)
    UPPER_TEETH.forEach((toothNum, i) => {
      const code = dentalChart[toothNum] ?? '';
      if (code) {
        const left = TOOTH_LEFTS[i];
        filled = filled.replace(
          new RegExp(`(<p style="position:absolute;top:268px;left:${left}px[^>]*>)\\s*&#160;\\s*(<\\/p>)`),
          `$1${code}$2`
        );
      }
    });

    // Нижня щелепа (top:577)
    LOWER_TEETH.forEach((toothNum, i) => {
      const code = dentalChart[toothNum] ?? '';
      if (code) {
        const left = TOOTH_LEFTS[i];
        filled = filled.replace(
          new RegExp(`(<p style="position:absolute;top:577px;left:${left}px[^>]*>)\\s*&#160;\\s*(<\\/p>)`),
          `$1${code}$2`
        );
      }
    });

    // ── Додаткові дані під таблицею зубів (top:382) ───────────────────────────
    if (toothNotesText) {
      filled = filled.replace(
        /(<p style="position:absolute;top:382px;left:128px[^>]*>)\s*&#160;\s*(<\/p>)/,
        `$1${toothNotesText}$2`
      );
    }

    // ── Відкриваємо вікно друку ───────────────────────────────────────────────
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Браузер заблокував відкриття нового вікна.\nДозвольте pop-up для цього сайту і спробуйте ще раз.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(filled);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => printWindow.print(), 300);
    };

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
