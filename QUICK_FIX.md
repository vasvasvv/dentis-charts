# 🚀 Швидке виправлення помилки деплою на Cloudflare Pages

## Проблема
```
✘ [ERROR] The detected framework ("Hono") cannot be automatically configured.
```

## ✅ Рішення

### Варіант 1: Налаштування через Dashboard (НАЙПРОСТІШЕ)

1. Зайдіть в **Cloudflare Dashboard** → **Pages** → Ваш проект
2. Перейдіть в **Settings** → **Builds & deployments**
3. Змініть налаштування:
   ```
   Framework preset: Vite (НЕ None, НЕ Auto)
   Build command: npm run build
   Build output directory: dist
   Root directory: (залишити пустим)
   Node version: 18 або новіше
   ```
4. Збережіть та перезапустіть деплой

### Варіант 2: Видалити wrangler.toml (ТИМЧАСОВО)

Якщо варіант 1 не допоміг:

```bash
# Перейменувати wrangler.toml
git mv wrangler.toml wrangler.toml.backup

# Закомітити зміни
git add .
git commit -m "fix: temporarily disable wrangler for Pages deployment"
git push
```

Cloudflare Pages автоматично перезапустить деплой і тепер він пройде успішно.

### Варіант 3: Використати .cfignore

Файл `.cfignore` вже створений і налаштований. Переконайтесь що він закоммічений:

```bash
git add .cfignore
git commit -m "fix: add cfignore to exclude worker files from Pages build"
git push
```

## 🎯 Що відбувається?

Ваш проект містить:
- ✅ **React app** (frontend) - для Cloudflare Pages
- ✅ **Hono API** (backend) - для Cloudflare Workers

Cloudflare Pages бачить `src/worker.ts` та `wrangler.toml` і думає, що весь проект - це Hono worker, але насправді вам потрібно задеплоїти React app.

## 📝 Наступні кроки

Після успішного деплою frontend:

1. **Якщо потрібен backend API:**
   - Задеплойте Hono worker окремо: `npm run deploy:worker`
   - Налаштуйте D1 базу даних
   - Підключіть frontend до worker API

2. **Якщо backend не потрібен:**
   - Видаліть `src/worker.ts`
   - Видаліть `wrangler.toml`
   - Використовуйте статичний frontend

## 🔍 Перевірка

Після деплою ваш сайт буде доступний за адресою:
`https://ваш-проект.pages.dev`

Якщо все працює - вітаємо! 🎉
