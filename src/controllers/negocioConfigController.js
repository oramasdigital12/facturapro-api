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
    const uniqueFilePath = `${req.user.id}/logo_${Date.now()}.${ext}`;
    const fileBuffer = await fs.readFile(file.filepath);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Eliminar todos los archivos de logo anteriores del usuario antes de subir el nuevo logo
    try {
      const { data: listData, error: listError } = await supabase.storage.from('logos').list(`${req.user.id}/`, { limit: 100 });
      if (listError) {
        console.error('Error al listar archivos en storage:', listError);
      }
      if (Array.isArray(listData) && listData.length > 0) {
        const filesToDelete = listData.map(f => `${req.user.id}/${f.name}`);
        if (filesToDelete.length > 0) {
          const { error: removeError } = await supabase.storage.from('logos').remove(filesToDelete);
          if (removeError) {
            console.error('Error al eliminar archivos en storage:', removeError);
          }
        }
      }
    } catch (err) {
      console.error('Error al limpiar logos anteriores:', err);
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