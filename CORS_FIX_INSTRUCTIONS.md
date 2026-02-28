# 🔧 Виправлення CORS помилки

## Проблема
CORS блокує запити з `https://dentis-clinic.pp.ua` до `https://dentis-charts.pages.dev/api/*`

## Причина
Cloudflare Pages не виконує `worker.ts`, тому що:
1. Немає `_routes.json` (не знає, що `/api/*` має йти до worker)
2. Немає `_worker.js` (не знає, який worker виконувати)

## ✅ Виправлення (вже зроблено)

### 1. Створено `public/_routes.json`
```json
{
  "version": 1,
  "include": ["/api/*"],
  "exclude": []
}
```

### 2. Створено `public/_worker.js`
```js
import app from '../src/worker.ts';
export default app;
```

### 3. Оновлено `package.json`
```json
"build": "vite build && npm run build:worker",
"build:worker": "cp src/worker.ts dist/ && cp public/_worker.js dist/ && cp public/_routes.json dist/",
"deploy:pages": "npm run build && wrangler pages deploy dist"
```

### 4. Оновлено `wrangler.toml`
Додано підтримку Pages Functions (Advanced Mode)

## 📦 Деплой

### Варіант А: Через GitHub Actions (Автоматично)

Просто зробіть commit і push:

```bash
git add .
git commit -m "fix: Add _routes.json and _worker.js for CORS support"
git push
```

GitHub Actions автоматично:
1. Збере проект (`npm run build`)
2. Задеплоїть на Cloudflare Pages

### Варіант Б: Вручну через Wrangler

```bash
# 1. Встановіть залежності (якщо ще не зробили)
npm install

# 2. Збудуйте проект
npm run build

# 3. Перевірте, що файли створені
ls -la dist/_*

# 4. Задеплойте на Cloudflare Pages
npm run deploy:pages
```

## 🔍 Перевірка після деплою

### 1. Перевірте, що `_routes.json` працює
```bash
curl -I https://dentis-charts.pages.dev/api/auth/login
```

Має повернути:
```
HTTP/2 405
access-control-allow-origin: https://dentis-clinic.pp.ua
access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
```

### 2. Перевірте CORS preflight
```bash
curl -X OPTIONS https://dentis-charts.pages.dev/api/auth/login \
  -H "Origin: https://dentis-clinic.pp.ua" \
  -H "Access-Control-Request-Method: POST" \
  -i
```

Має повернути заголовки:
```
access-control-allow-origin: https://dentis-clinic.pp.ua
access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
access-control-allow-headers: Content-Type, Authorization
```

## ⚙️ Налаштування Cloudflare Pages (якщо потрібно)

Якщо автоматичний деплой не працює, налаштуйте вручну:

### 1. Перейдіть до Cloudflare Dashboard
https://dash.cloudflare.com → Pages → dentis-charts

### 2. Перевірте Build Settings
```
Build command: npm run build
Build output directory: dist
```

### 3. Додайте Environment Variables
```
JWT_SECRET = <ваш_секретний_ключ>
```

### 4. Перевірте D1 Database Bindings
Settings → Functions → D1 database bindings:
```
Variable name: DB
D1 database: dentis-charts
```

## 🚨 Troubleshooting

### Помилка: "worker.ts not found"
**Рішення:** Перевірте, що `build:worker` скрипт виконується:
```bash
npm run build:worker
ls -la dist/worker.ts dist/_worker.js dist/_routes.json
```

### Помилка: "Module not found: hono"
**Рішення:** Cloudflare Pages не підтримує `node_modules` у worker. Потрібно використати esbuild:

```bash
# Встановіть esbuild
npm install -D esbuild

# Оновіть build:worker скрипт
"build:worker": "esbuild src/worker.ts --bundle --format=esm --outfile=dist/_worker.js && cp public/_routes.json dist/"
```

### CORS все ще не працює
**Рішення:** Очистіть кеш Cloudflare:
1. Cloudflare Dashboard → Caching → Purge Cache
2. Або додайте `?nocache=1` до URL для тесту

## 📚 Документація

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Advanced Mode with _worker.js](https://developers.cloudflare.com/pages/functions/advanced-mode/)
- [_routes.json configuration](https://developers.cloudflare.com/pages/functions/routing/)
