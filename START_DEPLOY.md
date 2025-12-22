# 🚀 Начать деплой за 10 минут

## Что нужно сделать

### 1️⃣ Подготовка (1 минута)

Убедитесь, что ваш код в GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push
```

### 2️⃣ Деплой API на Railway (5 минут)

1. Откройте [railway.app](https://railway.app) и войдите через GitHub
2. Нажмите **"New Project"** → **"Deploy from GitHub repo"**
3. Выберите репозиторий `task-tracker-cute`
4. Добавьте **PostgreSQL**:
   - Нажмите **"+ New"** → **"Database"** → **"PostgreSQL"**
5. Добавьте **API сервис**:
   - Нажмите **"+ New"** → **"GitHub Repo"** → выберите репозиторий
   - В настройках сервиса:
     - **Root Directory**: `apps/api`
     - **Build Command**: `pnpm install && pnpm build`
     - **Start Command**: `pnpm prisma generate && pnpm prisma migrate deploy && pnpm start:prod`
6. Добавьте переменные окружения (Settings → Variables):
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=ваш-случайный-секрет-минимум-32-символа-abcdefghijklmnopqrstuvwxyz123456
   PORT=3001
   FRONTEND_URL=https://ваш-домен.vercel.app (заполните после деплоя веба)
   ```
7. Скопируйте URL API (например: `https://your-api.up.railway.app`)

### 3️⃣ Деплой Web на Vercel (3 минуты)

1. Откройте [vercel.com](https://vercel.com) и войдите через GitHub
2. Нажмите **"Add New"** → **"Project"**
3. Выберите репозиторий `task-tracker-cute`
4. Настройки:
   - **Root Directory**: `apps/web` (или оставьте по умолчанию, vercel.json настроен)
   - **Framework**: Next.js (автоматически)
5. Добавьте переменные окружения:
   ```
   NEXT_PUBLIC_USE_API=true
   NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
   ```
   (замените на ваш URL из Railway)
6. Нажмите **"Deploy"**
7. Скопируйте URL веб-приложения (например: `https://your-app.vercel.app`)

### 4️⃣ Обновите FRONTEND_URL (1 минута)

1. Вернитесь в Railway
2. В настройках API сервиса обновите переменную:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Перезапустите API сервис (Settings → Restart)

### 5️⃣ Готово! 🎉

Откройте ваш сайт: `https://your-app.vercel.app`

## Проверка работы

- ✅ API Health: `https://your-api.up.railway.app/health` → должно быть `{"ok":true}`
- ✅ Веб-приложение: `https://your-app.vercel.app` → должна открыться главная страница
- ✅ Вход: `/login` → войдите через dev-login
- ✅ Создание workspace: нажмите кнопку "Workspace" в Header

## Email (опционально)

Если нужны приглашения по email:
1. Зарегистрируйтесь на [resend.com](https://resend.com)
2. Создайте API ключ
3. Добавьте в Railway: `RESEND_API_KEY=re_xxxxx`

## Проблемы?

Смотрите `DEPLOYMENT.md` для подробной информации и troubleshooting.

