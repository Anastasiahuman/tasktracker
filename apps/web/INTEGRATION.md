# API Integration Guide

## Переключение между режимами

### LocalStorage режим (по умолчанию)

В `apps/web/.env`:
```env
NEXT_PUBLIC_USE_API=false
```

**Характеристики:**
- Работает автономно, не требует API
- Данные хранятся в браузере
- Идеально для разработки UI
- Все функции работают как раньше

### API режим

В `apps/web/.env`:
```env
NEXT_PUBLIC_USE_API=true
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Характеристики:**
- Подключается к NestJS API
- Требует авторизацию
- Требует выбора workspace
- Данные в PostgreSQL

## Проверка работы

### 1. LocalStorage режим (USE_API=false)

1. Убедитесь, что `NEXT_PUBLIC_USE_API=false` в `.env`
2. Запустите только web: `pnpm dev:web`
3. Откройте `http://localhost:3000`
4. Проверьте:
   - ✅ Dashboard загружается
   - ✅ Можно создать задачу
   - ✅ Можно отредактировать задачу
   - ✅ Можно удалить задачу
   - ✅ Фильтры работают
   - ✅ Данные сохраняются в localStorage

### 2. API режим (USE_API=true)

1. Убедитесь, что API запущен: `pnpm dev:api`
2. Убедитесь, что PostgreSQL запущен: `docker-compose up -d`
3. Установите `NEXT_PUBLIC_USE_API=true` в `.env`
4. Перезапустите web: `pnpm dev:web`
5. Откройте `http://localhost:3000`

**Шаги проверки:**

**a) Dev Login:**
- Автоматически редирект на `/login`
- Введите email: `test@example.com`
- Введите name: `Test User`
- Нажмите "Login"
- ✅ Должен произойти редирект на `/workspace`

**b) Workspace Selection:**
- Если нет workspace, создайте новый
- Введите имя: `My Workspace`
- Нажмите "Create Workspace"
- ✅ Должен произойти редирект на `/`

**c) Dashboard:**
- ✅ Задачи загружаются из API
- ✅ Счетчики показывают правильные числа
- ✅ Фильтры работают (фильтрация на сервере)

**d) Create Task:**
- Нажмите "New Task"
- Заполните форму
- Нажмите "Создать задачу"
- ✅ Задача создается в API
- ✅ Редирект на Dashboard
- ✅ Toast "Задача создана"

**e) Edit Task:**
- Откройте задачу
- Измените поля
- Нажмите "Сохранить изменения"
- ✅ Задача обновляется в API
- ✅ Toast "Задача обновлена"

**f) Delete Task:**
- Нажмите удалить на карточке
- Подтвердите
- ✅ Задача удаляется (soft delete)
- ✅ Toast "Задача удалена"

**g) Status Change:**
- Нажмите кнопку смены статуса
- ✅ Статус обновляется в API
- ✅ Toast "Статус обновлен"

## Обработка ошибок

### API недоступен
- Показывается toast "API unavailable"
- Приложение не крашится
- Можно переключиться обратно на localStorage

### 401 Unauthorized
- Автоматический refresh token
- Если refresh не удался → редирект на `/login`

### Workspace не выбран
- Автоматический редирект на `/workspace`

## Архитектура

```
UI Components
    ↓
tasksRepo / projectsRepo (adapter pattern)
    ↓
LocalStorageTasksRepo OR ApiTasksRepo
    ↓
storage.ts OR apiClient.ts
    ↓
localStorage OR API
```

UI не знает, откуда приходят данные - это абстракция через репозитории.

