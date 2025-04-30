import { supabase } from '../config/supabase.js';

const validarDatosCliente = (datos) => {
  const errores = [];
  
  if (!datos.nombre || datos.nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }
  
  if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    errores.push('El email no es válido');
  }
  
  if (datos.telefono && !/^\+?[\d\s-]{8,}$/.test(datos.telefono)) {
    errores.push('El teléfono no es válido');
  }
  
  if (datos.fecha_nacimiento && isNaN(Date.parse(datos.fecha_nacimiento))) {
    errores.push('La fecha de nacimiento no es válida');
  }
  
  if (datos.fecha_vencimiento && isNaN(Date.parse(datos.fecha_vencimiento))) {
    errores.push('La fecha de vencimiento no es válida');
  }
  
  return errores;
};

class Cliente {
  static async crear(datos, supabase) {
    try {
      const errores = validarDatosCliente(datos);
      if (errores.length > 0) {
        throw new Error('Errores de validación: ' + errores.join(', '));
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert([{ ...datos }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear cliente:', error.message);
      throw error;
    }
  }

  static async obtenerTodos(userId, supabase) {
    try {
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return clientes;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorId(clienteId, userId, supabase) {
    try {
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return cliente;
    } catch (error) {
      throw error;
    }
  }

  static async actualizar(id, datos, user_id, supabase) {
    try {
      const errores = validarDatosCliente(datos);
      if (errores.length > 0) {
        throw new Error('Errores de validación: ' + errores.join(', '));
      }

      const { data, error } = await supabase
        .from('clientes')
        .update(datos)
        .match({ id, user_id })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar cliente:', error.message);
      throw error;
    }
  }

  static async eliminar(clienteId, userId, supabase) {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorCategoria(categoria, userId, supabase) {
    try {
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('categoria', categoria)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return clientes;
    } catch (error) {
      throw error;
    }
  }

  static async buscarPorNombre(userId, nombre, supabase) {
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', userId)
      .ilike('nombre', `%${nombre}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return clientes;
  }
}

export default Cliente; 