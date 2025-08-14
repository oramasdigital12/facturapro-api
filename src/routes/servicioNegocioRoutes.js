import express from 'express';
import { body } from 'express-validator';
import { crearServicio, listarServicios, actualizarServicio, eliminarServicio } from '../controllers/servicioNegocioController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: ServicioNegocio
 *     description: Gestión de servicios de negocio
 */

/**
 * @swagger
 * /api/servicios-negocio:
 *   post:
 *     summary: Crear un nuevo servicio
 *     tags: [ServicioNegocio]
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
 *               precio:
 *                 type: number
 *               categoria_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Servicio creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicioNegocio'
 */
router.post('/', authenticateToken, [body('nombre').notEmpty().trim(), body('precio').isNumeric()], crearServicio);

/**
 * @swagger
 * /api/servicios-negocio:
 *   get:
 *     summary: Listar servicios del usuario (opcional filtrar por categoria)
 *     tags: [ServicioNegocio]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de categoría
 *     responses:
 *       200:
 *         description: Lista de servicios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServicioNegocio'
 */
router.get('/', authenticateToken, listarServicios);

/**
 * @swagger
 * /api/servicios-negocio/{id}:
 *   put:
 *     summary: Actualizar un servicio
 *     tags: [ServicioNegocio]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               categoria_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicioNegocio'
 */
router.put('/:id', authenticateToken, [body('nombre').notEmpty().trim(), body('precio').isNumeric()], actualizarServicio);

/**
 * @swagger
 * /api/servicios-negocio/{id}:
 *   delete:
 *     summary: Eliminar un servicio
 *     tags: [ServicioNegocio]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Servicio eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
router.delete('/:id', authenticateToken, eliminarServicio);

export default router; 