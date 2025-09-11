# 🚀 Guía de Despliegue en Railway

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en Railway:

### Supabase

```
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase
```

**⚠️ IMPORTANTE**: `SUPABASE_SERVICE_ROLE_KEY` es **REQUERIDA** para que los API tokens funcionen correctamente. Esta clave bypassa las políticas RLS.

### JWT

```
JWT_SECRET=tu_jwt_secret_muy_seguro
```

### Sistema

```
NODE_ENV=production
LOG_LEVEL=info
```

### Brevo (Email)

```
BREVO_API_KEY=tu_brevo_api_key_aqui
BREVO_FROM_EMAIL=noreply@tu-dominio.com
BREVO_FROM_NAME=Tu Sistema CRM
```

**⚠️ IMPORTANTE**: `BREVO_API_KEY` es **REQUERIDA** para el servicio de email. Límite: 300 envíos/día (cuenta gratuita).

### CORS (Importante para Funnels)

```
ALLOWED_ORIGINS=https://tu-funnel.com,https://otro-dominio.com,http://localhost:3000
```

**⚠️ IMPORTANTE**: Agrega la URL de tu funnel a `ALLOWED_ORIGINS` separada por comas.

## Pasos para Desplegar

1. **Conectar repositorio a Railway**

   - Ve a Railway.app
   - Conecta tu repositorio de GitHub

2. **Configurar variables de entorno**

   - En el dashboard de Railway
   - Ve a Variables
   - Agrega todas las variables listadas arriba

3. **Configurar base de datos**

   - Ejecuta el script `api_tokens_table.sql` en Supabase
   - Asegúrate de que todas las tablas estén creadas

4. **Desplegar**
   - Railway detectará automáticamente que es un proyecto Node.js
   - Usará el comando `npm start` definido en package.json

## Verificación del Despliegue

Una vez desplegado, verifica:

1. **Health Check**

   ```
   GET https://tu-app.railway.app/health
   ```

2. **Documentación**

   ```
   GET https://tu-app.railway.app/api-docs
   ```

3. **API Tokens**
   ```
   POST https://tu-app.railway.app/api/auth/api-tokens
   ```

## Solución de Problemas

### Error SIGTERM

- ✅ **Solucionado**: Agregado manejo de señales graceful shutdown
- ✅ **Solucionado**: Configurado trust proxy para Railway
- ✅ **Solucionado**: Rate limiters configurados para proxies

### Variables de Entorno

- Verifica que todas las variables estén configuradas
- Revisa los logs de Railway para errores específicos

### Base de Datos

- Asegúrate de que la tabla `api_tokens` esté creada
- Verifica que las políticas RLS estén configuradas

## Logs de Railway

Para ver los logs en tiempo real:

```bash
railway logs
```

## Comandos Útiles

```bash
# Ver estado del servicio
railway status

# Ver logs
railway logs

# Conectar a la base de datos
railway connect

# Abrir en el navegador
railway open
```

## Estructura de Archivos

```
├── src/
│   ├── models/ApiToken.js          # Modelo de API tokens
│   ├── controllers/apiTokenController.js  # Controlador
│   ├── middlewares/apiTokenAuth.js # Autenticación
│   ├── validators/apiTokenValidator.js    # Validaciones
│   └── routes/apiTokenRoutes.js    # Rutas
├── api_tokens_table.sql            # Script de base de datos
├── railway.json                    # Configuración de Railway
├── .nvmrc                          # Versión de Node.js
└── API_TOKENS_DOCUMENTACION.md     # Documentación completa
```

## Soporte

Si tienes problemas:

1. Revisa los logs de Railway
2. Verifica las variables de entorno
3. Confirma que la base de datos esté configurada
4. Contacta al equipo de desarrollo
