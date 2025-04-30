import { supabase } from '../config/supabase.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Token de acceso requerido'
            });
        }

        // Verificar el token con Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            return res.status(403).json({
                error: 'Token inválido o expirado'
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        res.status(500).json({
            error: 'Error en autenticación',
            details: error.message
        });
    }
}; 