import express from 'express';
import { body, param } from 'express-validator';
import { authenticateToken } from '../middlewares/auth.js';
import {
    crearMetodoPago,
    obtenerMetodosPago,
    obtenerMetodoPago,
    actualizarMetodoPago,
    eliminarMetodoPago,
    cambiarOrdenMetodosPago
} from '../controllers/metodoPagoController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: MetodoPago
 *     description: Gestion de metodos de pago
 */

/**
 * @swagger
 * /api/metodos-pago:
 *   post:
 *     summary: Crear un nuevo metodo de pago
 *     tags: [MetodoPago]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del metodo de pago
 *               link:
 *                 type: string
 *                 description: URL del metodo de pago (opcional)
 *               descripcion:
 *                 type: string
 *                 description: Descripcion o pasos del metodo de pago
 *               activo:
 *                 type: boolean
 *                 description: Si el metodo esta activo
 *               orden:
 *                 type: integer
 *                 description: Orden de visualizacion
 *     responses:
 *       201:
 *         description: Metodo de pago creado exitosamente
 *       400:
 *         description: Datos invalidos
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/metodos-pago:
 *   get:
 *     summary: Obtener todos los metodos de pago del usuario
 *     tags: [MetodoPago]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de metodos de pago
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/metodos-pago/{id}:
 *   get:
 *     summary: Obtener un metodo de pago por ID
 *     tags: [MetodoPago]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del metodo de pago
 *     responses:
 *       200:
 *         description: Metodo de pago encontrado
 *       404:
 *         description: Metodo de pago no encontrado
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/metodos-pago/{id}:
 *   put:
 *     summary: Actualizar un metodo de pago
 *     tags: [MetodoPago]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del metodo de pago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               link:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               activo:
 *                 type: boolean
 *               orden:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Metodo de pago actualizado
 *       404:
 *         description: Metodo de pago no encontrado
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/metodos-pago/{id}:
 *   delete:
 *     summary: Eliminar un metodo de pago
 *     tags: [MetodoPago]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del metodo de pago
 *     responses:
 *       200:
 *         description: Metodo de pago eliminado
 *       404:
 *         description: Metodo de pago no encontrado
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/metodos-pago/orden:
 *   post:
 *     summary: Cambiar el orden de los metodos de pago
 *     tags: [MetodoPago]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de IDs en el orden deseado
 *     responses:
 *       200:
 *         description: Orden actualizado exitosamente
 *       400:
 *         description: Datos invalidos
 *       401:
 *         description: No autorizado
 */

// Validaciones
const crearMetodoPagoValidator = [
    body('nombre')
        .isString()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('El nombre es requerido y no puede exceder 100 caracteres'),
    
    body('link')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage('El link no puede exceder 500 caracteres'),
    
    body('descripcion')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La descripción no puede exceder 1000 caracteres'),
    
    body('activo')
        .optional()
        .isBoolean()
        .withMessage('El campo activo debe ser un booleano'),
    
    body('orden')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El orden debe ser un número entero mayor o igual a 0')
];

const actualizarMetodoPagoValidator = [
    param('id')
        .isUUID()
        .withMessage('El ID del método de pago debe ser un UUID válido'),
    
    body('nombre')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('El nombre no puede exceder 100 caracteres'),
    
    body('link')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage('El link no puede exceder 500 caracteres'),
    
    body('descripcion')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La descripción no puede exceder 1000 caracteres'),
    
    body('activo')
        .optional()
        .isBoolean()
        .withMessage('El campo activo debe ser un booleano'),
    
    body('orden')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El orden debe ser un número entero mayor o igual a 0')
];

const cambiarOrdenValidator = [
    body('ids')
        .isArray({ min: 1 })
        .withMessage('Se requiere un array de IDs'),
    
    body('ids.*')
        .isUUID()
        .withMessage('Cada ID debe ser un UUID válido')
];

// Rutas
router.post('/', authenticateToken, crearMetodoPagoValidator, crearMetodoPago);
router.get('/', authenticateToken, obtenerMetodosPago);
router.get('/:id', authenticateToken, obtenerMetodoPago);
router.put('/:id', authenticateToken, actualizarMetodoPagoValidator, actualizarMetodoPago);
router.delete('/:id', authenticateToken, eliminarMetodoPago);
router.post('/orden', authenticateToken, cambiarOrdenValidator, cambiarOrdenMetodosPago);

export default router;
