import Tarea from '../models/Tarea.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const crearTarea = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const tarea = await Tarea.crear(req.body, req.user.id, supabase);
    res.status(201).json(tarea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listarTareas = async (req, res) => {
  try {
    const { estado, search } = req.query;
    const supabase = getSupabaseForUser(req.token);
    const tareas = await Tarea.listar(req.user.id, estado, search, supabase);
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerTarea = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const tarea = await Tarea.obtenerPorId(req.params.id, req.user.id, supabase);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(tarea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const actualizarTarea = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const tarea = await Tarea.actualizar(req.params.id, req.body, req.user.id, supabase);
    res.json(tarea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const cambiarEstadoTarea = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!['pendiente', 'completada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const supabase = getSupabaseForUser(req.token);
    const tarea = await Tarea.cambiarEstado(req.params.id, estado, req.user.id, supabase);
    res.json(tarea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const eliminarTarea = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    await Tarea.eliminar(req.params.id, req.user.id, supabase);
    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const contarTareasPorEstado = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const conteo = await Tarea.contarPorEstado(req.user.id, supabase);
    res.json(conteo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 