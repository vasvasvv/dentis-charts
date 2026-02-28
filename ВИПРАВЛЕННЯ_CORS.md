# 🔧 Виправлення CORS помилки

## Проблема

```
Access to fetch at 'https://dentis-charts.pages.dev/api/auth/login' 
from origin 'https://dentis-clinic.pp.ua' has been blocked by CORS policy
```

## ✅ Що було зроблено

Додано `https://dentis-clinic.pp.ua` до списку дозволених доменів у файлі `src/worker.ts`:

```typescript
// CORS configuration
app.use('*', cors({
  origin: [
    'https://dentis-charts.pages.dev',
    'https://dentis-clinic.pp.ua',  // ← ДОДАНО!
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

Зміни вже закоммічені та запушені в GitHub.

## 🚀 Наступний крок - Деплой Worker

⚠️ **ВАЖЛИВО:** Щоб виправлення запрацювало, потрібно задеплоїти оновлений worker!

### Варіант 1: Локально через Wrangler (найшвидше)

```bash
# У папці проекту:
npm run deploy:worker

# АБО
npx wrangler deploy
```

**Якщо помилка "Not logged in":**
```bash
npx wrangler login
# Потім спробуйте знову
```

### Варіант 2: Через Cloudflare Dashboard

1. Зайдіть: https://dash.cloudflare.com/
2. Перейдіть: **Workers & Pages**
3. Знайдіть ваш worker (напр. `dentis-cards-api`)
4. Натисніть **Quick edit**
5. Скопіюйте оновлений код з `src/worker.ts`
6. **Save and Deploy**

### Варіант 3: Автоматично через GitHub Actions (якщо налаштовано)

1. https://github.com/vasvasvv/dentis-charts
2. **Actions** tab
3. Виберіть **"Deploy API Worker to Cloudflare"**
4. **Run workflow** → **Run workflow**

## 📋 Перевірка

Після деплою:

1. Відкрийте https://dentis-clinic.pp.ua
2. Відкрийте DevTools (F12) → Console
3. Спробуйте залогінитись
4. ✅ CORS помилка має зникнути!

## ❓ Troubleshooting

### Помилка все ще є

**Перевірте:**

1. **Чи задеплоїли worker?**
   - Cloudflare Dashboard → Workers & Pages → Перевірте дату деплою

2. **Чи правильний URL API?**
   - Відкрийте DevTools → Network
   - Подивіться куди йде запит
   - Має бути: `https://YOUR-WORKER.workers.dev/api/auth/login`
   - НЕ: `https://dentis-charts.pages.dev/api/auth/login`

3. **Чи правильно налаштований frontend?**
   - Перевірте де в коді вказано API URL
   - Має вказувати на worker, а не на Pages

### Worker не задеплоюється

**Можливі причини:**

1. **Не залогінені в Wrangler:**
   ```bash
   npx wrangler login
   ```

2. **Не вказано Account ID:**
   - Відкрийте `wrangler.toml`
   - Додайте `account_id = "YOUR_ACCOUNT_ID"`
   - Account ID знайдете на https://dash.cloudflare.com/

3. **Не створено D1 database:**
   ```bash
   npx wrangler d1 create dentis-charts
   # Скопіюйте database_id у wrangler.toml
   ```

4. **Не встановлено JWT_SECRET:**
   ```bash
   npx wrangler secret put JWT_SECRET
   # Введіть секретний ключ
   ```

## 💡 Додаткова інформація

### Архітектура проекту

```
Frontend (React):
  https://dentis-clinic.pp.ua
  https://dentis-charts.pages.dev
         │
         │ HTTP Request
         ▼
Backend (Hono Worker):
  https://dentis-cards-api.YOUR-SUBDOMAIN.workers.dev
         │
         │ Database
         ▼
Cloudflare D1:
  dentis-charts database
```

### Як це працює

1. Користувач відкриває сайт на `dentis-clinic.pp.ua`
2. Frontend надсилає запит до API worker
3. Worker перевіряє CORS: чи домен у списку дозволених?
4. Якщо ТАК → обробляє запит
5. Якщо НІ → блокує (CORS error)

### Що таке CORS?

CORS (Cross-Origin Resource Sharing) - механізм безпеки браузера.

- Блокує запити з одного домену на інший
- Потрібно явно дозволити домени на сервері
- У нашому випадку: дозволити `dentis-clinic.pp.ua` в worker

## ✅ Чеклист виправлення

- [x] Оновлено `src/worker.ts` з новим доменом
- [x] Закоммічено в Git
- [x] Запушено в GitHub
- [ ] **Задеплоїти worker** ← ВИ ТУТ
- [ ] Перевірити на сайті

## 🔗 Корисні посилання

- Ваш репозиторій: https://github.com/vasvasvv/dentis-charts
- Cloudflare Dashboard: https://dash.cloudflare.com/
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/

---

**Створено:** 2026-02-28  
**Статус:** ⏳ Очікується деплой worker
