import express from 'express';
import { EmailController } from '../controllers/emailController.js';
import { authenticateApiToken } from '../middlewares/apiTokenAuth.js';
import { body } from 'express-validator';

const router = express.Router();
const emailController = new EmailController();

// Validaciones para email personalizado
const customEmailValidation = [
    body('to')
        .isEmail()
        .withMessage('Email destinatario debe ser válido'),
    body('subject')
        .notEmpty()
        .withMessage('El asunto es requerido')
        .isLength({ min: 1, max: 200 })
        .withMessage('El asunto debe tener entre 1 y 200 caracteres'),
    body('htmlContent')
        .notEmpty()
        .withMessage('El contenido HTML es requerido')
];

// Validaciones para email de bienvenida
const welcomeEmailValidation = [
    body('cliente.email')
        .isEmail()
        .withMessage('Email del cliente debe ser válido'),
    body('cliente.nombre')
        .notEmpty()
        .withMessage('El nombre del cliente es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
];

// Validaciones para email de factura
const invoiceEmailValidation = [
    body('cliente.email')
        .isEmail()
        .withMessage('Email del cliente debe ser válido'),
    body('cliente.nombre')
        .notEmpty()
        .withMessage('El nombre del cliente es requerido'),
    body('factura.numero')
        .notEmpty()
        .withMessage('El número de factura es requerido'),
    body('factura.total')
        .isNumeric()
        .withMessage('El total de la factura debe ser numérico')
];

// Validaciones para email de recordatorio
const reminderEmailValidation = [
    body('cliente.email')
        .isEmail()
        .withMessage('Email del cliente debe ser válido'),
    body('cliente.nombre')
        .notEmpty()
        .withMessage('El nombre del cliente es requerido'),
    body('mensaje')
        .notEmpty()
        .withMessage('El mensaje de recordatorio es requerido')
        .isLength({ min: 10, max: 1000 })
        .withMessage('El mensaje debe tener entre 10 y 1000 caracteres')
];

/**
 * @swagger
 * /api/email/test:
 *   get:
 *     summary: Probar conexión con Brevo
 *     tags: [Email]
 *     security:
 *       - ApiTokenAuth: []
 *     responses:
 *       200:
 *         description: Conexión exitosa
 *       500:
 *         description: Error de conexión
 */
router.get('/test', authenticateApiToken, emailController.testConnection.bind(emailController));

/**
 * @swagger
 * /api/email/stats:
 *   get:
 *     summary: Obtener estadísticas de la cuenta de email
 *     tags: [Email]
 *     security:
 *       - ApiTokenAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       500:
 *         description: Error al obtener estadísticas
 */
router.get('/stats', authenticateApiToken, emailController.getEmailStats.bind(emailController));

/**
 * @swagger
 * /api/email/custom:
 *   post:
 *     summary: Enviar email personalizado
 *     tags: [Email]
 *     security:
 *       - ApiTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - htmlContent
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Email destinatario
 *               subject:
 *                 type: string
 *                 description: Asunto del email
 *               htmlContent:
 *                 type: string
 *                 description: Contenido HTML del email
 *               textContent:
 *                 type: string
 *                 description: Contenido de texto plano (opcional)
 *     responses:
 *       200:
 *         description: Email enviado exitosamente
 *       400:
 *         description: Errores de validación
 *       500:
 *         description: Error al enviar email
 */
router.post('/custom', authenticateApiToken, customEmailValidation, emailController.sendCustomEmail.bind(emailController));

/**
 * @swagger
 * /api/email/welcome:
 *   post:
 *     summary: Enviar email de bienvenida
 *     tags: [Email]
 *     security:
 *       - ApiTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente
 *             properties:
 *               cliente:
 *                 type: object
 *                 required:
 *                   - email
 *                   - nombre
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   nombre:
 *                     type: string
 *     responses:
 *       200:
 *         description: Email de bienvenida enviado exitosamente
 *       400:
 *         description: Errores de validación
 *       500:
 *         description: Error al enviar email
 */
router.post('/welcome', authenticateApiToken, welcomeEmailValidation, emailController.sendWelcomeEmail.bind(emailController));

/**
 * @swagger
 * /api/email/invoice:
 *   post:
 *     summary: Enviar email de factura
 *     tags: [Email]
 *     security:
 *       - ApiTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - factura
 *               - cliente
 *             properties:
 *               factura:
 *                 type: object
 *                 required:
 *                   - numero
 *                   - total
 *                 properties:
 *                   numero:
 *                     type: string
 *                   total:
 *                     type: number
 *                   fecha:
 *                     type: string
 *                     format: date
 *                   items:
 *                     type: array
 *               cliente:
 *                 type: object
 *                 required:
 *                   - email
 *                   - nombre
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   nombre:
 *                     type: string
 *     responses:
 *       200:
 *         description: Email de factura enviado exitosamente
 *       400:
 *         description: Errores de validación
 *       500:
 *         description: Error al enviar email
 */
router.post('/invoice', authenticateApiToken, invoiceEmailValidation, emailController.sendInvoiceEmail.bind(emailController));

/**
 * @swagger
 * /api/email/reminder:
 *   post:
 *     summary: Enviar email de recordatorio
 *     tags: [Email]
 *     security:
 *       - ApiTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente
 *               - mensaje
 *             properties:
 *               cliente:
 *                 type: object
 *                 required:
 *                   - email
 *                   - nombre
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   nombre:
 *                     type: string
 *               mensaje:
 *                 type: string
 *                 description: Mensaje de recordatorio
 *               tipo:
 *                 type: string
 *                 enum: [general, urgent]
 *                 default: general
 *     responses:
 *       200:
 *         description: Email de recordatorio enviado exitosamente
 *       400:
 *         description: Errores de validación
 *       500:
 *         description: Error al enviar email
 */
router.post('/reminder', authenticateApiToken, reminderEmailValidation, emailController.sendReminderEmail.bind(emailController));

export default router;
