import { validationResult } from 'express-validator';
import Venta from '../models/Venta.js';

export const registrarVenta = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Ignorar cualquier user_id enviado por el cliente
        const { cliente_id, tipo, monto, fecha } = req.body;
        const venta = await Venta.crear({
            cliente_id,
            tipo,
            monto,
            fecha,
            user_id: req.user.id
        });

        res.status(201).json(venta);
    } catch (error) {
        console.error('Error al registrar venta:', error);
        res.status(500).json({
            error: 'Error al registrar venta',
            details: error.message
        });
    }
};

export const obtenerVentas = async (req, res) => {
    try {
        const ventas = await Venta.obtenerTodas(req.user.id);
        res.json(ventas);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({
            error: 'Error al obtener ventas',
            details: error.message
        });
    }
};

export const obtenerVenta = async (req, res) => {
    try {
        const venta = await Venta.obtenerPorId(req.params.id, req.user.id);
        if (!venta) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        res.json(venta);
    } catch (error) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({
            error: 'Error al obtener venta',
            details: error.message
        });
    }
};

export const actualizarVenta = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Ignorar cualquier user_id enviado por el cliente
        const { cliente_id, tipo, monto, fecha } = req.body;
        const datosActualizados = { };
        if (cliente_id !== undefined) datosActualizados.cliente_id = cliente_id;
        if (tipo !== undefined) datosActualizados.tipo = tipo;
        if (monto !== undefined) datosActualizados.monto = monto;
        if (fecha !== undefined) datosActualizados.fecha = fecha;

        const venta = await Venta.actualizar(req.params.id, datosActualizados, req.user.id);
        if (!venta) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        res.json(venta);
    } catch (error) {
        console.error('Error al actualizar venta:', error);
        res.status(500).json({
            error: 'Error al actualizar venta',
            details: error.message
        });
    }
};

export const eliminarVenta = async (req, res) => {
    try {
        const eliminada = await Venta.eliminar(req.params.id, req.user.id);
        if (!eliminada) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        res.json({ message: 'Venta eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar venta:', error);
        res.status(500).json({
            error: 'Error al eliminar venta',
            details: error.message
        });
    }
};

export const obtenerVentasCliente = async (req, res) => {
    try {
        const ventas = await Venta.obtenerPorCliente(req.params.clienteId, req.user.id);
        res.json(ventas);
    } catch (error) {
        console.error('Error al obtener ventas del cliente:', error);
        res.status(500).json({
            error: 'Error al obtener ventas del cliente',
            details: error.message
        });
    }
};

export const obtenerVentasPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Se requieren fechas de inicio y fin' });
    }

    const ventas = await Venta.obtenerPorFecha(req.user.id, fechaInicio, fechaFin);
    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas por fecha:', error);
    res.status(500).json({ error: 'Error al obtener las ventas por fecha' });
  }
};

export const obtenerEstadisticas = async (req, res) => {
  try {
    const { año, mes } = req.query;
    
    if (!año || !mes) {
      return res.status(400).json({ error: 'Se requiere año y mes' });
    }

    const estadisticas = await Venta.obtenerEstadisticasMensuales(req.user.id, parseInt(año), parseInt(mes));
    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas' });
  }
}; 