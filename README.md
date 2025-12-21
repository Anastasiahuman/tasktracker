# Task Tracker Monorepo

Монорепо для Task Tracker с Next.js web приложением и NestJS API.

## Структура

```
.
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # NestJS backend
│   └── admin/        # React Admin backoffice
├── packages/
│   └── shared/       # Shared types and utilities
└── docker-compose.yml
```

## Требования

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker (для PostgreSQL)

## Установка

```bash
# Установить pnpm (если не установлен)
npm install -g pnpm

# Установить зависимости
pnpm install
```

## Настройка окружения

### API

```bash
# Создать .env для API
cp apps/api/.env.example apps/api/.env
```

Отредактируйте `apps/api/.env`:
```env
DATABASE_URL="postgresql://tasktracker:tasktracker@localhost:5432/task_tracker?schema=public"
PORT=3001
JWT_SECRET="your-secret-key"
```

### Web

```bash
# Создать .env для Web
cp apps/web/.env.example apps/web/.env
```

Отредактируйте `apps/web/.env`:
```env
# API Integration
NEXT_PUBLIC_USE_API=false  # true для использования API, false для localStorage
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Запуск

### 1. Запустить PostgreSQL

```bash
# В корне монорепо
docker-compose up -d
```

### 2. Выполнить миграции Prisma

```bash
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev --name init
```

### 3. Запустить API сервер

```bash
# В корне монорепо
pnpm dev:api

# Или из apps/api
cd apps/api
pnpm start:dev
```

API будет доступен на `http://localhost:3001`

### 4. Запустить Web приложение

```bash
# В корне монорепо (в другом терминале)
pnpm dev:web

# Или из apps/web
cd apps/web
pnpm dev
```

Web будет доступен на `http://localhost:3000`

### 5. Запустить Admin (React Admin)

```bash
# Создать .env для admin
cp apps/admin/.env.example apps/admin/.env

# Запустить (в корне монорепо, в третьем терминале)
pnpm dev:admin

# Или из apps/admin
cd apps/admin
pnpm dev
```

Admin будет доступен на `http://localhost:3002`

**Настройка Admin:**
- Убедитесь, что `VITE_API_URL=http://localhost:3001` в `apps/admin/.env`
- Admin требует запущенный API сервер
- Для входа используйте dev-login (email + name)

## Режимы работы Web приложения

### LocalStorage режим (по умолчанию)

```env
NEXT_PUBLIC_USE_API=false
```

- Работает полностью автономно
- Данные хранятся в браузере (localStorage)
- Не требует API сервер
- Идеально для разработки UI

### API режим

```env
NEXT_PUBLIC_USE_API=true
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- Подключается к NestJS API
- Требует авторизацию (dev-login)
- Требует выбора workspace
- Данные хранятся в PostgreSQL

## Workflow для API режима

1. Запустить API сервер (`pnpm dev:api`)
2. Запустить Web (`pnpm dev:web`)
3. Открыть `http://localhost:3000`
4. Перейти на `/login` (автоматически при первом визите)
5. Ввести email и name → Dev Login
6. Выбрать или создать workspace на `/workspace`
7. Использовать приложение как обычно

## Переключение между режимами

Можно переключаться между localStorage и API режимами без перезапуска:
- Измените `NEXT_PUBLIC_USE_API` в `.env`
- Перезапустите dev server
- Приложение автоматически использует нужный режим

## Документация

- API документация: `apps/api/README.md`
- API примеры: `apps/api/API_EXAMPLES.md`
- Admin документация: `apps/admin/README.md`

## Admin (React Admin)

Admin приложение предоставляет backoffice для управления:
- **Workspaces** - управление рабочими пространствами
- **Users** - просмотр пользователей
- **Memberships** - управление членством в workspace
- **Projects** - управление проектами
- **Tasks** - управление задачами (с фильтрами и поиском)
- **Activities** - просмотр активности

Подробнее см. `apps/admin/README.md`
