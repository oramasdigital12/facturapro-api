import express from 'express';
import * as facturaController from '../controllers/facturaController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateRequest, validateUUID } from '../middlewares/validation.js';
import { createLimiter, deleteLimiter, uploadLimiter, bulkLimiter } from '../middlewares/rateLimiter.js';
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
 *         fecha_vencimiento:
 *           type: string
 *           format: date
 *           description: Fecha de vencimiento de la factura
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
 *         metodo_pago_id:
 *           type: string
 *           description: ID del método de pago seleccionado
 *         metodo_pago:
 *           $ref: '#/components/schemas/MetodoPago'
 *           description: Información del método de pago seleccionado
 *         cliente:
 *           $ref: '#/components/schemas/Cliente'
 *           description: Información del cliente
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
 *     
 *     MetodoPago:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID del método de pago
 *         nombre:
 *           type: string
 *           description: Nombre del método de pago
 *         link:
 *           type: string
 *           description: URL del método de pago (opcional)
 *         descripcion:
 *           type: string
 *           description: Descripción o pasos del método de pago
 *         activo:
 *           type: boolean
 *           description: Si el método está activo
 *         orden:
 *           type: integer
 *           description: Orden de visualización
 *     
 *     Cliente:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID del cliente
 *         nombre:
 *           type: string
 *           description: Nombre del cliente
 *         email:
 *           type: string
 *           description: Email del cliente
 *         telefono:
 *           type: string
 *           description: Teléfono del cliente
 *         direccion:
 *           type: string
 *           description: Dirección del cliente
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
 *               fecha_vencimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento de la factura (opcional)
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
 *               metodo_pago_id:
 *                 type: string
 *                 description: ID del método de pago seleccionado (opcional)
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
  createLimiter, // ✅ Límite en creación de facturas
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
  // ✅ SIN LÍMITES para consultas de facturas
  facturaController.obtenerFacturas
);

/**
 * @swagger
 * /api/facturas/eliminadas:
 *   get:
 *     summary: Obtener facturas eliminadas (en papelera)
 *     tags: [Facturas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facturas eliminadas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Factura'
 */
router.get('/eliminadas', 
  authenticateToken, 
  // ✅ SIN LÍMITES para consultas de facturas eliminadas
  facturaController.obtenerFacturasEliminadas
);

/**
 * @swagger
 * /api/facturas/limpiar-antiguas:
 *   post:
 *     summary: Limpiar facturas eliminadas antiguas (automático)
 *     tags: [Facturas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diasRetencion:
 *                 type: integer
 *                 description: Días de retención (mínimo 365, por defecto 2555 = 7 años)
 *                 default: 2555
 *     responses:
 *       200:
 *         description: Limpieza completada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Limpieza completada. 5 de 10 facturas antiguas eliminadas"
 *                 resultado:
 *                   type: object
 *                   properties:
 *                     eliminadas:
 *                       type: integer
 *                       description: Número de facturas eliminadas
 *                     total:
 *                       type: integer
 *                       description: Total de facturas procesadas
 *                 diasRetencion:
 *                 type: integer
 *                 description: Días de retención utilizados
 *       400:
 *         description: Días de retención inválidos
 */
router.post('/limpiar-antiguas', 
  authenticateToken, 
  bulkLimiter, // ✅ Límite en operaciones masivas
  facturaController.limpiarFacturasAntiguas
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
 *               fecha_vencimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento de la factura (opcional)
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
 *               metodo_pago_id:
 *                 type: string
 *                 description: ID del método de pago seleccionado (opcional)
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
  createLimiter, // ✅ Límite en actualización de facturas
  actualizarFacturaValidator,
  validateRequest,
  facturaController.actualizarFactura
);

/**
 * @swagger
 * /api/facturas/{id}/pdf:
 *   get:
 *     summary: Obtener PDF de factura con URL corta
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       302:
 *         description: Redirección al PDF
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:id/pdf',
  authenticateToken,
  facturaController.redirectToPdf
);

/**
 * @swagger
 * /api/facturas/pdf/{uuid}:
 *   get:
 *     summary: Obtener PDF de factura pública con URL corta
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID público de la factura
 *     responses:
 *       302:
 *         description: Redirección al PDF
 *       404:
 *         description: Factura no encontrada
 */
router.get('/pdf/:uuid',
  facturaController.redirectToPdfPublic
);

/**
 * @swagger
 * /api/facturas/{id}/pdf/public:
 *   get:
 *     summary: Obtener PDF de factura con URL corta (sin autenticación)
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       302:
 *         description: Redirección al PDF
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:id/pdf/public',
  facturaController.redirectToPdfPublicById
);

/**
 * @swagger
 * /api/facturas/{id}/regenerate-pdf:
 *   post:
 *     summary: Regenerar el PDF de una factura
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
 *         description: PDF regenerado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PDF regenerado exitosamente
 *                 factura:
 *                   $ref: '#/components/schemas/Factura'
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error al regenerar PDF
 */
router.post('/:id/regenerate-pdf',
  authenticateToken,
  uploadLimiter, // ✅ Límite en regeneración de PDFs
  validateUUID('id'),
  facturaController.regenerarPdfFactura
);

/**
 * @swagger
 * /api/facturas/{id}/convertir-borrador:
 *   post:
 *     summary: Convertir un borrador en factura pendiente
 *     tags: [Facturas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura borrador
 *     responses:
 *       200:
 *         description: Borrador convertido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Borrador convertido exitosamente a factura pendiente"
 *                 factura:
 *                   $ref: '#/components/schemas/Factura'
 *       400:
 *         description: La factura no es un borrador
 *       404:
 *         description: Factura no encontrada
 */
router.post('/:id/convertir-borrador', 
  authenticateToken, 
  validateUUID('id'),
  facturaController.convertirBorradorEnFactura
);

/**
 * @swagger
 * /api/facturas/{id}/soft-delete:
 *   post:
 *     summary: Mover factura a papelera (soft delete)
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
 *         description: Factura movida a papelera exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Factura movida a papelera exitosamente"
 *                 factura:
 *                   $ref: '#/components/schemas/Factura'
 *                 deleted_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: La factura ya ha sido eliminada
 *       404:
 *         description: Factura no encontrada
 */
router.post('/:id/soft-delete', 
  authenticateToken, 
  validateUUID('id'),
  facturaController.softDeleteFactura
);

/**
 * @swagger
 * /api/facturas/{id}/hard-delete:
 *   delete:
 *     summary: Eliminar factura permanentemente (hard delete)
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
 *         description: Factura eliminada permanentemente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Factura eliminada permanentemente"
 *                 factura_id:
 *                   type: string
 *                 deleted_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Factura no encontrada
 */
router.delete('/:id/hard-delete', 
  authenticateToken, 
  validateUUID('id'),
  facturaController.hardDeleteFactura
);

/**
 * @swagger
 * /api/facturas/{id}/restore:
 *   post:
 *     summary: Restaurar factura desde la papelera
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
 *         description: Factura restaurada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Factura restaurada exitosamente"
 *                 factura:
 *                   $ref: '#/components/schemas/Factura'
 *       404:
 *         description: Factura no encontrada en papelera
 */
router.post('/:id/restore', 
  authenticateToken, 
  validateUUID('id'),
  facturaController.restoreFactura
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
  deleteLimiter,
  validateUUID('id'),
  facturaController.eliminarFactura
);

export default router; 