import { validationResult } from 'express-validator';
import MetodoPago from '../models/MetodoPago.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const crearMetodoPago = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const supabase = getSupabaseForUser(req.token);
        const { nombre, link, descripcion, activo, orden } = req.body;

        const metodoPago = await MetodoPago.crear({
            nombre,
            link,
            descripcion,
            activo: activo !== undefined ? activo : true,
            orden: orden || 0
        }, req.user.id, supabase);

        res.status(201).json(metodoPago);
    } catch (error) {
        console.error('Error al crear método de pago:', error);
        res.status(500).json({
            error: 'Error al crear método de pago',
            details: error.message
        });
    }
};

export const obtenerMetodosPago = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        const metodosPago = await MetodoPago.obtenerTodos(req.user.id, supabase);
        res.json(metodosPago);
    } catch (error) {
        console.error('Error al obtener métodos de pago:', error);
        res.status(500).json({
            error: 'Error al obtener métodos de pago',
            details: error.message
        });
    }
};

export const obtenerMetodoPago = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        const metodoPago = await MetodoPago.obtenerPorId(req.params.id, req.user.id, supabase);
        
        if (!metodoPago) {
            return res.status(404).json({ error: 'Método de pago no encontrado' });
        }

        res.json(metodoPago);
    } catch (error) {
        console.error('Error al obtener método de pago:', error);
        res.status(500).json({
            error: 'Error al obtener método de pago',
            details: error.message
        });
    }
};

export const actualizarMetodoPago = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const supabase = getSupabaseForUser(req.token);
        const { nombre, link, descripcion, activo, orden } = req.body;

        const datosActualizados = {};
        if (nombre !== undefined) datosActualizados.nombre = nombre;
        if (link !== undefined) datosActualizados.link = link;
        if (descripcion !== undefined) datosActualizados.descripcion = descripcion;
        if (activo !== undefined) datosActualizados.activo = activo;
        if (orden !== undefined) datosActualizados.orden = orden;

        const metodoPago = await MetodoPago.actualizar(
            req.params.id,
            datosActualizados,
            req.user.id,
            supabase
        );

        if (!metodoPago) {
            return res.status(404).json({ error: 'Método de pago no encontrado' });
        }

        res.json(metodoPago);
    } catch (error) {
        console.error('Error al actualizar método de pago:', error);
        res.status(500).json({
            error: 'Error al actualizar método de pago',
            details: error.message
        });
    }
};

export const eliminarMetodoPago = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        const eliminado = await MetodoPago.eliminar(req.params.id, req.user.id, supabase);
        
        if (!eliminado) {
            return res.status(404).json({ error: 'Método de pago no encontrado' });
        }

        res.json({ message: 'Método de pago eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar método de pago:', error);
        res.status(500).json({
            error: 'Error al eliminar método de pago',
            details: error.message
        });
    }
};

export const cambiarOrdenMetodosPago = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const supabase = getSupabaseForUser(req.token);
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Se requiere un array de IDs' });
        }

        await MetodoPago.cambiarOrden(ids, req.user.id, supabase);
        res.json({ message: 'Orden actualizado exitosamente' });
    } catch (error) {
        console.error('Error al cambiar orden de métodos de pago:', error);
        res.status(500).json({
            error: 'Error al cambiar orden de métodos de pago',
            details: error.message
        });
    }
};
