import { supabase } from '../config/supabase.js';

class Venta {
  static async crear({ cliente_id, tipo, monto, fecha, user_id }) {
    try {
      const { data: venta, error } = await supabase
        .from('ventas')
        .insert([
          {
            cliente_id,
            tipo,
            monto,
            fecha,
            user_id
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return venta;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerTodas(userId) {
    try {
      const { data: ventas, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ventas;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorId(ventaId, userId) {
    try {
      const { data: venta, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('id', ventaId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return venta;
    } catch (error) {
      throw error;
    }
  }

  static async actualizar(ventaId, datosActualizados, userId) {
    try {
      const { data: venta, error } = await supabase
        .from('ventas')
        .update(datosActualizados)
        .eq('id', ventaId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return venta;
    } catch (error) {
      throw error;
    }
  }

  static async eliminar(ventaId, userId) {
    try {
      const { error } = await supabase
        .from('ventas')
        .delete()
        .eq('id', ventaId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorCliente(clienteId, userId) {
    try {
      const { data: ventas, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ventas;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorFecha(userId, fechaInicio, fechaFin) {
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select(`
        *,
        clientes (
          id,
          nombre,
          email,
          telefono
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', fechaInicio)
      .lte('created_at', fechaFin)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ventas;
  }

  static async obtenerEstadisticasMensuales(userId, año, mes) {
    const fechaInicio = new Date(año, mes - 1, 1).toISOString();
    const fechaFin = new Date(año, mes, 0).toISOString();

    const { data: ventas, error } = await supabase
      .from('ventas')
      .select('monto, tipo')
      .eq('user_id', userId)
      .gte('created_at', fechaInicio)
      .lte('created_at', fechaFin);

    if (error) throw error;

    const total = ventas.reduce((sum, venta) => sum + venta.monto, 0);
    const totalUnicas = ventas
      .filter(v => v.tipo === 'unica')
      .reduce((sum, venta) => sum + venta.monto, 0);
    const totalRecurrentes = ventas
      .filter(v => v.tipo === 'recurrente')
      .reduce((sum, venta) => sum + venta.monto, 0);

    return {
      total,
      totalUnicas,
      totalRecurrentes,
      cantidadVentas: ventas.length,
      cantidadUnicas: ventas.filter(v => v.tipo === 'unica').length,
      cantidadRecurrentes: ventas.filter(v => v.tipo === 'recurrente').length
    };
  }
}

export default Venta; 