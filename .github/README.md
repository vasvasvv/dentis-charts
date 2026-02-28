# 🤖 GitHub Actions для Cloudflare Pages

Ця папка містить налаштування автоматичного деплою на Cloudflare Pages.

## 📁 Файли

- `workflows/cloudflare-pages.yml` - Деплой React frontend
- `workflows/cloudflare-worker.yml` - Деплой Hono API worker
- `АВТОДЕПЛОЙ.md` - 🇺🇦 Швидка інструкція українською
- `GITHUB_ACTIONS_SETUP.md` - Повна документація
- `WORKFLOW_DIAGRAM.md` - Візуальна схема процесу

## 🚀 Швидкий старт

### 1. Налаштування (одноразово)

Читайте: **АВТОДЕПЛОЙ.md** (українською, 5 хвилин)

### 2. Використання

```bash
git push  # Автоматичний деплой!
```

## 📚 Документація

- **Українською:** `АВТОДЕПЛОЙ.md` - просто і швидко
- **Детально:** `GITHUB_ACTIONS_SETUP.md` - всі можливості
- **Візуально:** `WORKFLOW_DIAGRAM.md` - схеми і порівняння

## ✅ Що потрібно для роботи

- [ ] GitHub Secrets налаштовані:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
- [ ] Cloudflare Pages проект створений
- [ ] Workflow файли закоммічені

## 💡 Підказки

**Перевірити статус деплою:**
- GitHub: Repository → Actions tab
- Cloudflare: dash.cloudflare.com → Pages

**Ручний деплой worker:**
- Repository → Actions → "Deploy API Worker" → Run workflow

**Preview версія:**
- Створіть Pull Request → автоматичний preview

---

💬 Питання? Читайте документацію вище або створіть Issue.
