class Tarea {
  /**
   * Crea una nueva tarea para un usuario
   * @param {Object} datos - Datos de la tarea
   * @param {string} user_id - ID del usuario propietario
   * @param {Object} supabase - Cliente de Supabase autenticado
   * @returns {Object} Tarea creada
   * @throws {Error} Si ya existe una tarea en la misma fecha/hora
   */
  static async crear(datos, user_id, supabase) {
    // Validar que no exista otra tarea del usuario en la misma fecha/hora
    const { count } = await supabase
      .from('tareas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('fecha_hora', datos.fecha_hora);
    if (count > 0) throw new Error('Ya existe una tarea en esa fecha y hora');
    const { data, error } = await supabase
      .from('tareas')
      .insert([{ ...datos, user_id, estado: 'pendiente' }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Lista las tareas de un usuario con filtros opcionales
   * @param {string} user_id - ID del usuario propietario
   * @param {string} filtro - Filtro de estado: 'pendiente', 'por_vencer', 'vencida', 'completada'
   * @param {string} search - Término de búsqueda en la descripción
   * @param {Object} supabase - Cliente de Supabase autenticado
   * @returns {Array} Lista de tareas filtradas
   */
  static async listar(user_id, filtro, search, supabase) {
    let query = supabase.from('tareas').select('*').eq('user_id', user_id);
    const now = new Date();
    if (filtro === 'pendiente') {
      query = query.eq('estado', 'pendiente').gt('fecha_hora', now.toISOString());
    } else if (filtro === 'por_vencer') {
      const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
      query = query.eq('estado', 'pendiente').gte('fecha_hora', now.toISOString()).lte('fecha_hora', in48h);
    } else if (filtro === 'vencida') {
      query = query.eq('estado', 'pendiente').lt('fecha_hora', now.toISOString());
    } else if (filtro === 'completada') {
      query = query.eq('estado', 'completada');
    }
    if (search) {
      query = query.ilike('descripcion', `%${search}%`);
    }
    query = query.order('fecha_hora', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Obtiene una tarea específica por ID con datos del cliente asociado
   * @param {string} id - ID de la tarea
   * @param {string} user_id - ID del usuario propietario
   * @param {Object} supabase - Cliente de Supabase autenticado
   * @returns {Object} Tarea con datos del cliente
   */
  static async obtenerPorId(id, user_id, supabase) {
    const { data, error } = await supabase
      .from('tareas')
      .select('*, clientes(id, nombre, email, telefono)')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Actualiza una tarea existente
   * @param {string} id - ID de la tarea
   * @param {Object} datos - Datos a actualizar
   * @param {string} user_id - ID del usuario propietario
   * @param {Object} supabase - Cliente de Supabase autenticado
   * @returns {Object} Tarea actualizada
   * @throws {Error} Si ya existe otra tarea en la misma fecha/hora
   */
  static async actualizar(id, datos, user_id, supabase) {
    // Validar que no exista otra tarea del usuario en la misma fecha/hora
    if (datos.fecha_hora) {
      const { count } = await supabase
        .from('tareas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user_id)
        .eq('fecha_hora', datos.fecha_hora)
        .neq('id', id);
      if (count > 0) throw new Error('Ya existe una tarea en esa fecha y hora');
    }
    const { data, error } = await supabase
      .from('tareas')
      .update(datos)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Cambia el estado de una tarea
   * @param {string} id - ID de la tarea
   * @param {string} estado - Nuevo estado: 'pendiente' o 'completada'
   * @param {string} user_id - ID del usuario propietario
   * @param {Object} supabase - Cliente de Supabase autenticado
   * @returns {Object} Tarea actualizada
   */
  static async cambiarEstado(id, estado, user_id, supabase) {
    const { data, error } = await supabase
      .from('tareas')
      .update({ estado })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Elimina una tarea
   * @param {string} id - ID de la tarea
   * @param {string} user_id - ID del usuario propietario
   * @param {Object} supabase - Cliente de Supabase autenticado
   * @returns {boolean} true si se eliminó correctamente
   */
  static async eliminar(id, user_id, supabase) {
    const { error } = await supabase
      .from('tareas')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);
    if (error) throw error;
    return true;
  }

  /**
   * Cuenta las tareas por estado para un usuario
   * @param {string} user_id - ID del usuario propietario
   * @param {Object} supabase - Cliente de Supabase autenticado
   * @returns {Object} Conteo de tareas por estado
   */
  static async contarPorEstado(user_id, supabase) {
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
    const estados = {
      pendiente: supabase.from('tareas').select('id', { count: 'exact', head: true }).eq('user_id', user_id).eq('estado', 'pendiente').gt('fecha_hora', now.toISOString()),
      por_vencer: supabase.from('tareas').select('id', { count: 'exact', head: true }).eq('user_id', user_id).eq('estado', 'pendiente').gte('fecha_hora', now.toISOString()).lte('fecha_hora', in48h),
      vencida: supabase.from('tareas').select('id', { count: 'exact', head: true }).eq('user_id', user_id).eq('estado', 'pendiente').lt('fecha_hora', now.toISOString()),
      completada: supabase.from('tareas').select('id', { count: 'exact', head: true }).eq('user_id', user_id).eq('estado', 'completada'),
    };
    const results = await Promise.all(Object.values(estados));
    return {
      pendiente: results[0].count,
      por_vencer: results[1].count,
      vencida: results[2].count,
      completada: results[3].count,
    };
  }
}

export default Tarea; 