import CategoriaNegocio from '../models/CategoriaNegocio.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const crearCategoria = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const categoria = await CategoriaNegocio.crear(req.body, req.user.id, supabase);
    res.status(201).json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría', details: error.message });
  }
};

export const listarCategorias = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const categorias = await CategoriaNegocio.obtenerPorUsuario(req.user.id, supabase);
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías', details: error.message });
  }
};

export const actualizarCategoria = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const categoria = await CategoriaNegocio.actualizar(req.params.id, req.body, req.user.id, supabase);
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría', details: error.message });
  }
};

export const eliminarCategoria = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    await CategoriaNegocio.eliminar(req.params.id, req.user.id, supabase);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría', details: error.message });
  }
}; 