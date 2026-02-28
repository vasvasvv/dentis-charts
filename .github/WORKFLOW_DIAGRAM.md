# 🔄 Схема автоматичного деплою

## Як це працює

```
┌─────────────────────────────────────────────────────────────┐
│                    ВАШ WORKFLOW                             │
└─────────────────────────────────────────────────────────────┘

   📝 Ви пишете код
   │
   ├─── git add .
   ├─── git commit -m "update"
   └─── git push origin main
         │
         │ автоматично
         ▼
   ┌─────────────────────┐
   │   GitHub Actions    │ ← Запускається автоматично!
   └─────────────────────┘
         │
         ├─── 📦 npm install
         ├─── 🔨 npm run build
         └─── 🚀 Deploy to Cloudflare
               │
               ▼
   ┌─────────────────────┐
   │  Cloudflare Pages   │
   └─────────────────────┘
         │
         ▼
   🌐 Ваш сайт онлайн!
   https://dentis-charts.pages.dev
```

## До (ручний процес)

```
❌ СКЛАДНО:

1. Зробити git push
2. Зайти на dash.cloudflare.com
3. Знайти проект
4. Натиснути "Create deployment"
5. Вибрати гілку
6. Налаштувати параметри білду
7. Запустити деплой
8. Чекати
9. Перевірити

⏱️  Час: ~10-15 хвилин кожного разу
😓 Складність: Багато кліків
🐛 Помилки: Легко забути крок
```

## Після (автоматичний процес)

```
✅ ПРОСТО:

1. git push

⏱️  Час: 10 секунд
😎 Складність: Одна команда
🎯 Помилки: Неможливі
```

## Процес для різних сценаріїв

### 🌟 Production Deploy (main branch)

```
git push origin main
    │
    ├─── GitHub Actions запускається
    ├─── Білд проходить
    ├─── Деплой на production
    └─── ✅ Сайт оновлено!

🔗 URL: https://dentis-charts.pages.dev
```

### 🔍 Preview Deploy (Pull Request)

```
git push origin feature/new-feature
    │
    └─── Створюєте PR на GitHub
            │
            ├─── GitHub Actions запускається
            ├─── Білд проходить
            ├─── Деплой на preview URL
            └─── 💬 Коментар з preview URL в PR

🔗 Preview URL: https://abc123.dentis-charts.pages.dev
```

### 🔧 API Worker Deploy

```
git push origin main (якщо змінили src/worker.ts)
    │
    ├─── GitHub Actions запускається
    ├─── Деплой worker на Cloudflare
    └─── ✅ API оновлено!

АБО

GitHub → Actions → Deploy API Worker → Run workflow
```

## Переваги автоматизації

### Швидкість
```
Ручний деплой:  ~10-15 хвилин
Автодеплой:     ~2-3 хвилини (чекаєте в фоні)
```

### Надійність
```
Ручний:    Можна забути крок, помилитись
Автодеплой: Завжди однаковий процес
```

### Зручність
```
Ручний:    Треба логінитись, знаходити проект
Автодеплой: Просто git push
```

### Історія
```
Ручний:    Важко відслідкувати що коли деплоїлось
Автодеплой: Вся історія в GitHub Actions
```

### Preview
```
Ручний:    Складно створити тестову версію
Автодеплой: Автоматичний preview для кожного PR
```

## Структура workflow файлів

```
.github/
└── workflows/
    ├── cloudflare-pages.yml   ← Деплой frontend (React)
    │   └── Тригери:
    │       ├── Push to main/master
    │       └── Pull Request
    │
    └── cloudflare-worker.yml  ← Деплой backend (API)
        └── Тригери:
            ├── Push (якщо змінили worker.ts)
            └── Manual workflow dispatch
```

## Моніторинг і дебаг

### GitHub Actions Tab

```
Ваш репозиторій → Actions
    │
    ├── ✅ Deploy to Cloudflare Pages
    │   ├── Checkout ✅
    │   ├── Setup Node.js ✅
    │   ├── Install dependencies ✅
    │   ├── Build ✅
    │   └── Deploy ✅
    │
    └── 📊 Статистика:
        ├── Тривалість: 2m 34s
        ├── Статус: Success
        └── Деплой URL: [посилання]
```

### Cloudflare Dashboard

```
dash.cloudflare.com → Pages → dentis-charts
    │
    ├── Deployments
    │   ├── Production (від GitHub main)
    │   └── Preview (від PR #123)
    │
    └── Settings
        ├── Build settings ← Ігнорується (GitHub Actions керує)
        └── Environment variables
```

## Безпека

```
Секрети зберігаються в:
    GitHub Repository Secrets
        │
        ├── CLOUDFLARE_API_TOKEN     🔒 Захищено
        └── CLOUDFLARE_ACCOUNT_ID    🔒 Захищено

Ніколи не в коді:
    ❌ wrangler.toml
    ❌ .env файли
    ❌ GitHub workflow файли

Доступ тільки через:
    ✅ ${{ secrets.CLOUDFLARE_API_TOKEN }}
    ✅ GitHub Actions runtime
```

## Troubleshooting flow

```
Деплой не працює?
    │
    ├── Перевірити GitHub Actions tab
    │   ├── Чи запустився workflow? → Ні → Перевірити .github/workflows/
    │   └── Чи є помилки в логах? → Так → Прочитати помилку
    │
    ├── Перевірити GitHub Secrets
    │   ├── Чи додані токени? → Ні → Додати (крок 3)
    │   └── Чи правильні токени? → Ні → Оновити
    │
    └── Перевірити білд локально
        ├── npm install → Працює?
        └── npm run build → Працює? → Ні → Виправити помилки
```

## Порівняння: GitHub Pages vs Cloudflare Pages

```
┌──────────────────┬─────────────────┬──────────────────┐
│   Функція        │  GitHub Pages   │ Cloudflare Pages │
├──────────────────┼─────────────────┼──────────────────┤
│ Автодеплой       │ ✅ Так          │ ✅ Так           │
│ Preview deploys  │ ❌ Ні           │ ✅ Так           │
│ Edge network     │ ❌ GitHub CDN   │ ✅ Cloudflare CF │
│ Швидкість        │ 🟡 Середня      │ 🟢 Висока        │
│ D1 Database      │ ❌ Ні           │ ✅ Так           │
│ Workers API      │ ❌ Ні           │ ✅ Так           │
│ Безкоштовно      │ ✅ Так          │ ✅ Так           │
│ Custom domain    │ ✅ Так          │ ✅ Так           │
└──────────────────┴─────────────────┴──────────────────┘

💡 Для вашого проекту Cloudflare Pages краще:
   - Швидший edge network
   - Можливість використати D1 database
   - Preview deploys для PR
   - Інтеграція з Hono worker
```

---

**Створено:** 2026-02-28  
**Документація:** `.github/GITHUB_ACTIONS_SETUP.md`, `.github/АВТОДЕПЛОЙ.md`
