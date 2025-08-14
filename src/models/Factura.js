import { supabase } from '../config/supabase.js';

const validarDatosFactura = (datos, esActualizacion = false) => {
  const errores = [];
  // Solo obligatorio al crear, o si se envía en actualización
  if (!esActualizacion || datos.cliente_id !== undefined) {
    if (!datos.cliente_id || typeof datos.cliente_id !== 'string') {
      errores.push('El cliente_id es requerido');
    }
  }
  
  if (datos.estado && !['pendiente', 'pagada', 'borrador'].includes(datos.estado)) {
    errores.push('El estado debe ser: pendiente, pagada o borrador');
  }
  
  if (datos.subtotal !== undefined && (isNaN(datos.subtotal) || datos.subtotal < 0)) {
    errores.push('El subtotal debe ser un número válido mayor o igual a 0');
  }
  
  if (datos.impuesto !== undefined && (isNaN(datos.impuesto) || datos.impuesto < 0)) {
    errores.push('El impuesto debe ser un número válido mayor o igual a 0');
  }
  
  if (datos.total !== undefined && (isNaN(datos.total) || datos.total < 0)) {
    errores.push('El total debe ser un número válido mayor o igual a 0');
  }
  
  if (datos.deposito !== undefined && (isNaN(datos.deposito) || datos.deposito < 0)) {
    errores.push('El depósito debe ser un número válido mayor o igual a 0');
  }
  
  if (datos.balance_restante !== undefined && (isNaN(datos.balance_restante) || datos.balance_restante < 0)) {
    errores.push('El balance restante debe ser un número válido mayor o igual a 0');
  }
  
  return errores;
};

const validarItemsFactura = (items) => {
  if (!Array.isArray(items)) {
    return ['Los items deben ser un array'];
  }
  
  const errores = [];
  
  items.forEach((item, index) => {
    if (!item.descripcion || typeof item.descripcion !== 'string' || item.descripcion.trim().length === 0) {
      errores.push(`Item ${index + 1}: La descripción es requerida`);
    }
    
    if (item.precio_unitario === undefined || isNaN(item.precio_unitario) || item.precio_unitario < 0) {
      errores.push(`Item ${index + 1}: El precio unitario debe ser un número válido mayor o igual a 0`);
    }
    
    if (item.cantidad === undefined || !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      errores.push(`Item ${index + 1}: La cantidad debe ser un número entero mayor a 0`);
    }
    
    if (item.total === undefined || isNaN(item.total) || item.total < 0) {
      errores.push(`Item ${index + 1}: El total debe ser un número válido mayor o igual a 0`);
    }
  });
  
  return errores;
};

class Factura {
  static async obtenerSiguienteNumero(userId, supabase) {
    try {
      const { data, error } = await supabase
        .from('facturas')
        .select('numero_factura')
        .eq('user_id', userId)
        .order('numero_factura', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data ? data.numero_factura + 1 : 1;
    } catch (error) {
      console.error('Error al obtener siguiente número de factura:', error);
      throw error;
    }
  }

  static async obtenerConfiguracionNegocio(userId, supabase) {
    try {
      const { data, error } = await supabase
        .from('negocio_config')
        .select('logo_url, firma_url, terminos_condiciones, nota_factura, nombre_negocio, email, telefono, direccion, color_personalizado')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || {};
    } catch (error) {
      console.error('Error al obtener configuración del negocio:', error);
      return {};
    }
  }

  static async crear(datos, items, supabase) {
    try {
      const errores = validarDatosFactura(datos);
      if (errores.length > 0) {
        throw new Error('Errores de validación: ' + errores.join(', '));
      }

      const erroresItems = validarItemsFactura(items);
      if (erroresItems.length > 0) {
        throw new Error('Errores en items: ' + erroresItems.join(', '));
      }

      // Obtener siguiente número de factura
      const numeroFactura = await this.obtenerSiguienteNumero(datos.user_id, supabase);
      
      // Obtener configuración del negocio para valores por defecto
      const configNegocio = await this.obtenerConfiguracionNegocio(datos.user_id, supabase);
      
      // Preparar datos de la factura
      const datosFactura = {
        ...datos,
        numero_factura: numeroFactura,
        fecha_factura: datos.fecha_factura || new Date().toISOString().split('T')[0],
        fecha_vencimiento: datos.fecha_vencimiento || null,
        estado: datos.estado || 'pendiente',
        metodo_pago_id: datos.metodo_pago_id || null,
        logo_personalizado_url: datos.logo_personalizado_url || configNegocio.logo_url,
        firma_url: datos.firma_url || configNegocio.firma_url,
        terminos: datos.terminos || configNegocio.terminos_condiciones,
        nota: datos.nota || configNegocio.nota_factura
      };

      // Crear la factura
      const { data: factura, error: errorFactura } = await supabase
        .from('facturas')
        .insert([datosFactura])
        .select()
        .single();

      if (errorFactura) throw errorFactura;

      // Crear los items de la factura
      const itemsConFacturaId = items.map(item => ({
        ...item,
        factura_id: factura.id
      }));

      const { data: itemsCreados, error: errorItems } = await supabase
        .from('factura_items')
        .insert(itemsConFacturaId)
        .select();

      if (errorItems) throw errorItems;

      // Retornar factura con items
      return {
        ...factura,
        items: itemsCreados
      };
    } catch (error) {
      console.error('Error al crear factura:', error.message);
      throw error;
    }
  }

  static async obtenerTodas(userId, filtros = {}, supabase) {
    try {
      let query = supabase
        .from('facturas')
        .select(`
          *,
          cliente:clientes(id, nombre, email, telefono),
          metodo_pago:metodos_pago(id, nombre, link, descripcion),
          items:factura_items(*)
        `)
        .eq('user_id', userId);

      // Aplicar filtros
      if (filtros.cliente_id) {
        query = query.eq('cliente_id', filtros.cliente_id);
      }

      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }

      if (filtros.fecha_inicio) {
        query = query.gte('fecha_factura', filtros.fecha_inicio);
      }

      if (filtros.fecha_fin) {
        query = query.lte('fecha_factura', filtros.fecha_fin);
      }

      const { data: facturas, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      return facturas;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorId(facturaId, userId, supabase) {
    try {
      const { data: factura, error } = await supabase
        .from('facturas')
        .select(`
          *,
          cliente:clientes(id, nombre, email, telefono, direccion),
          metodo_pago:metodos_pago(id, nombre, link, descripcion),
          items:factura_items(*)
        `)
        .eq('id', facturaId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return factura;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorUuidPublico(uuid, supabase) {
    try {
      const { data: factura, error } = await supabase
        .from('facturas')
        .select(`
          *,
          cliente:clientes(id, nombre, email, telefono, direccion),
          metodo_pago:metodos_pago(id, nombre, link, descripcion),
          items:factura_items(*)
        `)
        .eq('id', uuid)
        .single();

      if (error) throw error;
      return factura;
    } catch (error) {
      throw error;
    }
  }

  static async actualizar(id, datos, items, userId, supabase) {
    try {
      const errores = validarDatosFactura(datos, true);
      if (errores.length > 0) {
        throw new Error('Errores de validación: ' + errores.join(', '));
      }

      if (items) {
        const erroresItems = validarItemsFactura(items);
        if (erroresItems.length > 0) {
          throw new Error('Errores en items: ' + erroresItems.join(', '));
        }
      }

      // Si el estado cambia a 'pagada', establecer fecha_pagada
      if (datos.estado === 'pagada') {
        datos.fecha_pagada = new Date().toISOString().split('T')[0];
      }

      // Actualizar la factura
      const { data: factura, error: errorFactura } = await supabase
        .from('facturas')
        .update(datos)
        .match({ id, user_id: userId })
        .select()
        .single();

      if (errorFactura) throw errorFactura;

      // Si se proporcionan items, eliminar los viejos y crear los nuevos
      if (items) {
        // Eliminar items existentes
        const { error: errorEliminar } = await supabase
          .from('factura_items')
          .delete()
          .eq('factura_id', id);

        if (errorEliminar) throw errorEliminar;

        // Crear nuevos items
        const itemsConFacturaId = items.map(item => ({
          ...item,
          factura_id: id
        }));

        const { data: itemsCreados, error: errorItems } = await supabase
          .from('factura_items')
          .insert(itemsConFacturaId)
          .select();

        if (errorItems) throw errorItems;

        return {
          ...factura,
          items: itemsCreados
        };
      }

      // Si no se proporcionan items, obtener los existentes
      const { data: itemsExistentes, error: errorItems } = await supabase
        .from('factura_items')
        .select('*')
        .eq('factura_id', id);

      if (errorItems) throw errorItems;

      return {
        ...factura,
        items: itemsExistentes
      };
    } catch (error) {
      console.error('Error al actualizar factura:', error.message);
      throw error;
    }
  }

  static async eliminar(facturaId, userId, supabase) {
    try {
      // Eliminar items primero (por la foreign key)
      const { error: errorItems } = await supabase
        .from('factura_items')
        .delete()
        .eq('factura_id', facturaId);

      if (errorItems) throw errorItems;

      // Eliminar la factura
      const { error } = await supabase
        .from('facturas')
        .delete()
        .eq('id', facturaId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default Factura; 