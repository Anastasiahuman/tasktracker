# 📝 Task Tracker Cute

Современный task tracker с милым дизайном в стиле Смешариков.

## 🏗️ Архитектура

**Monorepo** (pnpm workspaces)
- `apps/api` - Backend (NestJS + PostgreSQL)
- `apps/web` - Frontend (Next.js + React)

## 🚀 Быстрый старт

### Требования

- Node.js 20+
- pnpm 10+
- Docker (для локальной базы данных)

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/Anastasiahuman/tasktracker.git
cd task-tracker-cute

# Установить зависимости
pnpm install

# Запустить PostgreSQL
docker-compose up -d

# Применить миграции
cd apps/api
pnpm prisma migrate dev
pnpm prisma generate
```

### Запуск локально

```bash
# В корне проекта
pnpm dev
```

Или отдельно:

```bash
# Terminal 1: API (порт 3001)
cd apps/api
pnpm start:dev

# Terminal 2: Web (порт 3000)
cd apps/web
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📦 Переменные окружения

Создайте `.env` файл в корне проекта (см. `.env.example` для примера):

```env
# База данных
DATABASE_URL=postgresql://tasktracker:tasktracker@localhost:5432/task_tracker

# API
PORT=3001
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🚢 Деплой

### Railway (API + PostgreSQL)

1. Создайте проект на [Railway](https://railway.app)
2. Добавьте PostgreSQL базу данных
3. Добавьте сервис из GitHub репозитория
4. Установите Root Directory: `apps/api`
5. Добавьте переменные окружения:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `JWT_SECRET` = (случайная строка)
   - `FRONTEND_URL` = (URL фронтенда после деплоя)

Подробные инструкции: [DEPLOYMENT_ANALYSIS.md](./DEPLOYMENT_ANALYSIS.md)

### Vercel (Frontend)

1. Создайте проект на [Vercel](https://vercel.com)
2. Импортируйте GitHub репозиторий
3. Установите Root Directory: `apps/web`
4. Добавьте переменные окружения:
   - `NEXT_PUBLIC_API_URL` = (URL API из Railway)

## 📚 Технологии

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL
- **Аутентификация**: JWT, Passport.js

Подробнее: [TECH_STACK.md](./TECH_STACK.md)

## 📋 Функции

- ✅ Управление задачами (CRUD)
- ✅ Категории задач (Дизайн, ТЗ, Исследования, Разработка, Тестирование, Публикация)
- ✅ Приоритеты и статусы
- ✅ Аутентификация (Login/Register)
- ✅ Workspaces и Projects
- ✅ Милый дизайн 🎨

## 🔧 Разработка

```bash
# Линтинг
pnpm lint

# Форматирование
pnpm format

# Сборка
pnpm build
```

## 📄 Лицензия

MIT
