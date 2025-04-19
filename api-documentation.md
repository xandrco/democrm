# API Документация

## Содержание
- [Введение](#введение)
- [Аутентификация](#аутентификация)
- [Заявки (Applications)](#заявки-applications)
  - [Получение списка заявок](#получение-списка-заявок)
  - [Создание новой заявки](#создание-новой-заявки)
  - [Просмотр детальной информации о заявке](#просмотр-детальной-информации-о-заявке)
  - [Обновление данных заявки](#обновление-данных-заявки)
  - [Удаление заявки](#удаление-заявки)
  - [Экспорт заявок в CSV](#экспорт-заявок-в-csv)
- [Комментарии (Comments)](#комментарии-comments)
  - [Получение списка комментариев](#получение-списка-комментариев)
  - [Добавление комментария](#добавление-комментария)
  - [Удаление комментария](#удаление-комментария)

## Введение

API предоставляет возможность управления заявками и комментариями к ним. Все запросы, кроме аутентификации, требуют наличия токена доступа.

## Аутентификация

### Вход в систему

```
POST /api/login
```

**Параметры запроса:**
```json
{
  "email": "email@example.com",
  "password": "password"
}
```

**Ответ:**
```json
{
  "success": true,
  "token": "your_auth_token",
  "user": {
    "id": 1,
    "name": "Имя пользователя",
    "email": "email@example.com"
  }
}
```

### Регистрация

```
POST /api/register
```

**Параметры запроса:**
```json
{
  "name": "Имя пользователя",
  "email": "email@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

**Ответ:**
```json
{
  "success": true,
  "token": "your_auth_token",
  "user": {
    "id": 1,
    "name": "Имя пользователя",
    "email": "email@example.com"
  }
}
```

### Получение данных пользователя

```
GET /api/user
```

**Заголовки:**
```
Authorization: Bearer your_auth_token
```

**Ответ:**
```json
{
  "id": 1,
  "name": "Имя пользователя",
  "email": "email@example.com"
}
```

### Выход из системы

```
POST /api/logout
```

**Заголовки:**
```
Authorization: Bearer your_auth_token
```

**Ответ:**
```json
{
  "success": true,
  "message": "Успешный выход из системы"
}
```

## Заявки (Applications)

### Получение списка заявок

```
GET /api/applications
```

**Параметры запроса:**
- `status` - фильтр по статусу заявки (pending, in_progress, approved, rejected)
- `search` - поиск по имени или email
- `per_page` - количество записей на странице (по умолчанию 15)
- `sort_by` - поле для сортировки (created_at, reviewed_at, name, email, status)
- `sort_direction` - направление сортировки (asc, desc)

**Заголовки:**
```
Authorization: Bearer your_auth_token
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Иван Иванов",
        "email": "ivan@example.com",
        "message": "Текст заявки",
        "status": "pending",
        "created_at": "2023-10-01T10:00:00",
        "reviewed_at": null,
        "comments_count": 0
      }
    ],
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

### Создание новой заявки

```
POST /api/applications
```

**Параметры запроса:**
```json
{
  "name": "Имя заявителя",
  "email": "email@example.com",
  "message": "Текст заявки"
}
```

**Заголовки:**
```
Authorization: Bearer your_auth_token
```

**Ответ:**
```json
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "id": 1,
    "name": "Имя заявителя",
    "email": "email@example.com",
    "message": "Текст заявки",
    "status": "pending",
    "created_at": "2023-10-01T10:00:00",
    "reviewed_at": null
  }
}
```

### Просмотр детальной информации о заявке

```
GET /api/applications/{id}
```

**Заголовки:**
```
Authorization: Bearer your_auth_token
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Имя заявителя",
    "email": "email@example.com",
    "message": "Текст заявки",
    "status": "pending",
    "created_at": "2023-10-01T10:00:00",
    "reviewed_at": null,
    "metadata": {
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0...",
      "referer": "https://example.com"
    },
    "reviewer": null,
    "comments": []
  }
}
```

### Обновление данных заявки

```
PUT /api/applications/{id}
```

**Параметры запроса:**
```json
{
  "status": "in_progress",
  "comment": "Комментарий к изменению статуса"
}
```

**Заголовки:**
```
Authorization: Bearer your_auth_token
```

**Ответ:**
```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": {
    "id": 1,
    "name": "Имя заявителя",
    "email": "email@example.com",
    "message": "Текст заявки",
    "status": "in_progress",
    "created_at": "2023-10-01T10:00:00",
    "reviewed_at": "2023-10-02T11:00:00",
    "reviewer": {
      "id": 1,
      "name": "Администратор"
    },
    "comments": [
      {
        "id": 1,
        "application_id": 1,
        "user_id": 1,
        "comment": "Комментарий к изменению статуса",
        "created_at": "2023-10-02T11:00:00",
        "user": {
          "id": 1,
          "name": "Администратор"
        }
      }
    ]
  }
}
```

### Удаление заявки

```
DELETE /api/applications/{id}
```

**Заголовки:**
```
Authorization: Bearer your_auth_token
```

**Ответ:**
```json
{
  "success": true,
  "message": "Application deleted successfully with all related comments"
}
```

### Экспорт заявок в CSV

```
GET /api/applications/export
```

**Параметры запроса:**
- `status` - фильтр по статусу заявки
- `search` - поиск по имени или email
- `sort_by` - поле для сортировки
- `sort_direction` - направление сортировки

**Заголовки:**
```
Authorization: Bearer your_auth_token
```

**Ответ:**
CSV-файл с заявками, включающий следующие колонки:
- ID
- Имя
- Email
- Сообщение
- Статус
- Дата создания
- Дата обработки
- Рецензент
- IP адрес
- Браузер

## Комментарии (Comments)

### Получение списка комментариев

```
GET /api/applications/{application_id}/comments
```

**Параметры запроса:**
- `sort` - сортировка (newest, oldest)
- `per_page` - количество записей на странице (по умолчанию 15)

**Заголовки:**
```
Authorization: Bearer your_auth_token
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "application_id": 1,
        "user_id": 1,
        "comment": "Текст комментария",
        "created_at": "2023-10-02T11:00:00",
        "user": {
          "id": 1,
          "name": "Имя пользователя"
        }
      }
    ],
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

### Добавление комментария

```
POST /api/applications/{application_id}/comments
```

**Параметры запроса:**
```json
{
  "comment": "Текст комментария"
}
```

**Заголовки:**
```
Authorization: Bearer your_auth_token
```

**Ответ:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": 1,
    "application_id": 1,
    "user_id": 1,
    "comment": "Текст комментария",
    "created_at": "2023-10-02T11:00:00",
    "user": {
      "id": 1,
      "name": "Имя пользователя"
    }
  }
}
```

### Удаление комментария

```
DELETE /api/comments/{id}
```

**Заголовки:**
```
Authorization: Bearer your_auth_token
```

**Ответ:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

**Примечание:** Удаление комментария доступно только автору комментария. 