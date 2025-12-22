#!/bin/bash

# Скрипт для проверки готовности к деплою

echo "🔍 Проверка готовности к деплою..."
echo ""

# Проверка git
echo "📦 Git статус:"
if git remote -v | grep -q "origin"; then
    echo "  ✅ GitHub репозиторий подключен"
    git remote -v
else
    echo "  ⚠️  GitHub репозиторий не подключен"
    echo "  Выполните: git remote add origin https://github.com/ВАШ-USERNAME/task-tracker-cute.git"
fi

echo ""
echo "📁 Конфигурации:"
if [ -f "railway.json" ]; then
    echo "  ✅ railway.json существует"
else
    echo "  ❌ railway.json отсутствует"
fi

if [ -f "vercel.json" ]; then
    echo "  ✅ vercel.json существует"
else
    echo "  ❌ vercel.json отсутствует"
fi

echo ""
echo "📚 Документация:"
if [ -f "DEPLOY_STEPS.md" ]; then
    echo "  ✅ DEPLOY_STEPS.md - пошаговая инструкция"
fi

echo ""
echo "✅ Проверка завершена!"
echo ""
echo "📖 Следующий шаг: откройте DEPLOY_STEPS.md и следуйте инструкциям"

