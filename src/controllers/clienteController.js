import { validationResult } from 'express-validator';
import Cliente from '../models/Cliente.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const crearCliente = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Errores de validación en /api/clientes:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const supabase = getSupabaseForUser(req.token);
        const { nombre, email, telefono, categoria, fecha_nacimiento, fecha_vencimiento, fecha_inicio, direccion, sexo, notas, identification_number } = req.body;
        
        // Convertir "pendiente" a "inactivo" automáticamente
        const categoriaFinal = categoria === 'pendiente' ? 'inactivo' : categoria;
        
        const cliente = await Cliente.crear({
            nombre,
            email,
            telefono,
            categoria: categoriaFinal,
            fecha_nacimiento,
            fecha_vencimiento,
            fecha_inicio,
            direccion,
            sexo,
            notas,
            identification_number,
            user_id: req.user.id
        }, supabase);

        res.status(201).json(cliente);
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({
            error: 'Error al crear cliente',
            details: error.message
        });
    }
};

export const obtenerClientes = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        const clientes = await Cliente.obtenerTodos(req.user.id, supabase);
        res.json(clientes);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({
            error: 'Error al obtener clientes',
            details: error.message
        });
    }
};

export const obtenerCliente = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        const cliente = await Cliente.obtenerPorId(req.params.id, req.user.id, supabase);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({
            error: 'Error al obtener cliente',
            details: error.message
        });
    }
};

export const actualizarCliente = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const supabase = getSupabaseForUser(req.token);
        const { nombre, email, telefono, categoria, fecha_nacimiento, fecha_vencimiento, fecha_inicio, direccion, sexo, notas, identification_number } = req.body;
        const datosActualizados = {};
        if (nombre !== undefined) datosActualizados.nombre = nombre;
        if (email !== undefined) datosActualizados.email = email;
        if (telefono !== undefined) datosActualizados.telefono = telefono;
        if (categoria !== undefined) {
          // Convertir "pendiente" a "inactivo" automáticamente
          datosActualizados.categoria = categoria === 'pendiente' ? 'inactivo' : categoria;
        }
        if (fecha_nacimiento !== undefined) datosActualizados.fecha_nacimiento = fecha_nacimiento;
        if (fecha_vencimiento !== undefined) datosActualizados.fecha_vencimiento = fecha_vencimiento;
        if (fecha_inicio !== undefined) datosActualizados.fecha_inicio = fecha_inicio;
        if (direccion !== undefined) datosActualizados.direccion = direccion;
        if (sexo !== undefined) datosActualizados.sexo = sexo;
        if (notas !== undefined) datosActualizados.notas = notas;
        if (identification_number !== undefined) datosActualizados.identification_number = identification_number;
        const cliente = await Cliente.actualizar(req.params.id, datosActualizados, req.user.id, supabase);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({
            error: 'Error al actualizar cliente',
            details: error.message
        });
    }
};

export const eliminarCliente = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        const eliminado = await Cliente.eliminar(req.params.id, req.user.id, supabase);
        if (!eliminado) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({
            error: 'Error al eliminar cliente',
            details: error.message
        });
    }
};

export const obtenerClientesPorCategoria = async (req, res) => {
    try {
        const supabase = getSupabaseForUser(req.token);
        const clientes = await Cliente.obtenerPorCategoria(req.params.categoria, req.user.id, supabase);
        res.json(clientes);
    } catch (error) {
        console.error('Error al obtener clientes por categoría:', error);
        res.status(500).json({
            error: 'Error al obtener clientes por categoría',
            details: error.message
        });
    }
};

export const buscarClientes = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const clientes = await Cliente.buscarPorNombre(req.user.id, req.query.nombre, supabase);
    res.json(clientes);
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({ error: 'Error al buscar clientes', details: error.message });
  }
}; 