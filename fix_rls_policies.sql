-- Script para corregir las políticas RLS de la tabla clientes
-- para permitir operaciones con API tokens
-- Ejecutar este script en el SQL Editor de Supabase

-- SOLUCIÓN: Usar SERVICE ROLE KEY para operaciones con API tokens
-- Las políticas RLS no pueden acceder al contexto del API token directamente
-- Por lo tanto, usaremos el SERVICE ROLE KEY que bypassa RLS

-- Verificar las políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'clientes';

-- Eliminar las políticas existentes de la tabla clientes
DROP POLICY IF EXISTS "Solo mis clientes" ON clientes;
DROP POLICY IF EXISTS "Users can view their own clients" ON clientes;
DROP POLICY IF EXISTS "Users can create their own clients" ON clientes;
DROP POLICY IF EXISTS "Users can update their own clients" ON clientes;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clientes;

-- Crear políticas más permisivas que permitan operaciones cuando auth.uid() es NULL
-- Esto permitirá que el SERVICE ROLE KEY funcione correctamente

-- Crear una política unificada que reemplace "Solo mis clientes" 
-- pero que permita tanto usuarios autenticados como SERVICE ROLE (API tokens)
CREATE POLICY "Solo mis clientes" ON clientes
    FOR ALL USING (
        auth.uid() = user_id OR auth.uid() IS NULL
    );

-- IMPORTANTE: Para que esto funcione, necesitamos usar el SERVICE ROLE KEY
-- en lugar del ANON KEY cuando usamos API tokens
