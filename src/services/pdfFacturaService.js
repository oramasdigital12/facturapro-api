import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

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
  
  return `${nombreNegocio}-${nombreCliente}-${numeroFactura}.pdf`;
}

function facturaHtmlTemplate(factura, cliente, negocio) {
  // Determinar estado
  const estado = factura.estado === 'pagada' ? 'PAID' : 'PENDING';
  const colorEstado = factura.estado === 'pagada' ? '#4CAF50' : '#F7E7A6';
  const colorTextoEstado = factura.estado === 'pagada' ? '#218838' : '#8a6d3b';
  const colorFondoEstado = factura.estado === 'pagada' ? '#e6f9ec' : '#fdf6d7';
  
  // Usar color personalizado del negocio o azul oscuro por defecto
  const colorNegocio = negocio?.color_personalizado || '#1e3a8a';
  
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice #${factura.numero_factura}</title>
      <style>
        @page {
          size: A4;
          margin: 0;
        }
        
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #fff;
          color: #222;
          margin: 0;
          padding: 0;
          line-height: 1.4;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        /* Header Section */
        .header {
          background: ${colorNegocio};
          color: white;
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .logo-placeholder {
          width: 80px;
          height: 80px;
          background: rgba(255,255,255,0.2);
          border: 2px dashed rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          text-align: center;
        }
        
        .logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          border-radius: 8px;
          background: white;
        }
        
        .invoice-title {
          font-size: 2.5rem;
          font-weight: bold;
          margin: 0;
        }
        
        .business-info {
          text-align: right;
        }
        
        .business-name {
          font-size: 1.3rem;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .business-details {
          font-size: 0.95rem;
          line-height: 1.3;
        }
        
        /* Main Content */
        .main-content {
          padding: 30px;
          flex: 1;
        }
        
        .invoice-details-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .invoice-details {
          flex: 1;
        }
        
        .bill-to {
          flex: 1;
          text-align: right;
        }
        
        .section-title {
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 10px;
          color: ${colorNegocio};
        }
        
        .detail-row {
          margin-bottom: 5px;
          font-size: 0.95rem;
        }
        
        .detail-label {
          font-weight: bold;
          color: #666;
        }
        
        /* Items Table */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .items-table th {
          background: #f8f9fa;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          color: ${colorNegocio};
          border-bottom: 2px solid #e0e0e0;
        }
        
        .items-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .items-table tr:nth-child(even) {
          background: #fafafa;
        }
        
        /* Bottom Section */
        .bottom-section {
          display: flex;
          justify-content: space-between;
          gap: 40px;
        }
        
        .terms-section {
          flex: 1;
        }
        
        .terms-content {
          text-align: justify;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.5;
          font-size: 0.9rem;
          color: #555;
        }
        
        .totals-section {
          flex: 0 0 200px;
          text-align: right;
        }
        
        .total-row {
          margin-bottom: 8px;
          font-size: 0.95rem;
        }
        
        .total-row.total {
          font-size: 1.1rem;
          font-weight: bold;
          color: ${colorNegocio};
          border-top: 2px solid #e0e0e0;
          padding-top: 8px;
          margin-top: 8px;
        }
        
        .total-label {
          display: inline-block;
          width: 80px;
          text-align: left;
        }
        
        .total-value {
          display: inline-block;
          width: 80px;
          text-align: right;
        }
        
        /* Status Badge */
        .status-badge {
          margin-top: 20px;
          background: ${colorFondoEstado};
          color: ${colorTextoEstado};
          font-weight: bold;
          font-size: 1.2rem;
          padding: 12px 24px;
          border-radius: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
          display: inline-block;
        }
        
        /* Footer */
        .footer {
          background: ${colorNegocio};
          color: white;
          padding: 15px 30px;
          text-align: center;
          font-size: 0.9rem;
          margin-top: auto;
        }
        
        .footer-logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
          border-radius: 50%;
          background: white;
          padding: 2px;
        }
        
        /* Page Break */
        .page-break {
          page-break-before: always;
        }
        
        /* Ensure footer stays at bottom */
        .invoice-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .main-content {
          flex: 1;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            ${factura.logo_personalizado_url || negocio?.logo_url ? 
              `<img src="${factura.logo_personalizado_url || negocio.logo_url}" class="logo" alt="Logo" />` : 
              `<div class="logo-placeholder">Your Company<br>Logo</div>`
            }
            <h1 class="invoice-title">INVOICE</h1>
          </div>
          <div class="business-info">
            <div class="business-name">${factura.nombre_negocio || negocio?.nombre_negocio || 'Business Name'}</div>
            <div class="business-details">
              ${negocio?.direccion || ''}<br>
              ${negocio?.telefono || ''}<br>
              ${factura.email || negocio?.email || ''}
            </div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
          <!-- Invoice Details Section -->
          <div class="invoice-details-section">
            <div class="invoice-details">
              <div class="section-title">INVOICE DETAILS:</div>
              <div class="detail-row">
                <span class="detail-label">Invoice #:</span> ${factura.numero_factura || '0000'}
              </div>
              <div class="detail-row">
                <span class="detail-label">Date of Issue:</span> ${factura.fecha_factura || 'MM/DD/YYYY'}
              </div>
              <div class="detail-row">
                <span class="detail-label">Due Date:</span> ${factura.fecha_vencimiento || 'MM/DD/YYYY'}
              </div>
            </div>
            <div class="bill-to">
              <div class="section-title">BILL TO:</div>
              <div class="detail-row">${cliente?.nombre || 'CUSTOMER NAME'}</div>
              <div class="detail-row">${cliente?.direccion || ''}</div>
              <div class="detail-row">${cliente?.email || ''}</div>
              <div class="detail-row">${cliente?.telefono || ''}</div>
            </div>
          </div>
          
          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>ITEM/SERVICE</th>
                <th>DESCRIPTION</th>
                <th>QTY/HRS</th>
                <th>RATE</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${factura.items && factura.items.length > 0 ? factura.items.map(item => `
                <tr>
                  <td>${item.categoria || 'Service'}</td>
                  <td>${item.descripcion || 'Description'}</td>
                  <td>${item.cantidad || '1'}</td>
                  <td>$${Number(item.precio_unitario || 0).toFixed(2)}</td>
                  <td>$${Number(item.total || 0).toFixed(2)}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td>Placeholder</td>
                  <td>Text</td>
                  <td>000</td>
                  <td>000</td>
                  <td>000</td>
                </tr>
              `}
            </tbody>
          </table>
          
          <!-- Bottom Section -->
          <div class="bottom-section">
            <div class="terms-section">
              <div class="section-title">TERMS</div>
              <div class="terms-content">${factura.terminos || negocio?.terminos_condiciones || 'Text Here'}</div>
              
              <div class="section-title" style="margin-top: 20px;">CONDITIONS/INSTRUCTIONS</div>
              <div class="terms-content">${factura.nota || negocio?.nota_factura || 'Text Here'}</div>
            </div>
            
            <div class="totals-section">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">$${Number(factura.subtotal || 0).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Tax:</span>
                <span class="total-value">$${Number(factura.impuesto || 0).toFixed(2)}</span>
              </div>
              <div class="total-row total">
                <span class="total-label">TOTAL:</span>
                <span class="total-value">$${Number(factura.total || 0).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Deposit:</span>
                <span class="total-value">$${Number(factura.deposito || 0).toFixed(2)}</span>
              </div>
              <div class="total-row total">
                <span class="total-label">BALANCE:</span>
                <span class="total-value">$${Number(factura.balance_restante || 0).toFixed(2)}</span>
              </div>
              
              <!-- Status Badge - Más grande y debajo del BALANCE -->
              ${estado ? `<div class="status-badge">${estado}</div>` : ''}
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            ${factura.logo_personalizado_url || negocio?.logo_url ? 
              `<img src="${factura.logo_personalizado_url || negocio.logo_url}" class="footer-logo" alt="Logo" />` : 
              `<div style="width: 20px; height: 20px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: ${colorNegocio}; font-size: 12px;">F</div>`
            }
            <span>${factura.nombre_negocio || negocio?.nombre_negocio || 'FreshBooks'}</span>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}

export async function generarYSubirPdfFactura({ factura, cliente, negocio }, userId) {
  const html = facturaHtmlTemplate(factura, cliente, negocio);
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ 
    format: 'A4', 
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    }
  });
  await browser.close();

  // Crear nombre de archivo descriptivo
  const fileName = generarNombreArchivo(factura, cliente, negocio);
  const filePath = `${userId}/${fileName}`;
  
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, pdfBuffer, {
    contentType: 'application/pdf',
    upsert: true
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

// Exportar función auxiliar para uso en otros archivos
export { generarNombreArchivo }; 