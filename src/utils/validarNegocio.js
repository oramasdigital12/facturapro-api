export const validarDatosNegocio = (datos) => {
  const errores = [];
  if (!datos.nombre_negocio || datos.nombre_negocio.trim().length < 2) {
    errores.push('El nombre del negocio debe tener al menos 2 caracteres');
  }
  if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    errores.push('El email no es válido');
  }
  if (datos.telefono && !/^\+?[\d\s-]{8,}$/.test(datos.telefono)) {
    errores.push('El teléfono no es válido');
  }
  if (datos.color_personalizado && !/^#[0-9A-Fa-f]{6}$/.test(datos.color_personalizado)) {
    errores.push('El color personalizado debe ser un color hexadecimal válido (#RRGGBB)');
  }
  if (datos.logo_url && typeof datos.logo_url !== 'string') {
    errores.push('El logo debe ser una URL válida');
  }
  return errores;
}; 