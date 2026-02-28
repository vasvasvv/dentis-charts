# 🚀 Інструкція з деплою проекту Dentis Charts

## Виправлення помилки Cloudflare Pages

Якщо ви побачили помилку:
```
✘ [ERROR] The detected framework ("Hono") cannot be automatically configured.
```

**👉 Читайте файл: `ВИПРАВЛЕННЯ_ДЕПЛОЮ.md`** (повна інструкція українською)

## Швидке рішення

### Крок 1: Налаштуйте Cloudflare Pages Dashboard

1. Зайдіть: https://dash.cloudflare.com/ → Pages → Ваш проект
2. Settings → Builds & deployments
3. Встановіть:
   - **Framework preset:** `Vite` ⚠️ (НЕ Auto!)
   - **Build command:** `npm run build`
   - **Build output:** `dist`
4. Save and Retry deployment

### Крок 2: Закоммітити зміни

```bash
git add .
git commit -m "fix: configure Cloudflare Pages for Vite deployment"
git push
```

## Структура проекту

```
├── Frontend (React + Vite)
│   └── Деплой → Cloudflare Pages
│
└── Backend (Hono API)
    └── Деплой → Cloudflare Workers (окремо)
```

## Документація

| Файл | Опис |
|------|------|
| `ВИПРАВЛЕННЯ_ДЕПЛОЮ.md` | 🇺🇦 Головна інструкція українською |
| `QUICK_FIX.md` | 🚀 Швидке виправлення |
| `CLOUDFLARE_DEPLOY.md` | 📚 Детальна інструкція |
| `CHECKLIST.md` | ✅ Покроковий чеклист |
| `DEPLOY_FIX_SUMMARY.md` | 🔧 Технічні деталі |

## Що було змінено

- ✅ Створено `.cfignore` - ігнорування worker файлів
- ✅ Створено `.cloudflare/pages.json` - конфігурація Pages
- ✅ Оновлено `wrangler.toml` - видалено конфлікти
- ✅ Оновлено `package.json` - додано deploy:worker
- ✅ Оновлено `.gitignore` - коректне ігнорування

## Підтримка

Якщо виникли проблеми:
1. Читайте `ВИПРАВЛЕННЯ_ДЕПЛОЮ.md`
2. Перевірте `CHECKLIST.md`
3. Спробуйте варіанти з `QUICK_FIX.md`

---

**Створено:** 2026-02-28  
**Статус:** ✅ Готово до деплою
