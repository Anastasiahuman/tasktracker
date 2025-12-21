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

