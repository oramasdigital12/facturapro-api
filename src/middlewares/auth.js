import { supabase } from '../config/supabase.js';
import { authenticateApiToken } from './apiTokenAuth.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'Token de acceso requerido'
            });
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        // Verificar si es un API token (64 caracteres hexadecimales)
        if (token.length === 64 && /^[a-f0-9]+$/i.test(token)) {
            // Es un API token, usar autenticación de API token
            return authenticateApiToken(req, res, next);
        } else {
            // Es un JWT normal, usar autenticación estándar
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error) {
                return res.status(403).json({
                    error: 'Token inválido o expirado'
                });
            }

            req.user = user;
            req.token = token;
            next();
        }
    } catch (error) {
        console.error('Error en autenticación:', error);
        res.status(500).json({
            error: 'Error en autenticación',
            details: error.message
        });
    }
}; 