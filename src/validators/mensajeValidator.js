import { body, param } from 'express-validator';

/**
 * Validaciones para crear mensajes
 */
export const crearMensajeValidations = [
  body('texto')
    .notEmpty()
    .trim()
    .withMessage('El texto del mensaje es requerido')
    .isLength({ min: 1, max: 2000 })
    .withMessage('El texto debe tener entre 1 y 2000 caracteres'),
  
  body('modulo')
    .optional()
    .isIn(['general', 'facturas', 'clientes', 'ventas', 'tareas'])
    .withMessage('El módulo debe ser uno de: general, facturas, clientes, ventas, tareas')
];

/**
 * Validaciones para actualizar mensajes
 */
export const actualizarMensajeValidations = [
  body('texto')
    .notEmpty()
    .trim()
    .withMessage('El texto del mensaje es requerido')
    .isLength({ min: 1, max: 2000 })
    .withMessage('El texto debe tener entre 1 y 2000 caracteres'),
  
  body('modulo')
    .optional()
    .isIn(['general', 'facturas', 'clientes', 'ventas', 'tareas'])
    .withMessage('El módulo debe ser uno de: general, facturas, clientes, ventas, tareas')
];

/**
 * Validaciones para el parámetro módulo
 */
export const moduloParamValidation = [
  param('modulo')
    .isIn(['general', 'facturas', 'clientes', 'ventas', 'tareas'])
    .withMessage('El módulo debe ser uno de: general, facturas, clientes, ventas, tareas')
];

/**
 * Validaciones para generar link de WhatsApp
 */
export const generarLinkWhatsAppValidations = [
  body('telefono')
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('El teléfono debe tener un formato válido'),
  
  body('mensajeId')
    .notEmpty()
    .withMessage('El ID del mensaje es requerido')
    .isUUID()
    .withMessage('El ID del mensaje debe ser un UUID válido')
];

/**
 * Validaciones para el parámetro ID
 */
export const idParamValidation = [
  param('id')
    .isUUID()
    .withMessage('El ID debe ser un UUID válido')
];
