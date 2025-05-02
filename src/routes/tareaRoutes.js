import express from 'express';
import { body } from 'express-validator';
import {
  crearTarea,
  listarTareas,
  obtenerTarea,
  actualizarTarea,
  cambiarEstadoTarea,
  eliminarTarea,
  contarTareasPorEstado
} from '../controllers/tareaController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tareas
 *   description: Endpoints para la agenda de tareas
 */

/**
 * @swagger
 * /api/tareas:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags: [Tareas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - fecha_hora
 *               - cliente_id
 *             properties:
 *               descripcion:
 *                 type: string
 *               fecha_hora:
 *                 type: string
 *                 format: date-time
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *               para_venta:
 *                 type: boolean
 *                 description: Indica si la tarea es para venta
 *     responses:
 *       201:
 *         description: Tarea creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', authenticateToken, [
  body('descripcion').notEmpty().trim(),
  body('fecha_hora').notEmpty().isISO8601(),
  body('cliente_id').notEmpty().isUUID(),
  body('para_venta').optional().isBoolean()
], crearTarea);

/**
 * @swagger
 * /api/tareas:
 *   get:
 *     summary: Listar tareas con filtros
 *     tags: [Tareas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, por_vencer, vencida, completada]
 *         description: Filtro de estado
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por descripción
 *     responses:
 *       200:
 *         description: Lista de tareas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', authenticateToken, listarTareas);

/**
 * @swagger
 * /api/tareas/contador:
 *   get:
 *     summary: Contar tareas por estado
 *     tags: [Tareas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Conteo de tareas por estado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pendiente:
 *                   type: integer
 *                 por_vencer:
 *                   type: integer
 *                 vencida:
 *                   type: integer
 *                 completada:
 *                   type: integer
 */
router.get('/contador', authenticateToken, contarTareasPorEstado);

/**
 * @swagger
 * /api/tareas/{id}:
 *   get:
 *     summary: Obtener detalles de una tarea
 *     tags: [Tareas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Detalles de la tarea
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', authenticateToken, obtenerTarea);

/**
 * @swagger
 * /api/tareas/{id}:
 *   put:
 *     summary: Actualizar una tarea
 *     tags: [Tareas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               fecha_hora:
 *                 type: string
 *                 format: date-time
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *               para_venta:
 *                 type: boolean
 *                 description: Indica si la tarea es para venta
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', authenticateToken, [
  body('descripcion').optional().trim(),
  body('fecha_hora').optional().isISO8601(),
  body('cliente_id').optional().isUUID(),
  body('para_venta').optional().isBoolean()
], actualizarTarea);

/**
 * @swagger
 * /api/tareas/{id}/estado:
 *   patch:
 *     summary: Cambiar el estado de una tarea
 *     tags: [Tareas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, completada]
 *     responses:
 *       200:
 *         description: Estado de la tarea actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.patch('/:id/estado', authenticateToken, [
  body('estado').notEmpty().isIn(['pendiente', 'completada'])
], cambiarEstadoTarea);

/**
 * @swagger
 * /api/tareas/{id}:
 *   delete:
 *     summary: Eliminar una tarea
 *     tags: [Tareas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Tarea eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete('/:id', authenticateToken, eliminarTarea);

export default router; 