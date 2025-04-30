import NegocioConfig from '../models/NegocioConfig.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const obtenerNegocioConfig = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const config = await NegocioConfig.obtenerPorUsuario(req.user.id, supabase);
    res.json(config || {});
  } catch (error) {
    console.error('Error al obtener configuración del negocio:', error);
    res.status(500).json({ error: 'Error al obtener configuración del negocio', details: error.message });
  }
};

export const guardarNegocioConfig = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const config = await NegocioConfig.guardar(req.body, req.user.id, supabase);
    res.status(201).json(config);
  } catch (error) {
    console.error('Error al guardar configuración del negocio:', error);
    res.status(500).json({ error: 'Error al guardar configuración del negocio', details: error.message });
  }
}; 