import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Configuración de Supabase Storage
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'facturas';

function facturaHtmlTemplate(factura, cliente, negocio) {
  // Determinar estado
  const estado = factura.estado === 'pagada' ? 'PAGADO' : 'pendiente';
  const colorEstado = factura.estado === 'pagada' ? '#4CAF50' : '#F7E7A6';
  const colorTextoEstado = factura.estado === 'pagada' ? '#218838' : '#8a6d3b';
  const colorFondoEstado = factura.estado === 'pagada' ? '#e6f9ec' : '#fdf6d7';
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Factura #${factura.numero_factura}</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #fff;
          color: #222;
          margin: 0;
          padding: 0;
        }
        .factura-preview {
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 40px 40px 40px;
          position: relative;
        }
        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .logo {
          width: 90px;
          height: 90px;
          object-fit: contain;
          border-radius: 12px;
          background: #f5f5f5;
        }
        .negocio-info {
          text-align: right;
          flex: 1;
          margin-left: 24px;
        }
        .nombre-negocio {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .negocio-contacto {
          margin-top: 2px;
          font-size: 1.05rem;
        }
        .datos-principales {
          margin: 32px 0 16px 0;
          display: flex;
          justify-content: space-between;
        }
        .datos-principales .izq {
          font-size: 1.1rem;
          min-width: 320px;
        }
        .datos-principales .der {
          font-size: 1.1rem;
          text-align: right;
        }
        .cliente-info {
          margin-bottom: 16px;
        }
        .cliente-info .label {
          font-weight: bold;
        }
        .cliente-info .valor {
          margin-left: 4px;
        }
        .tabla-items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        .tabla-items th {
          background: #fafbfc;
          font-weight: bold;
          padding: 10px 8px;
          border-bottom: 2px solid #eaeaea;
          text-align: left;
        }
        .tabla-items td {
          padding: 8px 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        .totales {
          margin-top: 16px;
          float: right;
          text-align: right;
        }
        .totales div {
          margin-bottom: 2px;
        }
        .totales .total {
          color: #1976d2;
          font-weight: bold;
          font-size: 1.15rem;
        }
        .nota, .terminos {
          margin-top: 32px;
          font-size: 1.05rem;
        }
        .nota b, .terminos b {
          font-weight: bold;
        }
        .estado-badge {
          position: absolute;
          right: 40px;
          bottom: 32px;
          background: ${colorFondoEstado};
          color: ${colorTextoEstado};
          font-weight: bold;
          font-size: 1.4rem;
          border-radius: 16px;
          padding: 10px 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transform: rotate(-8deg);
        }
      </style>
    </head>
    <body>
      <div class="factura-preview">
        <div class="header">
          <img src="${factura.logo_personalizado_url || ''}" class="logo" />
          <div class="negocio-info">
            <div class="nombre-negocio">${factura.nombre_negocio || negocio?.nombre_negocio || ''}</div>
            <div class="negocio-contacto">${factura.direccion || negocio?.direccion || ''}</div>
            <div class="negocio-contacto">${factura.email || negocio?.email || ''}</div>
            <div class="negocio-contacto">${negocio?.telefono || ''}</div>
          </div>
        </div>
        <div class="datos-principales">
          <div class="izq">
            <div><b>Factura #${factura.numero_factura}</b></div>
            <div class="cliente-info" style="margin-top:10px;">
              <div><span class="label">Cliente:</span><span class="valor">${cliente?.nombre || ''}</span></div>
              <div><span class="valor">${cliente?.email || ''}</span></div>
              <div><span class="valor">${cliente?.telefono || ''}</span></div>
            </div>
          </div>
          <div class="der">
            <div>Fecha: ${factura.fecha_factura || ''}</div>
          </div>
        </div>
        <table class="tabla-items">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Precio Unitario</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${factura.items && factura.items.length > 0 ? factura.items.map(item => `
              <tr>
                <td>${item.descripcion || ''}</td>
                <td>${item.categoria || ''}</td>
                <td>$${Number(item.precio_unitario).toFixed(2)}</td>
                <td>${item.cantidad}</td>
                <td>$${Number(item.total).toFixed(2)}</td>
              </tr>
            `).join('') : `<tr><td colspan="5" style="text-align:center;color:#aaa;">Sin items</td></tr>`}
          </tbody>
        </table>
        <div class="totales">
          <div>Subtotal: <b>$${Number(factura.subtotal || 0).toFixed(2)}</b></div>
          <div>Impuesto: <b>$${Number(factura.impuesto || 0).toFixed(2)}</b></div>
          <div class="total">Total: <b>$${Number(factura.total || 0).toFixed(2)}</b></div>
          <div>Depósito: <b>$${Number(factura.deposito || 0).toFixed(2)}</b></div>
          <div>Balance: <b>$${Number(factura.balance_restante || 0).toFixed(2)}</b></div>
        </div>
        <div style="clear:both"></div>
        <div class="nota"><b>Nota:</b> ${factura.nota || ''}</div>
        <div class="terminos"><b>Términos:</b> ${factura.terminos || ''}</div>
        ${estado ? `<div class="estado-badge">${estado}</div>` : ''}
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
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  const filePath = `${userId}/${factura.id}.pdf`;
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, pdfBuffer, {
    contentType: 'application/pdf',
    upsert: true
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
} 