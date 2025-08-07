# Agendador de Actividades - Sistema OpenSource

Sistema completo de gestión y agendamiento de actividades para empresas. **Diseñado para funcionar completamente SIN dependencias externas** - perfecto para empresas que requieren soluciones OpenSource sin comprometer funcionalidades.

## 🚀 Características Principales

- **✅ 100% Funcional SIN configuraciones externas**
- **🔧 Sistema de notificaciones interno** (no requiere email/WhatsApp)
- **🔐 Sistema de autenticación completo** con roles y permisos
- **📅 Calendario visual avanzado** para visualizar actividades
- **⏱️ Gestión de actividades** con estados y seguimiento de tiempo real
- **🌙 Tema oscuro/claro automático** con Material UI moderno
- **📱 Diseño responsive** optimizado para móviles y desktop
- **🗄️ Base de datos MySQL** con esquema robusto
- **🔌 API REST** documentada y escalable

## 🎯 **¿Por qué Elegir Esta Solución OpenSource?**

### ✅ **Listo para Usar INMEDIATAMENTE**
- **No requiere cuentas externas** (Gmail, Twilio, etc.)
- **No hay costos ocultos** por servicios de terceros
- **Funciona completamente offline** después de la instalación
- **Notificaciones del sistema integradas** sin dependencias

### ✅ **Escalable y Configurable**
- **OPCIONAL:** Configurar email (SMTP) cuando sea necesario
- **OPCIONAL:** Integrar WhatsApp (Twilio) si lo requieres
- **Los servicios externos se pueden agregar DESPUÉS sin afectar la funcionalidad**

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- MySQL 8.0+
- JWT para autenticación
- bcryptjs para encriptación
- **Nodemailer (OPCIONAL)** para emails
- **Twilio (OPCIONAL)** para WhatsApp

### Frontend
- React 19
- Tailwind CSS 4.1
- React Router DOM
- React Icons
- Material UI
- Axios
- Date-fns
- React Calendar

## 📋 Requisitos Mínimos

- Node.js 18+ 
- MySQL 8.0+
- npm o yarn
- **¡ESO ES TODO!** No necesitas cuentas de email o servicios externos

## ⚡ Instalación Rápida (5 minutos)

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd agendador-actividades
```

### 2. Configurar la base de datos

```bash
# Crear base de datos MySQL
mysql -u root -p -e "CREATE DATABASE agendador_actividades;"

# Importar esquema
mysql -u root -p agendador_actividades < database_schema.sql
```

### 3. Configurar el Backend

```bash
cd AppCalendarioBack
npm install
```

**Configurar `.env` (MÍNIMO REQUERIDO):**

```env
# CONFIGURACIÓN BÁSICA (SUFICIENTE PARA FUNCIONAR)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agendador_actividades
DB_USER=root
DB_PASSWORD=tu_password_mysql

JWT_SECRET=tu_jwt_secret_aqui_cambiar_en_produccion
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# NOTIFICACIONES (TODAS OPCIONALES - DÉJALAS VACÍAS)
ENABLE_EMAIL_NOTIFICATIONS=false
ENABLE_WHATSAPP_NOTIFICATIONS=false
ENABLE_SYSTEM_NOTIFICATIONS=true
```

### 4. Configurar el Frontend

```bash
cd ../AppCalendarioFront
npm install
```

## 🚀 Ejecutar la Aplicación

### Modo Desarrollo

**Terminal 1 - Backend:**
```bash
cd AppCalendarioBack
npm start
```

**Terminal 2 - Frontend:**
```bash
cd AppCalendarioFront
npm run dev
```

**¡LISTO!** Abre `http://localhost:3000` y comienza a usar el sistema.

## 👥 Primeros Pasos

### 1. Crear Usuario Administrador

Ve a `http://localhost:3000/login` → "Crear cuenta nueva" → Usar `rol_id: 1` para administrador.

### 2. Roles Incluidos
- **Administrador (ID: 1)**: Acceso completo
- **Supervisor (ID: 2)**: Gestiona actividades y reportes  
- **Empleado (ID: 3)**: Ve y actualiza sus actividades

### 3. Empezar a Usar
- ✅ Crear actividades en el calendario
- ✅ Asignar tareas a empleados
- ✅ Cambiar estados (Pendiente → En Progreso → Completada)
- ✅ Ver notificaciones del sistema
- ✅ Alternar tema oscuro/claro

## 📊 Esquema de Base de Datos

```
usuarios → roles → actividades → estados_actividades
    ↓           ↓           ↓
notificaciones  categorias  historial_actividades
```

**Tablas principales:**
- `usuarios` - Gestión de usuarios y autenticación
- `roles` - Sistema de permisos granular
- `actividades` - Actividades con fecha/hora/estado
- `notificaciones` - Sistema de notificaciones interno
- `categorias_actividades` - Organización por categorías
- `estados_actividades` - Workflow de estados
- `historial_actividades` - Auditoría completa

## 🔧 Configuraciones Opcionales

### Email (Configurar solo si lo necesitas)

```env
# Agregar al .env cuando quieras email
ENABLE_EMAIL_NOTIFICATIONS=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

### WhatsApp (Configurar solo si lo necesitas)

```env
# Agregar al .env cuando quieras WhatsApp
ENABLE_WHATSAPP_NOTIFICATIONS=true
TWILIO_ACCOUNT_SID=tu_twilio_sid
TWILIO_AUTH_TOKEN=tu_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

## 🎨 Características del Sistema

### 📅 Calendario Avanzado
- **Vista mensual** con indicadores de actividades
- **Códigos de color** por categoría
- **Vista de lista** alternativa
- **Filtros múltiples** (categoría, estado, usuario)
- **Búsqueda en tiempo real**

### 🔔 Sistema de Notificaciones
- **Notificaciones del sistema** (siempre activas)
- **Centro de notificaciones** integrado
- **Historial completo** de notificaciones
- **Email y WhatsApp** opcionales

### 👥 Gestión de Usuarios
- **Roles y permisos granulares**
- **Interface adaptativa** según permisos
- **Control de acceso** por funcionalidad

### ⏱️ Seguimiento de Actividades
- **Estados workflow:** Pendiente → En Progreso → Completada
- **Tiempo real:** Registro de hora de inicio/fin
- **Asignación flexible** por usuario
- **Prioridades:** Baja, Media, Alta, Urgente

### 🌙 Experiencia de Usuario
- **Tema automático** (oscuro/claro)
- **Fuente Poppins** de Google
- **Diseño Material UI** moderno
- **Responsive design** para móviles

## 🔧 API Endpoints

### Autenticación
```
POST /api/auth/login       # Iniciar sesión
POST /api/auth/register    # Registrar usuario  
GET  /api/auth/profile     # Obtener perfil
POST /api/auth/logout      # Cerrar sesión
```

### Actividades
```
GET    /api/activities           # Listar actividades
POST   /api/activities           # Crear actividad
PUT    /api/activities/:id       # Actualizar actividad
DELETE /api/activities/:id       # Eliminar actividad
PATCH  /api/activities/:id/status # Cambiar estado
```

### Notificaciones
```
GET /api/notifications        # Notificaciones del usuario
GET /api/notifications/config # Configuración de servicios
```

## 🐛 Solución de Problemas

### "Error de conexión a la base de datos"
```bash
# Verificar que MySQL esté ejecutándose
sudo service mysql start

# Verificar credenciales en .env
mysql -u root -p agendador_actividades
```

### "Token inválido"
```bash
# Cambiar JWT_SECRET en .env
JWT_SECRET=nuevo_secret_aqui
```

### "Error de CORS"
```bash
# Verificar que CORS_ORIGIN coincida con la URL del frontend
CORS_ORIGIN=http://localhost:3000
```

## 🚢 Despliegue en Producción

### 1. Construir Frontend
```bash
cd AppCalendarioFront
npm run build
```

### 2. Variables de Producción
```env
NODE_ENV=production
DB_PASSWORD=password_seguro_produccion
JWT_SECRET=jwt_super_seguro_produccion
```

### 3. Nginx/Apache
Configurar reverse proxy al puerto 5000 del backend.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

## 📄 Licencia

MIT License - Úsalo libremente en proyectos comerciales y personales.

## 🎯 Ventajas Competitivas

| Característica | Esta Solución | Otros Sistemas |
|---------------|---------------|----------------|
| **Instalación** | 5 minutos | Horas/días |
| **Dependencias externas** | ❌ Ninguna | ✅ Múltiples |
| **Costos recurrentes** | ❌ $0 | ✅ $50-200/mes |
| **Configuración inicial** | ✅ Funciona inmediatamente | ❌ Configuración compleja |
| **Escalabilidad** | ✅ Agregar servicios después | ❌ Todo o nada |
| **Código fuente** | ✅ 100% accesible | ❌ Cerrado |

---

## 🌟 **¿Por qué es la mejor opción OpenSource?**

✅ **Funciona INMEDIATAMENTE** sin configuraciones complejas  
✅ **Cero dependencias externas** para operación básica  
✅ **Escalable** - agrega servicios cuando los necesites  
✅ **Código 100% abierto** - modifica lo que necesites  
✅ **Sin costos ocultos** - no hay suscripciones sorpresa  
✅ **Soporte completo** de comunidad OpenSource  

**¡Perfecto para empresas que valoran la independencia tecnológica!**

---

**Desarrollado con ❤️ para la comunidad OpenSource**