import { validationResult } from 'express-validator';
import Factura from '../models/Factura.js';
import { getSupabaseForUser } from '../config/supabase.js';
import { generarYSubirPdfFactura, generarNombreArchivo } from '../services/pdfFacturaService.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseStorage = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'facturas';

export const crearFactura = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Errores de validación en /api/facturas:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const supabase = getSupabaseForUser(req.token);
        const { 
            cliente_id, 
            fecha_factura, 
            fecha_vencimiento,
            estado, 
            subtotal, 
            impuesto, 
            total, 
            deposito, 
            balance_restante, 
            nota, 
            terminos, 
            logo_personalizado_url, 
            firma_url,
            metodo_pago_id,
            items 
        } = req.body;

        // Crear la factura (sin join de cliente)
        const facturaCreada = await Factura.crear({
            cliente_id,
            fecha_factura,
            fecha_vencimiento,
            estado,
            subtotal,
            impuesto,
            total,
            deposito,
            balance_restante,
            nota,
            terminos,
            logo_personalizado_url,
            firma_url,
            metodo_pago_id,
            user_id: req.user.id
        }, items, supabase);

        // Obtener la factura completa (con join de cliente)
        const factura = await Factura.obtenerPorId(facturaCreada.id, req.user.id, supabase);
        const cliente = factura.cliente || null;
        const negocio = await Factura.obtenerConfiguracionNegocio(req.user.id, supabase);
        // Generar y subir PDF
        let pdfUrl = null;
        try {
          pdfUrl = await generarYSubirPdfFactura({ factura, cliente, negocio }, req.user.id);
        } catch (err) {
          console.error('Error al generar/subir PDF:', err);
        }
        res.status(201).json({ ...factura, pdfUrl });
    } catch (error) {
        console.error('Error al crear factura:', error);
        res.status(500).json({
            error: 'Error al crear factura',
            details: error.message
        });
    }
};

export const obtenerFacturas = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        
        // Extraer filtros de query params
        const filtros = {};
        if (req.query.cliente_id) filtros.cliente_id = req.query.cliente_id;
        if (req.query.estado) filtros.estado = req.query.estado;
        if (req.query.fecha_inicio) filtros.fecha_inicio = req.query.fecha_inicio;
        if (req.query.fecha_fin) filtros.fecha_fin = req.query.fecha_fin;

        const facturas = await Factura.obtenerTodas(req.user.id, filtros, supabase);

        // Obtener configuración del negocio para generar nombres de archivo
        const negocio = await Factura.obtenerConfiguracionNegocio(req.user.id, supabase);
        
        // Agregar pdfUrl a cada factura
        const facturasConPdf = facturas.map(factura => {
            let pdfUrl = null;
            if (factura.user_id && factura.id) {
                const fileName = generarNombreArchivo(factura, factura.cliente, negocio);
                const filePath = `${factura.user_id}/${fileName}`;
                const { data } = supabaseStorage.storage.from(BUCKET).getPublicUrl(filePath);
                pdfUrl = data?.publicUrl || null;
            }
            return { ...factura, pdfUrl };
        });

        res.json(facturasConPdf);
    } catch (error) {
        console.error('Error al obtener facturas:', error);
        res.status(500).json({
            error: 'Error al obtener facturas',
            details: error.message
        });
    }
};

export const obtenerFactura = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        const factura = await Factura.obtenerPorId(req.params.id, req.user.id, supabase);
        
        if (!factura) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }
        // Obtener configuración del negocio para generar nombre de archivo
        const negocio = await Factura.obtenerConfiguracionNegocio(req.user.id, supabase);
        
        // Calcular pdfUrl
        let pdfUrl = null;
        if (factura.user_id && factura.id) {
          const fileName = generarNombreArchivo(factura, factura.cliente, negocio);
          const filePath = `${factura.user_id}/${fileName}`;
          const { data } = supabaseStorage.storage.from(BUCKET).getPublicUrl(filePath);
          pdfUrl = data?.publicUrl || null;
        }
        res.json({ ...factura, pdfUrl });
    } catch (error) {
        console.error('Error al obtener factura:', error);
        res.status(500).json({
            error: 'Error al obtener factura',
            details: error.message
        });
    }
};

export const actualizarFactura = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const supabase = getSupabaseForUser(req.token);
        const { 
            cliente_id, 
            fecha_factura, 
            fecha_vencimiento,
            estado, 
            subtotal, 
            impuesto, 
            total, 
            deposito, 
            balance_restante, 
            nota, 
            terminos, 
            logo_personalizado_url, 
            firma_url,
            metodo_pago_id,
            items 
        } = req.body;

        const datosActualizados = {};
        if (cliente_id !== undefined) datosActualizados.cliente_id = cliente_id;
        if (fecha_factura !== undefined) datosActualizados.fecha_factura = fecha_factura;
        if (fecha_vencimiento !== undefined) datosActualizados.fecha_vencimiento = fecha_vencimiento;
        if (estado !== undefined) datosActualizados.estado = estado;
        if (subtotal !== undefined) datosActualizados.subtotal = subtotal;
        if (impuesto !== undefined) datosActualizados.impuesto = impuesto;
        if (total !== undefined) datosActualizados.total = total;
        if (deposito !== undefined) datosActualizados.deposito = deposito;
        if (balance_restante !== undefined) datosActualizados.balance_restante = balance_restante;
        if (nota !== undefined) datosActualizados.nota = nota;
        if (terminos !== undefined) datosActualizados.terminos = terminos;
        if (logo_personalizado_url !== undefined) datosActualizados.logo_personalizado_url = logo_personalizado_url;
        if (firma_url !== undefined) datosActualizados.firma_url = firma_url;
        if (metodo_pago_id !== undefined) datosActualizados.metodo_pago_id = metodo_pago_id;

        const factura = await Factura.actualizar(
            req.params.id, 
            datosActualizados, 
            items, 
            req.user.id, 
            supabase
        );

        if (!factura) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }

        // Obtener datos de cliente y negocio para el PDF
        const cliente = factura.cliente || null;
        const negocio = await Factura.obtenerConfiguracionNegocio(req.user.id, supabase);
        // Generar y subir PDF
        let pdfUrl = null;
        try {
          pdfUrl = await generarYSubirPdfFactura({ factura, cliente, negocio }, req.user.id);
        } catch (err) {
          console.error('Error al generar/subir PDF:', err);
        }
        res.json({ ...factura, pdfUrl });
    } catch (error) {
        console.error('Error al actualizar factura:', error);
        res.status(500).json({
            error: 'Error al actualizar factura',
            details: error.message
        });
    }
};

export const eliminarFactura = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        const eliminado = await Factura.eliminar(req.params.id, req.user.id, supabase);
        
        if (!eliminado) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }
        // Eliminar el PDF del storage
        try {
            // Obtener la factura y configuración del negocio para generar el nombre correcto del archivo
            const factura = await Factura.obtenerPorId(req.params.id, req.user.id, supabase);
            const negocio = await Factura.obtenerConfiguracionNegocio(req.user.id, supabase);
            if (factura) {
                const fileName = generarNombreArchivo(factura, factura.cliente, negocio);
                const filePath = `${req.user.id}/${fileName}`;
                const { error: storageError } = await supabaseStorage.storage.from(BUCKET).remove([filePath]);
                if (storageError) {
                    console.error('Error al eliminar PDF en storage:', storageError);
                    // No detenemos la respuesta si falla el borrado del PDF
                }
            }
        } catch (err) {
            console.error('Error inesperado al intentar eliminar PDF:', err);
        }
        res.json({ message: 'Factura eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar factura:', error);
        res.status(500).json({
            error: 'Error al eliminar factura',
            details: error.message
        });
    }
};

export const obtenerFacturaPublica = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        const factura = await Factura.obtenerPorUuidPublico(req.params.uuid, supabase);
        
        if (!factura) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }
        // Obtener configuración del negocio para generar nombre de archivo
        const negocio = await Factura.obtenerConfiguracionNegocio(factura.user_id, supabase);
        
        // Calcular pdfUrl
        let pdfUrl = null;
        if (factura.user_id && factura.id) {
          const fileName = generarNombreArchivo(factura, factura.cliente, negocio);
          const filePath = `${factura.user_id}/${fileName}`;
          const { data } = supabaseStorage.storage.from(BUCKET).getPublicUrl(filePath);
          pdfUrl = data?.publicUrl || null;
        }
        // Formatear la respuesta para la vista pública
        const facturaFormateada = {
            id: factura.id,
            numero_factura: factura.numero_factura,
            fecha_factura: factura.fecha_factura,
            fecha_pagada: factura.fecha_pagada,
            estado: factura.estado,
            subtotal: factura.subtotal,
            impuesto: factura.impuesto,
            total: factura.total,
            deposito: factura.deposito,
            balance_restante: factura.balance_restante,
            nota: factura.nota,
            terminos: factura.terminos,
            logo_personalizado_url: factura.logo_personalizado_url,
            firma_url: factura.firma_url,
            metodo_pago: factura.metodo_pago,
            cliente: factura.cliente,
            items: factura.items,
            created_at: factura.created_at,
            pdfUrl
        };
        
        res.json(facturaFormateada);
    } catch (error) {
        console.error('Error al obtener factura pública:', error);
        res.status(500).json({
            error: 'Error al obtener factura',
            details: error.message
        });
    }
}; 