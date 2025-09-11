# 🔐 API Tokens - Documentación

## Descripción

Sistema de tokens de API de larga duración (30-90 días) para integración con funnels externos y aplicaciones de producción.

## 🚀 Características

- **Duración flexible**: 1-365 días
- **Permisos granulares**: read, write, delete, admin
- **Seguridad**: Tokens de 64 caracteres hexadecimales
- **Monitoreo**: Tracking de último uso
- **Gestión**: Crear, listar, revocar tokens

## 📋 Tabla de Base de Datos

### Script SQL

Ejecutar el archivo `api_tokens_table.sql` en el SQL Editor de Supabase:

```sql
-- La tabla incluye:
- id: UUID único
- user_id: Referencia al usuario
- nombre: Nombre descriptivo
- token: Token de 64 caracteres
- fecha_creacion: Timestamp de creación
- fecha_expiracion: Timestamp de expiración
- permisos: Array de permisos
- activo: Estado del token
- ultimo_uso: Último uso del token
- descripcion: Descripción opcional
```

## 🔗 Endpoints Disponibles

### 1. Crear API Token

```http
POST /api/auth/api-tokens
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "nombre": "Funnel Producción",
  "duracion_dias": 90,
  "permisos": ["read", "write"],
  "descripcion": "Token para integración con funnel de producción"
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "API token creado exitosamente",
  "data": {
    "id": "uuid-del-token",
    "nombre": "Funnel Producción",
    "token": "a1b2c3d4e5f6...", // Solo se muestra una vez
    "fecha_expiracion": "2024-04-15T10:30:00Z",
    "permisos": ["read", "write"],
    "descripcion": "Token para integración con funnel de producción"
  }
}
```

### 2. Listar API Tokens

```http
GET /api/auth/api-tokens
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-del-token",
      "nombre": "Funnel Producción",
      "fecha_creacion": "2024-01-15T10:30:00Z",
      "fecha_expiracion": "2024-04-15T10:30:00Z",
      "permisos": ["read", "write"],
      "activo": true,
      "ultimo_uso": "2024-01-20T15:45:00Z",
      "descripcion": "Token para integración con funnel de producción"
    }
  ]
}
```

### 3. Revocar API Token

```http
DELETE /api/auth/api-tokens/{id}/revocar
Authorization: Bearer <JWT_TOKEN>
```

### 4. Revocar Todos los Tokens

```http
DELETE /api/auth/api-tokens/revocar-todos
Authorization: Bearer <JWT_TOKEN>
```

### 5. Limpiar Tokens Expirados

```http
DELETE /api/auth/api-tokens/limpiar-expirados
Authorization: Bearer <JWT_TOKEN>
```

## 🔑 Uso de API Tokens

### Autenticación

Los API tokens se usan igual que los JWT, pero con el token de 64 caracteres:

```http
GET /api/clientes
Authorization: Bearer a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Diferenciación Automática

El sistema detecta automáticamente si es un JWT o API token:

- **JWT**: Token largo con puntos (ej: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
- **API Token**: 64 caracteres hexadecimales (ej: `a1b2c3d4e5f6...`)

## 🛡️ Permisos Disponibles

- **read**: Solo lectura
- **write**: Lectura y escritura
- **delete**: Lectura, escritura y eliminación
- **admin**: Todos los permisos

## 🔧 Integración con Funnels

### Ejemplo de Uso en Funnel

```javascript
// Configuración del funnel
const API_TOKEN =
  "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
const API_BASE_URL = "https://tu-api.com";

// Crear cliente
const crearCliente = async (datosCliente) => {
  const response = await fetch(`${API_BASE_URL}/api/clientes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosCliente),
  });

  return response.json();
};

// Crear factura
const crearFactura = async (datosFactura) => {
  const response = await fetch(`${API_BASE_URL}/api/facturas`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosFactura),
  });

  return response.json();
};
```

## 📊 Monitoreo y Seguridad

### Características de Seguridad

- ✅ Tokens únicos de 64 caracteres
- ✅ Expiración automática
- ✅ Tracking de último uso
- ✅ Revocación individual o masiva
- ✅ Row Level Security (RLS)
- ✅ Limpieza automática de tokens expirados

### Monitoreo

- **Último uso**: Se actualiza cada vez que se usa el token
- **Estado**: Activo/Inactivo
- **Expiración**: Fecha de expiración configurable
- **Permisos**: Control granular de acceso

## 🚨 Consideraciones Importantes

1. **Almacenamiento Seguro**: Guarda el token de forma segura, solo se muestra una vez
2. **Rotación**: Considera rotar tokens periódicamente
3. **Permisos Mínimos**: Asigna solo los permisos necesarios
4. **Monitoreo**: Revisa regularmente el uso de tokens
5. **Revocación**: Revoca tokens que ya no se necesiten

## 🔄 Flujo de Trabajo Recomendado

1. **Crear Token**: Genera un token con permisos específicos
2. **Configurar Funnel**: Usa el token en tu aplicación externa
3. **Monitorear**: Revisa el uso y estado del token
4. **Rotar**: Renueva tokens antes de que expiren
5. **Limpiar**: Revoca tokens no utilizados

## 📝 Ejemplo Completo

```bash
# 1. Crear token
curl -X POST https://tu-api.com/api/auth/api-tokens \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Funnel Marketing",
    "duracion_dias": 90,
    "permisos": ["read", "write"],
    "descripcion": "Token para automatización de marketing"
  }'

# 2. Usar token para crear cliente
curl -X POST https://tu-api.com/api/clientes \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Cliente Funnel",
    "email": "cliente@ejemplo.com",
    "telefono": "+1234567890"
  }'
```

## 🆘 Soporte

Para problemas o dudas sobre la implementación de API tokens, contacta al equipo de desarrollo.
