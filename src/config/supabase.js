import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno de Supabase:');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
  console.error('   SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ Faltante');
  throw new Error('Faltan las variables de entorno de Supabase');
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