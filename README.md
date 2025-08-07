# Agendador de Actividades

Sistema completo de gestión y agendamiento de actividades para empresas. Permite programar, asignar y monitorear actividades de empleados y administrativos con notificaciones automáticas.

## 🚀 Características

- **Sistema de autenticación** con roles y permisos
- **Calendario visual** para visualizar actividades
- **Gestión de actividades** con estados y seguimiento de tiempo real
- **Sistema de notificaciones** por email y WhatsApp
- **Tema oscuro/claro** automático
- **Diseño responsive** con Material UI y Tailwind CSS
- **Base de datos MySQL** con esquema completo
- **API REST** con Node.js y Express

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- MySQL 8.0+
- JWT para autenticación
- bcryptjs para encriptación
- Nodemailer para emails
- Twilio para WhatsApp

### Frontend
- React 19
- Tailwind CSS 4.1
- React Router DOM
- React Icons
- Material UI
- Axios
- Date-fns
- React Calendar

## 📋 Requisitos

- Node.js 18+ 
- MySQL 8.0+
- npm o yarn

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd agendador-actividades
```

### 2. Configurar la base de datos

1. Crear una base de datos MySQL
2. Ejecutar el script SQL ubicado en `database_schema.sql`

```bash
mysql -u root -p < database_schema.sql
```

### 3. Configurar el Backend

```bash
cd AppCalendarioBack
npm install
```

Configurar variables de entorno en `.env`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agendador_actividades
DB_USER=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRE=7d

# Servidor
PORT=5000
NODE_ENV=development

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password

# WhatsApp API (Twilio)
TWILIO_ACCOUNT_SID=tu_twilio_account_sid
TWILIO_AUTH_TOKEN=tu_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# URLs del frontend
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### 4. Configurar el Frontend

```bash
cd AppCalendarioFront
npm install
```

Variables de entorno ya configuradas en `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Agendador de Actividades
VITE_APP_VERSION=1.0.0
```

## 🚀 Ejecución

### Desarrollo

1. **Iniciar el Backend:**
```bash
cd AppCalendarioBack
npm start
```
El servidor estará disponible en `http://localhost:5000`

2. **Iniciar el Frontend:**
```bash
cd AppCalendarioFront
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`

### Producción

1. **Construir el Frontend:**
```bash
cd AppCalendarioFront
npm run build
```

2. **Configurar variables de entorno para producción en el backend**

## 👥 Usuarios por Defecto

El sistema incluye 3 roles predefinidos:

1. **Administrador**: Acceso completo al sistema
2. **Supervisor**: Puede gestionar actividades y ver reportes
3. **Empleado**: Puede ver y actualizar sus actividades asignadas

Para crear el primer usuario administrador, utiliza el endpoint de registro con `rol_id: 1`.

## 📊 Esquema de Base de Datos

La base de datos incluye las siguientes tablas principales:

- `usuarios` - Información de usuarios
- `roles` - Roles y permisos del sistema
- `actividades` - Actividades programadas
- `categorias_actividades` - Categorías para organizar actividades
- `estados_actividades` - Estados de las actividades
- `notificaciones` - Sistema de notificaciones
- `historial_actividades` - Auditoría de cambios

## 🔧 Configuración de Notificaciones

### Email (SMTP)
1. Configura una cuenta de Gmail con contraseña de aplicación
2. Actualiza las variables `SMTP_*` en el archivo `.env`

### WhatsApp (Twilio)
1. Crea una cuenta en Twilio
2. Configura el servicio de WhatsApp Business API
3. Actualiza las variables `TWILIO_*` en el archivo `.env`

## 🎨 Personalización de Temas

El sistema incluye soporte para temas oscuro y claro automático. Los temas están configurados en:

- `src/index.css` - Variables CSS para temas
- `src/contexts/ThemeContext.jsx` - Lógica del tema
- Tailwind CSS con configuración dark mode

## 📱 Características Principales

### Calendario de Actividades
- Vista mensual con actividades codificadas por color
- Filtros por categoría, estado y usuario asignado
- Vista de lista y calendario intercambiables

### Gestión de Actividades
- Crear, editar y eliminar actividades
- Asignación por usuario y fecha/hora
- Estados de seguimiento (Pendiente, En Progreso, Completada, etc.)
- Registro de tiempo real de inicio y fin

### Sistema de Roles y Permisos
- Control granular de acceso por funcionalidad
- Roles predefinidos con permisos específicos
- Interfaz adaptativa según permisos del usuario

### Notificaciones Automáticas
- Notificaciones por email al asignar actividades
- Recordatorios automáticos antes de las actividades
- Soporte para WhatsApp mediante Twilio

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que MySQL esté ejecutándose
- Confirma las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `agendador_actividades` exista

### Error de CORS
- Verifica que `CORS_ORIGIN` en el backend coincida con la URL del frontend
- En desarrollo, debe ser `http://localhost:3000`

### Problemas con Tailwind CSS
- El proyecto usa Tailwind CSS 4.1 con la nueva sintaxis `@import "tailwindcss"`
- Asegúrate de tener la versión correcta instalada

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil del usuario
- `POST /api/auth/logout` - Cerrar sesión

### Actividades
- `GET /api/activities` - Listar actividades
- `POST /api/activities` - Crear actividad
- `PUT /api/activities/:id` - Actualizar actividad
- `DELETE /api/activities/:id` - Eliminar actividad
- `PATCH /api/activities/:id/status` - Cambiar estado de actividad

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ usando tecnologías modernas para la gestión empresarial eficiente.**