# Task Tracker Admin

React Admin backoffice для управления командами, проектами и задачами.

## Требования

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Запущенный API сервер (apps/api)

## Установка

```bash
# Из корня монорепо
pnpm install

# Или из apps/admin
cd apps/admin
pnpm install
```

## Настройка

Создайте `.env` файл:

```bash
cp .env.example .env
```

Отредактируйте `apps/admin/.env`:

```env
VITE_API_URL=http://localhost:3001
```

## Запуск

```bash
# Из корня монорепо
pnpm dev:admin

# Или из apps/admin
cd apps/admin
pnpm dev
```

Admin будет доступен на `http://localhost:3002`

## Использование

1. Откройте `http://localhost:3002`
2. Войдите через dev-login:
   - Email: любой email
   - Name: ваше имя (опционально)
3. После входа вы увидите меню с ресурсами:
   - **Workspaces** - управление рабочими пространствами
   - **Users** - просмотр пользователей
   - **Memberships** - управление членством в workspace
   - **Projects** - управление проектами
   - **Tasks** - управление задачами
   - **Activities** - просмотр активности

## Ресурсы

### Workspaces
- List, Show, Edit

### Users
- List, Show (read-only)

### Memberships
- List (с фильтром по workspaceId), Edit (роль)

### Projects
- List, Create, Edit

### Tasks
- List (с фильтрами: workspaceId, projectId, status, priority, assigneeId, поиск)
- Create, Edit

### Activities
- List (read-only, с фильтрами: workspaceId, entityType)

## Авторизация

Admin использует тот же dev-login endpoint, что и web приложение:
- `POST /auth/dev-login` - вход
- `GET /auth/me` - получение текущего пользователя
- `POST /auth/refresh` - обновление токена

Токены хранятся в localStorage с ключами:
- `admin-access-token`
- `admin-refresh-token`

## Обработка ошибок

- При 401/403 ошибках происходит автоматический logout
- При недоступности API показывается стандартная ошибка React Admin
- Refresh токен обрабатывается автоматически

