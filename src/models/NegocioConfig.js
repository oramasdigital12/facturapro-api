import { validarDatosNegocio } from '../utils/validarNegocio.js';

class NegocioConfig {
  static async obtenerPorUsuario(user_id, supabase) {
    const { data, error } = await supabase
      .from('negocio_config')
      .select('*')
      .eq('user_id', user_id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async guardar(datos, user_id, supabase) {
    const errores = validarDatosNegocio(datos);
    if (errores.length > 0) {
      throw new Error('Errores de validación: ' + errores.join(', '));
    }
    // upsert: si existe actualiza, si no, crea
    const { data, error } = await supabase
      .from('negocio_config')
      .upsert([{ 
        ...datos, 
        user_id,
        logo_url: datos.logo_url || null,
        color_personalizado: datos.color_personalizado || null,
        nota_factura: datos.nota_factura || null,
        terminos_condiciones: datos.terminos_condiciones || null
      }], { onConflict: ['user_id'] })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export default NegocioConfig; 