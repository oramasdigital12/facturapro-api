import { v4 as uuidv4 } from 'uuid';

class CategoriaNegocio {
  static async crear({ nombre, orden }, user_id, supabase) {
    const { data, error } = await supabase
      .from('categorias_negocio')
      .insert([{ user_id, nombre, orden }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async obtenerPorUsuario(user_id, supabase) {
    const { data, error } = await supabase
      .from('categorias_negocio')
      .select('*')
      .eq('user_id', user_id)
      .order('orden', { ascending: true });
    if (error) throw error;
    return data;
  }

  static async actualizar(id, { nombre, orden }, user_id, supabase) {
    const { data, error } = await supabase
      .from('categorias_negocio')
      .update({ nombre, orden })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async eliminar(id, user_id, supabase) {
    const { error } = await supabase
      .from('categorias_negocio')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);
    if (error) throw error;
    return { success: true };
  }
}

export default CategoriaNegocio; 