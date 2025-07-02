# 🚀 VendedorPro CRM API

API REST completa para un sistema CRM SaaS con integración de WhatsApp, autenticación robusta y gestión integral de clientes, ventas y tareas.

## ✨ **CARACTERÍSTICAS PRINCIPALES**

- 🔐 **Autenticación segura** con Supabase Auth y JWT
- 🛡️ **Rate limiting** y protección contra ataques
- 📊 **Gestión completa** de clientes, ventas, tareas y mensajes
- 📱 **Integración WhatsApp** con generación de links directos
- 🏥 **Health checks** y monitoreo en tiempo real
- 📝 **Documentación automática** con Swagger
- 🧪 **Tests automatizados** con Jest
- 📈 **Logging estructurado** con Winston
- 🔒 **Validación robusta** de datos de entrada

## 🛠️ **TECNOLOGÍAS UTILIZADAS**

- **Backend**: Node.js, Express.js
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth + JWT
- **Validación**: Express-validator
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Testing**: Jest
- **Documentación**: Swagger/OpenAPI

## 📋 **REQUISITOS PREVIOS**

- Node.js (v18 o superior)
- NPM (v8 o superior)
- Cuenta en Supabase
- Variables de entorno configuradas

## ⚙️ **INSTALACIÓN Y CONFIGURACIÓN**

### 1. Clonar el repositorio

```bash
git clone https://github.com/oramasdigital12/crm-wa-api.git
cd crm-wa-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_key_de_supabase
```

### 4. Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🚀 **ENDPOINTS PRINCIPALES**

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil

### Clientes

- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/:id` - Obtener cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente
- `GET /api/clientes/buscar` - Buscar clientes

### Ventas

- `GET /api/ventas` - Listar ventas
- `POST /api/ventas` - Registrar venta
- `GET /api/ventas/:id` - Obtener venta
- `PUT /api/ventas/:id` - Actualizar venta
- `DELETE /api/ventas/:id` - Eliminar venta
- `GET /api/ventas/estadisticas` - Estadísticas mensuales

### Tareas

- `GET /api/tareas` - Listar tareas
- `POST /api/tareas` - Crear tarea
- `GET /api/tareas/:id` - Obtener tarea
- `PUT /api/tareas/:id` - Actualizar tarea
- `DELETE /api/tareas/:id` - Eliminar tarea
- `GET /api/tareas/contador` - Contar por estado

### Mensajes

- `GET /api/mensajes` - Listar mensajes
- `POST /api/mensajes` - Crear mensaje
- `PUT /api/mensajes/:id` - Actualizar mensaje
- `DELETE /api/mensajes/:id` - Eliminar mensaje
- `POST /api/mensajes/whatsapp/link` - Generar link WhatsApp

### Monitoreo

- `GET /health` - Health check completo
- `GET /ready` - Readiness check
- `GET /live` - Liveness check

### Negocio

- `POST /api/negocio-config/logo` - Subir logo de negocio
- `GET /api/categorias-negocio` - Listar categorías de negocio
- `POST /api/categorias-negocio` - Crear categoría de negocio
- `GET /api/categorias-negocio/:id` - Obtener categoría de negocio
- `PUT /api/categorias-negocio/:id` - Actualizar categoría de negocio
- `DELETE /api/categorias-negocio/:id` - Eliminar categoría de negocio
- `GET /api/servicios-negocio` - Listar servicios de negocio
- `POST /api/servicios-negocio` - Crear servicio de negocio
- `GET /api/servicios-negocio/:id` - Obtener servicio de negocio
- `PUT /api/servicios-negocio/:id` - Actualizar servicio de negocio
- `DELETE /api/servicios-negocio/:id` - Eliminar servicio de negocio

## 📚 **DOCUMENTACIÓN**

### Swagger UI

La documentación interactiva está disponible en:

```
http://localhost:3000/api-docs
```

### Ejemplo de uso

```javascript
// Autenticación
const response = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "usuario@ejemplo.com",
    password: "Contraseña123!",
  }),
});

const { token } = await response.json();

// Crear cliente
const cliente = await fetch("http://localhost:3000/api/clientes", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    nombre: "Juan Pérez",
    email: "juan@ejemplo.com",
    telefono: "+34612345678",
  }),
});
```

## 🧪 **TESTING**

### Ejecutar tests

```bash
# Tests básicos
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Tests para CI/CD
npm run test:ci
```

### Estructura de tests

```
src/tests/
├── unit/
│   ├── models/
│   ├── controllers/
│   └── validators/
├── integration/
└── setup.js
```

## 🔒 **SEGURIDAD**

### Características implementadas

- ✅ **Rate limiting** por endpoint
- ✅ **Validación de entrada** robusta
- ✅ **Sanitización** de datos
- ✅ **Headers de seguridad** (Helmet)
- ✅ **CORS** configurado
- ✅ **Autenticación JWT** segura
- ✅ **Logging** de eventos de seguridad

### Rate Limiting

- **Autenticación**: 5 intentos por 15 minutos
- **API General**: 100 requests por 15 minutos
- **Creación**: 10 creaciones por 15 minutos
- **Búsquedas**: 50 búsquedas por 15 minutos

## 📊 **MONITOREO Y LOGS**

### Health Checks

- `/health` - Estado completo del sistema
- `/ready` - Listo para recibir tráfico
- `/live` - Aplicación funcionando

### Logging

Los logs se guardan en:

- `logs/all.log` - Todos los logs
- `logs/error.log` - Solo errores

### Niveles de log

- `error` - Errores críticos
- `warn` - Advertencias
- `info` - Información general
- `http` - Requests HTTP
- `debug` - Información de debugging

## 🚀 **DESPLIEGUE**

### Variables de entorno para producción

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=tu_url_produccion
SUPABASE_ANON_KEY=tu_key_produccion
```

### Comandos de despliegue

```bash
# Instalar dependencias
npm ci --only=production

# Ejecutar tests
npm run test:ci

# Iniciar aplicación
npm start
```

## 🤝 **CONTRIBUCIÓN**

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abrir Pull Request

### Estándares de código

- Usar ESLint para linting
- Seguir convenciones de commits
- Agregar tests para nuevas funcionalidades
- Documentar cambios en la API

## 📄 **LICENCIA**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 **SOPORTE**

- **Email**: soporte@vendedorpro.app
- **Documentación**: https://docs.vendedorpro.app
- **Issues**: GitHub Issues
- **Discord**: [Servidor de la comunidad](https://discord.gg/vendedorpro)

## 🎯 **ROADMAP**

### v1.1.0 (Próximamente)

- [ ] Cache con Redis
- [ ] Webhooks para integraciones
- [ ] API para reportes avanzados
- [ ] Notificaciones push
- [ ] Integración con más plataformas de mensajería

### v1.2.0 (Futuro)

- [ ] Microservicios
- [ ] GraphQL API
- [ ] Real-time con WebSockets
- [ ] Machine Learning para insights
- [ ] Multi-tenancy avanzado

---

**Desarrollado con ❤️ por el equipo de VendedorPro**
