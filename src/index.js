import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import logger from './config/logger.js';

// Importar middlewares de rate limiting
import { 
  authLimiter, 
  strictAuthLimiter, 
  createLimiter, 
  deleteLimiter, 
  searchLimiter, 
  bulkLimiter, 
  uploadLimiter, 
  systemLimiter 
} from './middlewares/rateLimiter.js';
import { sanitizeInput } from './middlewares/validation.js';

// Importar controladores de health check
import { healthCheck, readinessCheck, livenessCheck } from './controllers/healthController.js';

// Importar rutas
import clienteRoutes from './routes/clienteRoutes.js';
import mensajeRoutes from './routes/mensajeRoutes.js';
import ventaRoutes from './routes/ventaRoutes.js';
import authRoutes from './routes/authRoutes.js';
import negocioConfigRoutes from './routes/negocioConfigRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';
import categoriaNegocioRoutes from './routes/categoriaNegocioRoutes.js';
import servicioNegocioRoutes from './routes/servicioNegocioRoutes.js';
import facturaRoutes from './routes/facturaRoutes.js';
import facturaPublicaRoutes from './routes/facturaPublicaRoutes.js';
import metodoPagoRoutes from './routes/metodoPagoRoutes.js';
import apiTokenRoutes from './routes/apiTokenRoutes.js';

const app = express();

// Configurar trust proxy para Railway y otros proxies
app.set('trust proxy', 1);

// Middlewares de seguridad mejorados
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Configurar CORS usando variable de entorno o lista por defecto
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'https://gestionapro.netlify.app',
      'https://vendedorpro.app',
      'https://facturapro.app',
      'https://gestionaexpress.netlify.app',
      'https://gestionarapido.netlify.app',
      'https://venderapido.netlify.app',
      'https://leadspropr.netlify.app',
      'http://localhost:3000',
      'https://tuguiadigitalleadspro.netlify.app', 
      'http://localhost:5173',
      'http://localhost:5174'
    ];

// Log de dominios permitidos
console.log('🌐 Dominios CORS permitidos:');
allowedOrigins.forEach(origin => console.log(`   ✅ ${origin}`));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging mejorado
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Sanitización global de entrada
app.use(sanitizeInput);

// Rate limiting solo en rutas sensibles (no global para toda la API)
// app.use('/api', apiLimiter); // <-- Eliminado para evitar bloqueos globales

// Endpoints de health check (sin rate limiting)
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);
app.get('/live', livenessCheck);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Endpoint de estado de la API
 *     description: Retorna un mensaje indicando que la API está funcionando
 *     tags: [Estado]
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: CRM WhatsApp API v1.0.0
 */
app.get('/', (req, res) => {
  res.json({ 
    message: 'CRM WhatsApp API v1.0.0',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API con rate limiting específico
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth/api-tokens', apiTokenRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/negocio-config', negocioConfigRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/categorias-negocio', categoriaNegocioRoutes);
app.use('/api/servicios-negocio', servicioNegocioRoutes);
app.use('/api/metodos-pago', metodoPagoRoutes);

// Rutas públicas (sin autenticación)
app.use('/factura', facturaPublicaRoutes);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "CRM WhatsApp API - Documentación",
  swaggerOptions: {
    persistAuthorization: true
  }
}));

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriaNegocio:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user_id:
 *           type: string
 *         nombre:
 *           type: string
 *         orden:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *     ServicioNegocio:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         categoria_id:
 *           type: string
 *         user_id:
 *           type: string
 *         nombre:
 *           type: string
 *         precio:
 *           type: number
 *         created_at:
 *           type: string
 *           format: date-time
 */

// Manejo de errores global mejorado
app.use((err, req, res, next) => {
  logger.error('Error no manejado', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip
  });

  // No exponer detalles del error en producción
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: isDevelopment ? err.message : 'Algo salió mal',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  logger.warn('Ruta no encontrada', {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.path} no existe`,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

// Manejo de señales para Railway
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor gracefully...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado correctamente`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
  
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('📝 Documentación disponible en:');
  console.log(`   http://localhost:${PORT}/api-docs`);
  console.log('🏥 Health checks disponibles en:');
  console.log(`   http://localhost:${PORT}/health`);
  console.log(`   http://localhost:${PORT}/ready`);
  console.log(`   http://localhost:${PORT}/live`);
  console.log('\n📌 Rutas principales:');
  console.log('   GET    /');
  console.log('   GET    /api-docs');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   GET    /api/auth/profile');
  console.log('   POST   /api/clientes');
  console.log('   POST   /api/mensajes');
  console.log('   POST   /api/ventas');
  console.log('   POST   /api/facturas');
  console.log('   GET    /factura/{uuid}');
  console.log('   POST   /api/negocio-config');
  console.log('   POST   /api/tareas');
  console.log('   POST   /api/categorias-negocio');
  console.log('   POST   /api/servicios-negocio');
  console.log('   POST   /api/metodos-pago');
  console.log('   GET    /api/metodos-pago');
  console.log('   PUT    /api/metodos-pago/{id}');
  console.log('   DELETE /api/metodos-pago/{id}');
  console.log('   POST   /api/metodos-pago/orden');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} recibido, cerrando servidor...`);
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
  
  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    logger.error('Forzando cierre del servidor');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT')); 