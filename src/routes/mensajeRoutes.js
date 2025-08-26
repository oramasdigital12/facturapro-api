import express from 'express';
import {
  crearMensaje,
  listarMensajes,
  listarMensajesPorModulo,
  obtenerMensaje,
  actualizarMensaje,
  eliminarMensaje,
  generarLinkWhatsApp
} from '../controllers/mensajeController.js';
import { authenticateToken } from '../middlewares/auth.js';
import {
  crearMensajeValidations,
  actualizarMensajeValidations,
  moduloParamValidation,
  generarLinkWhatsAppValidations,
  idParamValidation
} from '../validators/mensajeValidator.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Mensaje:
 *       type: object
 *       required:
 *         - texto
 *       properties:
 *         id:
 *           type: string
 *           description: ID autogenerado del mensaje
 *         texto:
 *           type: string
 *           description: Contenido del mensaje
 *         modulo:
 *           type: string
 *           description: Módulo al que pertenece el mensaje (general, facturas, clientes, ventas, tareas)
 *           enum: [general, facturas, clientes, ventas, tareas]
 *         user_id:
 *           type: string
 *           description: ID del usuario propietario del mensaje
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
 *             required:
 *               - texto
 *             properties:
 *               texto:
 *                 type: string
 *                 description: Contenido del mensaje
 *               modulo:
 *                 type: string
 *                 description: Módulo al que pertenece el mensaje
 *                 enum: [general, facturas, clientes, ventas, tareas]
 *                 default: general
 *     responses:
 *       201:
 *         description: Mensaje creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensaje'
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', authenticateToken, crearMensajeValidations, crearMensaje);

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
 *                 $ref: '#/components/schemas/Mensaje'
 */
router.get('/', authenticateToken, listarMensajes);

/**
 * @swagger
 * /api/mensajes/modulo/{modulo}:
 *   get:
 *     summary: Listar mensajes predeterminados por módulo específico
 *     tags: [Mensajes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: modulo
 *         schema:
 *           type: string
 *           enum: [general, facturas, clientes, ventas, tareas]
 *         required: true
 *         description: Módulo para filtrar los mensajes
 *     responses:
 *       200:
 *         description: Lista de mensajes del módulo especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mensaje'
 *       400:
 *         description: Módulo inválido
 */
router.get('/modulo/:modulo', authenticateToken, moduloParamValidation, listarMensajesPorModulo);

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
 *               $ref: '#/components/schemas/Mensaje'
 *       404:
 *         description: Mensaje no encontrado
 *       400:
 *         description: ID inválido
 */
router.get('/:id', authenticateToken, idParamValidation, obtenerMensaje);

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
 *             required:
 *               - texto
 *             properties:
 *               texto:
 *                 type: string
 *                 description: Nuevo contenido del mensaje
 *               modulo:
 *                 type: string
 *                 description: Nuevo módulo del mensaje
 *                 enum: [general, facturas, clientes, ventas, tareas]
 *     responses:
 *       200:
 *         description: Mensaje actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensaje'
 *       404:
 *         description: Mensaje no encontrado
 *       400:
 *         description: Datos de entrada inválidos
 */
router.put('/:id', authenticateToken, idParamValidation, actualizarMensajeValidations, actualizarMensaje);

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
 *         description: Mensaje eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mensaje eliminado exitosamente"
 *       404:
 *         description: Mensaje no encontrado
 *       400:
 *         description: ID inválido
 */
router.delete('/:id', authenticateToken, idParamValidation, eliminarMensaje);

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
 *       404:
 *         description: Mensaje no encontrado
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/whatsapp/link', authenticateToken, generarLinkWhatsAppValidations, generarLinkWhatsApp);

export default router; 