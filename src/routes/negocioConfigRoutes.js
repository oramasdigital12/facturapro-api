import express from 'express';
import { body } from 'express-validator';
import { obtenerNegocioConfig, guardarNegocioConfig } from '../controllers/negocioConfigController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/negocio-config:
 *   get:
 *     summary: Obtener la configuración del negocio del usuario autenticado
 *     tags: [NegocioConfig]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración del negocio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/', authenticateToken, obtenerNegocioConfig);

/**
 * @swagger
 * /api/negocio-config:
 *   post:
 *     summary: Crear o actualizar la configuración del negocio
 *     tags: [NegocioConfig]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_negocio:
 *                 type: string
 *               tipo_negocio:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Configuración guardada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', authenticateToken, [
  body('nombre_negocio').notEmpty().trim(),
  body('tipo_negocio').optional().trim(),
  body('telefono').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('direccion').optional().trim()
], guardarNegocioConfig);

export default router; 