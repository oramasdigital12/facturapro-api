import express from 'express';
import * as facturaController from '../controllers/facturaController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateRequest, validateUUID } from '../middlewares/validation.js';
import { createLimiter, searchLimiter } from '../middlewares/rateLimiter.js';
import { crearFacturaValidator, actualizarFacturaValidator } from '../validators/facturaValidator.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FacturaItem:
 *       type: object
 *       required:
 *         - descripcion
 *         - precio_unitario
 *         - cantidad
 *         - total
 *       properties:
 *         id:
 *           type: string
 *           description: ID autogenerado del item
 *         factura_id:
 *           type: string
 *           description: ID de la factura a la que pertenece
 *         categoria:
 *           type: string
 *           description: Categoría del item
 *         descripcion:
 *           type: string
 *           description: Descripción del item
 *         precio_unitario:
 *           type: number
 *           description: Precio unitario del item
 *         cantidad:
 *           type: integer
 *           description: Cantidad del item
 *         total:
 *           type: number
 *           description: Total del item (precio_unitario * cantidad)
 *     
 *     Factura:
 *       type: object
 *       required:
 *         - cliente_id
 *         - items
 *       properties:
 *         id:
 *           type: string
 *           description: ID autogenerado de la factura
 *         user_id:
 *           type: string
 *           description: ID del usuario propietario
 *         cliente_id:
 *           type: string
 *           description: ID del cliente
 *         numero_factura:
 *           type: integer
 *           description: Número de factura (auto-incrementado)
 *         fecha_factura:
 *           type: string
 *           format: date
 *           description: Fecha de la factura
 *         fecha_pagada:
 *           type: string
 *           format: date
 *           description: Fecha cuando se pagó la factura
 *         estado:
 *           type: string
 *           enum: [pendiente, pagada, borrador]
 *           description: Estado de la factura
 *         subtotal:
 *           type: number
 *           description: Subtotal de la factura
 *         impuesto:
 *           type: number
 *           description: Monto de impuestos
 *         total:
 *           type: number
 *           description: Total de la factura
 *         deposito:
 *           type: number
 *           description: Monto de depósito
 *         balance_restante:
 *           type: number
 *           description: Balance restante por pagar
 *         nota:
 *           type: string
 *           description: Nota adicional de la factura
 *         terminos:
 *           type: string
 *           description: Términos y condiciones
 *         logo_personalizado_url:
 *           type: string
 *           description: URL del logo personalizado
 *         firma_url:
 *           type: string
 *           description: URL de la firma (opcional)
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FacturaItem'
 *           description: Items de la factura
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

/**
 * @swagger
 * /api/facturas:
 *   post:
 *     summary: Crear una nueva factura
 *     tags: [Facturas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_id
 *               - items
 *             properties:
 *               cliente_id:
 *                 type: string
 *                 description: ID del cliente
 *               fecha_factura:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la factura (opcional, usa fecha actual por defecto)
 *               estado:
 *                 type: string
 *                 enum: [pendiente, pagada, borrador]
 *                 description: Estado de la factura (opcional, usa 'pendiente' por defecto)
 *               subtotal:
 *                 type: number
 *                 description: Subtotal de la factura
 *               impuesto:
 *                 type: number
 *                 description: Monto de impuestos
 *               total:
 *                 type: number
 *                 description: Total de la factura
 *               deposito:
 *                 type: number
 *                 description: Monto de depósito
 *               balance_restante:
 *                 type: number
 *                 description: Balance restante por pagar
 *               nota:
 *                 type: string
 *                 description: Nota adicional de la factura
 *               terminos:
 *                 type: string
 *                 description: Términos y condiciones
 *               logo_personalizado_url:
 *                 type: string
 *                 description: URL del logo personalizado
 *               firma_url:
 *                 type: string
 *                 description: URL de la firma (opcional)
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/FacturaItem'
 *                 description: Items de la factura
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 */
router.post('/',
  authenticateToken,
  createLimiter,
  crearFacturaValidator,
  validateRequest,
  facturaController.crearFactura
);

/**
 * @swagger
 * /api/facturas:
 *   get:
 *     summary: Obtener todas las facturas del usuario
 *     tags: [Facturas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID del cliente
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, pagada, borrador]
 *         description: Filtrar por estado de la factura
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar desde esta fecha
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar hasta esta fecha
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Factura'
 */
router.get('/', 
  authenticateToken, 
  searchLimiter,
  facturaController.obtenerFacturas
);

/**
 * @swagger
 * /api/facturas/{id}:
 *   get:
 *     summary: Obtener una factura por ID
 *     tags: [Facturas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:id', 
  authenticateToken, 
  validateUUID('id'),
  facturaController.obtenerFactura
);

/**
 * @swagger
 * /api/facturas/{id}:
 *   put:
 *     summary: Actualizar una factura
 *     tags: [Facturas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente_id:
 *                 type: string
 *                 description: ID del cliente
 *               fecha_factura:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la factura
 *               estado:
 *                 type: string
 *                 enum: [pendiente, pagada, borrador]
 *                 description: Estado de la factura
 *               subtotal:
 *                 type: number
 *                 description: Subtotal de la factura
 *               impuesto:
 *                 type: number
 *                 description: Monto de impuestos
 *               total:
 *                 type: number
 *                 description: Total de la factura
 *               deposito:
 *                 type: number
 *                 description: Monto de depósito
 *               balance_restante:
 *                 type: number
 *                 description: Balance restante por pagar
 *               nota:
 *                 type: string
 *                 description: Nota adicional de la factura
 *               terminos:
 *                 type: string
 *                 description: Términos y condiciones
 *               logo_personalizado_url:
 *                 type: string
 *                 description: URL del logo personalizado
 *               firma_url:
 *                 type: string
 *                 description: URL de la firma (opcional)
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/FacturaItem'
 *                 description: Items de la factura (reemplaza todos los items existentes)
 *     responses:
 *       200:
 *         description: Factura actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       404:
 *         description: Factura no encontrada
 */
router.put('/:id',
  authenticateToken,
  createLimiter,
  actualizarFacturaValidator,
  validateRequest,
  facturaController.actualizarFactura
);

/**
 * @swagger
 * /api/facturas/{id}:
 *   delete:
 *     summary: Eliminar una factura
 *     tags: [Facturas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Factura eliminada exitosamente
 *       404:
 *         description: Factura no encontrada
 */
router.delete('/:id',
  authenticateToken,
  createLimiter,
  validateUUID('id'),
  facturaController.eliminarFactura
);

export default router; 