import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

/**
 * Endpoint de health check para monitoreo
 * Verifica el estado de la aplicación y servicios externos
 */
export const healthCheck = async (req, res) => {
  const startTime = Date.now();
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {}
  };

  try {
    // Verificar conexión a Supabase
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      healthData.status = 'degraded';
      healthData.services.database = {
        status: 'error',
        message: error.message
      };
      logger.error('Error en health check - Base de datos', { error: error.message });
    } else {
      healthData.services.database = {
        status: 'connected',
        responseTime: Date.now() - startTime
      };
    }

    // Verificar memoria del proceso
    const memUsage = process.memoryUsage();
    healthData.services.memory = {
      status: 'ok',
      rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
    };

    // Verificar variables de entorno críticas
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      healthData.status = 'degraded';
      healthData.services.environment = {
        status: 'error',
        message: `Variables de entorno faltantes: ${missingEnvVars.join(', ')}`
      };
    } else {
      healthData.services.environment = {
        status: 'ok',
        message: 'Todas las variables de entorno están configuradas'
      };
    }

    // Determinar status final
    const hasErrors = Object.values(healthData.services).some(service => service.status === 'error');
    if (hasErrors) {
      healthData.status = 'unhealthy';
      res.status(503);
    } else if (healthData.status === 'degraded') {
      res.status(200);
    } else {
      res.status(200);
    }

    logger.info('Health check completado', {
      status: healthData.status,
      responseTime: Date.now() - startTime
    });

    res.json(healthData);

  } catch (error) {
    logger.error('Error crítico en health check', { error: error.message });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Endpoint de readiness check
 * Verifica si la aplicación está lista para recibir tráfico
 */
export const readinessCheck = async (req, res) => {
  try {
    // Verificación básica de conectividad a Supabase
    const { error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return res.status(503).json({
        status: 'not ready',
        message: 'Base de datos no disponible',
        error: error.message
      });
    }

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      message: 'Aplicación lista para recibir tráfico'
    });

  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      message: 'Error de conectividad',
      error: error.message
    });
  }
};

/**
 * Endpoint de liveness check
 * Verifica si la aplicación está viva y funcionando
 */
export const livenessCheck = (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Aplicación funcionando correctamente'
  });
}; 