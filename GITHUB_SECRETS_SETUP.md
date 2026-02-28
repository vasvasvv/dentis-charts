# 🔐 Налаштування GitHub Secrets

Для автоматичного деплою на Cloudflare через GitHub Actions необхідно налаштувати secrets.

## Крок 1: Перейдіть до налаштувань репозиторію

1. Відкрийте ваш репозиторій на GitHub: https://github.com/vasvasvv/dentis-charts
2. Натисніть **Settings** (вгорі справа)
3. В лівому меню виберіть **Secrets and variables** → **Actions**
4. Натисніть **New repository secret**

## Крок 2: Додайте наступні secrets

### 1. CLOUDFLARE_API_TOKEN

- **Name**: `CLOUDFLARE_API_TOKEN`
- **Value**: `FTOFM5dxCD0ypXdojzv_P6DbFG5AbcwYZeOcRYRJ`

### 2. CLOUDFLARE_ACCOUNT_ID

- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: `a22d80896b0eccc01b40478bc64c9849`

### 3. JWT_SECRET

- **Name**: `JWT_SECRET`
- **Value**: Створіть сильний секретний ключ (мінімум 32 символи)

**Приклад генерації JWT_SECRET:**

```bash
# В терміналі (Linux/Mac):
openssl rand -base64 32

# Або використайте онлайн генератор:
# https://generate-secret.vercel.app/32
```

**Рекомендований JWT_SECRET** (змініть його!):
```
your-super-secret-jwt-key-min-32-chars-long-change-me-in-production
```

## Крок 3: Перевірка

Після додавання всіх трьох secrets ви побачите їх список:

- ✅ CLOUDFLARE_API_TOKEN
- ✅ CLOUDFLARE_ACCOUNT_ID
- ✅ JWT_SECRET

## Крок 4: Тригер деплою

Після налаштування secrets, push до main гілки автоматично запустить деплой:

```bash
git add .
git commit -m "Configure Cloudflare deployment"
git push origin main
```

## Перевірка статусу деплою

1. Перейдіть на вкладку **Actions** у вашому репозиторії
2. Подивіться на останній workflow run
3. Якщо деплой успішний, ви побачите зелену галочку ✅

## Troubleshooting

### Помилка: "Invalid API token"

- Перевірте, що ви правильно скопіювали CLOUDFLARE_API_TOKEN
- Переконайтеся, що токен не містить пробілів на початку/кінці

### Помилка: "Database not found"

- Переконайтеся, що база даних `dentis-charts` існує в Cloudflare Dashboard
- Перевірте правильність `database_id` в `wrangler.toml`

### Помилка: "Account ID mismatch"

- Переконайтеся, що CLOUDFLARE_ACCOUNT_ID відповідає вашому account ID в Cloudflare

## Додаткова інформація

Після успішного деплою ваш API буде доступний за адресою:

```
https://dentis-cards-api.YOUR_SUBDOMAIN.workers.dev
```

Ви можете знайти точну URL в логах GitHub Actions або в Cloudflare Dashboard → Workers & Pages.
