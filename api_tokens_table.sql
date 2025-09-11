-- Script SQL para crear la tabla api_tokens en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Crear la tabla api_tokens
CREATE TABLE IF NOT EXISTS api_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    permisos TEXT[] DEFAULT ARRAY['read', 'write'],
    activo BOOLEAN DEFAULT true,
    ultimo_uso TIMESTAMP WITH TIME ZONE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar las consultas
CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON api_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_token ON api_tokens(token);
CREATE INDEX IF NOT EXISTS idx_api_tokens_activo ON api_tokens(activo);
CREATE INDEX IF NOT EXISTS idx_api_tokens_fecha_expiracion ON api_tokens(fecha_expiracion);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_api_tokens_updated_at 
    BEFORE UPDATE ON api_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Crear función para limpiar tokens expirados automáticamente
CREATE OR REPLACE FUNCTION limpiar_tokens_expirados()
RETURNS void AS $$
BEGIN
    UPDATE api_tokens 
    SET activo = false 
    WHERE fecha_expiracion < NOW() 
    AND activo = true;
END;
$$ language 'plpgsql';

-- Crear política RLS (Row Level Security)
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver sus propios tokens
CREATE POLICY "Users can view their own api tokens" ON api_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan crear sus propios tokens
CREATE POLICY "Users can create their own api tokens" ON api_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios solo puedan actualizar sus propios tokens
CREATE POLICY "Users can update their own api tokens" ON api_tokens
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan eliminar sus propios tokens
CREATE POLICY "Users can delete their own api tokens" ON api_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Comentarios en la tabla y columnas
COMMENT ON TABLE api_tokens IS 'Tabla para almacenar tokens de API de larga duración para integración con aplicaciones externas';
COMMENT ON COLUMN api_tokens.id IS 'ID único del token';
COMMENT ON COLUMN api_tokens.user_id IS 'ID del usuario propietario del token';
COMMENT ON COLUMN api_tokens.nombre IS 'Nombre descriptivo del token';
COMMENT ON COLUMN api_tokens.token IS 'Token de acceso (64 caracteres hexadecimales)';
COMMENT ON COLUMN api_tokens.fecha_creacion IS 'Fecha de creación del token';
COMMENT ON COLUMN api_tokens.fecha_expiracion IS 'Fecha de expiración del token';
COMMENT ON COLUMN api_tokens.permisos IS 'Array de permisos del token (read, write, delete, admin)';
COMMENT ON COLUMN api_tokens.activo IS 'Estado del token (activo/inactivo)';
COMMENT ON COLUMN api_tokens.ultimo_uso IS 'Última vez que se usó el token';
COMMENT ON COLUMN api_tokens.descripcion IS 'Descripción opcional del token';
