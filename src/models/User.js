import { supabase } from '../config/supabase.js';

class User {
    static async register(email, password, fullName) {
        try {
            // Crear usuario en Supabase Auth
            const response = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (response.error) throw response.error;

            // Insertar usuario en la tabla users
            const { data: user, error: dbError } = await supabase
                .from('users')
                .insert([
                    {
                        id: response.data.user.id,
                        email,
                        full_name: fullName
                    }
                ])
                .select()
                .single();

            if (dbError) throw dbError;

            return {
                ...user,
                message: 'Por favor, confirma tu email antes de iniciar sesión'
            };
        } catch (error) {
            throw error;
        }
    }

    static async login(email, password) {
        try {
            // Iniciar sesión con Supabase Auth
            const response = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (response.error) throw response.error;
            if (!response.data || !response.data.session) throw new Error('Invalid credentials');

            // Obtener datos adicionales del usuario
            let { data: user, error: dbError } = await supabase
                .from('users')
                .select('*')
                .eq('id', response.data.session.user.id)
                .single();

            if (dbError) {
                // Si no encontramos el usuario en nuestra tabla, lo creamos
                const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: response.data.session.user.id,
                            email: email,
                            full_name: response.data.session.user.user_metadata.full_name || email
                        }
                    ])
                    .select()
                    .single();

                if (insertError) throw insertError;
                user = newUser;
            }

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role
                },
                token: response.data.session.access_token
            };
        } catch (error) {
            throw error;
        }
    }

    static async getProfile(userId) {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, full_name, role, created_at')
                .eq('id', userId)
                .single();

            if (error) throw error;
            if (!user) throw new Error('Usuario no encontrado');

            return user;
        } catch (error) {
            throw error;
        }
    }
}

export default User; 