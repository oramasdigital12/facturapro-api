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
      // Obtener todas las facturas del usuario y ordenarlas numéricamente en JavaScript
      const { data: facturas, error } = await supabase
        .from('facturas')
        .select('numero_factura')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      if (!facturas || facturas.length === 0) {
        return 1;
      }

      // Convertir a números y encontrar el máximo
      const numeros = facturas.map(f => parseInt(f.numero_factura) || 0);
      const maximo = Math.max(...numeros);
      
      return maximo + 1;
    } catch (error) {
      console.error('Error al obtener siguiente número de factura:', error);
      throw error;
    }
  }

  static async verificarNumeroFacturaExiste(numeroFactura, userId, supabase) {
    try {
      const { data, error } = await supabase
        .from('facturas')
        .select('id')
        .eq('user_id', userId)
        .eq('numero_factura', numeroFactura)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data; // Retorna true si existe, false si no existe
    } catch (error) {
      console.error('Error al verificar número de factura:', error);
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

      // Obtener siguiente número de factura (usar el proporcionado o generar automáticamente)
      const numeroFactura = datos.numero_factura || await this.obtenerSiguienteNumero(datos.user_id, supabase);
      
      // Si se proporcionó un número de factura, verificar que no exista
      if (datos.numero_factura) {
        const existe = await this.verificarNumeroFacturaExiste(numeroFactura, datos.user_id, supabase);
        if (existe) {
          throw new Error(`El número de factura ${numeroFactura} ya existe`);
        }
      }
      
      // Obtener configuración del negocio para valores por defecto
      const configNegocio = await this.obtenerConfiguracionNegocio(datos.user_id, supabase);
      
      // Preparar datos de la factura
      const datosFactura = {
        ...datos,
        numero_factura: numeroFactura,
        fecha_factura: datos.fecha_factura || new Date().toISOString().split('T')[0],
        fecha_vencimiento: datos.fecha_vencimiento || null, // Valor por defecto para campos opcionales
        estado: datos.estado || 'pendiente',
        metodo_pago_id: datos.metodo_pago_id || null,
        logo_personalizado_url: datos.logo_personalizado_url || configNegocio.logo_url,
        firma_url: datos.firma_url || configNegocio.firma_url,
        terminos: datos.terminos || '', // Campo opcional, no usar configuración por defecto
        nota: datos.nota || '' // Campo opcional, no usar configuración por defecto
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
        .eq('user_id', userId)
        .is('deleted_at', null); // Excluir facturas eliminadas por soft delete

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
        .is('deleted_at', null) // Excluir facturas eliminadas por soft delete
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
        .eq('uuid_publico', uuid)
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

  static async obtenerEliminadas(userId, supabase) {
    try {
      const { data: facturas, error } = await supabase
        .from('facturas')
        .select(`
          *,
          cliente:clientes(id, nombre, email, telefono),
          metodo_pago:metodos_pago(id, nombre, link, descripcion),
          items:factura_items(*)
        `)
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return facturas;
    } catch (error) {
      throw error;
    }
  }

  static async softDelete(facturaId, userId, supabase) {
    try {
      // Obtener la factura para hacer backup del PDF
      const factura = await this.obtenerPorId(facturaId, userId, supabase);
      if (!factura) {
        throw new Error('Factura no encontrada');
      }

      // Hacer backup del PDF si existe
      if (factura.user_id && factura.id) {
        try {
          // Obtener configuración del negocio para generar nombre de archivo correcto
          const negocio = await this.obtenerConfiguracionNegocio(userId, supabase);
          
          // Generar el nombre de archivo correcto usando la misma lógica que al crear
          const { generarNombreArchivo } = await import('../services/pdfFacturaService.js');
          const fileName = generarNombreArchivo(factura, factura.cliente, negocio);
          const filePath = `${factura.user_id}/${fileName}`;
          const backupFileName = `${factura.user_id}/backup/${factura.id}_${Date.now()}.pdf`;
          
          console.log('💾 Intentando hacer backup de:', filePath);
          
          // Copiar archivo a backup (si existe)
          const { data: fileData, error: fileError } = await supabase.storage
            .from('facturas')
            .download(filePath);
          
          if (!fileError && fileData) {
            // Subir a bucket de backup
            const { error: uploadError } = await supabase.storage
              .from('facturas-backup')
              .upload(backupFileName, fileData, {
                contentType: 'application/pdf'
              });
            
            if (uploadError) {
              console.error('❌ Error al hacer backup del PDF:', uploadError);
            } else {
              console.log('✅ Backup del PDF creado:', backupFileName);
            }
          } else {
            console.log('⚠️ No se encontró archivo para hacer backup:', filePath);
          }
        } catch (backupError) {
          console.error('❌ Error en proceso de backup:', backupError);
        }
      }

      // Marcar como eliminada (soft delete)
      const { data: facturaActualizada, error } = await supabase
        .from('facturas')
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: userId
        })
        .eq('id', facturaId)
        .eq('user_id', userId)
        .select(`
          *,
          cliente:clientes(id, nombre, email, telefono),
          metodo_pago:metodos_pago(id, nombre, link, descripcion),
          items:factura_items(*)
        `)
        .single();

      if (error) throw error;
      return facturaActualizada;
    } catch (error) {
      throw error;
    }
  }

  static async hardDelete(facturaId, userId, supabase) {
    try {
      // Obtener la factura (incluyendo las eliminadas por soft delete)
      const { data: factura, error: facturaError } = await supabase
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

      if (facturaError) {
        throw new Error('Factura no encontrada');
      }

      if (!factura) {
        throw new Error('Factura no encontrada');
      }

      console.log('📋 Estado de la factura:', {
        id: factura.id,
        numero_factura: factura.numero_factura,
        estado: factura.estado,
        deleted_at: factura.deleted_at,
        user_id: factura.user_id
      });

      // Eliminar PDF de Supabase Storage si existe
      if (factura.user_id && factura.id) {
        try {
          // Obtener configuración del negocio para generar nombre de archivo correcto
          const negocio = await this.obtenerConfiguracionNegocio(userId, supabase);
          
          // Generar el nombre de archivo correcto usando la misma lógica que al crear
          const { generarNombreArchivo } = await import('../services/pdfFacturaService.js');
          const fileName = generarNombreArchivo(factura, factura.cliente, negocio);
          const filePath = `${factura.user_id}/${fileName}`;
          
          console.log('🗑️ Intentando eliminar archivo:', filePath);
          
          const { error: deleteError } = await supabase.storage
            .from('facturas')
            .remove([filePath]);
          
          if (deleteError) {
            console.error('❌ Error al eliminar PDF:', deleteError);
            // No lanzar error para que continúe con la eliminación de la base de datos
          } else {
            console.log('✅ PDF eliminado de storage:', filePath);
          }
        } catch (storageError) {
          console.error('❌ Error en eliminación de storage:', storageError);
          // No lanzar error para que continúe con la eliminación de la base de datos
        }
      }

      // Eliminar items de la factura
      console.log('🗑️ Eliminando items de la factura:', facturaId);
      const { error: itemsError } = await supabase
        .from('factura_items')
        .delete()
        .eq('factura_id', facturaId);

      if (itemsError) {
        console.error('❌ Error al eliminar items:', itemsError);
        throw itemsError;
      } else {
        console.log('✅ Items de la factura eliminados');
      }

      // Eliminar la factura permanentemente
      console.log('🗑️ Eliminando factura de la base de datos:', facturaId);
      const { error } = await supabase
        .from('facturas')
        .delete()
        .eq('id', facturaId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error al eliminar factura de la base de datos:', error);
        throw error;
      } else {
        console.log('✅ Factura eliminada de la base de datos');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async restore(facturaId, userId, supabase) {
    try {
      // Restaurar la factura (quitar deleted_at)
      const { data: facturaRestaurada, error } = await supabase
        .from('facturas')
        .update({ 
          deleted_at: null,
          deleted_by: null
        })
        .eq('id', facturaId)
        .eq('user_id', userId)
        .select(`
          *,
          cliente:clientes(id, nombre, email, telefono),
          metodo_pago:metodos_pago(id, nombre, link, descripcion),
          items:factura_items(*)
        `)
        .single();

      if (error) throw error;
      return facturaRestaurada;
    } catch (error) {
      throw error;
    }
  }

  static async limpiarFacturasAntiguas(userId, supabase, diasRetencion = 2555) { // 7 años por defecto
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasRetencion);

      // Obtener facturas eliminadas más antiguas que el límite
      const { data: facturasAntiguas, error } = await supabase
        .from('facturas')
        .select('id, user_id, deleted_at')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .lt('deleted_at', fechaLimite.toISOString());

      if (error) throw error;

      let eliminadas = 0;
      for (const factura of facturasAntiguas) {
        try {
          await this.hardDelete(factura.id, userId, supabase);
          eliminadas++;
        } catch (deleteError) {
          console.error(`Error al eliminar factura antigua ${factura.id}:`, deleteError);
        }
      }

      return { eliminadas, total: facturasAntiguas.length };
    } catch (error) {
      throw error;
    }
  }
}

export default Factura; 