# Переменные окружения для деплоя

## API (Railway)

Скопируйте эти переменные в Railway → Settings → Variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=ваш-случайный-секрет-минимум-32-символа-abcdefghijklmnopqrstuvwxyz1234567890
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
RESEND_API_KEY=re_xxxxx
```

### Как получить JWT_SECRET:
```bash
# Сгенерируйте случайную строку (минимум 32 символа)
openssl rand -base64 32
# Или используйте онлайн генератор: https://randomkeygen.com/
```

### RESEND_API_KEY (опционально):
1. Зарегистрируйтесь на [resend.com](https://resend.com)
2. Создайте API ключ
3. Скопируйте ключ (начинается с `re_`)

## Web (Vercel)

Скопируйте эти переменные в Vercel → Settings → Environment Variables:

```env
NEXT_PUBLIC_USE_API=true
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
```

**Важно:** Замените `your-api.up.railway.app` на реальный URL вашего API из Railway.

## Порядок настройки

1. Сначала настройте API на Railway (получите URL)
2. Затем настройте Web на Vercel (используйте URL API)
3. Вернитесь в Railway и обновите `FRONTEND_URL` на URL Vercel

