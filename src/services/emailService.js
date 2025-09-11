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
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; position: relative; overflow: hidden; }
                    .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
                    .header .subtitle { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
                    .content { padding: 40px 30px; }
                    .lead-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 15px; margin: 20px 0; position: relative; overflow: hidden; }
                    .lead-card::before { content: '🔥'; position: absolute; top: 15px; right: 20px; font-size: 24px; opacity: 0.3; }
                    .lead-name { font-size: 28px; font-weight: 700; margin: 0 0 15px 0; }
                    .lead-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                    .lead-detail { background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 10px; }
                    .lead-detail-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 5px; }
                    .lead-detail-value { font-size: 16px; font-weight: 600; }
                    .cta-section { text-align: center; margin: 40px 0; }
                    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3); }
                    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
                    .stat { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; }
                    .stat-number { font-size: 24px; font-weight: 700; color: #667eea; margin-bottom: 5px; }
                    .stat-label { font-size: 12px; text-transform: uppercase; color: #666; letter-spacing: 1px; }
                    .footer { background-color: #f8f9fa; padding: 30px; text-align: center; font-size: 12px; color: #666; }
                    .footer a { color: #667eea; text-decoration: none; }
                    .urgency { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center; font-weight: 600; }
                    @media (max-width: 600px) {
                        .lead-details { grid-template-columns: 1fr; }
                        .stats { grid-template-columns: 1fr; }
                        .header h1 { font-size: 24px; }
                        .content { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔥 Nuevo Lead Recibido</h1>
                        <p class="subtitle">¡No dejes pasar esta oportunidad!</p>
                    </div>
                    
                    <div class="content">
                        <div class="urgency">
                            ⚡ Nuevo lead desde tu funnel web - ¡Contacta ahora!
                        </div>
                        
                        <div class="lead-card">
                            <div class="lead-name">${cliente.nombre}</div>
                            <div class="lead-details">
                                <div class="lead-detail">
                                    <div class="lead-detail-label">Teléfono</div>
                                    <div class="lead-detail-value">${cliente.telefono || 'No proporcionado'}</div>
                                </div>
                                <div class="lead-detail">
                                    <div class="lead-detail-label">Categoría</div>
                                    <div class="lead-detail-value">${cliente.categoria || 'Lead'}</div>
                                </div>
                                <div class="lead-detail">
                                    <div class="lead-detail-label">Fecha</div>
                                    <div class="lead-detail-value">${new Date().toLocaleDateString('es-ES')}</div>
                                </div>
                                <div class="lead-detail">
                                    <div class="lead-detail-label">Origen</div>
                                    <div class="lead-detail-value">Funnel Web</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stats">
                            <div class="stat">
                                <div class="stat-number">1</div>
                                <div class="stat-label">Nuevo Lead</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}</div>
                                <div class="stat-label">Hora de llegada</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">🔥</div>
                                <div class="stat-label">Prioridad Alta</div>
                            </div>
                        </div>
                        
                        <div class="cta-section">
                            <h3 style="margin-bottom: 20px; color: #333;">🚀 Gestiona este lead ahora</h3>
                            <a href="https://leadspropr.netlify.app" class="cta-button">
                                📊 Ir al Portal de Leads
                            </a>
                            <p style="margin-top: 15px; color: #666; font-size: 14px;">
                                Accede a tu panel de control para gestionar todos tus leads
                            </p>
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 30px 0;">
                            <h4 style="margin: 0 0 10px 0; color: #1976d2;">💡 Consejo de ventas:</h4>
                            <p style="margin: 0; color: #1976d2; font-size: 14px;">
                                Este lead vino desde tu funnel web. Los leads responden mejor en las primeras 5 minutos. ¡Llama ahora para maximizar tus conversiones!
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Este es un email automático del sistema CRM</p>
                        <p>Portal de Leads: <a href="https://leadspropr.netlify.app">leadspropr.netlify.app</a></p>
                        <p>Si no deseas recibir estas notificaciones, puedes contactarnos para darte de baja.</p>
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
