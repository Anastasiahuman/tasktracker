# Dockerfile для API в monorepo
FROM node:20-alpine

# Установка pnpm глобально
RUN corepack enable && corepack prepare pnpm@latest --activate

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/ 2>/dev/null || true

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем весь исходный код
COPY . .

# Переходим в директорию API
WORKDIR /app/apps/api

# Генерируем Prisma Client
RUN pnpm prisma generate

# Собираем API
RUN pnpm build

# Применяем миграции
RUN pnpm prisma migrate deploy

# Production
ENV NODE_ENV=production

EXPOSE 3001

# Запускаем приложение
CMD ["node", "dist/main.js"]
