import { v4 as uuidv4 } from 'uuid';

class ServicioNegocio {
  static async crear({ nombre, precio, categoria_id }, user_id, supabase) {
    const { data, error } = await supabase
      .from('servicios_negocio')
      .insert([{ user_id, nombre, precio, categoria_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async obtenerPorUsuario(user_id, supabase, categoria_id = null) {
    let query = supabase.from('servicios_negocio').select('*').eq('user_id', user_id);
    if (categoria_id) {
      query = query.eq('categoria_id', categoria_id);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async actualizar(id, { nombre, precio, categoria_id }, user_id, supabase) {
    const { data, error } = await supabase
      .from('servicios_negocio')
      .update({ nombre, precio, categoria_id })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async eliminar(id, user_id, supabase) {
    const { error } = await supabase
      .from('servicios_negocio')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);
    if (error) throw error;
    return { success: true };
  }
}

export default ServicioNegocio; 