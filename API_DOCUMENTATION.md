# 📚 DOCUMENTACIÓN COMPLETA DE LA API VENDEDORPRO

## 🚀 **INFORMACIÓN GENERAL**

- **Base URL**: `https://api.vendedorpro.app` (Producción)
- **Versión**: 1.0.0
- **Formato**: JSON
- **Autenticación**: Bearer Token (JWT)

## 🔐 **AUTENTICACIÓN**

### Registro de Usuario

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!",
  "fullName": "Juan Pérez"
}
```

**Respuesta exitosa (201):**

```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@ejemplo.com",
    "fullName": "Juan Pérez"
  }
}
```

### Inicio de Sesión

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!"
}
```

**Respuesta exitosa (200):**

```json
{
  "message": "Login exitoso",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@ejemplo.com",
    "fullName": "Juan Pérez",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Obtener Perfil

```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 👥 **GESTIÓN DE CLIENTES**

### Crear Cliente

```http
POST /api/clientes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "María González",
  "email": "maria@ejemplo.com",
  "telefono": "+34612345678",
  "categoria": "activo",
  "fecha_nacimiento": "1990-05-15",
  "fecha_vencimiento": "2024-12-31",
  "direccion": "Calle Mayor 123, Madrid",
  "sexo": "F",
  "identification_number": "12345678A",
  "notas": "Cliente preferencial"
}
```

### Obtener Todos los Clientes

```http
GET /api/clientes
Authorization: Bearer <token>
```

### Buscar Clientes

```http
GET /api/clientes/buscar?nombre=María
Authorization: Bearer <token>
```

### Obtener Cliente por ID

```http
GET /api/clientes/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

### Actualizar Cliente

```http
PUT /api/clientes/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoria": "por_vencer",
  "notas": "Cliente actualizado"
}
```

### Eliminar Cliente

```http
DELETE /api/clientes/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

---

## 💰 **GESTIÓN DE VENTAS**

### Registrar Venta

```http
POST /api/ventas
Authorization: Bearer <token>
Content-Type: application/json

{
  "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
  "tipo": "mensual",
  "monto": 1500.50,
  "fecha": "2024-03-20"
}
```

### Obtener Todas las Ventas

```http
GET /api/ventas
Authorization: Bearer <token>
```

### Obtener Ventas por Cliente

```http
GET /api/ventas/cliente/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

### Obtener Ventas por Fecha

```http
GET /api/ventas?fechaInicio=2024-01-01&fechaFin=2024-03-31
Authorization: Bearer <token>
```

### Obtener Estadísticas Mensuales

```http
GET /api/ventas/estadisticas?año=2024&mes=3
Authorization: Bearer <token>
```

---

## 📋 **GESTIÓN DE TAREAS**

### Crear Tarea

```http
POST /api/tareas
Authorization: Bearer <token>
Content-Type: application/json

{
  "descripcion": "Llamar al cliente para seguimiento",
  "fecha_hora": "2024-03-25T10:00:00Z",
  "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
  "para_venta": true
}
```

### Listar Tareas

```http
GET /api/tareas?estado=pendiente&search=llamar
Authorization: Bearer <token>
```

### Cambiar Estado de Tarea

```http
PUT /api/tareas/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "completada"
}
```

### Contar Tareas por Estado

```http
GET /api/tareas/contador
Authorization: Bearer <token>
```

---

## 💬 **GESTIÓN DE MENSAJES**

### Crear Mensaje Predeterminado

```http
POST /api/mensajes
Authorization: Bearer <token>
Content-Type: application/json

{
  "texto": "Hola {{nombre}}, gracias por confiar en nosotros. Tu próximo pago vence el {{fecha_vencimiento}}."
}
```

### Generar Link de WhatsApp

```http
POST /api/mensajes/whatsapp/link
Authorization: Bearer <token>
Content-Type: application/json

{
  "telefono": "+34612345678",
  "mensajeId": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

## ⚙️ **CONFIGURACIÓN DE NEGOCIO**

### Obtener Configuración

```http
GET /api/negocio-config
Authorization: Bearer <token>
```

### Guardar Configuración

```http
POST /api/negocio-config
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre_negocio": "Mi Empresa S.L.",
  "tipo_negocio": "Servicios",
  "telefono": "+34612345678",
  "email": "info@miempresa.com",
  "direccion": "Calle Comercial 456, Barcelona"
}
```

---

## 🏥 **HEALTH CHECKS**

### Health Check Completo

```http
GET /health
```

**Respuesta:**

```json
{
  "status": "healthy",
  "timestamp": "2024-03-20T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "connected",
      "responseTime": 45
    },
    "memory": {
      "status": "ok",
      "rss": "45 MB",
      "heapUsed": "23 MB",
      "heapTotal": "67 MB"
    },
    "environment": {
      "status": "ok",
      "message": "Todas las variables de entorno están configuradas"
    }
  }
}
```

### Readiness Check

```http
GET /ready
```

### Liveness Check

```http
GET /live
```

---

## 📊 **CÓDIGOS DE ERROR**

| Código | Descripción                                |
| ------ | ------------------------------------------ |
| 200    | OK - Operación exitosa                     |
| 201    | Created - Recurso creado                   |
| 400    | Bad Request - Datos inválidos              |
| 401    | Unauthorized - Token inválido o faltante   |
| 403    | Forbidden - Sin permisos                   |
| 404    | Not Found - Recurso no encontrado          |
| 429    | Too Many Requests - Rate limit excedido    |
| 500    | Internal Server Error - Error del servidor |

### Ejemplo de Error

```json
{
  "error": "Datos inválidos",
  "details": [
    {
      "field": "email",
      "message": "El email debe ser válido",
      "value": "email-invalido"
    }
  ],
  "timestamp": "2024-03-20T10:30:00.000Z"
}
```

---

## 🔒 **SEGURIDAD Y RATE LIMITING**

### Límites de Velocidad

- **Autenticación**: 5 intentos por 15 minutos
- **API General**: 100 requests por 15 minutos
- **Creación de recursos**: 10 creaciones por 15 minutos
- **Búsquedas**: 50 búsquedas por 15 minutos

### Headers de Seguridad

La API incluye los siguientes headers de seguridad:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

---

## 🛠️ **INTEGRACIÓN CON FRONTEND**

### Ejemplo con JavaScript (Fetch)

```javascript
const API_BASE = "https://api.vendedorpro.app";

// Función para hacer requests autenticados
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("authToken");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error en la petición");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en API request:", error);
    throw error;
  }
}

// Ejemplo de uso
const clientes = await apiRequest("/api/clientes");
```

### Ejemplo con Axios

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.vendedorpro.app",
  timeout: 10000,
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## 📝 **MEJORES PRÁCTICAS**

### 1. **Manejo de Errores**

```javascript
try {
  const response = await apiRequest("/api/clientes");
  // Procesar respuesta
} catch (error) {
  if (error.response?.status === 429) {
    // Rate limit excedido
    console.log("Demasiadas peticiones, espera un momento");
  } else if (error.response?.status === 401) {
    // Token expirado
    await refreshToken();
  }
}
```

### 2. **Validación de Datos**

```javascript
// Validar datos antes de enviar
const validateCliente = (cliente) => {
  const errors = [];

  if (!cliente.nombre || cliente.nombre.length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres");
  }

  if (cliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) {
    errors.push("El email no es válido");
  }

  return errors;
};
```

### 3. **Cache de Datos**

```javascript
// Cache simple en memoria
const cache = new Map();

const getClientesWithCache = async () => {
  const cacheKey = "clientes";
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data; // Cache válido por 5 minutos
  }

  const data = await apiRequest("/api/clientes");
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};
```

---

## 🔧 **CONFIGURACIÓN DE DESARROLLO**

### Variables de Entorno

```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_key_de_supabase
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

### Ejecutar Tests

```bash
npm test
npm run test:coverage
```

---

## 📞 **SOPORTE**

- **Documentación**: `/api-docs` (Swagger UI)
- **Health Check**: `/health`
- **Email**: soporte@vendedorpro.app
- **Documentación**: https://docs.vendedorpro.app

---

## 📄 **CHANGELOG**

### v1.0.0 (2024-03-20)

- ✅ Implementación inicial de la API
- ✅ Autenticación con Supabase
- ✅ CRUD completo para clientes, ventas, tareas y mensajes
- ✅ Rate limiting y seguridad mejorada
- ✅ Health checks y monitoreo
- ✅ Tests automatizados
- ✅ Documentación completa
