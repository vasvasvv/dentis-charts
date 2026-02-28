# ✅ Чеклист для деплою на Cloudflare Pages

## Крок 1: Підготовка (Локально)

- [ ] Переконайтеся, що проект білдиться локально:
  ```bash
  npm install
  npm run build
  ```
  
- [ ] Перевірте, що папка `dist` створилася після білду

- [ ] Закоммітити всі зміни:
  ```bash
  git add .
  git commit -m "fix: configure for Cloudflare Pages deployment"
  git push
  ```

## Крок 2: Налаштування Cloudflare Pages

- [ ] Зайдіть на https://dash.cloudflare.com/
- [ ] Виберіть **Pages** → **Create a project**
- [ ] Підключіть GitHub репозиторій
- [ ] Налаштуйте білд:
  - [ ] **Framework preset:** `Vite` ⚠️ ВАЖЛИВО: НЕ Auto!
  - [ ] **Build command:** `npm run build`
  - [ ] **Build output directory:** `dist`
  - [ ] **Root directory:** (залишити пустим)
  - [ ] **Node version:** `18` або вище

## Крок 3: Деплой

- [ ] Натисніть **Save and Deploy**
- [ ] Дочекайтеся завершення білду (зазвичай 2-5 хвилин)
- [ ] Перевірте, що статус = ✅ Success

## Крок 4: Перевірка

- [ ] Відкрийте URL вашого сайту (напр. `https://ваш-проект.pages.dev`)
- [ ] Перевірте, що сайт відкривається
- [ ] Перевірте базову функціональність

## 🚨 Якщо виникла помилка "Hono framework..."

- [ ] Перейдіть в **Settings** → **Builds & deployments**
- [ ] Змініть Framework preset з "None" на "Vite"
- [ ] Натисніть **Retry deployment**

АБО

- [ ] Видаліть `wrangler.toml` тимчасово:
  ```bash
  git mv wrangler.toml wrangler.toml.backup
  git add .
  git commit -m "temp: disable wrangler"
  git push
  ```

## 📊 Опціонально: Деплой API Worker

Якщо вам потрібен backend API:

- [ ] Встановіть Wrangler CLI: `npm install -g wrangler`
- [ ] Авторизуйтеся: `wrangler login`
- [ ] Створіть D1 базу даних:
  ```bash
  npx wrangler d1 create dentis-charts
  ```
- [ ] Скопіюйте `database_id` у `wrangler.toml`
- [ ] Запустіть міграції:
  ```bash
  npx wrangler d1 execute dentis-charts --file=./schema.sql
  ```
- [ ] Встановіть JWT secret:
  ```bash
  npx wrangler secret put JWT_SECRET
  ```
- [ ] Задеплойте worker:
  ```bash
  npm run deploy:worker
  ```

## 🎉 Готово!

Ваш сайт має бути доступний за адресою Cloudflare Pages.

## 📚 Додаткова інформація:

- Швидке виправлення: `QUICK_FIX.md`
- Повна інструкція: `CLOUDFLARE_DEPLOY.md`
- Підсумок змін: `DEPLOY_FIX_SUMMARY.md`
