# 🎯 НАЧНИТЕ ОТСЮДА!

## ✅ Что уже готово

- ✅ Все файлы закоммичены
- ✅ Конфигурации созданы
- ✅ JWT_SECRET сгенерирован (см. JWT_SECRET.txt)
- ✅ Инструкции готовы

## 🚀 План действий (10 минут)

### Шаг 1: GitHub (2 минуты)

1. **Откройте:** https://github.com/new
2. **Создайте репозиторий:**
   - Название: `task-tracker-cute`
   - Public или Private
   - **НЕ** добавляйте README, .gitignore, license
3. **После создания выполните:**

```bash
cd /Users/anastasiaamanova/task-tracker-cute
git remote add origin https://github.com/ВАШ-USERNAME/task-tracker-cute.git
git branch -M main
git push -u origin main
```

**Замените `ВАШ-USERNAME` на ваш GitHub username!**

### Шаг 2: Railway - API (5 минут)

1. **Откройте:** https://railway.app
2. **Login with GitHub**
3. **New Project** → **Deploy from GitHub repo** → выберите `task-tracker-cute`
4. **+ New** → **Database** → **PostgreSQL**
5. **Настройте API сервис:**
   - Откройте сервис с репозиторием
   - Settings → Root Directory: `apps/api`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm prisma generate && pnpm prisma migrate deploy && pnpm start:prod`
6. **Добавьте переменные (Settings → Variables):**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=DjLNj8omoOmhO0c2WuOC6pIqlO9FUlop+C3X4lwkJ9Y=
   PORT=3001
   FRONTEND_URL=https://your-app.vercel.app
   ```
7. **Получите URL:** Settings → Networking → Generate Domain
8. **Скопируйте URL API** (например: `https://your-api.up.railway.app`)

**Подробная инструкция:** RAILWAY_SETUP.md

### Шаг 3: Vercel - Web (3 минуты)

1. **Откройте:** https://vercel.com
2. **Sign Up with GitHub**
3. **Add New** → **Project** → выберите `task-tracker-cute`
4. **Настройте:**
   - Root Directory: `apps/web`
5. **Добавьте переменные (Environment Variables):**
   ```
   NEXT_PUBLIC_USE_API=true
   NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
   ```
   (Замените на реальный URL из Railway!)
6. **Deploy**
7. **Скопируйте URL** (например: `https://your-app.vercel.app`)

**Подробная инструкция:** VERCEL_SETUP.md

### Шаг 4: Обновление FRONTEND_URL (1 минута)

1. **Вернитесь в Railway**
2. **Settings** → **Variables**
3. **Обновите** `FRONTEND_URL` на URL из Vercel
4. Railway автоматически перезапустит API

## ✅ Готово!

Откройте: `https://your-app.vercel.app`

## 📚 Дополнительные инструкции

- **RAILWAY_SETUP.md** - детальная настройка Railway
- **VERCEL_SETUP.md** - детальная настройка Vercel
- **COMMANDS.md** - команды для копирования
- **AUTO_DEPLOY.md** - альтернативная инструкция

## 🆘 Если что-то не работает

1. Проверьте логи в Railway и Vercel
2. Убедитесь, что все переменные окружения установлены
3. Проверьте, что URL правильные
4. Убедитесь, что миграции применены (Railway делает это автоматически)

