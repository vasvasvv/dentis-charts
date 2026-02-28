# Dentis Charts - Документація

## 🚀 Швидкий старт

### Локальна розробка
```bash
npm install          # Встановити залежності
npm run dev          # Запустити dev сервер (localhost:8080)
```

### Деплой
```bash
npm run deploy       # Автоматичний деплой на Cloudflare Pages
```

---

## 📁 Структура проекту

```
├── src/
│   ├── components/     # React компоненти
│   │   ├── ui/         # shadcn/ui компоненти
│   │   ├── dental/     # Зубна карта
│   │   ├── patients/   # Управління пацієнтами
│   │   └── auth/       # Авторизація
│   ├── context/        # React Context (Auth)
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Утиліти
│   ├── types/          # TypeScript типи
│   └── worker.ts       # Cloudflare Worker API
├── public/             # Статичні файли
├── dist/               # Build output
└── wrangler.toml       # Cloudflare конфігурація
```

---

## 🔧 Налаштування Cloudflare

### 1. Перший деплой

1. Зайдіть на [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Pages** → **Create a project** → Підключіть GitHub
3. Налаштування:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output:** `dist`
   - **Node version:** `18`

### 2. Налаштування D1 Database

```bash
# Створити базу даних
npx wrangler d1 create dentis-charts

# Скопіюйте database_id в wrangler.toml

# Запустити міграції
npx wrangler d1 execute dentis-charts --file=./schema.sql

# Встановити JWT secret
npx wrangler secret put JWT_SECRET
```

### 3. GitHub Secrets (для CI/CD)

Додайте в **Settings → Secrets → Actions**:
- `CLOUDFLARE_API_TOKEN` - [Створити тут](https://dash.cloudflare.com/profile/api-tokens)
- `CLOUDFLARE_ACCOUNT_ID` - знайти в Dashboard

---

## 🔐 API Endpoints

| Метод | Endpoint | Опис |
|-------|----------|------|
| POST | `/api/auth/login` | Авторизація |
| POST | `/api/auth/register` | Реєстрація |
| GET | `/api/patients` | Список пацієнтів |
| POST | `/api/patients` | Створити пацієнта |
| PUT | `/api/patients/:id` | Оновити пацієнта |
| DELETE | `/api/patients/:id` | Видалити пацієнта |
| GET | `/api/patients/:id/teeth` | Зубна карта |
| POST | `/api/patients/:id/teeth` | Оновити зуб |
| GET | `/api/patients/:id/visits` | Візити |
| POST | `/api/patients/:id/visits` | Додати візит |
| GET | `/api/doctors` | Список лікарів |

---

## 🛠 Скрипти

| Команда | Опис |
|---------|------|
| `npm run dev` | Локальний dev сервер |
| `npm run build` | Production build |
| `npm run preview` | Preview build локально |
| `npm run lint` | Перевірка ESLint |
| `npm run test` | Запуск тестів |
| `npm run deploy` | Деплой на Cloudflare |

---

## 🐛 Вирішення проблем

### CORS помилки
Перевірте що ваш домен додано в `src/worker.ts`:
```typescript
origin: [
  'https://dentis-charts.pages.dev',
  'https://your-domain.com',
  'http://localhost:5173'
]
```

### Build помилки
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Database помилки
```bash
# Перевірити з'єднання
npx wrangler d1 execute dentis-charts --command="SELECT 1"

# Переглянути таблиці
npx wrangler d1 execute dentis-charts --command=".tables"
```

---

## 📝 Ролі користувачів

| Роль | Пацієнти | Зубна карта | Користувачі |
|------|----------|-------------|-------------|
| super-admin | ✅ все | ✅ все | ✅ все |
| doctor | ✅ все | ✅ все | ❌ |
| administrator | ✅ add/edit | ❌ | ❌ |
