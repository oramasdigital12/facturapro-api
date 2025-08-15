-- Script para agregar la columna uuid_publico a la tabla facturas
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar la columna uuid_publico
ALTER TABLE facturas 
ADD COLUMN uuid_publico UUID DEFAULT gen_random_uuid();

-- 2. Crear un índice único para uuid_publico para búsquedas rápidas
CREATE UNIQUE INDEX idx_facturas_uuid_publico ON facturas(uuid_publico);

-- 3. Generar UUIDs para facturas existentes que no tengan uuid_publico
UPDATE facturas 
SET uuid_publico = gen_random_uuid() 
WHERE uuid_publico IS NULL;

-- 4. Hacer la columna NOT NULL después de llenar los datos
ALTER TABLE facturas 
ALTER COLUMN uuid_publico SET NOT NULL;

-- 5. Verificar que se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'facturas' 
AND column_name = 'uuid_publico';
