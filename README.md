# 🦷 Dentis Charts - Dental Practice Management System

Система управління стоматологічною практикою з використанням React, Cloudflare Workers та D1 Database.

## 📋 Зміст

- [Особливості](#особливості)
- [Технологічний стек](#технологічний-стек)
- [Початок роботи](#початок-роботи)
- [Налаштування Cloudflare](#налаштування-cloudflare)
- [Розгортання](#розгортання)
- [Розробка](#розробка)

## ✨ Особливості

- 👥 Управління пацієнтами
- 📅 Планування та відстеження візитів
- 🦷 Інтерактивна dental chart (схема зубів)
- 👨‍⚕️ Управління лікарями та персоналом
- 🔐 Автентифікація та авторизація (JWT)
- 📊 Історія змін та аудит
- 🌐 API на базі Cloudflare Workers
- 💾 База даних Cloudflare D1 (SQLite)

## 🛠 Технологічний стек

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- shadcn/ui компоненти
- React Query
- React Router

### Backend
- Cloudflare Workers
- Hono (web framework)
- Cloudflare D1 Database
- JWT для автентифікації

## 🚀 Початок роботи

### Вимоги

- Node.js 20+
- npm або yarn
- Cloudflare account
- Git

### Локальна установка

1. **Клонування репозиторію**

```bash
git clone https://github.com/vasvasvv/dentis-charts.git
cd dentis-charts
```

2. **Встановлення залежностей**

```bash
npm install
```

3. **Налаштування конфігурації**

Створіть файл `wrangler.toml` на основі `wrangler.toml.example`:

```bash
cp wrangler.toml.example wrangler.toml
```

Відредагуйте `wrangler.toml` і вставте ваші дані:

```toml
account_id = "YOUR_CLOUDFLARE_ACCOUNT_ID"
database_id = "YOUR_D1_DATABASE_ID"
```

4. **Налаштування локальних змінних**

Створіть файл `.dev.vars` для локальної розробки:

```bash
cp .dev.vars.example .dev.vars
```

Відредагуйте `.dev.vars` і встановіть JWT_SECRET:

```
JWT_SECRET="your-very-long-secret-key-min-32-characters-long"
```

## ⚙️ Налаштування Cloudflare

### 1. Створення D1 Database

```bash
npx wrangler d1 create dentis-charts
```

Скопіюйте `database_id` з виводу команди в `wrangler.toml`.

### 2. Ініціалізація схеми бази даних

```bash
npx wrangler d1 execute dentis-charts --remote --file=schema.sql
```

### 3. Встановлення JWT секрету (для production)

```bash
npx wrangler secret put JWT_SECRET
```

Введіть ваш секретний ключ (мінімум 32 символи).

## 📦 Розгортання

### Автоматичний деплой через GitHub Actions

1. **Налаштуйте GitHub Secrets**

Перейдіть до Settings → Secrets and variables → Actions і додайте:

- `CLOUDFLARE_API_TOKEN` - ваш Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - ваш Cloudflare Account ID
- `JWT_SECRET` - секретний ключ для JWT

2. **Зробіть push в main/master**

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

GitHub Actions автоматично задеплоїть ваш worker при кожному push.

### Ручний деплой

```bash
# Встановіть змінні оточення
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"

# Задеплойте worker
npx wrangler deploy

# Встановіть JWT secret
echo "your-secret" | npx wrangler secret put JWT_SECRET
```

### Деплой frontend (GitHub Pages)

```bash
npm run deploy
```

## 💻 Розробка

### Локальний сервер (Frontend)

```bash
npm run dev
```

Відкрийте http://localhost:5173

### Локальний сервер (Worker)

```bash
npx wrangler dev
```

API буде доступний на http://localhost:8787

### Тестування

```bash
npm test
```

### Lint

```bash
npm run lint
```

## 📁 Структура проекту

```
dentis-charts/
├── src/
│   ├── components/       # React компоненти
│   ├── pages/           # Сторінки
│   ├── lib/             # Утиліти
│   └── worker.ts        # Cloudflare Worker (API)
├── public/              # Статичні файли
├── .github/
│   └── workflows/       # GitHub Actions
├── schema.sql          # Схема бази даних
├── wrangler.toml       # Конфігурація Cloudflare
└── package.json
```

## 🔐 Безпека

- **НІКОЛИ** не commitьте `wrangler.toml` з реальними ID в публічний репозиторій
- **ЗАВЖДИ** використовуйте `wrangler secret` для чутливих даних
- JWT токени мають термін дії 24 години
- Використовуйте сильні паролі (у production замініть simpleHash на bcrypt)

## 📝 API Endpoints

### Автентифікація
- `POST /api/auth/login` - Вхід
- `POST /api/auth/register` - Реєстрація

### Пацієнти
- `GET /api/patients` - Список пацієнтів
- `GET /api/patients/:id` - Деталі пацієнта
- `POST /api/patients` - Створити пацієнта
- `PUT /api/patients/:id` - Оновити пацієнта
- `DELETE /api/patients/:id` - Видалити пацієнта

### Візити
- `GET /api/patients/:id/visits` - Візити пацієнта
- `POST /api/patients/:id/visits` - Створити візит
- `DELETE /api/patients/:patientId/visits/:visitId` - Видалити візит

### Dental Chart
- `GET /api/patients/:id/teeth` - Стан зубів
- `POST /api/patients/:id/teeth` - Оновити стан зуба

### Лікарі
- `GET /api/doctors` - Список лікарів

## 🤝 Внесок

Pull requests вітаються! Для великих змін спочатку відкрийте issue.

## 📄 Ліцензія

MIT

## 👥 Автори

- Vasyl - Initial work

## 📞 Підтримка

Якщо у вас виникли проблеми, створіть issue на GitHub.

---

**Важливо**: Цей проект використовує Cloudflare Free tier, який має певні обмеження. Для production використання розгляньте платні плани.