import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';

// Configuración de Supabase Storage
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'facturas';

// Función auxiliar para generar nombre de archivo descriptivo
function generarNombreArchivo(factura, cliente, negocio) {
  const nombreNegocio = (negocio?.nombre_negocio || 'Negocio').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const nombreCliente = (cliente?.nombre || 'Cliente').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const numeroFactura = factura.numero_factura || '000';
  const numeroFacturaFormateado = `100${numeroFactura}`;
  
  return `${nombreNegocio}-${nombreCliente}-${numeroFacturaFormateado}.pdf`;
}

// 🚀 Convertir stream a buffer
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

// 🎨 Generar PDF con PDFKit (SIN BROWSER - 10x más rápido y eficiente)
export async function generarYSubirPdfFactura({ factura, cliente, negocio }, userId) {
  try {
    // Crear documento PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 0,
      bufferPages: true
    });

    // Buffer para almacenar el PDF
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {});

    // Usar color personalizado del negocio o azul oscuro por defecto
    const colorNegocio = negocio?.color_personalizado || '#1e3a8a';
    
    // Determinar estado
    const estado = factura.estado === 'pagada' ? 'PAID' : 'PENDING';
    const colorEstado = factura.estado === 'pagada' ? '#4CAF50' : '#F7E7A6';

    // =====================
    // HEADER SECTION
    // =====================
    doc.rect(0, 0, 595, 120).fill(colorNegocio);
    
    // Logo placeholder o texto
    doc.fontSize(48)
       .fillColor('#FFFFFF')
       .text('INVOICE', 80, 40);

    // Información del negocio (derecha)
    doc.fontSize(14)
       .fillColor('#FFFFFF')
       .text(factura.nombre_negocio || negocio?.nombre_negocio || 'Business Name', 350, 40, { 
         width: 200, 
         align: 'right' 
       });
    
    doc.fontSize(9)
       .text(negocio?.direccion || '', 350, 60, { width: 200, align: 'right' })
       .text(negocio?.telefono || '', 350, 75, { width: 200, align: 'right' })
       .text(factura.email || negocio?.email || '', 350, 90, { width: 200, align: 'right' });

    // =====================
    // INVOICE DETAILS SECTION
    // =====================
    doc.fillColor('#000000');
    
    // Invoice Details (izquierda)
    doc.fontSize(12)
       .fillColor(colorNegocio)
       .text('INVOICE DETAILS:', 50, 150);
    
    doc.fontSize(10)
       .fillColor('#000000')
       .text(`Invoice #: 100${factura.numero_factura || '000'}`, 50, 170)
       .text(`Date of Issue: ${factura.fecha_factura || 'MM/DD/YYYY'}`, 50, 185);
    
    if (factura.fecha_vencimiento && factura.fecha_vencimiento !== '1999-99-99' && factura.fecha_vencimiento !== null) {
      doc.text(`Due Date: ${factura.fecha_vencimiento}`, 50, 200);
    }

    // Bill To (derecha)
    doc.fontSize(12)
       .fillColor(colorNegocio)
       .text('BILL TO:', 350, 150);
    
    doc.fontSize(10)
       .fillColor('#000000')
       .text(cliente?.nombre || 'CUSTOMER NAME', 350, 170)
       .text(cliente?.direccion || '', 350, 185)
       .text(cliente?.email || '', 350, 200)
       .text(cliente?.telefono || '', 350, 215);

    // Línea separadora
    doc.moveTo(50, 240)
       .lineTo(545, 240)
       .stroke('#e0e0e0');

    // =====================
    // ITEMS TABLE
    // =====================
    let yPos = 260;
    
    // Header de tabla
    doc.rect(50, yPos, 495, 25).fill('#f8f9fa');
    doc.fontSize(10)
       .fillColor(colorNegocio)
       .text('PRODUCT/SERVICE', 60, yPos + 8, { width: 100 })
       .text('DESCRIPTION', 170, yPos + 8, { width: 150 })
       .text('QTY', 330, yPos + 8, { width: 40 })
       .text('RATE', 380, yPos + 8, { width: 60 })
       .text('AMOUNT', 450, yPos + 8, { width: 85, align: 'right' });

    yPos += 25;

    // Items
    const items = factura.items && factura.items.length > 0 ? factura.items : [
      { categoria: 'Placeholder', descripcion: 'Text', cantidad: '000', precio_unitario: 0, total: 0 }
    ];

    doc.fillColor('#000000');
    items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.rect(50, yPos, 495, 25).fill('#fafafa');
      }
      
      doc.fontSize(9)
         .fillColor('#000000')
         .text(item.categoria || 'Product', 60, yPos + 8, { width: 100 })
         .text(item.descripcion || 'Description', 170, yPos + 8, { width: 150 })
         .text(item.cantidad || '1', 330, yPos + 8, { width: 40 })
         .text(`$${Number(item.precio_unitario || 0).toFixed(2)}`, 380, yPos + 8, { width: 60 })
         .text(`$${Number(item.total || 0).toFixed(2)}`, 450, yPos + 8, { width: 85, align: 'right' });
      
      yPos += 25;
    });

    yPos += 20;

    // =====================
    // TOTALS SECTION
    // =====================
    const totalsX = 380;
    
    doc.fontSize(10)
       .fillColor('#000000')
       .text('Subtotal:', totalsX, yPos, { width: 70 })
       .text(`$${Number(factura.subtotal || 0).toFixed(2)}`, totalsX + 70, yPos, { width: 85, align: 'right' });
    
    yPos += 20;

    // Descuento (si existe)
    if (factura.descuento && factura.descuento > 0) {
      const descuentoPct = Math.round((factura.descuento / factura.subtotal) * 100);
      doc.fillColor('#dc3545')
         .text(`Descuento (${descuentoPct}%):`, totalsX, yPos, { width: 70 })
         .text(`-$${Number(factura.descuento || 0).toFixed(2)}`, totalsX + 70, yPos, { width: 85, align: 'right' });
      yPos += 20;
    }

    // Tax
    doc.fillColor('#000000')
       .text('Tax:', totalsX, yPos, { width: 70 })
       .text(`$${Number(factura.impuesto || 0).toFixed(2)}`, totalsX + 70, yPos, { width: 85, align: 'right' });
    
    yPos += 20;

    // Total
    doc.moveTo(totalsX, yPos - 5)
       .lineTo(545, yPos - 5)
       .stroke('#e0e0e0');
    
    doc.fontSize(12)
       .fillColor(colorNegocio)
       .text('TOTAL:', totalsX, yPos, { width: 70 })
       .text(`$${Number(factura.total || 0).toFixed(2)}`, totalsX + 70, yPos, { width: 85, align: 'right' });
    
    yPos += 25;

    // Deposit
    doc.fontSize(10)
       .fillColor('#000000')
       .text('Deposit:', totalsX, yPos, { width: 70 })
       .text(`$${Number(factura.deposito || 0).toFixed(2)}`, totalsX + 70, yPos, { width: 85, align: 'right' });
    
    yPos += 20;

    // Balance
    doc.fontSize(12)
       .fillColor(colorNegocio)
       .text('BALANCE:', totalsX, yPos, { width: 70 })
       .text(`$${Number(factura.balance_restante || 0).toFixed(2)}`, totalsX + 70, yPos, { width: 85, align: 'right' });

    yPos += 30;

    // Status Badge
    if (estado) {
      const badgeColor = factura.estado === 'pagada' ? '#e6f9ec' : '#fdf6d7';
      const badgeTextColor = factura.estado === 'pagada' ? '#218838' : '#8a6d3b';
      
      doc.roundedRect(totalsX + 20, yPos, 120, 35, 18)
         .fill(badgeColor);
      
      doc.fontSize(14)
         .fillColor(badgeTextColor)
         .text(estado, totalsX + 20, yPos + 10, { width: 120, align: 'center' });
    }

    // =====================
    // TERMS SECTION (si existe)
    // =====================
    yPos += 50;
    
    if ((factura.terminos && factura.terminos.trim() !== '') || 
        (negocio?.terminos_condiciones && negocio.terminos_condiciones.trim() !== '')) {
      doc.fontSize(12)
         .fillColor(colorNegocio)
         .text('TERMS', 50, yPos);
      
      doc.fontSize(9)
         .fillColor('#555555')
         .text(factura.terminos || negocio?.terminos_condiciones || '', 50, yPos + 20, { 
           width: 300, 
           align: 'justify' 
         });
    }

    // =====================
    // FOOTER
    // =====================
    const footerY = 780;
    doc.rect(0, footerY, 595, 62).fill(colorNegocio);
    
    doc.fontSize(10)
       .fillColor('#FFFFFF')
       .text(factura.nombre_negocio || negocio?.nombre_negocio || 'Business Name', 0, footerY + 25, { 
         width: 595, 
         align: 'center' 
       });

    // Finalizar documento
    doc.end();

    // Esperar a que se complete el stream
    const pdfBuffer = await streamToBuffer(doc);

    // Subir a Supabase Storage
    const fileName = generarNombreArchivo(factura, cliente, negocio);
    const filePath = `${userId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });
    
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    
    // Agregar timestamp para evitar cacheo
    const timestamp = Date.now();
    const pdfUrl = `${data.publicUrl}?t=${timestamp}`;
    
    console.log('✅ PDF generado exitosamente con PDFKit (sin browser)');
    return pdfUrl;

  } catch (error) {
    console.error('❌ Error generando PDF con PDFKit:', error);
    throw error;
  }
}

// Exportar función auxiliar
export { generarNombreArchivo };
