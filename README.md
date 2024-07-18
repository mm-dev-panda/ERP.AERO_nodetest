# ERP AERO API

Этот проект для тестового задачи 

## Настройка окружения

Перед запуском проекта убедитесь, что у вас установлен Node.js и MySQL.

### Установка зависимостей
Настройка базы данных
Создайте базу данных и таблицы в MySQL. Используйте следующие команды:

```
CREATE DATABASE erp_aero;

USE erp_aero;

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    extension VARCHAR(10) NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    size INT NOT NULL,
    upload_date DATETIME NOT NULL
);
```
```bash
npm install
```
```
postman.json - для тестов на Postman
```


