import express from 'express';
import * as clienteController from '../controllers/clienteController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateRequest, validateUUID } from '../middlewares/validation.js';
import { createLimiter, deleteLimiter, bulkLimiter } from '../middlewares/rateLimiter.js';
import { crearClienteValidator, actualizarClienteValidator } from '../validators/clienteValidator.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: string
 *           description: ID autogenerado del cliente
 *         nombre:
 *           type: string
 *           description: Nombre del cliente
 *         email:
 *           type: string
 *           format: email
 *           description: Email del cliente
 *         telefono:
 *           type: string
 *           description: Número de teléfono del cliente
 *         categoria:
 *           type: string
 *           enum: [activo, pendiente, por_vencer]
 *           description: Categoría del cliente
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento del cliente
 *         fecha_vencimiento:
 *           type: string
 *           format: date
 *           description: Fecha de vencimiento para seguimiento
 *         notas:
 *           type: string
 *           description: Notas adicionales sobre el cliente
 *         fecha_inicio:
 *           type: string
 *           format: date
 *           description: Fecha de inicio del cliente
 *         direccion:
 *           type: string
 *           description: Dirección del cliente
 *         sexo:
 *           type: string
 *           description: Sexo del cliente
 *         identification_number:
 *           type: string
 *           description: Número de identificación del cliente (letras y números)
 *         proviene:
 *           type: string
 *           description: Origen del cliente (ej: Facebook, WhatsApp, Meta Ads, etc.)
 */

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 */
router.post('/',
  authenticateToken,
  createLimiter,
  crearClienteValidator,
  validateRequest,
  clienteController.crearCliente
);

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Clientes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 */
router.get('/', authenticateToken, clienteController.obtenerClientes);

/**
 * @swagger
 * /api/clientes/buscar:
 *   get:
 *     summary: Buscar clientes por nombre
 *     tags: [Clientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre o parte del nombre a buscar
 *     responses:
 *       200:
 *         description: Lista de clientes encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 */
router.get('/buscar', 
  authenticateToken, 
  clienteController.buscarClientes
);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 */
router.get('/:id', 
  authenticateToken, 
  validateUUID('id'),
  clienteController.obtenerCliente
);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Clientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 */
router.put('/:id',
  authenticateToken,
  validateUUID('id'),
  actualizarClienteValidator,
  validateRequest,
  clienteController.actualizarCliente
);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Eliminar un cliente
 *     tags: [Clientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado
 */
router.delete('/:id', 
  authenticateToken, 
  validateUUID('id'),
  clienteController.eliminarCliente
);

/**
 * @swagger
 * /api/clientes/categoria/{categoria}:
 *   get:
 *     summary: Obtener clientes por categoría
 *     tags: [Clientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [activo, pendiente, por_vencer]
 *         required: true
 *         description: Categoría de los clientes
 *     responses:
 *       200:
 *         description: Lista de clientes por categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 */
router.get('/categoria/:categoria', 
  authenticateToken, 
  clienteController.obtenerClientesPorCategoria
);

export default router; 