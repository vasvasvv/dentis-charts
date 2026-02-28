# 📝 Як додати GitHub Actions workflows

## ⚠️ Важлива інформація

GitHub Actions workflows **не були запушені** через обмеження токену.
Ваш токен не має `workflow` scope, який потрібен для створення/оновлення workflow файлів.

## ✅ Що вже запушено в GitHub

Всі основні файли успішно запушені:
- ✅ `.cfignore` - виправлення помилки деплою
- ✅ `.cloudflare/pages.json` - конфігурація Pages
- ✅ `wrangler.toml` - конфігурація worker
- ✅ Вся документація українською та англійською

**Проблему з деплоєм вже виправлено!** Можете деплоїти зараз.

## 🤖 Додавання автоматизації (опціонально)

Якщо хочете автоматичний деплой через GitHub Actions, є 3 варіанти:

---

### Варіант 1: Додати файли вручну через GitHub UI

#### Крок 1: Відкрийте репозиторій
https://github.com/vasvasvv/dentis-charts

#### Крок 2: Створіть workflow файли

**Файл 1: cloudflare-pages.yml**

1. Натисніть "Add file" → "Create new file"
2. Назва: `.github/workflows/cloudflare-pages.yml`
3. Скопіюйте вміст з локального файла `.github/workflows/cloudflare-pages.yml`
4. Commit changes

**Файл 2: cloudflare-worker.yml**

1. Натисніть "Add file" → "Create new file"
2. Назва: `.github/workflows/cloudflare-worker.yml`
3. Скопіюйте вміст з локального файла `.github/workflows/cloudflare-worker.yml`
4. Commit changes

#### Крок 3: Додайте документацію (опціонально)

Так само створіть:
- `.github/АВТОДЕПЛОЙ.md`
- `.github/GITHUB_ACTIONS_SETUP.md`
- `.github/WORKFLOW_DIAGRAM.md`
- `.github/README.md`

---

### Варіант 2: Створити новий GitHub токен

#### Крок 1: Створіть новий токен

1. Перейдіть: https://github.com/settings/tokens
2. Натисніть "Generate new token" → "Generate new token (classic)"
3. Назва: `Cloudflare Deploy Token`
4. Виберіть scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows) ← ВАЖЛИВО!
5. Натисніть "Generate token"
6. **СКОПІЮЙТЕ ТОКЕН** (показується тільки раз!)

#### Крок 2: Запуште з новим токеном

```bash
# У вашій папці проекту:
git remote set-url origin https://НОВИЙ_ТОКЕН@github.com/vasvasvv/dentis-charts.git

# Додайте workflow файли
git add .github/
git commit -m "ci: додати GitHub Actions workflows"
git push
```

---

### Варіант 3: Використовувати SSH ключі замість токену

#### Крок 1: Створіть SSH ключ (якщо ще немає)

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

#### Крок 2: Додайте SSH ключ в GitHub

1. Скопіюйте публічний ключ:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. GitHub → Settings → SSH and GPG keys → New SSH key
3. Вставте скопійований ключ

#### Крок 3: Змініть remote на SSH

```bash
git remote set-url origin git@github.com:vasvasvv/dentis-charts.git

# Додайте workflow файли
git add .github/
git commit -m "ci: додати GitHub Actions workflows"
git push
```

---

## 📋 Які файли додати

Всі файли знаходяться локально в папці `.github/`:

```
.github/
├── workflows/
│   ├── cloudflare-pages.yml       ← Автодеплой frontend (ОСНОВНИЙ)
│   └── cloudflare-worker.yml      ← Автодеплой API worker
│
├── АВТОДЕПЛОЙ.md                  ← Інструкція українською
├── GITHUB_ACTIONS_SETUP.md        ← Повна документація
├── WORKFLOW_DIAGRAM.md            ← Схеми і візуалізація
└── README.md                      ← Огляд
```

**Мінімум:** Додайте тільки файли з папки `workflows/`
**Рекомендовано:** Додайте всі файли для повної документації

---

## 🎯 Після додавання workflows

### Налаштуйте GitHub Secrets

1. GitHub → Settings → Secrets and variables → Actions
2. Натисніть "New repository secret"
3. Додайте 2 секрети:

**Секрет 1:**
```
Name:  CLOUDFLARE_API_TOKEN
Value: <ваш Cloudflare API Token>
```

**Секрет 2:**
```
Name:  CLOUDFLARE_ACCOUNT_ID
Value: <ваш Cloudflare Account ID>
```

**Де взяти:**
- API Token: https://dash.cloudflare.com/profile/api-tokens
- Account ID: https://dash.cloudflare.com/ → будь-який проект → sidebar

### Створіть Cloudflare Pages проект

1. https://dash.cloudflare.com/ → Pages → Create project
2. Connect to Git → Виберіть репозиторій
3. Build settings:
   - Framework: **Vite**
   - Build command: **npm run build**
   - Output: **dist**
4. Save and Deploy

### Готово!

Тепер кожен `git push` автоматично деплоїть проект! 🎉

---

## 🤔 Що краще вибрати?

**Варіант 1 (Вручну через UI):**
- ✅ Найпростіше
- ✅ Не потрібно нічого налаштовувати локально
- ❌ Довше (копіювати кожен файл)

**Варіант 2 (Новий токен):**
- ✅ Швидко
- ✅ Можна використовувати далі
- ⚠️ Потрібно створити новий токен

**Варіант 3 (SSH):**
- ✅ Найбезпечніше
- ✅ Не потрібно токени
- ⚠️ Потрібно налаштувати SSH

**Рекомендація:** Використовуйте **Варіант 2** (новий токен) - швидко і зручно.

---

## 📞 Потрібна допомога?

Читайте документацію:
- `ВИПРАВЛЕННЯ_ДЕПЛОЮ.md` - основна інструкція
- `.github/АВТОДЕПЛОЙ.md` - інструкція з автоматизації
- `.github/GITHUB_ACTIONS_SETUP.md` - детальна документація

---

**Створено:** 2026-02-28  
**Статус:** Інструкція для додавання GitHub Actions
