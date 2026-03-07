import React, { useState, useEffect, useRef, useCallback } from 'react';
import htmlTemplate from '@/assets/f043.html?raw';
import { useClinic } from '@/context/ClinicContext';
import { formatPhoneForDisplay } from '@/components/patients/PatientModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Printer, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useBase64Images } from '@/hooks/useBase64Images';
// ─── Types ────────────────────────────────────────────────────────────────────
interface ToothEntry { numerator: string; denominator: string; }
interface FormData {
  cardNumber: string; year: string; fullName: string; gender: string;
  dobD1: string; dobD2: string; dobM1: string; dobM2: string; dobY1: string; dobY2: string;
  phone: string; diagnoz: string; skargy: string; pereneseni: string; rozvytok: string;
  daniOglyadu: string; teeth: Record<number, ToothEntry>; toothNotes: string;
  prykus: string; stanGigieny: string; daniRentgen: string;
  kolirvita: string; navchannya: string; kontrolGigieny: string;
  journal: Array<{ date: string; note: string }>;
  planObstezhenny: string[]; planLikuvannya: string[];
  likar: string; zavViddil: string;
}
// ─── Tooth layout ─────────────────────────────────────────────────────────────
const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const TOOTH_LEFTS_UPPER = [128, 274, 331, 388, 445, 503, 560, 617, 674, 731, 789, 846, 903, 960, 1018, 1075];
const TOOTH_LEFTS_LOWER = [128, 293, 351, 408, 465, 523, 580, 637, 694, 751, 808, 866, 923, 980, 1037, 1095];
function statusToCode(s: string): string {
  if (!s) return '';
  const l = s.toLowerCase().trim();
  if (l.includes('карієс') || l === 'c') return 'C';
  if (l.includes('пульпіт') || l === 'p') return 'P';
  if (l.includes('періодонтит') || l === 'pt') return 'Pt';
  if (l.includes('відсутн') || l === 'a') return 'A';
  if (l.includes('корінь') || l === 'r') return 'R';

  if (l.includes('коронка') || l === 'cd') return 'Cd';
  if (l.includes('пломба') || l === 'pl') return 'Pl';
  if (l.includes('фасетка') || l === 'f') return 'F';
  if (l.includes('штучний') || l === 'ar') return 'ar';
  if (l.includes('реставрація')) return 'r';
  if (l.includes('штифт') || l === 'pin') return 'pin';
  if (l.includes('імплант') || l === 'i') return 'I';
  if (l.includes('камінь') || l === 'dc') return 'Dc';
  return s;
}
// ─── HTML builder ─────────────────────────────────────────────────────────────
function buildHTML(f: FormData, imgs: string[]): string {
  let html = htmlTemplate;
  imgs.forEach((b64, i) => {
    html = html.replace(new RegExp(`src="target00${i + 1}\\.png"`, 'g'), `src="${b64}"`);
  });
  const fillCell = (top: number, left: number, value: string) => {
    if (!value) return;
    html = html.replace(
      new RegExp(`(<p style="position:absolute;top:${top}px;left:${left}px[^>]*>)\\s*&#160;\\s*(<\\/p>)`),
      `$1${value}$2`
    );
  };
  html = html.replace(/№_____/, `№${f.cardNumber}`);
  html = html.replace(/_{4}р\./, `${f.year}р.`);
  fillCell(311, 772, f.fullName);
  fillCell(372, 378, f.gender);
  const dobLefts = [732, 771, 810, 849, 888, 927];
  const dobVals = [f.dobD1, f.dobD2 + '.', f.dobM1, f.dobM2 + '.', f.dobY1, f.dobY2 + '.'];
  dobLefts.forEach((left, i) => fillCell(372, left, dobVals[i]));
  if (f.phone) {
    html = html.replace(
      '<p style="position:absolute;top:416px;left:138px;white-space:nowrap"',
      `<p style="position:absolute;top:422px;left:380px;white-space:nowrap" class="ft17">${f.phone}</p>\n<p style="position:absolute;top:416px;left:138px;white-space:nowrap"`
    );
  }
  fillCell(485, 129, f.diagnoz);
  fillCell(546, 129, f.skargy);
  fillCell(607, 424, f.pereneseni);
  fillCell(710, 434, f.rozvytok);
  fillCell(140, 128, f.daniOglyadu);
  UPPER_TEETH.forEach((num, i) => {
    const t = f.teeth[num];
    if (t?.numerator) fillCell(268, TOOTH_LEFTS_UPPER[i], t.numerator);

    if (t?.denominator) fillCell(307, TOOTH_LEFTS_UPPER[i], t.denominator);
  });
  LOWER_TEETH.forEach((num, i) => {
    const t = f.teeth[num];
    if (t?.numerator) fillCell(577, TOOTH_LEFTS_LOWER[i], t.numerator);
    if (t?.denominator) fillCell(617, TOOTH_LEFTS_LOWER[i], t.denominator);
  });
  fillCell(382, 128, f.toothNotes);
  fillCell(153, 129, f.prykus);
  fillCell(214, 129, f.stanGigieny);
  fillCell(515, 129, f.daniRentgen);
  fillCell(607, 286, f.kolirvita);
  fillCell(649, 520, f.navchannya);
  fillCell(706, 809, f.kontrolGigieny);
  const tops4 = [209, 240, 270, 301, 331, 362, 392, 422, 453, 484, 514, 544, 575, 605, 636, 666, 697];
  const tops5 = [188, 219, 249, 279, 310, 340, 371, 401, 432, 462, 493, 523, 553, 584, 614, 645, 675, 706];
  f.journal.slice(0, tops4.length).forEach((j, i) => {
    fillCell(tops4[i], 128, j.date);
    fillCell(tops4[i], 306, j.note);
  });
  f.journal.slice(tops4.length, tops4.length + tops5.length).forEach((j, i) => {
    fillCell(tops5[i], 128, j.date);
    fillCell(tops5[i], 306, j.note);
  });
  // Лікар — стор. 4 і стор. 5. У шаблоні між "Лікар" і підкресленнями стоїть &#160; (HTML entity)
  html = html.replace(/Лікар&#160;_{10,}/g, `Лікар&#160;${f.likar}`);
  const planTops = [141, 171, 201, 230, 260, 289, 319, 348, 378, 408, 437, 467, 496, 526, 556, 585, 615, 644, 674, 704, 733];
  f.planObstezhenny.slice(0, planTops.length).forEach((v, i) => fillCell(planTops[i], 129, v));
  f.planLikuvannya.slice(0, planTops.length).forEach((v, i) => fillCell(planTops[i], 662, v));
  return html;
}
// ─── Init from patient ────────────────────────────────────────────────────────
function initFromPatient(patient: any, doctors: any[]): FormData {
  const doctor = doctors?.find(d => d.id === patient?.doctorId);
  const rawPhone = formatPhoneForDisplay(patient?.phone ?? '');
  const phone = rawPhone.startsWith('+38') ? rawPhone : rawPhone ? `+38${rawPhone.replace(/^\+?38/, '')}` : '';
  let dobD1 = '', dobD2 = '', dobM1 = '', dobM2 = '', dobY1 = '', dobY2 = '';
  if (patient?.dateOfBirth) {
    const dob = new Date(patient.dateOfBirth);

    const dd = String(dob.getDate()).padStart(2, '0');
    const mm = String(dob.getMonth() + 1).padStart(2, '0');
    const yy = String(dob.getFullYear()).slice(-2);
    [dobD1, dobD2, dobM1, dobM2, dobY1, dobY2] = [dd[0], dd[1], mm[0], mm[1], yy[0], yy[1]];
  }
  const teeth: Record<number, ToothEntry> = {};
  if (Array.isArray(patient?.dentalChart)) {
    for (const t of patient.dentalChart) {
      const num = t.toothNumber ?? t.tooth_number;
      const status = t.status ?? t.description ?? '';
      if (num) teeth[num] = { numerator: statusToCode(status), denominator: '' };
    }
  }
  return {
    cardNumber: String(Math.floor(Math.random() * (8790 - 4560 + 1)) + 4560),
    year: String(new Date().getFullYear()),
    fullName: `${patient?.lastName ?? ''} ${patient?.firstName ?? ''} ${patient?.middleName ?? ''}`.trim(),
    gender: patient?.gender === 'male' ? '1' : patient?.gender === 'female' ? '2' : '',
    dobD1, dobD2, dobM1, dobM2, dobY1, dobY2,
    phone,
    diagnoz: '', skargy: '', pereneseni: '', rozvytok: '',
    daniOglyadu: '', teeth, toothNotes: '',
    prykus: '', stanGigieny: '', daniRentgen: '',
    kolirvita: '', navchannya: '', kontrolGigieny: '',
    journal: Array(35).fill(null).map(() => ({ date: '', note: '' })),
    planObstezhenny: Array(21).fill(''),
    planLikuvannya: Array(21).fill(''),
    likar: doctor?.name ?? '',
    zavViddil: '',
  };
}
// ─── Component ────────────────────────────────────────────────────────────────
interface Props { onClose: () => void; }
export function Form043Editor({ onClose }: Props) {
  const { selectedPatientId, patients, doctors } = useClinic();
  const patient = patients.find(p => p.id === selectedPatientId);
  const [formData, setFormData] = useState<FormData>(() => initFromPatient(patient, doctors ?? []));
  const [previewPage, setPreviewPage] = useState(1);
  // On mobile the preview panel is hidden by default; user can toggle it
  const [showPreview, setShowPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const iframeCallbackRef = useCallback((node: HTMLIFrameElement | null) => {
    iframeRef.current = node;
    // When iframe mounts, immediately apply the already-built blob URL if available
    if (node && blobUrlRef.current) {
      node.src = blobUrlRef.current + `#page${previewPage}-div`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const blobUrlRef = useRef<string | null>(null);
  const images = useBase64Images();
  // Lock body scroll when the editor opens, preserving current scroll position
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    return () => {
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const updatePreview = useCallback(() => {
    if (!images) return;
    const html = buildHTML(formData, images);
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const blob = new Blob([html], { type: 'text/html' });
    blobUrlRef.current = URL.createObjectURL(blob);
    if (iframeRef.current) {
      iframeRef.current.src = blobUrlRef.current + `#page${previewPage}-div`;
    }
  }, [formData, previewPage, images]);
  useEffect(() => { updatePreview(); }, [formData, previewPage, images]);
  useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); }, []);
  const set = (key: keyof FormData, value: any) =>
    setFormData(p => ({ ...p, [key]: value }));
  const setTooth = (num: number, field: 'numerator' | 'denominator', val: string) =>
    setFormData(p => ({ ...p, teeth: { ...p.teeth, [num]: { ...p.teeth[num], [field]: val } } }));
  const setJournal = (i: number, field: 'date' | 'note', val: string) =>
    setFormData(p => { const j = [...p.journal]; j[i] = { ...j[i], [field]: val }; return { ...p, journal: j }; });
  const setPlan = (field: 'planObstezhenny' | 'planLikuvannya', i: number, val: string) =>
    setFormData(p => { const arr = [...p[field]]; arr[i] = val; return { ...p, [field]: arr }; });
  const handlePrint = () => {
    if (!images) { alert('Зображення ще завантажуються, спробуйте за секунду'); return; }

    const html = buildHTML(formData, images);
    const w = window.open('', '_blank');
    if (!w) { alert('Дозвольте pop-up для цього сайту'); return; }
    w.document.open(); w.document.write(html); w.document.close();
    w.onload = () => { w.focus(); setTimeout(() => w.print(), 300); };
    setTimeout(() => { if (w && !w.closed) { w.focus(); w.print(); } }, 1200);
  };
  const inp = "h-8 text-sm border-slate-200 focus-visible:ring-1 focus-visible:ring-teal-500 rounded-md";
  const lbl = "text-[11px] font-medium text-slate-500 mb-0.5 block uppercase tracking-wide";
  const ta = "text-sm border-slate-200 focus-visible:ring-1 focus-visible:ring-teal-500 min-h-[56px]";
  const SCALE = 0.62;
  const iframeW = 1262;
  const iframeH = 892;
  const scaledW = Math.round(iframeW * SCALE);
  const scaledH = Math.round(iframeH * SCALE);
  // ── Preview panel (shared between mobile overlay and desktop side-by-side) ──
  const PreviewPanel = () => (
    <div className="flex flex-col bg-slate-200 overflow-hidden flex-1 min-w-0">
      {/* Navbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 text-white shrink-0 gap-2">
        <span className="text-xs font-medium whitespace-nowrap">Стор. {previewPage}</span>
        <div className="flex gap-0.5 items-center">
          <button onClick={() => setPreviewPage(p => Math.max(1, p - 1))} disabled={previewPage === 1}
            className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <button key={n} onClick={() => setPreviewPage(n)}
              className={`w-6 h-6 text-[11px] rounded font-semibold transition-colors ${previewPage === n ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
              {n}
            </button>
          ))}
          <button onClick={() => setPreviewPage(p => Math.min(6, p + 1))} disabled={previewPage === 6}
            className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Close preview on mobile */}
        <button
          onClick={() => setShowPreview(false)}
          className="sm:hidden p-1 rounded hover:bg-slate-700 transition-colors ml-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* iframe */}
      <div className="flex-1 overflow-auto p-3 flex items-start justify-start">
        <div style={{ width: scaledW, height: scaledH, position: 'relative', flexShrink: 0 }}>
          <iframe
            ref={iframeCallbackRef}
            title="Форма 043"
            style={{
              width: iframeW,
              height: iframeH,
              transform: `scale(${SCALE})`,
              transformOrigin: 'top left',
              border: 'none',
              borderRadius: 2,
              boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
            }}
          />
        </div>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-x-0 z-40 flex h-full bg-slate-900/80 backdrop-blur-sm" style={{ top: '72px', bottom: '0px' }}>
      {/*
Layout strategy:
- Mobile (<sm): form fills full width; preview slides in as a full-screen overlay
- Desktop (≥sm): side-by-side (440 px form + rest for preview)
*/}
      {/* ── Form panel ── */}
      <div className={`
flex flex-col bg-white shadow-2xl overflow-hidden border-r border-slate-100 shrink-0 h-full
w-full sm:w-[440px]
${showPreview ? 'hidden sm:flex' : 'flex'}
`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-teal-600 text-white shrink-0">
          <div className="min-w-0">
            <p className="font-semibold text-sm">Форма 043/О</p>
            <p className="text-[11px] text-teal-200 truncate max-w-[200px] sm:max-w-[270px] mt-0.5">
              {formData.fullName || 'Пацієнт'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">

            <Button size="sm" onClick={handlePrint}
              className="h-7 px-2 text-xs bg-white text-teal-700 hover:bg-teal-50 gap-1">
              <Printer className="w-3 h-3" />
              <span className="hidden xs:inline">Друк</span>
            </Button>
            {/* Toggle preview — mobile only */}
            <Button size="sm" onClick={() => setShowPreview(true)}
              className="h-7 px-2 text-xs bg-white text-teal-700 hover:bg-teal-50 gap-1 sm:hidden">
              <Eye className="w-3 h-3" />
            </Button>
            <button onClick={onClose} className="ml-1 p-1 rounded hover:bg-teal-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <Tabs defaultValue="p1" className="flex flex-col min-h-0 flex-1">
          {/* Scrollable tab bar on small screens */}
          <div className="overflow-x-auto shrink-0 border-b border-slate-100 bg-slate-50">
            <TabsList className="w-max min-w-full rounded-none bg-transparent h-9 px-2 justify-start gap-0.5">
              {[['p1', 'Стор. 1'], ['p2', 'Зуби'], ['p3', 'Огляд'], ['p4', 'Щоденник'], ['p6', 'План']].map(([v, l]) => (
                <TabsTrigger key={v} value={v}
                  className="text-[11px] px-2.5 h-7 rounded whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm">
                  {l}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {/* ── Page 1 ── */}
          <TabsContent value="p1" className="overflow-y-auto p-4 space-y-3 mt-0" style={{height:'calc(100vh - 72px - 56px - 36px)',overflowY:'auto'}}>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className={lbl}>Номер картки</Label>
                <Input className={inp} value={formData.cardNumber} onChange={e => set('cardNumber', e.target.value)} /></div>
              <div><Label className={lbl}>Рік</Label>
                <Input className={inp} value={formData.year} onChange={e => set('year', e.target.value)} /></div>
            </div>
            <div><Label className={lbl}>ПІБ пацієнта</Label>
              <Input className={inp} value={formData.fullName} onChange={e => set('fullName', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className={lbl}>Стать</Label>
                <Select value={formData.gender} onValueChange={v => set('gender', v)}>
                  <SelectTrigger className={inp}><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 — чоловіча</SelectItem>
                    <SelectItem value="2">2 — жіноча</SelectItem>

                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className={lbl}>Телефон</Label>
              <Input className={inp} value={formData.phone} onChange={e => set('phone', e.target.value)} placeholder="+380..." inputMode="tel" /></div>
            <div>
              <Label className={lbl}>Дата народження</Label>
              <div className="flex flex-wrap gap-1 items-center">
                {(['dobD1', 'dobD2', 'dobM1', 'dobM2', 'dobY1', 'dobY2'] as const).map((k, i) => (
                  <React.Fragment key={k}>
                    <Input className="w-9 h-8 text-center text-sm p-0 border-slate-200" maxLength={1}
                      value={formData[k]} onChange={e => set(k, e.target.value)} inputMode="numeric" />
                    {(i === 1 || i === 3) && <span className="text-slate-400 font-bold">.</span>}
                  </React.Fragment>
                ))}
                <span className="text-[10px] text-slate-400">дд.мм.рр</span>
              </div>
            </div>
            <div><Label className={lbl}>Діагноз</Label>
              <Textarea className={ta} value={formData.diagnoz} onChange={e => set('diagnoz', e.target.value)} /></div>
            <div><Label className={lbl}>Скарги</Label>
              <Textarea className={ta} value={formData.skargy} onChange={e => set('skargy', e.target.value)} /></div>
            <div><Label className={lbl}>Перенесені та супутні захворювання</Label>
              <Textarea className={ta} value={formData.pereneseni} onChange={e => set('pereneseni', e.target.value)} /></div>
            <div><Label className={lbl}>Розвиток теперішнього захворювання</Label>
              <Textarea className={ta} value={formData.rozvytok} onChange={e => set('rozvytok', e.target.value)} /></div>
          </TabsContent>
          {/* ── Page 2: Зубна карта ── */}
          <TabsContent value="p2" className="overflow-y-auto p-4 space-y-3 mt-0" style={{height:'calc(100vh - 72px - 56px - 36px)',overflowY:'auto'}}>
            <div><Label className={lbl}>Дані об'єктивного дослідження / зовнішній огляд</Label>
              <Textarea className={ta} value={formData.daniOglyadu} onChange={e => set('daniOglyadu', e.target.value)} /></div>
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-2 text-[10px] text-teal-800 leading-relaxed">
              <b>Коди:</b> C-карієс · P-пульпіт · Pt-періодонтит · A-відсутній · R-корінь · Cd-коронка · Pl-пломба · F-фасетка · ar-штучний · r-реставрація · pin-штифт · I-імплантат · Dc-камінь
            </div>
            {[
              { label: 'Верхня щелепа', tList: UPPER_TEETH },
              { label: 'Нижня щелепа', tList: LOWER_TEETH },
            ].map(({ label, tList }) => (
              <div key={label}>
                <div className="text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">{label}</div>
                {/* Tooth table — horizontally scrollable */}
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="border-collapse text-[10px]" style={{ minWidth: 'max-content' }}>
                    <thead>
                      <tr className="bg-slate-50">

                        <td className="border border-slate-200 px-1 py-0.5 text-slate-400 w-12 text-center sticky left-0 bg-slate-50 z-10">Зуб</td>
                        {tList.map(n => <td key={n} className="border border-slate-200 w-8 text-center font-mono font-bold text-slate-700 py-0.5">{n}</td>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(['numerator', 'denominator'] as const).map((field, ri) => (
                        <tr key={field}>
                          <td className="border border-slate-200 px-1 text-slate-400 text-center text-[9px] py-0.5 sticky left-0 bg-white z-10 whitespace-nowrap">
                            {ri === 0 ? 'Огляд' : 'Ліку-\nвання'}
                          </td>
                          {tList.map(n => (
                            <td key={n} className="border border-slate-200 p-0">
                              <input
                                className={`w-8 text-center text-[11px] border-0 outline-none p-0.5 h-7 focus:bg-teal-50 ${ri === 0 ? 'bg-white' : 'bg-slate-50'}`}
                                maxLength={4}
                                value={formData.teeth[n]?.[field] ?? ''}
                                onChange={e => setTooth(n, field, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            <div><Label className={lbl}>Додаткові дані щодо зубів (під таблицею)</Label>
              <Textarea className={ta} value={formData.toothNotes} onChange={e => set('toothNotes', e.target.value)} /></div>
          </TabsContent>
          {/* ── Page 3: Клінічний огляд ── */}
          <TabsContent value="p3" className="overflow-y-auto p-4 space-y-3 mt-0" style={{height:'calc(100vh - 72px - 56px - 36px)',overflowY:'auto'}}>
            <div><Label className={lbl}>Прикус (тип)</Label>
              <Input className={inp} value={formData.prykus} onChange={e => set('prykus', e.target.value)} /></div>
            <div><Label className={lbl}>Стан гігієни, слизової, ясен, альвеолярних відростків. Індекси ГІ та РМА</Label>
              <Textarea className={ta + ' min-h-[80px]'} value={formData.stanGigieny} onChange={e => set('stanGigieny', e.target.value)} /></div>
            <div><Label className={lbl}>Дані рентгенівських обстежень та лабораторних досліджень</Label>
              <Textarea className={ta + ' min-h-[80px]'} value={formData.daniRentgen} onChange={e => set('daniRentgen', e.target.value)} /></div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              <div><Label className={lbl}>Колір за шкалою "Віта"</Label>
                <Input className={inp} value={formData.kolirvita} onChange={e => set('kolirvita', e.target.value)} /></div>
              <div><Label className={lbl}>Навчання гігієні</Label>
                <Input className={inp} value={formData.navchannya} onChange={e => set('navchannya', e.target.value)} /></div>
            </div>
            <div><Label className={lbl}>Дата контролю гігієни порожнини рота</Label>
              <Input className={inp} value={formData.kontrolGigieny} onChange={e => set('kontrolGigieny', e.target.value)} /></div>
          </TabsContent>
          {/* ── Pages 4+5: Щоденник ── */}
          <TabsContent value="p4" className="overflow-y-auto p-4 mt-0" style={{height:'calc(100vh - 72px - 56px - 36px)',overflowY:'auto'}}>
            <div className="border-b border-slate-100 pb-3 mb-3 grid grid-cols-1 xs:grid-cols-2 gap-3">
              <div><Label className={lbl}>Лікар (підпис)</Label>
                <Input className={inp} value={formData.likar} onChange={e => set('likar', e.target.value)} /></div>
              <div><Label className={lbl}>Зав. відділенням</Label>
                <Input className={inp} value={formData.zavViddil} onChange={e => set('zavViddil', e.target.value)} /></div>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 uppercase tracking-wide font-medium">Щоденник лікаря — стор. 4–5 (35 записів)</p>
            <div className="space-y-1.5">
              {formData.journal.map((j, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[10px] text-slate-300 w-4 text-right shrink-0">{i + 1}</span>
                  <Input
                    className="w-24 h-7 text-xs border-slate-200 shrink-0 px-1.5"
                    placeholder="дд.мм.рр"
                    inputMode="numeric"
                    value={j.date}
                    onChange={e => setJournal(i, 'date', e.target.value)}
                  />
                  <Input
                    className="h-7 text-xs border-slate-200 flex-1 px-1.5 min-w-0"
                    placeholder={`Запис ${i + 1}`}
                    value={j.note}
                    onChange={e => setJournal(i, 'note', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          {/* ── Page 6: План ── */}
          <TabsContent value="p6" className="overflow-y-auto p-4 mt-0" style={{height:'calc(100vh - 72px - 56px - 36px)',overflowY:'auto'}}>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide font-medium text-teal-700 mb-2">План обстеження</p>
                <div className="space-y-1">
                  {formData.planObstezhenny.map((v, i) => (
                    <Input key={i} className="h-7 text-xs border-slate-200 px-2" value={v}
                      onChange={e => setPlan('planObstezhenny', i, e.target.value)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide font-medium text-teal-700 mb-2">План лікування</p>

                <div className="space-y-1">
                  {formData.planLikuvannya.map((v, i) => (
                    <Input key={i} className="h-7 text-xs border-slate-200 px-2" value={v}
                      onChange={e => setPlan('planLikuvannya', i, e.target.value)} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* ── Preview panel ──
Desktop: always visible alongside form
Mobile: full-screen overlay when showPreview === true
*/}
      <div className={`
flex-1 min-w-0
sm:flex
${showPreview ? 'flex fixed inset-x-0 z-[60]' : 'hidden'}
`} style={showPreview ? { top: '72px', bottom: 0 } : undefined}>
        <PreviewPanel />
      </div>
    </div>
  );
}