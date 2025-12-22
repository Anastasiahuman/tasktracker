# 🤖 Автоматизированный деплой - пошагово

## Шаг 1: GitHub репозиторий (2 минуты)

### Вариант A: Через скрипт

```bash
./setup-github.sh
```

Скрипт откроет инструкции и поможет подключить репозиторий.

### Вариант B: Вручную

1. Откройте https://github.com/new
2. Название: `task-tracker-cute`
3. Public или Private
4. НЕ добавляйте README, .gitignore, license
5. Create repository
6. Затем выполните:

```bash
git remote add origin https://github.com/ВАШ-USERNAME/task-tracker-cute.git
git branch -M main
git push -u origin main
```

## Шаг 2: Railway - API (5 минут)

### 2.1 Создание проекта

1. Откройте https://railway.app
2. Login with GitHub
3. New Project → Deploy from GitHub repo
4. Выберите `task-tracker-cute`

### 2.2 PostgreSQL база данных

1. В проекте: **+ New** → **Database** → **PostgreSQL**
2. Railway создаст базу автоматически

### 2.3 Настройка API сервиса

1. Найдите сервис с вашим репозиторием
2. Откройте **Settings**
3. Настройте:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm prisma generate && pnpm prisma migrate deploy && pnpm start:prod`

### 2.4 Переменные окружения

В **Settings** → **Variables** добавьте:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<сгенерируйте случайную строку минимум 32 символа>
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
```

**Для генерации JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 2.5 Получение URL

1. Settings → Networking
2. Generate Domain
3. Скопируйте URL (например: `https://your-api.up.railway.app`)

## Шаг 3: Vercel - Web (3 минуты)

### 3.1 Создание проекта

1. Откройте https://vercel.com
2. Sign Up with GitHub
3. Add New → Project
4. Выберите `task-tracker-cute`
5. Import

### 3.2 Настройка

1. **Root Directory**: `apps/web`
2. **Framework**: Next.js (автоматически)

### 3.3 Переменные окружения

В **Environment Variables** добавьте:

```
NEXT_PUBLIC_USE_API=true
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
```

(Замените на реальный URL из Railway!)

### 3.4 Деплой

1. Deploy
2. Дождитесь завершения
3. Скопируйте URL (например: `https://your-app.vercel.app`)

## Шаг 4: Обновление FRONTEND_URL (1 минута)

1. Вернитесь в Railway
2. Settings → Variables
3. Обновите `FRONTEND_URL` на URL из Vercel
4. Railway перезапустит API автоматически

## ✅ Готово!

Откройте ваш сайт: `https://your-app.vercel.app`

## 🆘 Troubleshooting

### API не запускается
- Проверьте логи в Railway
- Убедитесь, что DATABASE_URL правильный
- Проверьте, что миграции применены

### CORS ошибки
- Проверьте FRONTEND_URL в Railway
- Убедитесь, что URL совпадает с Vercel

### Web не подключается к API
- Проверьте NEXT_PUBLIC_API_URL в Vercel
- Убедитесь, что API доступен: `https://your-api.up.railway.app/health`

