import { validationResult } from 'express-validator';
import Mensaje from '../models/Mensaje.js';
import { getSupabaseForUser } from '../config/supabase.js';

/**
 * Crea un nuevo mensaje predeterminado para el usuario
 */
export const crearMensaje = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supabase = getSupabaseForUser(req.token);
    const mensaje = await Mensaje.crear(req.body, req.user.id, supabase);
    res.status(201).json(mensaje);
  } catch (error) {
    console.error('Error al crear mensaje:', error);
    res.status(500).json({ error: 'Error al crear mensaje', details: error.message });
  }
};

/**
 * Lista todos los mensajes predeterminados del usuario
 */
export const listarMensajes = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const mensajes = await Mensaje.listar(req.user.id, supabase);
    res.json(mensajes);
  } catch (error) {
    console.error('Error al listar mensajes:', error);
    res.status(500).json({ error: 'Error al listar mensajes', details: error.message });
  }
};

/**
 * Lista mensajes predeterminados por módulo específico
 */
export const listarMensajesPorModulo = async (req, res) => {
  try {
    const { modulo } = req.params;
    const supabase = getSupabaseForUser(req.token);
    const mensajes = await Mensaje.listarPorModulo(modulo, req.user.id, supabase);
    res.json(mensajes);
  } catch (error) {
    console.error('Error al listar mensajes por módulo:', error);
    res.status(500).json({ error: 'Error al listar mensajes por módulo', details: error.message });
  }
};

/**
 * Obtiene un mensaje específico por ID
 */
export const obtenerMensaje = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const mensaje = await Mensaje.obtenerPorId(req.params.id, req.user.id, supabase);
    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }
    res.json(mensaje);
  } catch (error) {
    console.error('Error al obtener mensaje:', error);
    res.status(500).json({ error: 'Error al obtener mensaje', details: error.message });
  }
};

/**
 * Actualiza un mensaje existente
 */
export const actualizarMensaje = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supabase = getSupabaseForUser(req.token);
    const mensaje = await Mensaje.actualizar(req.params.id, req.body, req.user.id, supabase);
    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }
    res.json(mensaje);
  } catch (error) {
    console.error('Error al actualizar mensaje:', error);
    res.status(500).json({ error: 'Error al actualizar mensaje', details: error.message });
  }
};

/**
 * Elimina un mensaje
 */
export const eliminarMensaje = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const eliminado = await Mensaje.eliminar(req.params.id, req.user.id, supabase);
    if (!eliminado) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }
    res.json({ message: 'Mensaje eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    res.status(500).json({ error: 'Error al eliminar mensaje', details: error.message });
  }
};

/**
 * Genera un link directo de WhatsApp con el mensaje
 */
export const generarLinkWhatsApp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { telefono, mensajeId } = req.body;

    if (!telefono || !mensajeId) {
      return res.status(400).json({ error: 'Se requiere teléfono y ID del mensaje' });
    }

    const supabase = getSupabaseForUser(req.token);
    const mensaje = await Mensaje.obtenerPorId(mensajeId, req.user.id, supabase);
    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    const link = Mensaje.generarLinkWhatsApp(telefono, mensaje.texto);
    res.json({ link });
  } catch (error) {
    console.error('Error al generar link de WhatsApp:', error);
    res.status(500).json({ error: 'Error al generar el link de WhatsApp' });
  }
};

export const enviarMensaje = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const mensaje = await Mensaje.crear({
            ...req.body,
            user_id: req.user.id
        });

        res.status(201).json(mensaje);
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({
            error: 'Error al enviar mensaje',
            details: error.message
        });
    }
};

export const obtenerMensajesCliente = async (req, res) => {
    try {
        const mensajes = await Mensaje.obtenerPorCliente(req.params.clienteId, req.user.id);
        res.json(mensajes);
    } catch (error) {
        console.error('Error al obtener mensajes del cliente:', error);
        res.status(500).json({
            error: 'Error al obtener mensajes del cliente',
            details: error.message
        });
    }
};

export const obtenerMensajes = async (req, res) => {
  try {
    const mensajes = await Mensaje.obtenerTodos(req.user.id);
    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
}; 