# Dockerfile для API сервиса
FROM node:20-alpine AS base

# Установка pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/ 2>/dev/null || true

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
WORKDIR /app/apps/api
RUN pnpm prisma generate

# Собираем API
RUN pnpm build

# Production
ENV NODE_ENV=production

# Применяем миграции
RUN pnpm prisma migrate deploy

EXPOSE 3001

CMD ["node", "dist/main.js"]

