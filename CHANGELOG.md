# Changelog

## [Виправлення] - 2024

### Виправлено

#### Проблема з відображенням лікарів при додаванні пацієнта

**Симптоми:**
- При додаванні нового пацієнта акордеон з вибором лікаря не відображався або був порожнім
- Лікарі не були прив'язані до пацієнтів в базі даних

**Причини:**
1. Відсутність поля `doctor_id` в таблиці `patients` в базі даних
2. API `/api/doctors` повертав як super-admin, так і doctor (замість тільки doctor)
3. Відсутність методів `updatePatient`, `deletePatient`, `getPatientsByDoctor` в `ClinicContext`
4. Відсутність методів `addVisit`, `deleteVisit` в `ClinicContext`

**Виправлення:**

### База даних (schema.sql)
- ✅ Додано поле `doctor_id INTEGER NOT NULL` з зовнішнім ключем на `users(id)`
- ✅ Додано поле `middleName TEXT` для по-батькові пацієнта
- ✅ Додано поле `gender TEXT` для статі пацієнта

### Backend (worker.ts)
- ✅ Виправлено `GET /api/doctors` - тепер повертає тільки користувачів з `role_id = 2` (doctor)
- ✅ Оновлено `POST /api/patients` - додано підтримку полів `doctorId`, `middleName`, `gender`
- ✅ Додано `PUT /api/patients/:id` - новий ендпоінт для оновлення пацієнта
- ✅ Додано `DELETE /api/patients/:id` - новий ендпоінт для видалення пацієнта (каскадне видалення tooth_data та visits)

### Frontend

#### ClinicContext (src/context/ClinicContext.tsx)
- ✅ Додано метод `updatePatient(patientId, patientData)` - оновлення даних пацієнта
- ✅ Додано метод `deletePatient(patientId)` - видалення пацієнта
- ✅ Додано метод `getPatientsByDoctor(doctorId)` - отримання пацієнтів конкретного лікаря
- ✅ Додано метод `addHistoryEntry(patientId, entry)` - додавання запису в історію змін
- ✅ Додано метод `addVisit(patientId, visit)` - додавання візиту
- ✅ Додано метод `deleteVisit(patientId, visitId)` - видалення візиту
- ✅ Виправлено маппінг даних з API - додано `doctorId: p.doctor_id?.toString()`

#### PatientModal (src/components/patients/PatientModal.tsx)
- ✅ Компонент вже був правильно налаштований для відображення лікарів
- ✅ Використовує `doctors.map()` для відображення списку лікарів
- ✅ Коректно передає `doctorId` при створенні/оновленні пацієнта

#### VisitModal (src/components/patients/VisitModal.tsx)
- ✅ Додано випадаючий список для вибору лікаря при створенні візиту
- ✅ Раніше використовувався тільки `selectedDoctorId` (глобальний фільтр)
- ✅ Тепер можна вибрати будь-якого лікаря при створенні візиту

### Міграція

- ✅ Створено файл `migration.sql` для оновлення існуючої бази даних
- ✅ Створено файл `MIGRATION_INSTRUCTIONS.md` з детальними інструкціями

### Тестування

Після застосування виправлень потрібно перевірити:
- [ ] Додавання нового пацієнта - акордеон з лікарями відображається
- [ ] В списку лікарів тільки користувачі з роллю "doctor"
- [ ] Оновлення існуючого пацієнта зберігає прив'язку до лікаря
- [ ] Видалення пацієнта видаляє всі пов'язані дані
- [ ] Фільтрація пацієнтів за лікарем працює коректно
- [ ] Створення візиту дозволяє вибрати лікаря
- [ ] Історія змін пацієнта записується коректно

### Технічні деталі

**Версії:**
- React: 18.x
- TypeScript: 5.x
- Hono: 4.x
- Cloudflare Workers
- Cloudflare D1 (SQLite)

**API Endpoints змінені/додані:**
- `GET /api/doctors` - змінено фільтрацію
- `POST /api/patients` - додано нові поля
- `PUT /api/patients/:id` - новий
- `DELETE /api/patients/:id` - новий

**Структура БД:**
```sql
patients (
  id,
  firstName,
  lastName,
  middleName,      -- НОВЕ
  gender,          -- НОВЕ
  dateOfBirth,
  phone,
  email,
  address,
  notes,
  doctor_id,       -- НОВЕ, NOT NULL, FK -> users(id)
  created_at,
  updated_at
)
```
