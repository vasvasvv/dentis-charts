# Інструкції по міграції бази даних

## Зміни в проекті

Були внесені наступні зміни для виправлення проблеми з відображенням лікарів при додаванні пацієнта:

### 1. Зміни в базі даних (schema.sql)

- Додано поле `doctor_id` до таблиці `patients` (обов'язкове поле з зовнішнім ключем на `users.id`)
- Додано поле `middleName` до таблиці `patients` (опціональне)
- Додано поле `gender` до таблиці `patients` (опціональне)

### 2. Зміни в API (worker.ts)

- **GET /api/doctors** - тепер повертає тільки користувачів з роллю `doctor` (role_id = 2), а не super-admin та doctor
- **POST /api/patients** - тепер приймає і зберігає поля `doctorId`, `middleName`, `gender`
- **PUT /api/patients/:id** - новий ендпоінт для оновлення пацієнта
- **DELETE /api/patients/:id** - новий ендпоінт для видалення пацієнта (видаляє також всі пов'язані записи)

### 3. Зміни в фронтенді

- **ClinicContext** - додано методи: `updatePatient`, `deletePatient`, `addVisit`, `deleteVisit`, `getPatientsByDoctor`, `addHistoryEntry`
- **PatientModal** - тепер коректно відображає список лікарів (тільки з роллю doctor)
- **VisitModal** - додано можливість вибору лікаря при створенні візиту

## Інструкції по міграції

### Крок 1: Створення резервної копії

Перед застосуванням міграції **обов'язково** створіть резервну копію вашої бази даних!

```bash
# Для Cloudflare D1
wrangler d1 backup create dentis-db
```

### Крок 2: Застосування міграції

Виконайте SQL-скрипт `migration.sql` на вашій базі даних Cloudflare D1:

```bash
wrangler d1 execute dentis-db --file=./migration.sql
```

Або через Cloudflare Dashboard:
1. Відкрийте D1 Database в Cloudflare Dashboard
2. Перейдіть до розділу "Console"
3. Скопіюйте вміст файлу `migration.sql` та виконайте його

### Крок 3: Призначення лікарів існуючим пацієнтам

Після міграції всі існуючі пацієнти матимуть `doctor_id = 1` (за замовчуванням). Вам потрібно вручну призначити правильних лікарів:

**Варіант А: Призначити всім пацієнтам першого доступного лікаря**

```sql
UPDATE patients 
SET doctor_id = (SELECT id FROM users WHERE role_id = 2 LIMIT 1);
```

**Варіант Б: Призначити кожному пацієнту лікаря вручну**

```sql
-- Приклад: призначити лікаря з ID 3 пацієнту з ID 1
UPDATE patients SET doctor_id = 3 WHERE id = 1;
```

### Крок 4: Деплой оновленого Worker

```bash
npm run deploy
# або
wrangler deploy
```

### Крок 5: Перевірка

1. Увійдіть в додаток
2. Спробуйте додати нового пацієнта - має з'явитися випадаючий список з лікарями
3. Перевірте що відображаються тільки користувачі з роллю "doctor"
4. Перевірте що існуючі пацієнти мають призначеного лікаря

## Можливі проблеми

### Проблема: "Error: NOT NULL constraint failed: patients.doctor_id"

**Рішення:** Переконайтеся що у вас є хоча б один користувач з `role_id = 2` (doctor) в базі даних.

```sql
-- Перевірка наявності лікарів
SELECT * FROM users WHERE role_id = 2;

-- Якщо лікарів немає, створіть хоча б одного
INSERT INTO users (email, password_hash, fullName, role_id) 
VALUES ('doctor@example.com', 'password123', 'Доктор Іванов', 2);
```

### Проблема: Не відображаються лікарі в випадаючому списку

**Рішення:** 
1. Перевірте що API `/api/doctors` повертає лікарів:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://your-worker-url/api/doctors
   ```
2. Перевірте що у користувачів `role_id = 2` (а не 1 або 3)
3. Очистіть кеш браузера

## Відкат міграції (якщо щось пішло не так)

Якщо міграція спричинила проблеми, відновіть резервну копію:

```bash
wrangler d1 backup restore dentis-db <backup-id>
```

Або створіть таблицю `patients` в старому форматі:

```sql
DROP TABLE patients;

CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  dateOfBirth TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Контакти

Якщо виникнуть проблеми з міграцією, зверніться до технічної підтримки.
