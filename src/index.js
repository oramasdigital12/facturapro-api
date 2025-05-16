import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

// Importar rutas
import clienteRoutes from './routes/clienteRoutes.js';
import mensajeRoutes from './routes/mensajeRoutes.js';
import ventaRoutes from './routes/ventaRoutes.js';
import authRoutes from './routes/authRoutes.js';
import negocioConfigRoutes from './routes/negocioConfigRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: [
    'https://gestionapro.netlify.app',
    'https://vendedorespro.netlify.app',
    'https://gestionaexpress.netlify.app',
    'https://gestionarapido.netlify.app',
    'https://venderapido.netlify.app', // Dominio de Netlify para producción
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

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
  res.json({ message: 'CRM WhatsApp API v1.0.0' });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/negocio-config', negocioConfigRoutes);
app.use('/api/tareas', tareaRoutes);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "CRM WhatsApp API - Documentación",
  swaggerOptions: {
    persistAuthorization: true
  }
}));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('📝 Documentación disponible en:');
  console.log(`   http://localhost:${PORT}/api-docs`);
  console.log('\n📌 Rutas principales:');
  console.log('   GET    /');
  console.log('   GET    /api-docs');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   GET    /api/auth/profile');
  console.log('   POST   /api/clientes');
  console.log('   POST   /api/mensajes');
  console.log('   POST   /api/ventas');
  console.log('   POST   /api/negocio-config');
  console.log('   POST   /api/tareas');
}); 