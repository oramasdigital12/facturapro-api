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
  return errores;
}; 