# Prisma Migration Instructions

## Изменения в schema.prisma

Обновлены модели:
- **Project**: добавлены поля `key`, `archivedAt`, уникальный индекс `workspaceId_key`
- **Task**: добавлены поля `workspaceId`, `assigneeId`, `reporterId`, `startDate`, `estimateMinutes`, `archivedAt`; `projectId` сделан optional
- **User**: добавлены связи `assignedTasks` и `reportedTasks`
- **Workspace**: добавлена связь `tasks`

## Выполнение миграции

```bash
cd apps/api

# 1. Сгенерировать Prisma Client
pnpm prisma generate

# 2. Создать миграцию
pnpm prisma migrate dev --name add_projects_tasks_fields

# 3. Применить миграцию (если нужно)
pnpm prisma migrate deploy
```

## Важно

- Миграция может потребовать ручного вмешательства, если в базе уже есть данные
- Поле `projectId` в Task теперь optional - существующие задачи без проекта могут остаться с `projectId = null`
- Поле `workspaceId` в Task обязательное - нужно будет заполнить для существующих задач

