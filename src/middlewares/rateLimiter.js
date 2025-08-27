import rateLimit from "express-rate-limit";

/**
 * Rate limiter para endpoints de autenticación
 * Limita a 20 intentos por 5 minutos (ajustado para producción)
 */
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo 20 intentos
  message: {
    error: "Demasiados intentos de login, intenta más tarde",
    retryAfter: "5 minutos"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiados intentos de login, intenta más tarde",
      retryAfter: "5 minutos"
    });
  }
});

/**

* Rate limiter para endpoints de autenticación (más restrictivo)
 * Limita a 10 intentos por 5 minutos para registro/cambio de contraseña
 */
export const strictAuthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // máximo 10 intentos
  message: {
    error: "Demasiados intentos, intenta más tarde",
    retryAfter: "5 minutos"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiados intentos, intenta más tarde",
      retryAfter: "5 minutos"
    });
  }
});

/**
 * Rate limiter para creación de recursos (moderado)
 * Limita a 50 creaciones por 15 minutos
 */
export const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // máximo 50 creaciones
  message: {
    error: "Demasiadas creaciones, intenta más tarde",
    retryAfter: "15 minutos"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiadas creaciones, intenta más tarde",
      retryAfter: "15 minutos"
    });
  }
});

/**
 * Rate limiter para operaciones destructivas (muy restrictivo)
 * Limita a 10 eliminaciones por 15 minutos
 */
export const deleteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 eliminaciones
  message: {
    error: "Demasiadas eliminaciones, intenta más tarde",
    retryAfter: "15 minutos"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiadas eliminaciones, intenta más tarde",
      retryAfter: "15 minutos"
    });
  }
});

/**
 * Rate limiter para búsquedas (muy permisivo)
 * Limita a 200 búsquedas por 15 minutos
 */
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máximo 200 búsquedas
  message: {
    error: "Demasiadas búsquedas, intenta más tarde",
    retryAfter: "15 minutos"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiadas búsquedas, intenta más tarde",
      retryAfter: "15 minutos"
    });
  }
});

/**
 * Rate limiter para operaciones masivas (moderado)
 * Limita a 20 operaciones masivas por 15 minutos
 */
export const bulkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 operaciones masivas
  message: {
    error: "Demasiadas operaciones masivas, intenta más tarde",
    retryAfter: "15 minutos"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiadas operaciones masivas, intenta más tarde",
      retryAfter: "15 minutos"
    });
  }
});

/**
 * Rate limiter para archivos/upload (moderado)
 * Limita a 30 uploads por 15 minutos
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // máximo 30 uploads
  message: {
    error: "Demasiados archivos subidos, intenta más tarde",
    retryAfter: "15 minutos"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiados archivos subidos, intenta más tarde",
      retryAfter: "15 minutos"
    });
  }
});

/**
 * Rate limiter para operaciones de sistema (muy permisivo)
 * Limita a 500 operaciones por 15 minutos
 */
export const systemLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // máximo 500 operaciones
  message: {
    error: "Demasiadas operaciones del sistema, intenta más tarde",
    retryAfter: "15 minutos"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiadas operaciones del sistema, intenta más tarde",
      retryAfter: "15 minutos"
    });
  }
}); 