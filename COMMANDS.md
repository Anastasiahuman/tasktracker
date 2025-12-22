# 📋 Команды для копирования

## Шаг 1: GitHub (выполните в терминале)

```bash
# После создания репозитория на github.com выполните:
cd /Users/anastasiaamanova/task-tracker-cute
git remote add origin https://github.com/ВАШ-USERNAME/task-tracker-cute.git
git branch -M main
git push -u origin main
```

**Замените `ВАШ-USERNAME` на ваш GitHub username!**

## Шаг 2: Генерация JWT_SECRET

```bash
openssl rand -base64 32
```

Скопируйте результат - это будет ваш JWT_SECRET для Railway.

## Шаг 3: Проверка API после деплоя

```bash
curl https://your-api.up.railway.app/health
```

Должно вернуть: `{"ok":true}`

