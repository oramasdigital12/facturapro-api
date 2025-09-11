# 📧 Servicio de Email con Brevo - Ejemplos de Uso

## 🚀 Configuración Inicial

### Variables de Entorno Requeridas

```bash
BREVO_API_KEY=tu_brevo_api_key_aqui
BREVO_FROM_EMAIL=noreply@tu-dominio.com
BREVO_FROM_NAME=Tu Sistema CRM
```

## 📋 Endpoints Disponibles

### 1. Probar Conexión

```bash
GET /api/email/test
Authorization: Bearer tu_api_token
```

### 2. Obtener Estadísticas

```bash
GET /api/email/stats
Authorization: Bearer tu_api_token
```

### 3. Enviar Email Personalizado

```bash
POST /api/email/custom
Authorization: Bearer tu_api_token
Content-Type: application/json

{
  "to": "cliente@example.com",
  "subject": "Asunto del email",
  "htmlContent": "<h1>Hola!</h1><p>Este es un email personalizado.</p>",
  "textContent": "Hola! Este es un email personalizado."
}
```

### 4. Enviar Email de Bienvenida

```bash
POST /api/email/welcome
Authorization: Bearer tu_api_token
Content-Type: application/json

{
  "cliente": {
    "email": "nuevo@cliente.com",
    "nombre": "Juan Pérez"
  }
}
```

### 5. Enviar Email de Factura

```bash
POST /api/email/invoice
Authorization: Bearer tu_api_token
Content-Type: application/json

{
  "factura": {
    "numero": "FAC-001",
    "total": 150.00,
    "fecha": "2024-01-15",
    "items": [
      {
        "descripcion": "Servicio de consultoría",
        "cantidad": 1,
        "precio": 150.00,
        "total": 150.00
      }
    ]
  },
  "cliente": {
    "email": "cliente@example.com",
    "nombre": "María García"
  }
}
```

### 6. Enviar Email de Recordatorio

```bash
POST /api/email/reminder
Authorization: Bearer tu_api_token
Content-Type: application/json

{
  "cliente": {
    "email": "cliente@example.com",
    "nombre": "Carlos López"
  },
  "mensaje": "Recordatorio: Tu cita está programada para mañana a las 10:00 AM.",
  "tipo": "general"
}
```

## 💻 Uso en Código

### Importar el Servicio

```javascript
import EmailService from "./services/emailService.js";

const emailService = new EmailService();
```

### Enviar Email de Bienvenida

```javascript
const cliente = {
  email: "nuevo@cliente.com",
  nombre: "Juan Pérez",
};

const result = await emailService.sendWelcomeEmail(cliente);

if (result.success) {
  console.log("Email enviado:", result.messageId);
} else {
  console.error("Error:", result.error);
}
```

### Enviar Email de Factura

```javascript
const factura = {
  numero: "FAC-001",
  total: 150.0,
  fecha: "2024-01-15",
};

const cliente = {
  email: "cliente@example.com",
  nombre: "María García",
};

const result = await emailService.sendInvoiceEmail(factura, cliente);
```

### Enviar Email Personalizado

```javascript
const result = await emailService.sendEmail({
  to: "cliente@example.com",
  toName: "Juan Pérez",
  subject: "Asunto personalizado",
  htmlContent: "<h1>Hola!</h1><p>Contenido HTML</p>",
  textContent: "Hola! Contenido de texto plano.",
});
```

## 🎨 Plantillas Disponibles

### 1. Bienvenida

- Diseño moderno con gradientes
- Información de bienvenida
- Lista de funcionalidades

### 2. Factura

- Tabla de items
- Total destacado
- Información del cliente

### 3. Recordatorio

- Diseño llamativo
- Soporte para urgentes
- Mensaje personalizable

### 4. Notificación de Pago

- Confirmación de pago
- Detalles de transacción
- Diseño profesional

### 5. Vencimiento de Servicio

- Alerta de vencimiento
- Información del servicio
- Llamada a la acción

## 🔧 Integración con Otras Funciones

### En el Controlador de Clientes

```javascript
import EmailService from "../services/emailService.js";

export const crearCliente = async (req, res) => {
  try {
    // Crear cliente
    const cliente = await Cliente.crear(datos, supabase);

    // Enviar email de bienvenida
    const emailService = new EmailService();
    await emailService.sendWelcomeEmail(cliente);

    res.status(201).json(cliente);
  } catch (error) {
    // Manejar error
  }
};
```

### En el Controlador de Facturas

```javascript
export const crearFactura = async (req, res) => {
  try {
    // Crear factura
    const factura = await Factura.crear(datos, supabase);

    // Obtener cliente
    const cliente = await Cliente.obtenerPorId(factura.cliente_id, supabase);

    // Enviar email de factura
    const emailService = new EmailService();
    await emailService.sendInvoiceEmail(factura, cliente);

    res.status(201).json(factura);
  } catch (error) {
    // Manejar error
  }
};
```

## 📊 Monitoreo y Límites

### Límites de Brevo (Cuenta Gratuita)

- **300 emails por día**
- **Sin límite de contactos**
- **Soporte por email**

### Monitoreo

```javascript
// Obtener estadísticas
const stats = await emailService.getAccountStats();
console.log("Estadísticas:", stats.data);
```

## 🚨 Manejo de Errores

### Errores Comunes

1. **API Key inválida**: Verificar `BREVO_API_KEY`
2. **Email inválido**: Validar formato del email
3. **Límite excedido**: Monitorear envíos diarios
4. **Conexión**: Verificar conectividad

### Logging

```javascript
// El servicio incluye logging automático
console.log("✅ Email enviado exitosamente:", {
  to: emailData.to,
  subject: emailData.subject,
  messageId: response.data.messageId,
});
```

## 🔒 Seguridad

- ✅ API Key segura en variables de entorno
- ✅ Validación de emails
- ✅ Sanitización de contenido
- ✅ Rate limiting en endpoints
- ✅ Autenticación requerida

## 📈 Próximas Mejoras

- [ ] Cola de emails para envíos masivos
- [ ] Plantillas personalizables
- [ ] Tracking de aperturas
- [ ] Integración con webhooks
- [ ] Dashboard de estadísticas
