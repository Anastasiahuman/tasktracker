#!/bin/bash

echo "🚀 Отправка кода на GitHub..."
echo ""

# Проверка подключения
if ! git remote -v | grep -q "Anastasiahuman/tasktracker"; then
    echo "❌ Репозиторий не подключен!"
    exit 1
fi

echo "✅ Репозиторий подключен: https://github.com/Anastasiahuman/tasktracker.git"
echo ""

# Попытка push
echo "📤 Отправка кода..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Код успешно отправлен на GitHub!"
    echo "🔗 Репозиторий: https://github.com/Anastasiahuman/tasktracker"
    echo ""
    echo "🚀 Следующий шаг:"
    echo "   1. Откройте RAILWAY_SETUP.md - деплой API"
    echo "   2. Откройте VERCEL_SETUP.md - деплой Web"
else
    echo ""
    echo "⚠️  Требуется аутентификация"
    echo ""
    echo "Создайте Personal Access Token:"
    echo "   1. Откройте: https://github.com/settings/tokens"
    echo "   2. Generate new token (classic)"
    echo "   3. Выберите scope: repo"
    echo "   4. Скопируйте токен"
    echo "   5. При запросе пароля введите токен"
    echo ""
    echo "Или используйте: gh auth login"
fi
