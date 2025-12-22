# 📤 Отправка кода на GitHub

## ✅ Репозиторий подключен!

Репозиторий уже подключен к: https://github.com/Anastasiahuman/tasktracker.git

## 🚀 Отправка кода

Выполните в терминале:

```bash
cd /Users/anastasiaamanova/task-tracker-cute
git push -u origin main
```

### Если потребуется аутентификация:

**Вариант 1: Personal Access Token (рекомендуется)**

1. Откройте: https://github.com/settings/tokens
2. Нажмите **"Generate new token"** → **"Generate new token (classic)"**
3. Название: `task-tracker-deploy`
4. Выберите scope: `repo` (полный доступ к репозиториям)
5. Нажмите **"Generate token"**
6. **Скопируйте токен** (он показывается только один раз!)
7. При запросе пароля введите токен вместо пароля

**Вариант 2: GitHub CLI**

```bash
# Если установлен GitHub CLI
gh auth login
git push -u origin main
```

**Вариант 3: Настройка credentials**

```bash
git config --global credential.helper osxkeychain
git push -u origin main
```

## ✅ После успешного push

Код будет на GitHub и можно продолжать деплой:
1. Railway - откройте RAILWAY_SETUP.md
2. Vercel - откройте VERCEL_SETUP.md

