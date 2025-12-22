#!/bin/bash

# Использование: ./push-direct.sh YOUR_TOKEN
# Или: GITHUB_TOKEN=your_token ./push-direct.sh

if [ -z "$1" ] && [ -z "$GITHUB_TOKEN" ]; then
    echo "Использование:"
    echo "  ./push-direct.sh YOUR_TOKEN"
    echo "  или"
    echo "  GITHUB_TOKEN=your_token ./push-direct.sh"
    exit 1
fi

TOKEN=${1:-$GITHUB_TOKEN}

echo "🚀 Отправка кода на GitHub..."
echo ""

# Настройка URL с токеном
GITHUB_URL="https://${TOKEN}@github.com/Anastasiahuman/tasktracker.git"

# Push
git push $GITHUB_URL main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Код успешно отправлен!"
    echo "🔗 https://github.com/Anastasiahuman/tasktracker"
    
    # Обновляем remote
    git remote set-url origin https://github.com/Anastasiahuman/tasktracker.git
    echo "✅ Remote обновлен"
else
    echo "❌ Ошибка. Проверьте токен и права доступа."
fi

