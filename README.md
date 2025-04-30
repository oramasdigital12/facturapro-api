# CRM API con WhatsApp Integration

API REST para un sistema CRM con integración de WhatsApp, autenticación y gestión de clientes y ventas.

## 🚀 Tecnologías Utilizadas

- Node.js
- Express.js
- PostgreSQL (Supabase)
- JWT para autenticación
- Swagger para documentación de API

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- NPM (v6 o superior)
- Una cuenta en Supabase
- Variables de entorno configuradas

## ⚙️ Configuración

1. Clona el repositorio:

```bash
git clone https://github.com/oramasdigital12/crm-wa-api.git
cd crm-wa-api
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=3000
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_key_de_supabase
JWT_SECRET=tu_jwt_secret
```

## 🚀 Iniciar el Servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación de la API

La documentación Swagger está disponible en la ruta `/api-docs` cuando el servidor está en ejecución.

### Endpoints Principales

#### Autenticación

- POST `/api/auth/register` - Registro de usuario
- POST `/api/auth/login` - Inicio de sesión

#### Clientes

- GET `/api/clientes` - Listar clientes
- POST `/api/clientes` - Crear cliente
- GET `/api/clientes/:id` - Obtener cliente por ID
- PUT `/api/clientes/:id` - Actualizar cliente
- DELETE `/api/clientes/:id` - Eliminar cliente

#### Ventas

- GET `/api/ventas` - Listar ventas
- POST `/api/ventas` - Registrar venta
- GET `/api/ventas/:id` - Obtener venta por ID
- PUT `/api/ventas/:id` - Actualizar venta
- DELETE `/api/ventas/:id` - Eliminar venta
- GET `/api/ventas/cliente/:clienteId` - Obtener ventas por cliente

## 🔒 Seguridad

- Autenticación mediante JWT
- Políticas de seguridad a nivel de fila (RLS) en Supabase
- Validación de datos en endpoints
- Sanitización de entradas

## 📝 Características

- Gestión completa de clientes
- Registro y seguimiento de ventas
- Autenticación y autorización
- Documentación interactiva con Swagger
- Validación de datos
- Manejo de errores consistente

## 🤝 Contribuir

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
