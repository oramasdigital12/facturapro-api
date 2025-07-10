import express from 'express';
import * as facturaController from '../controllers/facturaController.js';
import { validateUUID } from '../middlewares/validation.js';
import { searchLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /factura/{uuid}:
 *   get:
 *     summary: Obtener una factura pública por UUID (sin autenticación)
 *     tags: [Facturas Públicas]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID de la factura para vista pública
 *     responses:
 *       200:
 *         description: Factura encontrada (vista pública)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID de la factura
 *                 numero_factura:
 *                   type: integer
 *                   description: Número de factura
 *                 fecha_factura:
 *                   type: string
 *                   format: date
 *                   description: Fecha de la factura
 *                 fecha_pagada:
 *                   type: string
 *                   format: date
 *                   description: Fecha cuando se pagó la factura
 *                 estado:
 *                   type: string
 *                   enum: [pendiente, pagada, borrador]
 *                   description: Estado de la factura
 *                 subtotal:
 *                   type: number
 *                   description: Subtotal de la factura
 *                 impuesto:
 *                   type: number
 *                   description: Monto de impuestos
 *                 total:
 *                   type: number
 *                   description: Total de la factura
 *                 deposito:
 *                   type: number
 *                   description: Monto de depósito
 *                 balance_restante:
 *                   type: number
 *                   description: Balance restante por pagar
 *                 nota:
 *                   type: string
 *                   description: Nota adicional de la factura
 *                 terminos:
 *                   type: string
 *                   description: Términos y condiciones
 *                 logo_personalizado_url:
 *                   type: string
 *                   description: URL del logo personalizado
 *                 firma_url:
 *                   type: string
 *                   description: URL de la firma (opcional)
 *                 cliente:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telefono:
 *                       type: string
 *                     direccion:
 *                       type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       categoria:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                       precio_unitario:
 *                         type: number
 *                       cantidad:
 *                         type: integer
 *                       total:
 *                         type: number
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:uuid',
  searchLimiter,
  validateUUID('uuid'),
  facturaController.obtenerFacturaPublica
);

export default router; 