import axios from 'axios';

class EmailService {
    constructor() {
        this.apiKey = process.env.BREVO_API_KEY;
        this.baseURL = 'https://api.brevo.com/v3';
        this.fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@tu-dominio.com';
        this.fromName = process.env.BREVO_FROM_NAME || 'Tu Sistema CRM';
        
        if (!this.apiKey) {
            console.error('❌ BREVO_API_KEY no configurada');
            throw new Error('BREVO_API_KEY es requerida');
        }
    }

    /**
     * Enviar email usando la API de Brevo
     * @param {Object} emailData - Datos del email
     * @param {string} emailData.to - Email destinatario
     * @param {string} emailData.subject - Asunto del email
     * @param {string} emailData.htmlContent - Contenido HTML del email
     * @param {string} emailData.textContent - Contenido de texto plano (opcional)
     * @param {string} emailData.templateId - ID de plantilla (opcional)
     * @param {Object} emailData.params - Parámetros para la plantilla (opcional)
     * @returns {Promise<Object>} Respuesta de la API
     */
    async sendEmail(emailData) {
        try {
            const payload = {
                sender: {
                    name: this.fromName,
                    email: this.fromEmail
                },
                to: [
                    {
                        email: emailData.to,
                        name: emailData.toName || emailData.to
                    }
                ],
                subject: emailData.subject,
                htmlContent: emailData.htmlContent,
                textContent: emailData.textContent || this.stripHtml(emailData.htmlContent)
            };

            // Si se especifica templateId, usar plantilla
            if (emailData.templateId) {
                payload.templateId = emailData.templateId;
                payload.params = emailData.params || {};
            }

            const response = await axios.post(`${this.baseURL}/smtp/email`, payload, {
                headers: {
                    'accept': 'application/json',
                    'api-key': this.apiKey,
                    'content-type': 'application/json'
                }
            });

            console.log('✅ Email enviado exitosamente:', {
                to: emailData.to,
                subject: emailData.subject,
                messageId: response.data.messageId
            });

            return {
                success: true,
                messageId: response.data.messageId,
                data: response.data
            };

        } catch (error) {
            console.error('❌ Error al enviar email:', {
                to: emailData.to,
                subject: emailData.subject,
                error: error.response?.data || error.message
            });

            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Enviar email de bienvenida a un nuevo cliente
     * @param {Object} cliente - Datos del cliente
     * @returns {Promise<Object>} Resultado del envío
     */
    async sendWelcomeEmail(cliente) {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Bienvenido a nuestro sistema</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido ${cliente.nombre}!</h1>
                    </div>
                    <div class="content">
                        <p>Hola ${cliente.nombre},</p>
                        <p>Te damos la bienvenida a nuestro sistema. Estamos emocionados de tenerte como cliente.</p>
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                        <p>¡Saludos!</p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático del sistema CRM</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail({
            to: cliente.email,
            toName: cliente.nombre,
            subject: `¡Bienvenido ${cliente.nombre}!`,
            htmlContent: htmlContent
        });
    }

    /**
     * Enviar email de factura
     * @param {Object} factura - Datos de la factura
     * @param {Object} cliente - Datos del cliente
     * @returns {Promise<Object>} Resultado del envío
     */
    async sendInvoiceEmail(factura, cliente) {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Factura ${factura.numero}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .invoice-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Factura ${factura.numero}</h1>
                    </div>
                    <div class="content">
                        <p>Hola ${cliente.nombre},</p>
                        <p>Adjunto encontrarás tu factura:</p>
                        <div class="invoice-details">
                            <p><strong>Número:</strong> ${factura.numero}</p>
                            <p><strong>Fecha:</strong> ${new Date(factura.fecha).toLocaleDateString()}</p>
                            <p><strong>Total:</strong> $${factura.total}</p>
                        </div>
                        <p>Gracias por tu preferencia.</p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático del sistema CRM</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail({
            to: cliente.email,
            toName: cliente.nombre,
            subject: `Factura ${factura.numero} - ${cliente.nombre}`,
            htmlContent: htmlContent
        });
    }

    /**
     * Enviar email de recordatorio
     * @param {Object} cliente - Datos del cliente
     * @param {string} mensaje - Mensaje de recordatorio
     * @returns {Promise<Object>} Resultado del envío
     */
    async sendReminderEmail(cliente, mensaje) {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Recordatorio</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .reminder { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Recordatorio</h1>
                    </div>
                    <div class="content">
                        <p>Hola ${cliente.nombre},</p>
                        <div class="reminder">
                            <p>${mensaje}</p>
                        </div>
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático del sistema CRM</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail({
            to: cliente.email,
            toName: cliente.nombre,
            subject: `Recordatorio - ${cliente.nombre}`,
            htmlContent: htmlContent
        });
    }

    /**
     * Obtener estadísticas de envíos
     * @returns {Promise<Object>} Estadísticas de la cuenta
     */
    async getAccountStats() {
        try {
            const response = await axios.get(`${this.baseURL}/account`, {
                headers: {
                    'accept': 'application/json',
                    'api-key': this.apiKey
                }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Error al obtener estadísticas:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Convertir HTML a texto plano
     * @param {string} html - Contenido HTML
     * @returns {string} Texto plano
     */
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    /**
     * Validar email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

export default EmailService;
