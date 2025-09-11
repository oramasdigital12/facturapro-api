import EmailService from '../services/emailService.js';
import emailTemplates from '../services/emailTemplates.js';
import { validationResult } from 'express-validator';

/**
 * Controlador para manejar operaciones de email
 */
export class EmailController {
    constructor() {
        this.emailService = new EmailService();
    }

    /**
     * Enviar email personalizado
     */
    async sendCustomEmail(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { to, subject, htmlContent, textContent } = req.body;

            const result = await this.emailService.sendEmail({
                to,
                subject,
                htmlContent,
                textContent
            });

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Email enviado exitosamente',
                    data: {
                        messageId: result.messageId
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al enviar email',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error en sendCustomEmail:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Enviar email de bienvenida
     */
    async sendWelcomeEmail(req, res) {
        try {
            const { cliente } = req.body;

            if (!cliente || !cliente.email || !cliente.nombre) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos del cliente requeridos (email, nombre)'
                });
            }

            const result = await this.emailService.sendWelcomeEmail(cliente);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Email de bienvenida enviado exitosamente',
                    data: {
                        messageId: result.messageId
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al enviar email de bienvenida',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error en sendWelcomeEmail:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Enviar email de factura
     */
    async sendInvoiceEmail(req, res) {
        try {
            const { factura, cliente } = req.body;

            if (!factura || !cliente || !cliente.email || !cliente.nombre) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de factura y cliente requeridos'
                });
            }

            const result = await this.emailService.sendInvoiceEmail(factura, cliente);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Email de factura enviado exitosamente',
                    data: {
                        messageId: result.messageId
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al enviar email de factura',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error en sendInvoiceEmail:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Enviar email de recordatorio
     */
    async sendReminderEmail(req, res) {
        try {
            const { cliente, mensaje, tipo = 'general' } = req.body;

            if (!cliente || !cliente.email || !cliente.nombre || !mensaje) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos del cliente y mensaje requeridos'
                });
            }

            const result = await this.emailService.sendReminderEmail(cliente, mensaje);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Email de recordatorio enviado exitosamente',
                    data: {
                        messageId: result.messageId
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al enviar email de recordatorio',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error en sendReminderEmail:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de la cuenta de email
     */
    async getEmailStats(req, res) {
        try {
            const result = await this.emailService.getAccountStats();

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Estadísticas obtenidas exitosamente',
                    data: result.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener estadísticas',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error en getEmailStats:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Probar conexión con Brevo
     */
    async testConnection(req, res) {
        try {
            const result = await this.emailService.getAccountStats();

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Conexión con Brevo exitosa',
                    data: {
                        connected: true,
                        account: result.data
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error de conexión con Brevo',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error en testConnection:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export default EmailController;
