import { validationResult } from 'express-validator';
import Factura from '../models/Factura.js';
import { getSupabaseForUser } from '../config/supabase.js';

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
            items 
        } = req.body;

        const factura = await Factura.crear({
            cliente_id,
            fecha_factura,
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
            user_id: req.user.id
        }, items, supabase);

        res.status(201).json(factura);
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
        res.json(facturas);
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
        
        res.json(factura);
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
            items 
        } = req.body;

        const datosActualizados = {};
        if (cliente_id !== undefined) datosActualizados.cliente_id = cliente_id;
        if (fecha_factura !== undefined) datosActualizados.fecha_factura = fecha_factura;
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

        res.json(factura);
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
            cliente: factura.cliente,
            items: factura.items,
            created_at: factura.created_at
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