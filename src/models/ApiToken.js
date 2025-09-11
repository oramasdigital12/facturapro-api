import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

const validarDatosApiToken = (datos) => {
  const errores = [];
  
  if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim().length === 0) {
    errores.push('El nombre del token es requerido');
  }
  
  if (datos.nombre && datos.nombre.length > 100) {
    errores.push('El nombre del token no puede exceder 100 caracteres');
  }
  
  if (!datos.duracion_dias || typeof datos.duracion_dias !== 'number' || datos.duracion_dias < 1) {
    errores.push('La duración en días debe ser un número mayor a 0');
  }
  
  if (datos.duracion_dias > 365) {
    errores.push('La duración máxima es de 365 días');
  }
  
  if (datos.permisos && !Array.isArray(datos.permisos)) {
    errores.push('Los permisos deben ser un array');
  }
  
  return errores;
};

const generarToken = () => {
  // Generar un token seguro de 64 caracteres
  return crypto.randomBytes(32).toString('hex');
};

const calcularFechaExpiracion = (duracionDias) => {
  const fechaExpiracion = new Date();
  fechaExpiracion.setDate(fechaExpiracion.getDate() + duracionDias);
  return fechaExpiracion.toISOString();
};

export default class ApiToken {
  static async crear(datos, userId, supabase) {
    try {
      const errores = validarDatosApiToken(datos);
      if (errores.length > 0) {
        throw new Error(errores.join(', '));
      }

      const token = generarToken();
      const fechaExpiracion = calcularFechaExpiracion(datos.duracion_dias);
      
      const datosToken = {
        user_id: userId,
        nombre: datos.nombre.trim(),
        token: token,
        fecha_expiracion: fechaExpiracion,
        permisos: datos.permisos || ['read', 'write'],
        activo: true,
        ultimo_uso: null,
        descripcion: datos.descripcion || null
      };

      const { data: tokenCreado, error } = await supabase
        .from('api_tokens')
        .insert(datosToken)
        .select()
        .single();

      if (error) throw error;

      // Retornar el token completo solo en la creación
      return {
        ...tokenCreado,
        token: token // Incluir el token en la respuesta
      };
    } catch (error) {
      console.error('Error al crear API token:', error.message);
      throw error;
    }
  }

  static async obtenerPorToken(token, supabase) {
    try {
      const { data: apiToken, error } = await supabase
        .from('api_tokens')
        .select('*')
        .eq('token', token)
        .eq('activo', true)
        .single();

      if (error) throw error;
      
      // Verificar si el token ha expirado
      if (apiToken && new Date(apiToken.fecha_expiracion) < new Date()) {
        // Marcar como inactivo
        await supabase
          .from('api_tokens')
          .update({ activo: false })
          .eq('id', apiToken.id);
        
        return null;
      }

      return apiToken;
    } catch (error) {
      return null;
    }
  }

  static async obtenerTodos(userId, supabase) {
    try {
      const { data: tokens, error } = await supabase
        .from('api_tokens')
        .select('id, nombre, fecha_creacion, fecha_expiracion, permisos, activo, ultimo_uso, descripcion')
        .eq('user_id', userId)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      return tokens;
    } catch (error) {
      throw error;
    }
  }

  static async actualizarUltimoUso(tokenId, supabase) {
    try {
      const { error } = await supabase
        .from('api_tokens')
        .update({ ultimo_uso: new Date().toISOString() })
        .eq('id', tokenId);

      if (error) throw error;
    } catch (error) {
      console.error('Error al actualizar último uso:', error.message);
    }
  }

  static async revocar(tokenId, userId, supabase) {
    try {
      const { data: tokenRevocado, error } = await supabase
        .from('api_tokens')
        .update({ activo: false })
        .eq('id', tokenId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return tokenRevocado;
    } catch (error) {
      throw error;
    }
  }

  static async revocarTodos(userId, supabase) {
    try {
      const { error } = await supabase
        .from('api_tokens')
        .update({ activo: false })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }

  static async limpiarTokensExpirados(supabase) {
    try {
      const { error } = await supabase
        .from('api_tokens')
        .update({ activo: false })
        .lt('fecha_expiracion', new Date().toISOString())
        .eq('activo', true);

      if (error) throw error;
    } catch (error) {
      console.error('Error al limpiar tokens expirados:', error.message);
    }
  }
}
