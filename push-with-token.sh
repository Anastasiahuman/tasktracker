#!/bin/bash

echo "🚀 Отправка кода на GitHub с токеном"
echo ""

# Проверка подключения
if ! git remote -v | grep -q "Anastasiahuman/tasktracker"; then
    echo "❌ Репозиторий не подключен!"
    exit 1
fi

echo "✅ Репозиторий подключен: https://github.com/Anastasiahuman/tasktracker.git"
echo ""

# Запрос токена
read -sp "Введите ваш GitHub Personal Access Token: " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Токен не введен!"
    exit 1
fi

# Настройка URL с токеном
GITHUB_URL="https://${GITHUB_TOKEN}@github.com/Anastasiahuman/tasktracker.git"

echo "📤 Отправка кода..."
git push $GITHUB_URL main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Код успешно отправлен на GitHub!"
    echo "🔗 Репозиторий: https://github.com/Anastasiahuman/tasktracker"
    echo ""
    echo "🚀 Следующий шаг:"
    echo "   1. Откройте RAILWAY_SETUP.md - деплой API"
    echo "   2. Откройте VERCEL_SETUP.md - деплой Web"
    
    # Обновляем remote на обычный URL (без токена)
    git remote set-url origin https://github.com/Anastasiahuman/tasktracker.git
    echo ""
    echo "✅ Remote URL обновлен (токен удален из настроек)"
else
    echo ""
    echo "❌ Ошибка при отправке кода"
    echo "Проверьте:"
    echo "   1. Правильность токена"
    echo "   2. Что токен имеет права 'repo'"
    echo "   3. Что репозиторий существует"
fi

