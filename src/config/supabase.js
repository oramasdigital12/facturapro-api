import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno de Supabase:');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
  console.error('   SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ Faltante');
  throw new Error('Faltan las variables de entorno de Supabase');
}

if (!serviceRoleKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY no configurada - API tokens no funcionarán correctamente');
}

// Validar formato del JWT
const validateJWTFormat = (token) => {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3;
};

if (!validateJWTFormat(supabaseKey)) {
  console.error('❌ SUPABASE_ANON_KEY no tiene formato JWT válido');
  console.error('   Formato esperado: header.payload.signature');
  console.error('   Longitud actual:', supabaseKey.length);
  console.error('   Primeros 20 caracteres:', supabaseKey.substring(0, 20) + '...');
  throw new Error('SUPABASE_ANON_KEY no tiene formato JWT válido');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getSupabaseForUser = (token) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}; 