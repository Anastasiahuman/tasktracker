# Multi-stage build для API в monorepo
FROM node:20-alpine AS base

# Установка pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Установка зависимостей
FROM base AS deps
WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/ 2>/dev/null || true

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Build phase
FROM base AS build
WORKDIR /app

# Копируем зависимости
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
WORKDIR /app/apps/api
RUN pnpm prisma generate

# Собираем API
RUN pnpm build

# Production phase
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Копируем только необходимые файлы
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./node_modules

# Применяем миграции
WORKDIR /app
RUN pnpm prisma migrate deploy

EXPOSE 3001

CMD ["node", "dist/main.js"]

