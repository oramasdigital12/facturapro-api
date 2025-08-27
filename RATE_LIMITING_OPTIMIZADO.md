# 🚀 Rate Limiting Optimizado para SaaS

## 📋 **Resumen de Cambios**

Se ha implementado un sistema de **rate limiting inteligente** que elimina los errores 429 (Too Many Requests) en tu web-app mientras mantiene la seguridad.

## 🎯 **Problema Resuelto**

- ❌ **Antes**: Errores 429 en `/api/facturas` bloqueando la carga de datos
- ✅ **Ahora**: Sin límites en consultas, límites moderados en operaciones críticas

## 🔧 **Cambios Implementados**

### **1. Nuevos Limiters Específicos**

```javascript
// ✅ Auth (crítico) - 20 intentos/5min
authLimiter

// ✅ Auth estricto (registro/cambio password) - 10 intentos/5min  
strictAuthLimiter

// ✅ Creación (moderado) - 50 creaciones/15min
createLimiter

// ✅ Eliminación (muy restrictivo) - 10 eliminaciones/15min
deleteLimiter

// ✅ Búsquedas (muy permisivo) - 200 búsquedas/15min
searchLimiter

// ✅ Operaciones masivas (moderado) - 20 operaciones/15min
bulkLimiter

// ✅ Uploads (moderado) - 30 uploads/15min
uploadLimiter

// ✅ Sistema (muy permisivo) - 500 operaciones/15min
systemLimiter
```

### **2. Eliminación de Límites Globales**

**ANTES:**
```javascript
app.use('/api/facturas', apiLimiter, facturaRoutes); // ❌ Límite global
```

**AHORA:**
```javascript
app.use('/api/facturas', facturaRoutes); // ✅ Sin límites globales
```

### **3. Límites Específicos por Operación**

#### **Facturas:**
- ✅ **SIN LÍMITES**: `GET /api/facturas` (consultas)
- ✅ **SIN LÍMITES**: `GET /api/facturas/eliminadas` (consultas)
- ✅ **LÍMITE**: `POST /api/facturas` (creación)
- ✅ **LÍMITE**: `PUT /api/facturas/:id` (actualización)
- ✅ **LÍMITE**: `DELETE /api/facturas/:id` (eliminación)
- ✅ **LÍMITE**: `POST /api/facturas/:id/regenerate-pdf` (upload)

#### **Clientes:**
- ✅ **SIN LÍMITES**: `GET /api/clientes` (consultas)
- ✅ **SIN LÍMITES**: `GET /api/clientes/buscar` (búsquedas)
- ✅ **LÍMITE**: `POST /api/clientes` (creación)

#### **Facturas Públicas:**
- ✅ **SIN LÍMITES**: Todas las rutas públicas

## 🛡️ **Estrategia de Seguridad**

### **Niveles de Protección:**

1. **🔴 Crítico**: Auth endpoints (login, registro)
2. **🟡 Moderado**: Creación, actualización, uploads
3. **🟢 Permisivo**: Consultas, búsquedas, operaciones de sistema
4. **⚪ Sin límites**: Rutas públicas, health checks

### **Beneficios:**

- ✅ **Sin bloqueos** en operaciones normales del usuario
- ✅ **Protección** contra ataques de fuerza bruta
- ✅ **Escalabilidad** para diferentes tipos de uso
- ✅ **Flexibilidad** para ajustar según necesidades

## 📊 **Límites por Categoría**

| Operación | Límite | Ventana | Uso |
|-----------|--------|---------|-----|
| Login | 20 | 5 min | Protección contra fuerza bruta |
| Registro | 10 | 5 min | Prevenir spam de registros |
| Creación | 50 | 15 min | Operaciones normales |
| Eliminación | 10 | 15 min | Prevenir eliminaciones masivas |
| Búsquedas | 200 | 15 min | Uso intensivo de búsquedas |
| Uploads | 30 | 15 min | Subida de archivos |
| Sistema | 500 | 15 min | Operaciones automáticas |

## 🚀 **Próximos Pasos**

1. **Reinicia el servidor** para aplicar los cambios
2. **Prueba la web-app** - ya no deberías ver errores 429
3. **Monitorea** el rendimiento y ajusta límites si es necesario

## 🔍 **Monitoreo**

Para monitorear el uso de rate limiting:

```bash
# Ver logs de rate limiting
grep "429" logs/all.log

# Ver estadísticas de uso
grep "Rate limit" logs/all.log
```

## ⚙️ **Ajustes Futuros**

Si necesitas ajustar límites:

1. **Aumentar límites**: Modifica los valores en `src/middlewares/rateLimiter.js`
2. **Agregar nuevos limiters**: Crea nuevos limiters para casos específicos
3. **Monitoreo**: Usa los logs para identificar patrones de uso

---

**✅ Resultado**: Tu web-app ya no tendrá errores 429 y mantendrá la seguridad necesaria para un SaaS.
