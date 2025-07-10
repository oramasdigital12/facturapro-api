import { body, param } from 'express-validator';

export const crearFacturaValidator = [
  body('cliente_id')
    .isUUID()
    .withMessage('El cliente_id debe ser un UUID válido'),
  
  body('fecha_factura')
    .optional()
    .isISO8601()
    .withMessage('La fecha_factura debe ser una fecha válida'),
  
  body('estado')
    .optional()
    .isIn(['pendiente', 'pagada', 'borrador'])
    .withMessage('El estado debe ser: pendiente, pagada o borrador'),
  
  body('subtotal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El subtotal debe ser un número mayor o igual a 0'),
  
  body('impuesto')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El impuesto debe ser un número mayor o igual a 0'),
  
  body('total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El total debe ser un número mayor o igual a 0'),
  
  body('deposito')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El depósito debe ser un número mayor o igual a 0'),
  
  body('balance_restante')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El balance restante debe ser un número mayor o igual a 0'),
  
  body('nota')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La nota no puede exceder 1000 caracteres'),
  
  body('terminos')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Los términos no pueden exceder 2000 caracteres'),
  
  body('logo_personalizado_url')
    .optional()
    .isURL()
    .withMessage('El logo_personalizado_url debe ser una URL válida'),
  
  body('firma_url')
    .optional()
    .isURL()
    .withMessage('La firma_url debe ser una URL válida'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un item'),
  
  body('items.*.categoria')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La categoría del item no puede exceder 100 caracteres'),
  
  body('items.*.descripcion')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('La descripción del item es requerida y no puede exceder 500 caracteres'),
  
  body('items.*.precio_unitario')
    .isFloat({ min: 0 })
    .withMessage('El precio unitario del item debe ser un número mayor o igual a 0'),
  
  body('items.*.cantidad')
    .isInt({ min: 1 })
    .withMessage('La cantidad del item debe ser un número entero mayor a 0'),
  
  body('items.*.total')
    .isFloat({ min: 0 })
    .withMessage('El total del item debe ser un número mayor o igual a 0')
];

export const actualizarFacturaValidator = [
  param('id')
    .isUUID()
    .withMessage('El ID de la factura debe ser un UUID válido'),
  
  body('cliente_id')
    .optional()
    .isUUID()
    .withMessage('El cliente_id debe ser un UUID válido'),
  
  body('fecha_factura')
    .optional()
    .isISO8601()
    .withMessage('La fecha_factura debe ser una fecha válida'),
  
  body('estado')
    .optional()
    .isIn(['pendiente', 'pagada', 'borrador'])
    .withMessage('El estado debe ser: pendiente, pagada o borrador'),
  
  body('subtotal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El subtotal debe ser un número mayor o igual a 0'),
  
  body('impuesto')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El impuesto debe ser un número mayor o igual a 0'),
  
  body('total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El total debe ser un número mayor o igual a 0'),
  
  body('deposito')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El depósito debe ser un número mayor o igual a 0'),
  
  body('balance_restante')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El balance restante debe ser un número mayor o igual a 0'),
  
  body('nota')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La nota no puede exceder 1000 caracteres'),
  
  body('terminos')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Los términos no pueden exceder 2000 caracteres'),
  
  body('logo_personalizado_url')
    .optional()
    .isURL()
    .withMessage('El logo_personalizado_url debe ser una URL válida'),
  
  body('firma_url')
    .optional()
    .isURL()
    .withMessage('La firma_url debe ser una URL válida'),
  
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Si se proporcionan items, debe incluir al menos uno'),
  
  body('items.*.categoria')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La categoría del item no puede exceder 100 caracteres'),
  
  body('items.*.descripcion')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('La descripción del item es requerida y no puede exceder 500 caracteres'),
  
  body('items.*.precio_unitario')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio unitario del item debe ser un número mayor o igual a 0'),
  
  body('items.*.cantidad')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad del item debe ser un número entero mayor a 0'),
  
  body('items.*.total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El total del item debe ser un número mayor o igual a 0')
]; 