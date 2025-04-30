import User from '../models/User.js';

export const register = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Validaciones básicas
        if (!email || !password || !fullName) {
            return res.status(400).json({
                error: 'Todos los campos son requeridos'
            });
        }

        const user = await User.register(email, password, fullName);
        
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            error: 'Error al registrar usuario',
            details: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validaciones básicas
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y contraseña son requeridos'
            });
        }

        const result = await User.login(email, password);
        
        res.status(200).json({
            message: 'Login exitoso',
            ...result
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(401).json({
            error: 'Credenciales inválidas',
            details: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Este vendrá del middleware de autenticación
        const user = await User.getProfile(userId);
        
        res.status(200).json({
            user
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            error: 'Error al obtener perfil de usuario',
            details: error.message
        });
    }
}; 