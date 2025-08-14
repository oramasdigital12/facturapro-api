import { supabase } from '../config/supabase.js';

class MetodoPago {
  static async crear(datos, user_id, supabase) {
    try {
      const { data, error } = await supabase
        .from('metodos_pago')
        .insert([{ ...datos, user_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerTodos(user_id, supabase) {
    try {
      const { data, error } = await supabase
        .from('metodos_pago')
        .select('*')
        .eq('user_id', user_id)
        .order('orden', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorId(id, user_id, supabase) {
    try {
      const { data, error } = await supabase
        .from('metodos_pago')
        .select('*')
        .eq('id', id)
        .eq('user_id', user_id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async actualizar(id, datos, user_id, supabase) {
    try {
      const { data, error } = await supabase
        .from('metodos_pago')
        .update(datos)
        .eq('id', id)
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async eliminar(id, user_id, supabase) {
    try {
      const { error } = await supabase
        .from('metodos_pago')
        .delete()
        .eq('id', id)
        .eq('user_id', user_id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  static async cambiarOrden(ids, user_id, supabase) {
    try {
      const updates = ids.map((id, index) => ({
        id,
        orden: index + 1
      }));

      const { error } = await supabase
        .from('metodos_pago')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

export default MetodoPago;
