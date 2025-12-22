# Инструкция по деплою Task Tracker

## Обзор

Task Tracker состоит из трех приложений:
- **apps/web** - Next.js фронтенд
- **apps/api** - NestJS бэкенд API
- **apps/admin** - React Admin backoffice

## Варианты деплоя

### Вариант 1: Vercel (Web) + Railway/Render (API) + Railway/Render (Admin)

**Рекомендуется для начала**

#### 1. Деплой API (Railway или Render)

1. **Railway:**
   - Зарегистрируйтесь на [railway.app](https://railway.app)
   - Создайте новый проект
   - Добавьте PostgreSQL базу данных
   - Подключите репозиторий
   - Установите переменные окружения:
     ```
     DATABASE_URL=<из Railway PostgreSQL>
     JWT_SECRET=<случайная строка>
     PORT=3001
     RESEND_API_KEY=<ваш Resend API ключ>
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Railway автоматически определит NestJS и запустит `pnpm start:prod`

2. **Render:**
   - Зарегистрируйтесь на [render.com](https://render.com)
   - Создайте PostgreSQL базу данных
   - Создайте Web Service, подключите репозиторий
   - Build Command: `cd apps/api && pnpm install && pnpm build`
   - Start Command: `cd apps/api && pnpm start:prod`
   - Установите переменные окружения (как выше)

3. **Применение миграций:**
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```

#### 2. Деплой Web (Vercel)

1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Подключите репозиторий
3. Настройки проекта:
   - Root Directory: `apps/web`
   - Framework Preset: Next.js
   - Build Command: `pnpm build` (или оставьте по умолчанию)
   - Install Command: `pnpm install`
4. Environment Variables:
   ```
   NEXT_PUBLIC_USE_API=true
   NEXT_PUBLIC_API_URL=https://your-api.railway.app (или render.com)
   ```
5. Deploy

#### 3. Деплой Admin (опционально, Render)

1. Создайте Web Service на Render
2. Root Directory: `apps/admin`
3. Build Command: `cd apps/admin && pnpm install && pnpm build`
4. Start Command: `cd apps/admin && pnpm serve` (или используйте статический хостинг)
5. Environment Variables:
   ```
   VITE_API_URL=https://your-api.railway.app
   ```

### Вариант 2: Все на одном провайдере (Railway)

Railway поддерживает несколько сервисов в одном проекте:

1. Создайте проект на Railway
2. Добавьте PostgreSQL
3. Добавьте 3 сервиса:
   - **API**: Root `apps/api`, Build `pnpm install && pnpm build`, Start `pnpm start:prod`
   - **Web**: Root `apps/web`, Build `pnpm install && pnpm build`, Start `pnpm start`
   - **Admin**: Root `apps/admin`, Build `pnpm install && pnpm build`, Start `pnpm serve`

### Вариант 3: Docker Compose (VPS)

Создайте `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: tasktracker
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: task_tracker
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgresql://tasktracker:${DB_PASSWORD}@postgres:5432/task_tracker
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3001
      RESEND_API_KEY: ${RESEND_API_KEY}
      FRONTEND_URL: ${FRONTEND_URL}
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_USE_API: "true"
      NEXT_PUBLIC_API_URL: http://api:3001
    ports:
      - "3000:3000"
    depends_on:
      - api
```

## Настройка Email (Resend)

Подробные инструкции в `SETUP_EMAIL.md`

Кратко:
1. Зарегистрируйтесь на [resend.com](https://resend.com)
2. Создайте API ключ
3. Добавьте домен (для production) или используйте тестовый email
4. Установите `RESEND_API_KEY` в переменные окружения API

## Переменные окружения

### API (apps/api/.env)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key-min-32-chars
PORT=3001
RESEND_API_KEY=re_xxxxxxxxxxxxx
FRONTEND_URL=https://your-app.vercel.app
```

### Web (apps/web/.env.local)

```env
NEXT_PUBLIC_USE_API=true
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

### Admin (apps/admin/.env)

```env
VITE_API_URL=https://your-api.railway.app
```

## Применение миграций

После деплоя API:

```bash
# Локально или через Railway CLI
cd apps/api
pnpm prisma migrate deploy
```

## Проверка работы

1. **API Health:** `https://your-api.railway.app/health`
2. **Web:** `https://your-app.vercel.app`
3. **Admin:** `https://your-admin.render.com`

## Troubleshooting

### API не подключается к БД
- Проверьте `DATABASE_URL`
- Убедитесь, что БД доступна из сети (для Railway/Render обычно автоматически)

### CORS ошибки
- Проверьте `FRONTEND_URL` в API
- Убедитесь, что в `main.ts` CORS настроен правильно

### Email не отправляется
- Проверьте `RESEND_API_KEY`
- Убедитесь, что домен верифицирован (для production)
- Проверьте логи API

## Следующие шаги

1. Настройте домен для email (Resend)
2. Настройте CI/CD (GitHub Actions)
3. Добавьте мониторинг (Sentry, LogRocket)
4. Настройте бэкапы БД

