import express from 'express';
import { body } from 'express-validator';
import { crearCategoria, listarCategorias, actualizarCategoria, eliminarCategoria } from '../controllers/categoriaNegocioController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: CategoriaNegocio
 *     description: Gestión de categorías de negocio
 */
/**
 * @swagger
 * /api/categorias-negocio:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [CategoriaNegocio]
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
 *               orden:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaNegocio'
 */
// Crear categoría
router.post('/', authenticateToken, [body('nombre').notEmpty().trim()], crearCategoria);

/**
 * @swagger
 * /api/categorias-negocio:
 *   get:
 *     summary: Listar categorías del usuario
 *     tags: [CategoriaNegocio]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoriaNegocio'
 */
// Listar categorías
router.get('/', authenticateToken, listarCategorias);

/**
 * @swagger
 * /api/categorias-negocio/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [CategoriaNegocio]
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
 *               orden:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaNegocio'
 */
// Actualizar categoría
router.put('/:id', authenticateToken, [body('nombre').notEmpty().trim()], actualizarCategoria);

/**
 * @swagger
 * /api/categorias-negocio/{id}:
 *   delete:
 *     summary: Eliminar una categoría
 *     tags: [CategoriaNegocio]
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
 *         description: Categoría eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
// Eliminar categoría
router.delete('/:id', authenticateToken, eliminarCategoria);

export default router; 