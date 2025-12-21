# API Examples - cURL запросы

## Базовая информация
- Base URL: `http://localhost:3001`
- Refresh tokens возвращаются в body (не в cookie)

## 1. Dev Login (создание/вход пользователя)

```bash
curl -X POST http://localhost:3001/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "Test User"
  }'
```

**Ответ:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Test User",
    "role": "MEMBER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Сохраните токены:**
```bash
export ACCESS_TOKEN="your-access-token-here"
export REFRESH_TOKEN="your-refresh-token-here"
```

## 2. Получить текущего пользователя

```bash
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## 3. Refresh Token

```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }"
```

## 4. Создать Workspace

```bash
curl -X POST http://localhost:3001/workspaces \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Workspace",
    "description": "Test workspace"
  }'
```

**Ответ:**
```json
{
  "id": "workspace-uuid",
  "name": "My Workspace",
  "slug": "my-workspace",
  "description": "Test workspace",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "memberships": [...]
}
```

**Сохраните workspace ID:**
```bash
export WORKSPACE_ID="workspace-uuid"
```

## 5. Список доступных Workspaces

```bash
curl -X GET http://localhost:3001/workspaces \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## 6. Добавить участника в Workspace

**Сначала создайте второго пользователя:**
```bash
curl -X POST http://localhost:3001/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@example.com",
    "name": "Member User"
  }'
```

**Затем добавьте его в workspace (используйте токен первого пользователя - OWNER):**
```bash
curl -X POST http://localhost:3001/workspaces/$WORKSPACE_ID/members \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@example.com",
    "role": "MEMBER"
  }'
```

## 7. Получить список участников Workspace

```bash
curl -X GET http://localhost:3001/workspaces/$WORKSPACE_ID/members \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## 8. Изменить роль участника (только OWNER)

```bash
# Сначала получите memberId из списка участников
export MEMBER_ID="membership-uuid"

curl -X PATCH http://localhost:3001/workspaces/$WORKSPACE_ID/members/$MEMBER_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ADMIN"
  }'
```

## 9. Logout

```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Полный пример workflow

```bash
# 1. Login
RESPONSE=$(curl -s -X POST http://localhost:3001/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@example.com", "name": "Owner"}')
ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

# 2. Create workspace
WORKSPACE_RESPONSE=$(curl -s -X POST http://localhost:3001/workspaces \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Team", "description": "Team workspace"}')
WORKSPACE_ID=$(echo $WORKSPACE_RESPONSE | jq -r '.id')

# 3. List workspaces
curl -X GET http://localhost:3001/workspaces \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 4. Add member
curl -X POST http://localhost:3001/workspaces/$WORKSPACE_ID/members \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "member@example.com"}'

# 5. List members
curl -X GET http://localhost:3001/workspaces/$WORKSPACE_ID/members \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## 10. Projects CRUD

### Создать Project

```bash
curl -X POST http://localhost:3001/projects \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"workspaceId\": \"$WORKSPACE_ID\",
    \"name\": \"My Project\",
    \"key\": \"PROJ\",
    \"description\": \"Project description\"
  }"
```

### Список Projects с фильтрацией, сортировкой и пагинацией

```bash
# Базовый запрос с фильтром workspaceId
curl -X GET "http://localhost:3001/projects?filter={\"workspaceId\":\"$WORKSPACE_ID\"}" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# С пагинацией (range)
curl -X GET "http://localhost:3001/projects?filter={\"workspaceId\":\"$WORKSPACE_ID\"}&range=[0,9]" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# С сортировкой (sort)
curl -X GET "http://localhost:3001/projects?filter={\"workspaceId\":\"$WORKSPACE_ID\"}&sort={\"field\":\"name\",\"order\":\"ASC\"}" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Полный пример: фильтр + сортировка + пагинация
curl -X GET "http://localhost:3001/projects?filter={\"workspaceId\":\"$WORKSPACE_ID\"}&sort={\"field\":\"createdAt\",\"order\":\"DESC\"}&range=[0,24]" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -v
```

**Ответ с Content-Range заголовком:**
```
Content-Range: projects 0-24/50
```

**Body:**
```json
[
  {
    "id": "project-uuid",
    "workspaceId": "workspace-uuid",
    "name": "My Project",
    "key": "PROJ",
    "description": "Project description",
    "archivedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Получить Project по ID

```bash
export PROJECT_ID="project-uuid"
curl -X GET http://localhost:3001/projects/$PROJECT_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Обновить Project

```bash
curl -X PATCH http://localhost:3001/projects/$PROJECT_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description"
  }'
```

### Удалить Project (soft delete)

```bash
curl -X DELETE http://localhost:3001/projects/$PROJECT_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## 11. Tasks CRUD

### Создать Task

```bash
curl -X POST http://localhost:3001/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"workspaceId\": \"$WORKSPACE_ID\",
    \"projectId\": \"$PROJECT_ID\",
    \"title\": \"Implement feature\",
    \"description\": \"Task description\",
    \"status\": \"BACKLOG\",
    \"priority\": \"HIGH\",
    \"dueDate\": \"2024-12-31T23:59:59.000Z\",
    \"estimateMinutes\": 120
  }"
```

### Список Tasks с фильтрацией, поиском и пагинацией

```bash
# Базовый запрос с фильтром workspaceId
curl -X GET "http://localhost:3001/tasks?filter={\"workspaceId\":\"$WORKSPACE_ID\"}" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Поиск по тексту (q) в title и description
curl -X GET "http://localhost:3001/tasks?filter={\"workspaceId\":\"$WORKSPACE_ID\",\"q\":\"feature\"}" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Фильтр по статусу
curl -X GET "http://localhost:3001/tasks?filter={\"workspaceId\":\"$WORKSPACE_ID\",\"status\":\"IN_PROGRESS\"}" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Фильтр по приоритету
curl -X GET "http://localhost:3001/tasks?filter={\"workspaceId\":\"$WORKSPACE_ID\",\"priority\":\"HIGH\"}" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Фильтр по projectId
curl -X GET "http://localhost:3001/tasks?filter={\"workspaceId\":\"$WORKSPACE_ID\",\"projectId\":\"$PROJECT_ID\"}" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Комбинированные фильтры + сортировка + пагинация
curl -X GET "http://localhost:3001/tasks?filter={\"workspaceId\":\"$WORKSPACE_ID\",\"status\":\"BACKLOG\",\"priority\":\"HIGH\"}&sort={\"field\":\"createdAt\",\"order\":\"DESC\"}&range=[0,49]" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -v
```

**Ответ с Content-Range заголовком:**
```
Content-Range: tasks 0-49/150
```

**Body:**
```json
[
  {
    "id": "task-uuid",
    "workspaceId": "workspace-uuid",
    "projectId": "project-uuid",
    "title": "Implement feature",
    "description": "Task description",
    "status": "BACKLOG",
    "priority": "HIGH",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "startDate": null,
    "estimateMinutes": 120,
    "assigneeId": null,
    "reporterId": "user-uuid",
    "archivedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "assignee": null,
    "reporter": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "Test User"
    },
    "project": {
      "id": "project-uuid",
      "name": "My Project",
      "key": "PROJ"
    }
  }
]
```

### Получить Task по ID

```bash
export TASK_ID="task-uuid"
curl -X GET http://localhost:3001/tasks/$TASK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Обновить Task

```bash
curl -X PATCH http://localhost:3001/tasks/$TASK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "assigneeId": "assignee-user-uuid",
    "startDate": "2024-01-02T00:00:00.000Z"
  }'
```

### Удалить Task (soft delete)

```bash
curl -X DELETE http://localhost:3001/tasks/$TASK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Пример полного workflow с Projects и Tasks

```bash
# 1. Login и создание workspace
RESPONSE=$(curl -s -X POST http://localhost:3001/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "User"}')
ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

WORKSPACE_RESPONSE=$(curl -s -X POST http://localhost:3001/workspaces \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Workspace"}')
WORKSPACE_ID=$(echo $WORKSPACE_RESPONSE | jq -r '.id')

# 2. Создать проект
PROJECT_RESPONSE=$(curl -s -X POST http://localhost:3001/projects \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"workspaceId\":\"$WORKSPACE_ID\",\"name\":\"Web App\",\"key\":\"WEB\"}")
PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.id')

# 3. Создать задачу
TASK_RESPONSE=$(curl -s -X POST http://localhost:3001/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"workspaceId\":\"$WORKSPACE_ID\",\"projectId\":\"$PROJECT_ID\",\"title\":\"Setup API\",\"status\":\"BACKLOG\"}")
TASK_ID=$(echo $TASK_RESPONSE | jq -r '.id')

# 4. Получить список задач с фильтрацией
curl -X GET "http://localhost:3001/tasks?filter={\"workspaceId\":\"$WORKSPACE_ID\",\"projectId\":\"$PROJECT_ID\"}&sort={\"field\":\"createdAt\",\"order\":\"DESC\"}&range=[0,9]" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -v
```

