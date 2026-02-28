# 🤖 Автоматичний деплой на Cloudflare через GitHub Actions

## 🎯 Що це дає?

Замість ручного деплою через Cloudflare Dashboard, тепер:
- ✅ **Push в GitHub** → автоматичний деплой
- ✅ **Pull Request** → автоматичний preview деплой
- ✅ Немає потреби налаштовувати Cloudflare Dashboard вручну
- ✅ Всі деплої видимі в GitHub Actions tab

## 📋 Налаштування (одноразово, 5 хвилин)

### Крок 1: Отримати Cloudflare API Token

1. Зайдіть на https://dash.cloudflare.com/profile/api-tokens
2. Натисніть **"Create Token"**
3. Використайте шаблон **"Edit Cloudflare Workers"** або створіть custom token з правами:
   - Account → Cloudflare Pages → Edit
   - Account → Account Settings → Read
   - Zone → Workers Scripts → Edit (якщо використовуєте Workers)

4. Натисніть **"Continue to summary"** → **"Create Token"**
5. **СКОПІЮЙТЕ TOKEN** (він показується тільки раз!)

### Крок 2: Отримати Account ID

1. На https://dash.cloudflare.com/
2. Виберіть ваш домен (або будь-який проект)
3. Справа в sidebar знайдіть **"Account ID"**
4. Скопіюйте його

### Крок 3: Додати Secrets в GitHub

1. Відкрийте ваш репозиторій на GitHub
2. Перейдіть: **Settings** → **Secrets and variables** → **Actions**
3. Натисніть **"New repository secret"**
4. Додайте два секрети:

   **Секрет 1:**
   ```
   Name: CLOUDFLARE_API_TOKEN
   Value: <ваш токен з кроку 1>
   ```

   **Секрет 2:**
   ```
   Name: CLOUDFLARE_ACCOUNT_ID
   Value: <ваш Account ID з кроку 2>
   ```

5. Натисніть **"Add secret"** для кожного

### Крок 4: Створити Cloudflare Pages проект (якщо ще не створений)

**Опція A: Через Dashboard (швидше для першого разу)**
1. https://dash.cloudflare.com/ → Pages → Create a project
2. Connect to Git → Виберіть ваш репозиторій
3. Build settings:
   - Framework preset: **Vite**
   - Build command: **npm run build**
   - Build output directory: **dist**
4. Save and Deploy

**Опція B: Автоматично через Wrangler (для досвідчених)**
```bash
npx wrangler pages project create dentis-charts \
  --production-branch=main
```

### Крок 5: Перевірити назву проекту

Переконайтеся, що в `.github/workflows/cloudflare-pages.yml` вказана правильна назва проекту:

```yaml
projectName: dentis-charts  # ← Має співпадати з назвою в Cloudflare
```

Якщо назва проекту інша - змініть тут!

## 🚀 Використання

### Автоматичний деплой Frontend (React App)

Просто зробіть push в main/master:

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

**Що відбудеться:**
1. GitHub Actions автоматично запуститься
2. Встановить залежності
3. Зробить білд (`npm run build`)
4. Задеплоїть на Cloudflare Pages
5. Ви отримаєте URL деплою в коментарі до commit

### Preview деплой для Pull Request

Створіть Pull Request:

```bash
git checkout -b feature/new-feature
git add .
git commit -m "feat: my feature"
git push origin feature/new-feature
```

Створіть PR на GitHub → автоматично створюється preview деплой!

### Деплой API Worker (Backend)

**Автоматичний** (коли змінюєте `src/worker.ts`):
```bash
git add src/worker.ts
git commit -m "fix: update API endpoint"
git push
```

**Ручний** (через GitHub UI):
1. Перейдіть в репозиторій → **Actions** tab
2. Виберіть **"Deploy API Worker to Cloudflare"**
3. Натисніть **"Run workflow"** → **"Run workflow"**

## 📊 Моніторинг деплоїв

### Через GitHub Actions

1. Репозиторій → **Actions** tab
2. Виберіть потрібний workflow run
3. Дивіться логи білду і деплою

### Через Cloudflare Dashboard

1. https://dash.cloudflare.com/ → Pages
2. Виберіть проект **dentis-charts**
3. Дивіться історію деплоїв

## 🔧 Troubleshooting

### Помилка: "Resource not found" або "Project not found"

**Причина:** Проект ще не створений в Cloudflare Pages

**Рішення:**
1. Створіть проект вручну через Dashboard (Крок 4)
2. АБО видаліть `projectName` з workflow - Pages створить проект автоматично

### Помилка: "Authentication error"

**Причина:** Невірний API Token або Account ID

**Рішення:**
1. Перевірте секрети в GitHub (Settings → Secrets)
2. Переконайтеся, що токен має правильні права
3. Створіть новий токен якщо потрібно

### Помилка: "Build failed"

**Причина:** Помилка при білді коду

**Рішення:**
1. Перевірте логи в Actions tab
2. Запустіть білд локально: `npm run build`
3. Виправте помилки і зробіть новий push

### Workflow не запускається

**Причина:** Workflow файл не в правильній директорії або не закоммічений

**Рішення:**
```bash
git add .github/workflows/
git commit -m "ci: add GitHub Actions workflows"
git push
```

## 🎨 Кастомізація

### Змінити гілки для деплою

В `.github/workflows/cloudflare-pages.yml`:

```yaml
on:
  push:
    branches:
      - main          # ← Додайте або видаліть гілки
      - develop       # ← Production деплой
      - staging       # ← Staging деплой
```

### Додати environment variables

В `.github/workflows/cloudflare-pages.yml`:

```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/pages-action@v1
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    projectName: dentis-charts
    directory: dist
    gitHubToken: ${{ secrets.GITHUB_TOKEN }}
  env:
    NODE_ENV: production
    VITE_API_URL: ${{ secrets.API_URL }}  # ← Додайте свої змінні
```

### Запускати тести перед деплоєм

Додайте в `.github/workflows/cloudflare-pages.yml` перед Deploy step:

```yaml
- name: Run tests
  run: npm test

- name: Run linting
  run: npm run lint
```

## 📚 Корисні посилання

- [Cloudflare Pages GitHub Action](https://github.com/cloudflare/pages-action)
- [Wrangler GitHub Action](https://github.com/cloudflare/wrangler-action)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

## ✅ Чеклист налаштування

- [ ] Створено Cloudflare API Token
- [ ] Скопійовано Account ID
- [ ] Додано `CLOUDFLARE_API_TOKEN` в GitHub Secrets
- [ ] Додано `CLOUDFLARE_ACCOUNT_ID` в GitHub Secrets
- [ ] Створено Cloudflare Pages проект (або готово до автоматичного створення)
- [ ] Перевірено назву проекту в workflow файлі
- [ ] Закоммічено workflow файли
- [ ] Зроблено push в main/master
- [ ] Перевірено Actions tab - деплой запустився
- [ ] Перевірено Cloudflare Dashboard - сайт задеплоєний

## 🎉 Готово!

Тепер кожен push автоматично деплоїть ваш проект на Cloudflare Pages!

---

**Створено:** 2026-02-28  
**Автор:** GitHub Actions automation setup
