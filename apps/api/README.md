# Task Tracker API

NestJS API для Task Tracker с авторизацией и управлением воркспейсами.

## Установка и запуск

### 1. Установите зависимости

```bash
# В корне монорепо
pnpm install
```

### 2. Настройте базу данных

Создайте `.env` файл в `apps/api/`:

```bash
cp apps/api/.env.example apps/api/.env
```

Отредактируйте `apps/api/.env` при необходимости.

### 3. Запустите PostgreSQL через Docker

```bash
# В корне монорепо
docker-compose up -d
```

### 4. Выполните миграции Prisma

```bash
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev --name init
```

### 5. Запустите API сервер

```bash
# В корне монорепо
pnpm dev:api

# Или из apps/api
pnpm start:dev
```

API будет доступен на `http://localhost:3001`

## Endpoints

### Auth
- `POST /auth/dev-login` - Dev login (создает пользователя если нет)
- `GET /auth/me` - Получить текущего пользователя
- `POST /auth/refresh` - Обновить токен
- `POST /auth/logout` - Выход

### Workspaces
- `POST /workspaces` - Создать workspace
- `GET /workspaces` - Список доступных workspaces
- `POST /workspaces/:id/members` - Добавить участника (OWNER/ADMIN)
- `PATCH /workspaces/:id/members/:memberId` - Изменить роль (OWNER)
- `GET /workspaces/:id/members` - Список участников (OWNER/ADMIN)

### Projects
- `GET /projects` - Список projects (React Admin совместимый, требует filter.workspaceId)
- `POST /projects` - Создать project
- `GET /projects/:id` - Получить project
- `PATCH /projects/:id` - Обновить project
- `DELETE /projects/:id` - Удалить project (soft delete)

### Tasks
- `GET /tasks` - Список tasks (React Admin совместимый, требует filter.workspaceId)
- `POST /tasks` - Создать task
- `GET /tasks/:id` - Получить task
- `PATCH /tasks/:id` - Обновить task
- `DELETE /tasks/:id` - Удалить task (soft delete)

### Health
- `GET /health` - Health check

## Примеры запросов

См. `API_EXAMPLES.md` для примеров cURL запросов.

## JWT Tokens

- **Access Token**: действителен 15 минут, передается в заголовке `Authorization: Bearer <token>`
- **Refresh Token**: действителен 7 дней, передается в body запроса `/auth/refresh`

Refresh tokens возвращаются в body ответа (не в httpOnly cookie).

