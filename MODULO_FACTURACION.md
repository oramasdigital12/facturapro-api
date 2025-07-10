# 📄 Módulo de Facturación - VendedorPro

## 🎯 Descripción General

El módulo de facturación permite crear, gestionar y compartir facturas profesionales con clientes. Incluye funcionalidades para auto-incremento de números de factura, gestión de items, estados de pago y enlaces públicos para compartir por WhatsApp.

## 🗄️ Estructura de Base de Datos

### Tabla: `facturas`

```sql
id uuid PRIMARY KEY
user_id uuid REFERENCES auth.users(id)
cliente_id uuid REFERENCES clientes(id)
numero_factura integer
fecha_factura date
fecha_pagada date
estado text -- 'pendiente', 'pagada', 'borrador'
subtotal numeric
impuesto numeric
total numeric
deposito numeric
balance_restante numeric
nota text
terminos text
logo_personalizado_url text
firma_url text
created_at timestamp
updated_at timestamp
```

### Tabla: `factura_items`

```sql
id uuid PRIMARY KEY
factura_id uuid REFERENCES facturas(id)
categoria text
descripcion text
precio_unitario numeric
cantidad integer
total numeric
```

## 🚀 Endpoints Disponibles

### 🔐 Endpoints Autenticados

#### 1. Crear Factura

```http
POST /api/facturas
Authorization: Bearer <token>
Content-Type: application/json

{
  "cliente_id": "uuid-del-cliente",
  "fecha_factura": "2024-01-15", // opcional, usa fecha actual por defecto
  "estado": "pendiente", // opcional, usa 'pendiente' por defecto
  "subtotal": 100.00,
  "impuesto": 16.00,
  "total": 116.00,
  "deposito": 50.00,
  "balance_restante": 66.00,
  "nota": "Nota adicional",
  "terminos": "Términos y condiciones",
  "logo_personalizado_url": "https://ejemplo.com/logo.png", // opcional
  "firma_url": "https://ejemplo.com/firma.png", // opcional
  "items": [
    {
      "categoria": "Servicios",
      "descripcion": "Diseño de logo",
      "precio_unitario": 50.00,
      "cantidad": 2,
      "total": 100.00
    }
  ]
}
```

**Características:**

- ✅ Auto-incrementa `numero_factura` por usuario
- ✅ Usa configuración del negocio como valores por defecto
- ✅ Valida items y cálculos
- ✅ Crea factura e items en una sola transacción

#### 2. Obtener Facturas (con filtros)

```http
GET /api/facturas?cliente_id=uuid&estado=pendiente&fecha_inicio=2024-01-01&fecha_fin=2024-01-31
Authorization: Bearer <token>
```

**Filtros disponibles:**

- `cliente_id`: Filtrar por cliente específico
- `estado`: `pendiente`, `pagada`, `borrador`
- `fecha_inicio`: Filtrar desde esta fecha
- `fecha_fin`: Filtrar hasta esta fecha

#### 3. Obtener Factura por ID

```http
GET /api/facturas/{id}
Authorization: Bearer <token>
```

**Respuesta incluye:**

- ✅ Datos completos de la factura
- ✅ Información del cliente
- ✅ Todos los items asociados

#### 4. Actualizar Factura

```http
PUT /api/facturas/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "pagada",
  "items": [
    {
      "categoria": "Servicios",
      "descripcion": "Diseño de logo actualizado",
      "precio_unitario": 60.00,
      "cantidad": 2,
      "total": 120.00
    }
  ]
}
```

**Características:**

- ✅ Actualiza datos de cabecera
- ✅ Reemplaza todos los items (elimina viejos, crea nuevos)
- ✅ Si estado cambia a 'pagada', establece `fecha_pagada` automáticamente

#### 5. Eliminar Factura

```http
DELETE /api/facturas/{id}
Authorization: Bearer <token>
```

**Características:**

- ✅ Elimina factura y todos sus items
- ✅ Verifica propiedad del usuario

### 🌐 Endpoints Públicos

#### 6. Ver Factura Pública

```http
GET /factura/{uuid}
```

**Características:**

- ✅ Sin autenticación requerida
- ✅ Formato optimizado para compartir por WhatsApp
- ✅ Incluye logo, datos del negocio, cliente, items y totales
- ✅ Muestra estado y fecha de pago si aplica

## 📋 Ejemplos de Uso

### Ejemplo 1: Crear Factura Completa

```javascript
const facturaData = {
  cliente_id: "123e4567-e89b-12d3-a456-426614174000",
  subtotal: 150.0,
  impuesto: 24.0,
  total: 174.0,
  deposito: 50.0,
  balance_restante: 124.0,
  nota: "Pago en 2 cuotas",
  items: [
    {
      categoria: "Diseño",
      descripcion: "Logo corporativo",
      precio_unitario: 75.0,
      cantidad: 2,
      total: 150.0,
    },
  ],
};

const response = await fetch("/api/facturas", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(facturaData),
});
```

### Ejemplo 2: Obtener Facturas Pendientes

```javascript
const response = await fetch("/api/facturas?estado=pendiente", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Ejemplo 3: Marcar Factura como Pagada

```javascript
const response = await fetch(`/api/facturas/${facturaId}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    estado: "pagada",
  }),
});
```

### Ejemplo 4: Compartir Factura por WhatsApp

```javascript
// Obtener el UUID de la factura
const factura = await obtenerFactura(facturaId);
const publicUrl = `https://tu-dominio.com/factura/${factura.id}`;

// Enviar por WhatsApp
const whatsappMessage = `Hola! Aquí tienes tu factura: ${publicUrl}`;
```

## 🔧 Configuración del Negocio

El módulo utiliza automáticamente la configuración del negocio para:

- **Logo personalizado**: Si no se especifica en la factura
- **Firma**: Si no se especifica en la factura
- **Términos**: Si no se especifica en la factura
- **Nota**: Si no se especifica en la factura

Estos valores se obtienen de la tabla `negocio_config` del usuario.

## 🛡️ Seguridad

- ✅ **Autenticación**: Todos los endpoints (excepto público) requieren token JWT
- ✅ **Autorización**: Verifica que `auth.uid() === user_id` en todas las operaciones
- ✅ **Validación**: Validación completa de datos de entrada
- ✅ **Rate Limiting**: Protección contra abuso en endpoints sensibles
- ✅ **Sanitización**: Limpieza de datos de entrada

## 📊 Estados de Factura

- **`borrador`**: Factura en proceso de creación
- **`pendiente`**: Factura enviada, esperando pago
- **`pagada`**: Factura pagada completamente

## 🔄 Auto-incremento de Números

- Cada usuario tiene su propia secuencia de números de factura
- Se obtiene el último número usado y se incrementa en 1
- Si es la primera factura del usuario, empieza en 1

## 📱 Integración con WhatsApp

### Enlace Público

```
https://tu-dominio.com/factura/{uuid}
```

### Formato de Mensaje Sugerido

```
¡Hola {nombre_cliente}!

Aquí tienes tu factura #{numero_factura}:
{url_publica}

Total: ${total}
Estado: {estado}

Gracias por tu confianza.
```

## 🚨 Manejo de Errores

### Errores Comunes

**400 - Datos Inválidos**

```json
{
  "errors": [
    {
      "msg": "El cliente_id debe ser un UUID válido",
      "param": "cliente_id",
      "location": "body"
    }
  ]
}
```

**404 - Factura No Encontrada**

```json
{
  "error": "Factura no encontrada"
}
```

**429 - Rate Limit**

```json
{
  "error": "Demasiadas peticiones, intenta más tarde",
  "retryAfter": "15 minutos"
}
```

## 📈 Próximas Mejoras

- [ ] Generación de PDF
- [ ] Envío automático por email
- [ ] Integración con pasarelas de pago
- [ ] Plantillas personalizables
- [ ] Recordatorios automáticos
- [ ] Reportes y estadísticas

---

**Desarrollado para VendedorPro** 🚀
_Sistema CRM minimalista y eficiente para vendedores_
