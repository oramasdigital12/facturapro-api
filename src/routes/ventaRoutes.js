import express from 'express';
import { body } from 'express-validator';
import * as ventaController from '../controllers/ventaController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Venta:
 *       type: object
 *       required:
 *         - cliente_id
 *         - tipo
 *         - monto
 *         - fecha
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID autogenerado de la venta
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID del cliente asociado a la venta
 *         tipo:
 *           type: string
 *           enum: [venta, mensual, anual]
 *           description: Tipo de la venta
 *         monto:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Monto de la venta
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha de la venta (YYYY-MM-DD)
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         cliente_id: "123e4567-e89b-12d3-a456-426614174001"
 *         tipo: "mensual"
 *         monto: 1500.50
 *         fecha: "2024-03-20"
 */

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Registrar una nueva venta
 *     tags: [Ventas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Venta'
 *     responses:
 *       201:
 *         description: Venta registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venta'
 *       400:
 *         description: Datos inválidos en la solicitud
 *       401:
 *         description: No autorizado - Token inválido
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/',
    authenticateToken,
    [
        body('cliente_id').notEmpty().isUUID(),
        body('tipo').notEmpty().isString(),
        body('monto').isFloat({ min: 0 }),
        body('fecha').notEmpty().isDate()
    ],
    ventaController.registrarVenta
);

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Obtener todas las ventas
 *     tags: [Ventas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página para la paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de registros por página
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Venta'
 *                 total:
 *                   type: integer
 *                   description: Total de registros
 *                 page:
 *                   type: integer
 *                   description: Página actual
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas
 *       401:
 *         description: No autorizado - Token inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticateToken, ventaController.obtenerVentas);

/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener una venta por ID
 *     tags: [Ventas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la venta a consultar
 *     responses:
 *       200:
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venta'
 *       401:
 *         description: No autorizado - Token inválido
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authenticateToken, ventaController.obtenerVenta);

/**
 * @swagger
 * /api/ventas/{id}:
 *   put:
 *     summary: Actualizar una venta existente
 *     tags: [Ventas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la venta a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *               tipo:
 *                 type: string
 *                 enum: [venta, mensual, anual]
 *               monto:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *               fecha:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Venta actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venta'
 *       400:
 *         description: Datos inválidos en la solicitud
 *       401:
 *         description: No autorizado - Token inválido
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id',
    authenticateToken,
    [
        body('cliente_id').optional().isUUID(),
        body('tipo').optional().isString(),
        body('monto').optional().isFloat({ min: 0 }),
        body('fecha').optional().isDate()
    ],
    ventaController.actualizarVenta
);

/**
 * @swagger
 * /api/ventas/{id}:
 *   delete:
 *     summary: Eliminar una venta
 *     tags: [Ventas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la venta a eliminar
 *     responses:
 *       200:
 *         description: Venta eliminada exitosamente
 *       401:
 *         description: No autorizado - Token inválido
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authenticateToken, ventaController.eliminarVenta);

/**
 * @swagger
 * /api/ventas/cliente/{clienteId}:
 *   get:
 *     summary: Obtener ventas por cliente
 *     tags: [Ventas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del cliente
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página para la paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de registros por página
 *     responses:
 *       200:
 *         description: Lista de ventas del cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Venta'
 *                 total:
 *                   type: integer
 *                   description: Total de registros
 *                 page:
 *                   type: integer
 *                   description: Página actual
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas
 *       401:
 *         description: No autorizado - Token inválido
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/cliente/:clienteId', authenticateToken, ventaController.obtenerVentasCliente);

export default router; 