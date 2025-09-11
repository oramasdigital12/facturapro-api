/**
 * Plantillas de email predefinidas para el sistema CRM
 * Estas plantillas se pueden usar con el EmailService
 */

export const emailTemplates = {
    /**
     * Plantilla de bienvenida para nuevos clientes
     */
    welcome: (cliente) => ({
        subject: `¡Bienvenido ${cliente.nombre}!`,
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Bienvenido a nuestro sistema</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px 20px; }
                    .welcome-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                    .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido ${cliente.nombre}!</h1>
                        <p>Gracias por unirte a nuestro sistema</p>
                    </div>
                    <div class="content">
                        <p>Hola ${cliente.nombre},</p>
                        <p>Nos complace darte la bienvenida a nuestro sistema CRM. Estamos emocionados de tenerte como cliente y esperamos brindarte el mejor servicio.</p>
                        
                        <div class="welcome-box">
                            <h3>¿Qué puedes hacer ahora?</h3>
                            <ul>
                                <li>Acceder a tu perfil personalizado</li>
                                <li>Gestionar tus servicios</li>
                                <li>Recibir notificaciones importantes</li>
                                <li>Contactar con nuestro equipo de soporte</li>
                            </ul>
                        </div>
                        
                        <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para ayudarte.</p>
                        
                        <p>¡Bienvenido de nuevo!</p>
                        <p><strong>El equipo de CRM</strong></p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático del sistema CRM</p>
                        <p>Si no deseas recibir estos emails, puedes contactarnos para darte de baja.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    /**
     * Plantilla de factura
     */
    invoice: (factura, cliente) => ({
        subject: `Factura ${factura.numero} - ${cliente.nombre}`,
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Factura ${factura.numero}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%); color: white; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px 20px; }
                    .invoice-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    .invoice-table th { background-color: #f8f9fa; font-weight: bold; }
                    .total { background-color: #e3f2fd; padding: 15px; border-radius: 5px; text-align: right; font-size: 18px; font-weight: bold; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Factura ${factura.numero}</h1>
                        <p>Fecha: ${new Date(factura.fecha).toLocaleDateString()}</p>
                    </div>
                    <div class="content">
                        <p>Hola ${cliente.nombre},</p>
                        <p>Adjunto encontrarás los detalles de tu factura:</p>
                        
                        <div class="invoice-details">
                            <h3>Detalles de la Factura</h3>
                            <p><strong>Número:</strong> ${factura.numero}</p>
                            <p><strong>Fecha:</strong> ${new Date(factura.fecha).toLocaleDateString()}</p>
                            <p><strong>Cliente:</strong> ${cliente.nombre}</p>
                            <p><strong>Email:</strong> ${cliente.email}</p>
                        </div>
                        
                        <table class="invoice-table">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${factura.items ? factura.items.map(item => `
                                    <tr>
                                        <td>${item.descripcion}</td>
                                        <td>${item.cantidad}</td>
                                        <td>$${item.precio}</td>
                                        <td>$${item.total}</td>
                                    </tr>
                                `).join('') : ''}
                            </tbody>
                        </table>
                        
                        <div class="total">
                            Total: $${factura.total}
                        </div>
                        
                        <p>Gracias por tu preferencia. Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos.</p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático del sistema CRM</p>
                        <p>Para consultas sobre facturas, contacta a nuestro equipo de soporte.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    /**
     * Plantilla de recordatorio
     */
    reminder: (cliente, mensaje, tipo = 'general') => ({
        subject: `Recordatorio - ${cliente.nombre}`,
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Recordatorio</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #FF9800 0%, #FFC107 100%); color: white; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px 20px; }
                    .reminder-box { background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800; }
                    .urgent { border-left-color: #f44336; background-color: #ffebee; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Recordatorio</h1>
                        <p>${tipo === 'urgent' ? '⚠️ Urgente' : '📅 Recordatorio'}</p>
                    </div>
                    <div class="content">
                        <p>Hola ${cliente.nombre},</p>
                        <p>Te enviamos este recordatorio:</p>
                        
                        <div class="reminder-box ${tipo === 'urgent' ? 'urgent' : ''}">
                            <h3>${tipo === 'urgent' ? '⚠️ Recordatorio Urgente' : '📅 Recordatorio'}</h3>
                            <p>${mensaje}</p>
                        </div>
                        
                        <p>Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.</p>
                        <p>¡Gracias por tu atención!</p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático del sistema CRM</p>
                        <p>Si no deseas recibir estos recordatorios, puedes contactarnos para darte de baja.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    /**
     * Plantilla de notificación de pago
     */
    paymentNotification: (cliente, pago) => ({
        subject: `Confirmación de Pago - ${cliente.nombre}`,
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Confirmación de Pago</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%); color: white; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px 20px; }
                    .payment-details { background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Pago Confirmado</h1>
                        <p>Gracias por tu pago</p>
                    </div>
                    <div class="content">
                        <p>Hola ${cliente.nombre},</p>
                        <p>Hemos recibido tu pago exitosamente:</p>
                        
                        <div class="payment-details">
                            <h3>Detalles del Pago</h3>
                            <p><strong>Monto:</strong> $${pago.monto}</p>
                            <p><strong>Fecha:</strong> ${new Date(pago.fecha).toLocaleDateString()}</p>
                            <p><strong>Método:</strong> ${pago.metodo}</p>
                            <p><strong>Referencia:</strong> ${pago.referencia}</p>
                        </div>
                        
                        <p>Tu pago ha sido procesado correctamente. Gracias por tu confianza.</p>
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático del sistema CRM</p>
                        <p>Para consultas sobre pagos, contacta a nuestro equipo de soporte.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    /**
     * Plantilla de notificación de vencimiento
     */
    expirationNotification: (cliente, servicio) => ({
        subject: `Servicio por Vencer - ${cliente.nombre}`,
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Servicio por Vencer</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #f44336 0%, #ff5722 100%); color: white; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px 20px; }
                    .expiration-box { background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Servicio por Vencer</h1>
                        <p>Acción requerida</p>
                    </div>
                    <div class="content">
                        <p>Hola ${cliente.nombre},</p>
                        <p>Te informamos que tu servicio está próximo a vencer:</p>
                        
                        <div class="expiration-box">
                            <h3>Detalles del Servicio</h3>
                            <p><strong>Servicio:</strong> ${servicio.nombre}</p>
                            <p><strong>Fecha de Vencimiento:</strong> ${new Date(servicio.fecha_vencimiento).toLocaleDateString()}</p>
                            <p><strong>Días restantes:</strong> ${servicio.dias_restantes} días</p>
                        </div>
                        
                        <p>Para continuar disfrutando de este servicio, por favor renueva tu suscripción antes de la fecha de vencimiento.</p>
                        <p>Si tienes alguna pregunta o necesitas ayuda con la renovación, no dudes en contactarnos.</p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático del sistema CRM</p>
                        <p>Para renovar tu servicio, contacta a nuestro equipo de soporte.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    })
};

export default emailTemplates;
