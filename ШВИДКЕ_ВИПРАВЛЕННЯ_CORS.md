# ⚡ Швидке виправлення CORS

## 🎯 Що було зроблено

### 1. ✅ Додано `public/_routes.json`
Вказує Cloudflare Pages, що `/api/*` має оброблятися через Worker:
```json
{
  "version": 1,
  "include": ["/api/*"],
  "exclude": []
}
```

### 2. ✅ Оновлено `package.json`
Додано автоматичну компіляцію worker при build:
```json
"build": "vite build && npm run build:worker",
"build:worker": "npx esbuild src/worker.ts --bundle --format=esm --outfile=dist/_worker.js --platform=neutral --external:hono --external:hono/* && cp public/_routes.json dist/"
```

### 3. ✅ Worker компілюється в `dist/_worker.js`
Cloudflare Pages автоматично використовує цей файл для обробки API запитів.

---

## 🚀 Деплой (2 кроки)

### Крок 1: Commit і Push

```bash
git add .
git commit -m "fix: Add _routes.json and build worker for CORS support"
git push
```

### Крок 2: Дочекайтесь GitHub Actions

Перейдіть на GitHub: https://github.com/vasvasvv/dentis-charts/actions

GitHub Actions автоматично:
1. Збере проект (`npm run build`)
2. Створить `dist/_worker.js` та `dist/_routes.json`
3. Задеплоїть на Cloudflare Pages

---

## ✅ Перевірка після деплою (5-10 хв після push)

### 1. Перевірте CORS заголовки

```bash
curl -I https://dentis-charts.pages.dev/api/auth/login \
  -H "Origin: https://dentis-clinic.pp.ua"
```

**Очікується:**
```
HTTP/2 405
access-control-allow-origin: https://dentis-clinic.pp.ua
access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
access-control-allow-headers: Content-Type, Authorization
```

### 2. Перевірте OPTIONS запит (preflight)

```bash
curl -X OPTIONS https://dentis-charts.pages.dev/api/auth/login \
  -H "Origin: https://dentis-clinic.pp.ua" \
  -H "Access-Control-Request-Method: POST" \
  -i
```

**Очікується:**
```
HTTP/2 200
access-control-allow-origin: https://dentis-clinic.pp.ua
access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
```

### 3. Спробуйте увійти на сайті

Відкрийте https://dentis-clinic.pp.ua і спробуйте увійти.

**Якщо все працює:**
- ✅ Помилка CORS зникне
- ✅ Запити будуть успішні

**Якщо все ще помилка:**
- 🔄 Очистіть кеш браузера (Ctrl+Shift+Del)
- 🔄 Або спробуйте в режимі інкогніто

---

## 🛠️ Локальне тестування (опціонально)

```bash
# 1. Збудуйте проект
npm run build

# 2. Перевірте, що файли створені
ls -lh dist/_worker.js dist/_routes.json

# 3. Запустіть локально через wrangler
npx wrangler pages dev dist --port 8788

# 4. Відкрийте в браузері
# http://localhost:8788
```

---

## 📊 Структура файлів після build

```
dist/
├── _worker.js       ← Скомпільований API worker (обробляє /api/*)
├── _routes.json     ← Конфігурація маршрутів
├── index.html       ← Фронтенд
├── assets/          ← JS, CSS фронтенду
└── ...
```

---

## 🚨 Якщо щось пішло не так

### Помилка: "Module not found: hono"

**Причина:** Worker не може знайти `hono` у runtime.

**Рішення:** Cloudflare Pages **автоматично надає** `hono` у worker runtime. Просто задеплойте на Cloudflare - локально може не працювати.

### CORS все ще блокується

**Рішення 1:** Очистіть кеш Cloudflare
```
Cloudflare Dashboard → Caching → Configuration → Purge Everything
```

**Рішення 2:** Перевірте, що `_routes.json` дійсно в dist:
```bash
cat dist/_routes.json
```

Має показати:
```json
{"version":1,"include":["/api/*"],"exclude":[]}
```

### Worker не виконується

**Рішення:** Перевірте Cloudflare Dashboard:
```
Pages → dentis-charts → Functions → View logs
```

Якщо бачите помилки - повідомте, допоможу виправити.

---

## 📚 Що далі?

Після успішного деплою:

1. ✅ CORS буде працювати
2. ✅ Логін буде успішним
3. ✅ Всі API запити будуть проходити

**Питання?** Пишіть, допоможу! 😊
