# 📋 Інструкція з розгортання оновлень Dentis Charts

## ✅ Виконані зміни

### 1. База даних (D1)
- ✅ Додано поле `type` в таблицю `visits` для розрізнення past/future візитів
- ✅ Оновлено `schema.sql` з новою структурою таблиці visits

### 2. API Worker (src/worker.ts)
- ✅ Додано POST endpoint `/api/patients/:id/visits` для створення візитів
- ✅ Додано DELETE endpoint `/api/patients/:patientId/visits/:visitId` для видалення візитів
- ✅ Додано GET endpoint `/api/patients/:id` для отримання повної інформації про пацієнта
- ✅ Оновлено GET `/api/patients` для повернення пацієнтів з візитами та dental chart
- ✅ Додано підтримку поля `type` при створенні візитів

### 3. Frontend (React)
- ✅ Оновлено `ClinicContext.tsx` для використання нових API endpoints
- ✅ Виправлено типи для `addVisit` та `deleteVisit` (тепер async)

## 🚀 Кроки для розгортання

### Крок 1: Міграція бази даних (ЗАВЕРШЕНО ✅)
Поле `type` вже додано до бази даних на Cloudflare.

Якщо потрібно перезастосувати міграцію:
```bash
wrangler d1 execute dentis-charts --remote --file=migration-visits-type.sql
```

### Крок 2: Розгортання API Worker

**Важливо:** Перед розгортанням встановіть залежності:

```bash
cd /mnt/workspace/fJ3y9p9qnYTECqbXyBzrVPf6Hk9
npm install
```

Потім задеплойте worker:

```bash
export CLOUDFLARE_API_TOKEN="FTOFM5dxCD0ypXdojzv_P6DbFG5AbcwYZeOcRYRJ"
export CLOUDFLARE_ACCOUNT_ID="a22d80896b0eccc01b40478bc64c9849"
wrangler deploy
```

**Альтернатива:** Розгорніть через Cloudflare Dashboard:
1. Зайдіть на https://dash.cloudflare.com
2. Відкрийте Workers & Pages
3. Знайдіть `dentis-cards-api`
4. Завантажте оновлений файл `src/worker.ts` вручну

### Крок 3: Розгортання Frontend

Якщо проект розгортається на GitHub Pages:

```bash
npm run deploy
```

Якщо використовується інша платформа (Vercel, Netlify тощо):

```bash
npm run build
# Потім завантажте папку dist на вашу платформу
```

## 📊 Структура оновленої бази даних

### Таблиця `visits`
```sql
CREATE TABLE visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  visitDate TEXT NOT NULL,
  type TEXT DEFAULT 'future' CHECK(type IN ('past', 'future')),  -- НОВЕ ПОЛЕ
  reason TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES users(id)
);
```

## 🔗 Нові API Endpoints

### POST `/api/patients/:id/visits`
Створення нового візиту

**Request Body:**
```json
{
  "visitDate": "2026-03-15",
  "type": "future",
  "reason": "Планова перевірка",
  "notes": "Пацієнт скаржиться на біль",
  "doctorId": "2"
}
```

### DELETE `/api/patients/:patientId/visits/:visitId`
Видалення візиту

### GET `/api/patients/:id`
Отримання повної інформації про пацієнта (з візитами та dental chart)

**Response:**
```json
{
  "id": 1,
  "firstName": "Іван",
  "lastName": "Петренко",
  "visits": [...],
  "dentalChart": [...]
}
```

## ⚠️ Важливі примітки

1. **JWT_SECRET**: В `wrangler.toml` встановлено тимчасовий JWT secret. Для продакшену змініть його на реальний:
   ```bash
   wrangler secret put JWT_SECRET
   ```

2. **Доступи**: Переконайтеся що користувачі мають правильні ролі в БД:
   - superadmin (id: 1) - повний доступ
   - doctor (id: 2) - доступ до пацієнтів та dental записів
   - admin (id: 3) - обмежений доступ

3. **Тестування**: Після розгортання перевірте:
   - ✅ Вхід в систему
   - ✅ Створення/редагування пацієнтів
   - ✅ Створення візитів (past/future)
   - ✅ Роботу dental chart
   - ✅ Видалення візитів

## 🐛 Відладка

Якщо виникли проблеми, перевірте логи:

```bash
wrangler tail dentis-cards-api
```

Перевірте стан бази даних:

```bash
wrangler d1 execute dentis-charts --remote --command "SELECT * FROM visits LIMIT 5;"
```

## 📝 Зміни в коді

Основні файли які були змінені:
- `schema.sql` - додано поле type
- `src/worker.ts` - нові endpoints та логіка
- `src/context/ClinicContext.tsx` - оновлені API calls
- `wrangler.toml` - конфігурація для деплою

---

**Виконано:** 28 лютого 2026  
**Статус бази даних:** ✅ Міграція застосована  
**Статус коду:** ✅ Готовий до розгортання
