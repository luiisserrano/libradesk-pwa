# LibraDesk - Panel de Administración

Panel de administración web para gestionar la biblioteca digital LibraDesk.

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de tu API

# Iniciar en modo desarrollo
npm run dev
```

## 📦 Scripts

- `npm run dev` - Inicia el servidor de desarrollo en el puerto 3001
- `npm run build` - Compila para producción
- `npm run preview` - Vista previa de la build de producción

## 🔐 Autenticación

Solo los usuarios con rol de **administrador** (`role_id = 1`) pueden acceder a este panel.

## 📋 Funcionalidades

- **Dashboard**: Vista general con estadísticas
- **Gestión de Usuarios**: Ver, editar roles y eliminar usuarios
- **Gestión de Libros**: Subir, editar y eliminar libros
- **Gestión de Géneros**: CRUD de géneros literarios
- **Gestión de Autores**: CRUD de autores
- **Notificaciones**: Enviar notificaciones push de prueba

## 🛠️ Tecnologías

- React 18
- React Router v6
- TypeScript
- Vite
- Axios
