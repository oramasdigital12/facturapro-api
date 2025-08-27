import { body } from 'express-validator';

/**
 * Validaciones para crear un cliente
 */
export const crearClienteValidator = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .trim()
    .escape()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .optional({ nullable: true })
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  
  body('telefono')
    .optional({ nullable: true })
    .matches(/^\+?[\d\s-]{8,}$/)
    .withMessage('El teléfono debe ser válido'),
  
  body('categoria')
    .optional()
    .isIn(['activo', 'inactivo'])
    .withMessage('La categoría debe ser: activo o inactivo'),
  
  body('fecha_nacimiento')
    .optional({ nullable: true })
    .isDate()
    .withMessage('La fecha de nacimiento debe ser válida'),
  
  body('fecha_vencimiento')
    .optional()
    .isDate()
    .withMessage('La fecha de vencimiento debe ser válida'),
  
  body('fecha_inicio')
    .optional()
    .isDate()
    .withMessage('La fecha de inicio debe ser válida'),
  
  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La dirección no puede exceder 200 caracteres'),
  
  body('sexo')
    .optional({ nullable: true })
    .isString()
    .withMessage('El sexo debe ser una cadena de texto'),
  
  body('identification_number')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El número de identificación no puede exceder 50 caracteres'),
  
  body('notas')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres'),
  
  body('proviene')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El campo proviene no puede exceder 100 caracteres')
];

/**
 * Validaciones para actualizar un cliente
 */
export const actualizarClienteValidator = [
  body('nombre')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .optional({ nullable: true })
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  
  body('telefono')
    .optional({ nullable: true })
    .matches(/^\+?[\d\s-]{8,}$/)
    .withMessage('El teléfono debe ser válido'),
  
  body('categoria')
    .optional()
    .isIn(['activo', 'inactivo'])
    .withMessage('La categoría debe ser: activo o inactivo'),
  
  body('fecha_nacimiento')
    .optional({ nullable: true })
    .isDate()
    .withMessage('La fecha de nacimiento debe ser válida'),
  
  body('fecha_vencimiento')
    .optional()
    .isDate()
    .withMessage('La fecha de vencimiento debe ser válida'),
  
  body('fecha_inicio')
    .optional()
    .isDate()
    .withMessage('La fecha de inicio debe ser válida'),
  
  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La dirección no puede exceder 200 caracteres'),
  
  body('sexo')
    .optional({ nullable: true })
    .isString()
    .withMessage('El sexo debe ser una cadena de texto'),
  
  body('identification_number')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El número de identificación no puede exceder 50 caracteres'),
  
  body('notas')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres'),
  
  body('proviene')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El campo proviene no puede exceder 100 caracteres')
]; 