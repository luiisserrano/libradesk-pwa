# LibraDesk PWA

Una aplicación web progresiva (PWA) para gestión de biblioteca digital con funcionalidades de lectura de libros PDF.

## 📚 Descripción

LibraDesk es una plataforma completa para gestionar y leer libros digitales. Incluye funcionalidades de autenticación, gestión de perfiles, biblioteca personal, y un lector de PDF integrado.

## 🏗️ Estructura del Proyecto

El proyecto está dividido en tres aplicaciones principales:

- **`frontend/`** - PWA para usuarios (React + Ionic Framework)
- **`admin-panel/`** - Panel de administración web (React)
- **`backend/`** - API REST con Laravel

## ✨ Características

### PWA (Usuarios)
- 🔐 Autenticación de usuarios (login/registro)
- 👤 Gestión de perfiles con foto
- 📖 Biblioteca personal de libros
- 📄 Lector de PDF integrado
- 🎨 Modo oscuro
- 📱 Diseño responsive (PWA)
- 🔍 Exploración de libros disponibles
- 📴 Soporte offline

### Panel de Administración
- 👥 Gestión de usuarios y roles
- 📚 Gestión de libros (subir, editar, eliminar)
- 🏷️ Gestión de géneros literarios
- ✍️ Gestión de autores
- 🔔 Envío de notificaciones push

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

### Frontend PWA (React + Ionic)

```bash
cd frontend
npm install
npm run dev
```

### Panel de Administración

```bash
cd admin-panel
npm install
cp .env.example .env
# Editar .env con la URL del backend
npm run dev
```

## 🛠️ Tecnologías

### Frontend (PWA)
- React 19
- Ionic Framework 8
- TypeScript
- Vite
- Axios
- React Router v5

### Panel de Administración
- React 18
- React Router v6
- TypeScript
- Vite
- Axios

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
