import express from 'express';
import * as facturaController from '../controllers/facturaController.js';
import { validateUUID } from '../middlewares/validation.js';
import { createClient } from '@supabase/supabase-js';
import Factura from '../models/Factura.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'facturas';

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
  validateUUID('uuid'),
  facturaController.obtenerFacturaPublica
);

// Endpoint público para servir el PDF de la factura
router.get('/:uuid/pdf', async (req, res) => {
  try {
    // Buscar la factura por UUID
    const factura = await Factura.obtenerPorUuidPublico(req.params.uuid, supabase);
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    // Construir la ruta del PDF en storage
    const filePath = `${factura.user_id}/${factura.id}.pdf`;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    if (!data || !data.publicUrl) {
      return res.status(404).json({ error: 'PDF no encontrado' });
    }
    // Redirigir al PDF público
    return res.redirect(data.publicUrl);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener PDF', details: error.message });
  }
});

export default router; 