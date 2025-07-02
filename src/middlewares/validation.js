import { validationResult } from 'express-validator';
import logger from '../config/logger.js';

/**
 * Middleware para validar los resultados de express-validator
 * Debe usarse después de los validadores en las rutas
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log del error para debugging
    logger.warn('Error de validación detectado', {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      errors: errors.array()
    });

    return res.status(400).json({
      error: 'Datos inválidos',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      })),
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Middleware para validar que el usuario esté autenticado
 * Complementa el middleware de autenticación existente
 */
export const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    logger.warn('Intento de acceso sin autenticación', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    return res.status(401).json({
      error: 'Autenticación requerida',
      message: 'Debes iniciar sesión para acceder a este recurso'
    });
  }
  
  next();
};

/**
 * Middleware para validar permisos básicos
 * Verifica que el usuario tenga un rol válido
 */
export const requireValidRole = (req, res, next) => {
  const validRoles = ['user', 'admin', 'manager'];
  
  if (!req.user.role || !validRoles.includes(req.user.role)) {
    logger.warn('Usuario con rol inválido', {
      userId: req.user.id,
      role: req.user.role,
      path: req.path
    });
    
    return res.status(403).json({
      error: 'Permisos insuficientes',
      message: 'Tu rol no tiene permisos para esta acción'
    });
  }
  
  next();
};

/**
 * Middleware para sanitizar datos de entrada
 * Elimina espacios en blanco y caracteres peligrosos
 */
export const sanitizeInput = (req, res, next) => {
  // Sanitizar body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  // Sanitizar query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  
  next();
};

/**
 * Middleware para validar formato de UUID
 */
export const validateUUID = (paramName) => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuid || !uuidRegex.test(uuid)) {
      logger.warn('UUID inválido proporcionado', {
        paramName,
        value: uuid,
        path: req.path,
        userId: req.user?.id
      });
      
      return res.status(400).json({
        error: 'ID inválido',
        message: `El ${paramName} proporcionado no es válido`,
        field: paramName
      });
    }
    
    next();
  };
}; 