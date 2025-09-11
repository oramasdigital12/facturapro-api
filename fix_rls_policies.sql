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
DROP POLICY IF EXISTS "Users can view their own clients" ON clientes;
DROP POLICY IF EXISTS "Users can create their own clients" ON clientes;
DROP POLICY IF EXISTS "Users can update their own clients" ON clientes;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clientes;

-- Crear políticas más permisivas que permitan operaciones cuando auth.uid() es NULL
-- Esto permitirá que el SERVICE ROLE KEY funcione correctamente

-- Política para SELECT: permitir si es el usuario autenticado O si no hay usuario autenticado (SERVICE ROLE)
CREATE POLICY "Users can view their own clients" ON clientes
    FOR SELECT USING (
        auth.uid() = user_id OR auth.uid() IS NULL
    );

-- Política para INSERT: permitir si es el usuario autenticado O si no hay usuario autenticado (SERVICE ROLE)
CREATE POLICY "Users can create their own clients" ON clientes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR auth.uid() IS NULL
    );

-- Política para UPDATE: permitir si es el usuario autenticado O si no hay usuario autenticado (SERVICE ROLE)
CREATE POLICY "Users can update their own clients" ON clientes
    FOR UPDATE USING (
        auth.uid() = user_id OR auth.uid() IS NULL
    );

-- Política para DELETE: permitir si es el usuario autenticado O si no hay usuario autenticado (SERVICE ROLE)
CREATE POLICY "Users can delete their own clients" ON clientes
    FOR DELETE USING (
        auth.uid() = user_id OR auth.uid() IS NULL
    );

-- IMPORTANTE: Para que esto funcione, necesitamos usar el SERVICE ROLE KEY
-- en lugar del ANON KEY cuando usamos API tokens
