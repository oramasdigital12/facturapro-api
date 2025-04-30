import { supabase } from '../config/supabase.js';

class Mensaje {
  static async crear({ texto }, user_id, supabase) {
    const { data, error } = await supabase
      .from('mensajes')
      .insert([{ texto, user_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async listar(user_id, supabase) {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async obtenerPorId(id, user_id, supabase) {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();
    if (error) throw error;
    return data;
  }

  static async actualizar(id, { texto }, user_id, supabase) {
    const { data, error } = await supabase
      .from('mensajes')
      .update({ texto })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async eliminar(id, user_id, supabase) {
    const { error } = await supabase
      .from('mensajes')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);
    if (error) throw error;
    return true;
  }

  static generarLinkWhatsApp(telefono, mensaje) {
    // Eliminar caracteres no numéricos del teléfono
    const numeroLimpio = telefono.replace(/\D/g, '');
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    return `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
  }
}

export default Mensaje; 