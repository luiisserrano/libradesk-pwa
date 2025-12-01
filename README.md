# LibraDesk PWA

Una aplicación web progresiva (PWA) para gestión de biblioteca digital con funcionalidades de lectura de libros PDF.

## 📚 Descripción

LibraDesk es una plataforma completa para gestionar y leer libros digitales. Incluye funcionalidades de autenticación, gestión de perfiles, biblioteca personal, y un lector de PDF integrado.

## 🏗️ Estructura del Proyecto

El proyecto está dividido en dos aplicaciones principales:

- **`frontend/`** - Aplicación React con Ionic Framework
- **`backend/`** - API REST con Laravel

## ✨ Características

- 🔐 Autenticación de usuarios (login/registro)
- 👤 Gestión de perfiles con foto
- 📖 Biblioteca personal de libros
- 📄 Lector de PDF integrado
- 🎨 Modo oscuro
- 📱 Diseño responsive (PWA)
- 🔍 Exploración de libros disponibles
- ⬆️ Carga de libros (solo administradores)

## 🚀 Instalación

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

### Frontend (React + Ionic)

```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Tecnologías

### Frontend
- React 19
- Ionic Framework 8
- TypeScript
- Vite
- Axios
- React Router

### Backend
- Laravel 11
- PHP 8.2+
- MySQL
- Laravel Sanctum (autenticación)

## 📝 Configuración

### Backend
Configura tu archivo `.env` con las credenciales de base de datos:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=libradesk
DB_USERNAME=root
DB_PASSWORD=
```

### Frontend
El frontend se conecta al backend en `http://localhost:8000` por defecto.

## 👥 Roles

- **Usuario**: Puede ver y leer libros, gestionar su biblioteca personal
- **Administrador**: Puede subir nuevos libros además de las funcionalidades de usuario

## 📄 Licencia

Este proyecto es de código abierto.
