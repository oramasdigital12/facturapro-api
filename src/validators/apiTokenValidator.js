import { body } from 'express-validator';

export const crearApiTokenValidator = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre del token es requerido')
        .isLength({ min: 1, max: 100 })
        .withMessage('El nombre del token debe tener entre 1 y 100 caracteres'),
    
    body('duracion_dias')
        .isInt({ min: 1, max: 365 })
        .withMessage('La duración debe ser un número entero entre 1 y 365 días'),
    
    body('permisos')
        .optional()
        .isArray()
        .withMessage('Los permisos deben ser un array')
        .custom((value) => {
            const permisosValidos = ['read', 'write', 'delete', 'admin'];
            const permisosInvalidos = value.filter(permiso => !permisosValidos.includes(permiso));
            
            if (permisosInvalidos.length > 0) {
                throw new Error(`Permisos inválidos: ${permisosInvalidos.join(', ')}. Permisos válidos: ${permisosValidos.join(', ')}`);
            }
            
            return true;
        }),
    
    body('descripcion')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres')
];
