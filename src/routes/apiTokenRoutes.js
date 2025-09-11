import express from 'express';
import * as apiTokenController from '../controllers/apiTokenController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateRequest, validateUUID } from '../middlewares/validation.js';
import { createLimiter } from '../middlewares/rateLimiter.js';
import { crearApiTokenValidator } from '../validators/apiTokenValidator.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiToken:
 *       type: object
 *       required:
 *         - nombre
 *         - duracion_dias
 *       properties:
 *         id:
 *           type: string
 *           description: ID autogenerado del token
 *         nombre:
 *           type: string
 *           description: Nombre descriptivo del token
 *         token:
 *           type: string
 *           description: Token de acceso (solo se muestra en la creación)
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del token
 *         fecha_expiracion:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración del token
 *         permisos:
 *           type: array
 *           items:
 *             type: string
 *             enum: [read, write, delete, admin]
 *           description: Permisos del token
 *         activo:
 *           type: boolean
 *           description: Estado del token
 *         ultimo_uso:
 *           type: string
 *           format: date-time
 *           description: Última vez que se usó el token
 *         descripcion:
 *           type: string
 *           description: Descripción del token
 *     ApiTokenCreate:
 *       type: object
 *       required:
 *         - nombre
 *         - duracion_dias
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre descriptivo del token
 *         duracion_dias:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           description: Duración del token en días
 *         permisos:
 *           type: array
 *           items:
 *             type: string
 *             enum: [read, write, delete, admin]
 *           description: Permisos del token
 *         descripcion:
 *           type: string
 *           description: Descripción del token
 */

/**
 * @swagger
 * /api/auth/api-tokens:
 *   post:
 *     summary: Crear un nuevo API token
 *     tags: [API Tokens]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiTokenCreate'
 *     responses:
 *       201:
 *         description: API token creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ApiToken'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/',
  authenticateToken,
  createLimiter,
  crearApiTokenValidator,
  validateRequest,
  apiTokenController.crearApiToken
);

/**
 * @swagger
 * /api/auth/api-tokens:
 *   get:
 *     summary: Obtener todos los API tokens del usuario
 *     tags: [API Tokens]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de API tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApiToken'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/',
  authenticateToken,
  apiTokenController.obtenerApiTokens
);

/**
 * @swagger
 * /api/auth/api-tokens/{id}/revocar:
 *   delete:
 *     summary: Revocar un API token específico
 *     tags: [API Tokens]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del API token
 *     responses:
 *       200:
 *         description: API token revocado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: API token no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id/revocar',
  authenticateToken,
  validateUUID('id'),
  apiTokenController.revocarApiToken
);

/**
 * @swagger
 * /api/auth/api-tokens/revocar-todos:
 *   delete:
 *     summary: Revocar todos los API tokens del usuario
 *     tags: [API Tokens]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Todos los API tokens revocados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/revocar-todos',
  authenticateToken,
  apiTokenController.revocarTodosApiTokens
);

/**
 * @swagger
 * /api/auth/api-tokens/limpiar-expirados:
 *   delete:
 *     summary: Limpiar tokens expirados
 *     tags: [API Tokens]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tokens expirados limpiados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/limpiar-expirados',
  authenticateToken,
  apiTokenController.limpiarTokensExpirados
);

export default router;
