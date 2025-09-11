import { validationResult } from 'express-validator';
import ApiToken from '../models/ApiToken.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const crearApiToken = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Errores de validación en /api/auth/api-tokens:', errors.array());
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const supabase = getSupabaseForUser(req.token);
        const { nombre, duracion_dias, permisos, descripcion } = req.body;

        const apiToken = await ApiToken.crear({
            nombre,
            duracion_dias,
            permisos,
            descripcion
        }, req.user.id, supabase);

        res.status(201).json({
            success: true,
            message: 'API token creado exitosamente',
            data: {
                id: apiToken.id,
                nombre: apiToken.nombre,
                token: apiToken.token, // Solo se muestra una vez
                fecha_expiracion: apiToken.fecha_expiracion,
                permisos: apiToken.permisos,
                descripcion: apiToken.descripcion
            }
        });
    } catch (error) {
        console.error('Error al crear API token:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export const obtenerApiTokens = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        
        const tokens = await ApiToken.obtenerTodos(req.user.id, supabase);

        res.json({
            success: true,
            data: tokens
        });
    } catch (error) {
        console.error('Error al obtener API tokens:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export const revocarApiToken = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        const { id } = req.params;

        const tokenRevocado = await ApiToken.revocar(id, req.user.id, supabase);

        if (!tokenRevocado) {
            return res.status(404).json({
                success: false,
                message: 'API token no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'API token revocado exitosamente'
        });
    } catch (error) {
        console.error('Error al revocar API token:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export const revocarTodosApiTokens = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        
        await ApiToken.revocarTodos(req.user.id, supabase);

        res.json({
            success: true,
            message: 'Todos los API tokens han sido revocados exitosamente'
        });
    } catch (error) {
        console.error('Error al revocar todos los API tokens:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export const limpiarTokensExpirados = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        
        await ApiToken.limpiarTokensExpirados(supabase);

        res.json({
            success: true,
            message: 'Tokens expirados limpiados exitosamente'
        });
    } catch (error) {
        console.error('Error al limpiar tokens expirados:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
