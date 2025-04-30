import express from 'express';
import { body } from 'express-validator';
import {
  crearMensaje,
  listarMensajes,
  obtenerMensaje,
  actualizarMensaje,
  eliminarMensaje,
  generarLinkWhatsApp
} from '../controllers/mensajeController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Mensaje:
 *       type: object
 *       required:
 *         - cliente_id
 *         - contenido
 *       properties:
 *         id:
 *           type: string
 *           description: ID autogenerado del mensaje
 *         cliente_id:
 *           type: string
 *           description: ID del cliente al que se envía el mensaje
 *         contenido:
 *           type: string
 *           description: Contenido del mensaje
 *         estado:
 *           type: string
 *           enum: [enviado, pendiente, error]
 *           description: Estado del mensaje
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación
 */

/**
 * @swagger
 * /api/mensajes:
 *   post:
 *     summary: Crear un mensaje predeterminado
 *     tags: [Mensajes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               texto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mensaje creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', authenticateToken, [
  body('texto').notEmpty().trim()
], crearMensaje);

/**
 * @swagger
 * /api/mensajes:
 *   get:
 *     summary: Listar todos los mensajes predeterminados del usuario
 *     tags: [Mensajes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensajes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', authenticateToken, listarMensajes);

/**
 * @swagger
 * /api/mensajes/{id}:
 *   get:
 *     summary: Obtener un mensaje predeterminado por ID
 *     tags: [Mensajes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del mensaje
 *     responses:
 *       200:
 *         description: Mensaje encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', authenticateToken, obtenerMensaje);

/**
 * @swagger
 * /api/mensajes/{id}:
 *   put:
 *     summary: Actualizar un mensaje predeterminado
 *     tags: [Mensajes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del mensaje
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               texto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mensaje actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', authenticateToken, [
  body('texto').notEmpty().trim()
], actualizarMensaje);

/**
 * @swagger
 * /api/mensajes/{id}:
 *   delete:
 *     summary: Eliminar un mensaje predeterminado
 *     tags: [Mensajes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del mensaje
 *     responses:
 *       200:
 *         description: Mensaje eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete('/:id', authenticateToken, eliminarMensaje);

/**
 * @swagger
 * /api/mensajes/whatsapp/link:
 *   post:
 *     summary: Generar link directo de WhatsApp
 *     tags: [Mensajes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - telefono
 *               - mensajeId
 *             properties:
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono del destinatario
 *               mensajeId:
 *                 type: string
 *                 description: ID del mensaje predeterminado a usar
 *     responses:
 *       200:
 *         description: Link generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 link:
 *                   type: string
 *                   description: URL directa de WhatsApp
 */
router.post('/whatsapp/link',
  authenticateToken,
  [
    body('telefono').notEmpty(),
    body('mensajeId').notEmpty()
  ],
  generarLinkWhatsApp
);

export default router; 