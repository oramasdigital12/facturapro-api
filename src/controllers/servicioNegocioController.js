import ServicioNegocio from '../models/ServicioNegocio.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const crearServicio = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const servicio = await ServicioNegocio.crear(req.body, req.user.id, supabase);
    res.status(201).json(servicio);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear servicio', details: error.message });
  }
};

export const listarServicios = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const categoria_id = req.query.categoria_id || null;
    const servicios = await ServicioNegocio.obtenerPorUsuario(req.user.id, supabase, categoria_id);
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener servicios', details: error.message });
  }
};

export const actualizarServicio = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const servicio = await ServicioNegocio.actualizar(req.params.id, req.body, req.user.id, supabase);
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar servicio', details: error.message });
  }
};

export const eliminarServicio = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    await ServicioNegocio.eliminar(req.params.id, req.user.id, supabase);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar servicio', details: error.message });
  }
}; 