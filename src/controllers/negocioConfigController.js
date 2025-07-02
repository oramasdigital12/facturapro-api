import NegocioConfig from '../models/NegocioConfig.js';
import { getSupabaseForUser } from '../config/supabase.js';
import formidable from 'formidable';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import fsSync from 'fs';

export const obtenerNegocioConfig = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const config = await NegocioConfig.obtenerPorUsuario(req.user.id, supabase);
    res.json(config || {});
  } catch (error) {
    console.error('Error al obtener configuración del negocio:', error);
    res.status(500).json({ error: 'Error al obtener configuración del negocio', details: error.message });
  }
};

export const guardarNegocioConfig = async (req, res) => {
  try {
    const supabase = getSupabaseForUser(req.token);
    const config = await NegocioConfig.guardar(req.body, req.user.id, supabase);
    res.status(201).json(config);
  } catch (error) {
    console.error('Error al guardar configuración del negocio:', error);
    res.status(500).json({ error: 'Error al guardar configuración del negocio', details: error.message });
  }
};

export const subirLogoNegocio = async (req, res) => {
  const form = formidable({ maxFileSize: 1 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Archivo demasiado grande o inválido' });
    }
    let file = files.logo;
    if (Array.isArray(file)) file = file[0];
    if (!file) {
      return res.status(400).json({ error: 'No se envió archivo logo' });
    }
    const filename = file.originalFilename || file.newFilename || file.name || 'logo.png';
    const ext = filename.split('.').pop();
    // Limpiar el nombre del archivo para evitar caracteres raros
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    // Forzar content-type seguro
    let contentType = 'image/png';
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      contentType = file.mimetype;
    }
    // Segmentar por usuario y usar nombre único
    const uniqueFilePath = `logos/${req.user.id}/logo_${Date.now()}.${ext}`;
    const fileBuffer = await fs.readFile(file.filepath);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Buscar y eliminar logo anterior si existe
    // Obtener la config actual del usuario
    const { data: config, error: configError } = await supabase
      .from('negocio_config')
      .select('logo_url')
      .eq('user_id', req.user.id)
      .single();
    if (config && config.logo_url) {
      // Extraer el path relativo del archivo anterior desde la URL pública
      const match = config.logo_url.match(/\/logos\/(.+)$/);
      if (match && match[1]) {
        const oldPath = `logos/${match[1]}`;
        await supabase.storage.from('logos').remove([oldPath]);
      }
    }

    // Subir el nuevo logo
    const { error: uploadError } = await supabase.storage.from('logos').upload(uniqueFilePath, fileBuffer, { upsert: true, contentType });
    if (uploadError) {
      return res.status(500).json({ error: 'Error al subir el logo', details: uploadError.message });
    }
    const { data } = supabase.storage.from('logos').getPublicUrl(uniqueFilePath);

    // Actualizar el campo logo_url en la base de datos
    await supabase
      .from('negocio_config')
      .update({ logo_url: data.publicUrl })
      .eq('user_id', req.user.id);

    res.json({ url: data.publicUrl });
  });
}; 