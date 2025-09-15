import axios from 'axios';

class EmailService {
    constructor() {
        this.apiKey = process.env.BREVO_API_KEY;
        this.baseURL = 'https://api.brevo.com/v3';
        this.fromEmail = process.env.BREVO_FROM_EMAIL || 'boramas12@gmail.com';
        this.fromName = process.env.BREVO_FROM_NAME || 'CRMPRO';
        
        if (!this.apiKey) {
            console.warn('⚠️ BREVO_API_KEY no configurada - Servicio de email deshabilitado');
            this.disabled = true;
        } else {
            this.disabled = false;
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
        if (this.disabled) {
            console.warn('⚠️ Servicio de email deshabilitado - BREVO_API_KEY no configurada');
            return {
                success: false,
                error: 'Servicio de email deshabilitado - BREVO_API_KEY no configurada'
            };
        }

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
     * Enviar notificación de nuevo lead
     * @param {Object} cliente - Datos del lead
     * @param {string} userEmail - Email del usuario que recibirá la notificación
     * @returns {Promise<Object>} Resultado del envío
     */
    async sendNewLeadNotification(cliente, userEmail) {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Nuevo Lead Recibido</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2c3e50; margin: 0; padding: 0; background-color: #f8f9fa; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
                    .header { background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .header .subtitle { margin: 8px 0 0 0; font-size: 16px; opacity: 0.9; }
                    .content { padding: 30px 25px; }
                    .lead-info { background: #ffffff; border: 2px solid #e9ecef; border-radius: 12px; padding: 25px; margin: 20px 0; }
                    .lead-name { font-size: 24px; font-weight: 700; color: #2c3e50; margin: 0 0 20px 0; text-align: center; }
                    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                    .contact-item { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
                    .contact-label { font-size: 12px; text-transform: uppercase; color: #6c757d; font-weight: 600; margin-bottom: 5px; }
                    .contact-value { font-size: 16px; font-weight: 600; color: #2c3e50; }
                    .action-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
                    .action-btn { display: inline-block; padding: 15px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; transition: all 0.3s ease; }
                    .call-btn { background: #28a745; color: white; }
                    .whatsapp-btn { background: #25d366; color: white; }
                    .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
                    .quick-info { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 8px; margin: 20px 0; }
                    .quick-info h4 { margin: 0 0 8px 0; color: #1976d2; font-size: 16px; }
                    .quick-info p { margin: 0; color: #1976d2; font-size: 14px; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef; }
                    .footer a { color: #2c3e50; text-decoration: none; }
                    @media (max-width: 600px) {
                        .contact-grid { grid-template-columns: 1fr; }
                        .action-buttons { grid-template-columns: 1fr; }
                        .header h1 { font-size: 24px; }
                        .content { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔥 Nuevo Lead</h1>
                        <p class="subtitle">Contacta ahora para maximizar la conversión</p>
                    </div>
                    
                    <div class="content">
                        <div class="lead-info">
                            <div class="lead-name">${cliente.nombre}</div>
                            
                            <div class="contact-grid">
                                <div class="contact-item">
                                    <div class="contact-label">📧 Email</div>
                                    <div class="contact-value">${cliente.email || 'No disponible'}</div>
                                </div>
                                <div class="contact-item">
                                    <div class="contact-label">📱 Teléfono</div>
                                    <div class="contact-value">${cliente.telefono || 'No disponible'}</div>
                                </div>
                            </div>
                            
                            <div class="action-buttons">
                                ${cliente.telefono ? `
                                    <a href="tel:${cliente.telefono}" class="action-btn call-btn">
                                        📞 Llamar Ahora
                                    </a>
                                ` : `
                                    <div class="action-btn" style="background: #6c757d; color: white; cursor: not-allowed;">
                                        📞 Sin Teléfono
                                    </div>
                                `}
                                
                                ${cliente.telefono ? `
                                    <a href="https://wa.me/${cliente.telefono.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(cliente.nombre)},%20gracias%20por%20contactarte%20con%20nosotros.%20¿Qué%20información%20o%20servicio%20estás%20buscando?" class="action-btn whatsapp-btn">
                                        💬 WhatsApp
                                    </a>
                                ` : `
                                    <div class="action-btn" style="background: #6c757d; color: white; cursor: not-allowed;">
                                        💬 Sin Teléfono
                                    </div>
                                `}
                            </div>
                        </div>
                        
                        <div class="quick-info">
                            <h4>💡 Información del Lead</h4>
                            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')} a las ${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}</p>
                            <p><strong>Categoría:</strong> ${cliente.categoria || 'Lead General'}</p>
                            <p><strong>Origen:</strong> Funnel Web</p>
                        </div>
                        
                        <div style="text-align: center; margin: 25px 0;">
                            <a href="https://leadspropr.netlify.app" style="display: inline-block; background: #2c3e50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                                📊 Ver en CRM
                            </a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Este es un email automático del sistema CRM</p>
                        <p>Portal: <a href="https://leadspropr.netlify.app">leadspropr.netlify.app</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail({
            to: userEmail,
            toName: 'Usuario',
            subject: `🔥 Nuevo Lead: ${cliente.nombre}`,
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
        if (this.disabled) {
            console.warn('⚠️ Servicio de email deshabilitado - BREVO_API_KEY no configurada');
            return {
                success: false,
                error: 'Servicio de email deshabilitado - BREVO_API_KEY no configurada'
            };
        }

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
