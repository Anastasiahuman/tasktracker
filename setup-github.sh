#!/bin/bash

# Скрипт для настройки GitHub репозитория

echo "🚀 Настройка GitHub репозитория"
echo ""

# Проверка текущего remote
if git remote -v | grep -q "origin"; then
    echo "✅ GitHub репозиторий уже подключен:"
    git remote -v
    exit 0
fi

echo "📋 Инструкция:"
echo ""
echo "1. Откройте https://github.com/new в браузере"
echo "2. Название репозитория: task-tracker-cute"
echo "3. Выберите Public (или Private)"
echo "4. НЕ добавляйте README, .gitignore, license"
echo "5. Нажмите 'Create repository'"
echo ""
read -p "После создания репозитория введите ваш GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Username не введен. Выход."
    exit 1
fi

echo ""
echo "🔗 Подключение репозитория..."

git remote add origin "https://github.com/${GITHUB_USERNAME}/task-tracker-cute.git" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Репозиторий подключен!"
    echo ""
    echo "📤 Отправка кода на GitHub..."
    git branch -M main
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Код успешно отправлен на GitHub!"
        echo "🔗 Репозиторий: https://github.com/${GITHUB_USERNAME}/task-tracker-cute"
    else
        echo "❌ Ошибка при отправке кода. Проверьте права доступа."
    fi
else
    echo "❌ Ошибка при подключении репозитория."
    echo "Возможно, репозиторий уже подключен или URL неверный."
fi

