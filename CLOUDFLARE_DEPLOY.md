# Інструкція з деплою на Cloudflare Pages

Цей проект складається з двох частин:
1. **React Frontend** - статичний сайт
2. **Hono API Worker** - backend API

## Варіант 1: Деплой тільки Frontend (Рекомендовано для початку)

### Налаштування в Cloudflare Pages Dashboard

1. Зайдіть на https://dash.cloudflare.com/
2. Виберіть **Pages** → **Create a project**
3. Підключіть ваш GitHub репозиторій
4. **Build settings:**
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (залишити пустим)
   - **Framework preset:** Vite

5. **Environment variables** (якщо потрібні):
   - Поки не потрібні для статичного сайту

6. Натисніть **Save and Deploy**

### Виправлення помилки "Hono framework cannot be configured"

Якщо ви бачите помилку про Hono:

**Спосіб 1:** В налаштуваннях проекту Cloudflare Pages:
- Перейдіть до **Settings** → **Builds & deployments**
- Змініть **Framework preset** на `Vite` (не дозволяйте автоматичне визначення)
- Build command: `npm run build`
- Build output: `dist`

**Спосіб 2:** Видаліть `wrangler.toml` перед деплоєм:
```bash
# Перейменуйте wrangler.toml на wrangler.toml.backup
mv wrangler.toml wrangler.toml.backup
git add .
git commit -m "Temporarily disable wrangler config for Pages deployment"
git push
```

## Варіант 2: Деплой Frontend + API Worker

Якщо вам потрібен і backend API, задеплойте їх окремо:

### 1. Деплой Frontend (React App)

Використовуйте Cloudflare Pages як описано вище.

### 2. Деплой Backend (Hono Worker)

```bash
# Переконайтеся, що wrangler.toml існує
# Встановіть необхідні змінні

# 1. Створіть D1 базу даних
npx wrangler d1 create dentis-charts

# Скопіюйте database_id з виводу і додайте до wrangler.toml:
# [[d1_databases]]
# binding = "DB"
# database_name = "dentis-charts"
# database_id = "YOUR_DATABASE_ID_HERE"

# 2. Запустіть міграції
npx wrangler d1 execute dentis-charts --file=./schema.sql

# 3. Встановіть JWT secret
npx wrangler secret put JWT_SECRET
# Введіть ваш секретний ключ (наприклад, згенерований через: openssl rand -base64 32)

# 4. Задеплойте worker
npm run deploy:worker
```

### 3. Підключіть Frontend до API

Після деплою worker ви отримаєте URL, наприклад:
`https://dentis-cards-api.YOUR_SUBDOMAIN.workers.dev`

Оновіть код frontend для використання цього API URL.

## Варіант 3: Використання GitHub Pages (без Cloudflare)

Якщо ви хочете використовувати GitHub Pages замість Cloudflare:

```bash
npm run deploy
```

Це збудує проект і задеплоїть на GitHub Pages.

## Рекомендації

1. **Для простого статичного сайту:** Використовуйте Cloudflare Pages з Vite preset
2. **Для повного стеку:** Деплойте frontend на Pages, backend на Workers окремо
3. **Видаліть wrangler.toml** якщо деплоїте тільки frontend на Pages

## Troubleshooting

### Помилка: "The detected framework (Hono) cannot be automatically configured"

**Рішення:**
1. Видаліть або перейменуйте `wrangler.toml`
2. Або явно вкажіть Framework preset = Vite в налаштуваннях Pages
3. Переконайтеся, що Build command = `npm run build` і Output = `dist`

### Помилка: "Build failed"

Перевірте:
- Чи всі залежності встановлені
- Чи правильний Node.js version (рекомендовано 18+)
- Чи немає помилок в коді TypeScript
