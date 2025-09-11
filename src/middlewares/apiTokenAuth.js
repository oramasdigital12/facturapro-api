import ApiToken from '../models/ApiToken.js';
import { getSupabaseForUser } from '../config/supabase.js';
import { createClient } from '@supabase/supabase-js';

export const authenticateApiToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token de autorización requerido'
            });
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        // Verificar si es un JWT normal o un API token
        if (token.length === 64 && /^[a-f0-9]+$/i.test(token)) {
            // Es un API token (64 caracteres hexadecimales)
            await authenticateWithApiToken(token, req, res, next);
        } else {
            // Es un JWT normal, usar autenticación estándar
            await authenticateWithJWT(token, req, res, next);
        }
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};

const authenticateWithApiToken = async (apiToken, req, res, next) => {
    try {
        console.log('🔑 [DEBUG] Verificando API token:', apiToken.substring(0, 10) + '...');
        console.log('🔑 [DEBUG] Longitud del token:', apiToken.length);
        console.log('🔑 [DEBUG] Token completo:', apiToken);
        
        // Crear una instancia de supabase para verificar el token (sin JWT)
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        
        console.log('🔑 [DEBUG] Supabase configurado, buscando token...');
        const tokenData = await ApiToken.obtenerPorToken(apiToken, supabase);
        
        console.log('🔑 [DEBUG] Resultado de búsqueda:', tokenData ? 'Token encontrado' : 'Token NO encontrado');
        
        if (!tokenData) {
            console.log('❌ [DEBUG] Token no encontrado o expirado');
            return res.status(401).json({
                success: false,
                message: 'API token inválido o expirado'
            });
        }
        
        console.log('✅ [DEBUG] Token válido, continuando...');

        // Actualizar último uso
        await ApiToken.actualizarUltimoUso(tokenData.id, supabase);

        // Obtener información del usuario usando la misma instancia de supabase
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, full_name')
            .eq('id', tokenData.user_id)
            .single();

        if (userError || !user) {
            console.log('❌ [DEBUG] Usuario no encontrado:', userError);
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Agregar información del usuario y token a la request
        req.user = {
            id: user.id,
            email: user.email,
            nombre: user.full_name,
            negocio_id: null // No hay business_id en la tabla users
        };
        
        req.apiToken = {
            id: tokenData.id,
            nombre: tokenData.nombre,
            permisos: tokenData.permisos,
            fecha_expiracion: tokenData.fecha_expiracion
        };

        // Para API tokens, usar el cliente de supabase sin autenticación de usuario
        req.supabase = supabase;
        req.token = apiToken;

        next();
    } catch (error) {
        console.error('Error en autenticación con API token:', error);
        return res.status(401).json({
            success: false,
            message: 'Error en autenticación'
        });
    }
};

const authenticateWithJWT = async (jwtToken, req, res, next) => {
    try {
        // Crear instancia de supabase para el usuario
        const supabase = getSupabaseForUser(jwtToken);
        
        // Verificar el token con Supabase
        const { data: { user }, error } = await supabase.auth.getUser(jwtToken);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Token JWT inválido o expirado'
            });
        }

        // Obtener información adicional del usuario
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, nombre, negocio_id')
            .eq('id', user.id)
            .single();

        if (userError || !userData) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        req.user = {
            id: userData.id,
            email: userData.email,
            nombre: userData.nombre,
            negocio_id: userData.negocio_id
        };
        
        req.supabase = supabase;
        req.token = jwtToken;

        next();
    } catch (error) {
        console.error('Error en autenticación con JWT:', error);
        return res.status(401).json({
            success: false,
            message: 'Token JWT inválido o expirado'
        });
    }
};

export const requireApiTokenPermission = (permission) => {
    return (req, res, next) => {
        if (!req.apiToken) {
            return res.status(403).json({
                success: false,
                message: 'Se requiere API token para esta operación'
            });
        }

        if (!req.apiToken.permisos.includes(permission)) {
            return res.status(403).json({
                success: false,
                message: `Permiso '${permission}' requerido`
            });
        }

        next();
    };
};
