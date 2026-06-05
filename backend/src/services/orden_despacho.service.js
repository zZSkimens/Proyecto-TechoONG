import { AppDataSource } from "../config/configDb.js";
import { OrdenDespacho, OrdenDespachoItem } from "../entities/orden_despacho.entity.js";
import { SolicitudAlimento } from "../entities/solicitud_alimento.entity.js";
import { Producto } from "../entities/producto.entity.js";
import { MovimientoInventario } from "../entities/movimiento_inventario.entity.js";

const ordenDespachoRepository = AppDataSource.getRepository(OrdenDespacho);
const ordenDespachoItemRepository = AppDataSource.getRepository(OrdenDespachoItem);
const solicitudRepository = AppDataSource.getRepository(SolicitudAlimento);
const productoRepository = AppDataSource.getRepository(Producto);
const movimientoRepository = AppDataSource.getRepository(MovimientoInventario);

export async function findOrdenes(filtros = {}) {
  const where = {};
  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.solicitud_id) where.solicitud_id = parseInt(filtros.solicitud_id);

  const ordenes = await ordenDespachoRepository.find({
    where,
    order: { created_at: "DESC" },
  });

  for (const orden of ordenes) {
    orden.items = await ordenDespachoItemRepository.find({
      where: { orden_id: orden.id },
    });
  }

  return ordenes;
}

export async function findOrdenById(id) {
  const orden = await ordenDespachoRepository.findOneBy({ id: parseInt(id) });
  if (!orden) {
    throw new Error("Orden de despacho no encontrada");
  }

  orden.items = await ordenDespachoItemRepository.find({
    where: { orden_id: orden.id },
  });

  return orden;
}

export async function procesarDespacho(id, data) {
  const orden = await findOrdenById(id);

  if (orden.estado === "despachada") {
    throw new Error("Esta orden ya fue despachada");
  }

  if (!data.despachado_por) {
    throw new Error("Debe indicar quién realiza el despacho");
  }

  const items = await ordenDespachoItemRepository.find({
    where: { orden_id: orden.id },
  });

  for (const item of items) {
    const producto = await productoRepository.findOneBy({ id: item.producto_id });
    if (!producto) {
      throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
    }
    if (producto.stock_actual < item.cantidad_despachada) {
      throw new Error(
        `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock_actual}, Requerido: ${item.cantidad_despachada}`
      );
    }
  }

  for (const item of items) {
    const producto = await productoRepository.findOneBy({ id: item.producto_id });
    const stockAnterior = producto.stock_actual;
    producto.stock_actual -= item.cantidad_despachada;

    await productoRepository.save(producto);

    const movimiento = movimientoRepository.create({
      producto_id: producto.id,
      tipo: "salida",
      cantidad: item.cantidad_despachada,
      stock_anterior: stockAnterior,
      stock_posterior: producto.stock_actual,
      referencia_tipo: "despacho",
      referencia_id: orden.id,
      descripcion: `Despacho de ${item.cantidad_despachada} ${item.unidad_medida} de "${producto.nombre}" - Orden #${orden.id}`,
      realizado_por: data.despachado_por,
    });
    await movimientoRepository.save(movimiento);
  }

  orden.estado = "despachada";
  orden.despachado_por = data.despachado_por;
  orden.fecha_despacho = new Date();
  orden.observaciones = data.observaciones || null;
  await ordenDespachoRepository.save(orden);

  await solicitudRepository.update(
    { id: orden.solicitud_id },
    { estado: "despachada" }
  );

  const solicitud = await solicitudRepository.findOneBy({ id: orden.solicitud_id });
  const comprobante = {
    comprobante_despacho: {
      numero_orden: orden.id,
      numero_solicitud: orden.solicitud_id,
      fecha_despacho: orden.fecha_despacho,
      despachado_por: orden.despachado_por,
      destino: solicitud.destino,
      actividad: solicitud.actividad,
      responsable_recepcion: solicitud.responsable_recepcion,
      items: items.map((item) => ({
        producto: item.nombre_producto,
        cantidad: item.cantidad_despachada,
        unidad: item.unidad_medida,
      })),
    },
  };

  return {
    orden,
    comprobante,
    mensaje: "Despacho procesado exitosamente. Stock actualizado.",
  };
}

export async function getComprobante(id) {
  const orden = await findOrdenById(id);

  if (orden.estado !== "despachada") {
    throw new Error("La orden aún no ha sido despachada");
  }

  const solicitud = await solicitudRepository.findOneBy({ id: orden.solicitud_id });
  const items = await ordenDespachoItemRepository.find({
    where: { orden_id: orden.id },
  });

  return {
    comprobante_despacho: {
      numero_orden: orden.id,
      numero_solicitud: orden.solicitud_id,
      fecha_despacho: orden.fecha_despacho,
      despachado_por: orden.despachado_por,
      destino: solicitud.destino,
      actividad: solicitud.actividad,
      responsable_recepcion: solicitud.responsable_recepcion,
      nombre_solicitante: solicitud.nombre_solicitante,
      items: items.map((item) => ({
        producto: item.nombre_producto,
        cantidad: item.cantidad_despachada,
        unidad: item.unidad_medida,
      })),
      observaciones: orden.observaciones,
    },
  };
}
