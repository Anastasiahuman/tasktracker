#!/bin/bash

RAILWAY_TOKEN="4901822f-ee6e-4eb1-8542-f6db7202ac54"
RAILWAY_API="https://api.railway.app/v1"

echo "🔍 Проверяю доступ к Railway API..."

# Проверка токена
response=$(curl -s -w "\n%{http_code}" -X GET "$RAILWAY_API/me" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" != "200" ]; then
  echo "❌ Ошибка авторизации. HTTP код: $http_code"
  echo "Ответ: $body"
  exit 1
fi

echo "✅ Авторизация успешна!"
echo "$body" | jq '.' 2>/dev/null || echo "$body"

