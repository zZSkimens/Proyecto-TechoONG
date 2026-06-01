import { AppDataSource } from "../config/configDB.js";
import { SolicitudAlimento, SolicitudAlimentoItem } from "../entities/solicitud_alimento.entity.js";
import { Producto } from "../entities/producto.entity.js";
import { OrdenDespacho, OrdenDespachoItem } from "../entities/orden_despacho.entity.js";
import { MovimientoInventario } from "../entities/movimiento_inventario.entity.js";

const solicitudRepository = AppDataSource.getRepository(SolicitudAlimento);
const solicitudItemRepository = AppDataSource.getRepository(SolicitudAlimentoItem);
const productoRepository = AppDataSource.getRepository(Producto);
const ordenDespachoRepository = AppDataSource.getRepository(OrdenDespacho);
const ordenDespachoItemRepository = AppDataSource.getRepository(OrdenDespachoItem);
const movimientoRepository = AppDataSource.getRepository(MovimientoInventario);

export async function findSolicitudes(filtros = {}) {
  const where = {};
  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.solicitante_id) where.solicitante_id = parseInt(filtros.solicitante_id);

  const solicitudes = await solicitudRepository.find({
    where,
    order: { created_at: "DESC" },
  });

  for (const solicitud of solicitudes) {
    solicitud.items = await solicitudItemRepository.find({
      where: { solicitud_id: solicitud.id },
    });
  }

  return solicitudes;
}

export async function findSolicitudById(id) {
  const solicitud = await solicitudRepository.findOneBy({ id: parseInt(id) });
  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  solicitud.items = await solicitudItemRepository.find({
    where: { solicitud_id: solicitud.id },
  });

  return solicitud;
}

export async function createSolicitud(data) {
  if (!data.nombre_solicitante) throw new Error("El nombre del solicitante es obligatorio");
  if (!data.fecha_entrega) throw new Error("La fecha de entrega es obligatoria");
  if (!data.destino) throw new Error("El destino es obligatorio");
  if (!data.actividad) throw new Error("La actividad o jornada es obligatoria");
  if (!data.responsable_recepcion) throw new Error("El responsable de recepción es obligatorio");
  if (!data.items || data.items.length === 0) throw new Error("Debe incluir al menos un producto en la solicitud");

  for (const item of data.items) {
    if (!item.producto_id) throw new Error("Cada item debe tener un producto_id");
    if (!item.cantidad_solicitada || item.cantidad_solicitada <= 0) {
      throw new Error("La cantidad solicitada debe ser mayor a 0");
    }
  }

  const solicitud = solicitudRepository.create({
    solicitante_id: data.solicitante_id,
    nombre_solicitante: data.nombre_solicitante,
    fecha_entrega: data.fecha_entrega,
    destino: data.destino,
    actividad: data.actividad,
    responsable_recepcion: data.responsable_recepcion,
    estado: "pendiente",
    observaciones: data.observaciones || null,
  });

  const solicitudGuardada = await solicitudRepository.save(solicitud);

  const itemsGuardados = [];
  for (const item of data.items) {
    const producto = await productoRepository.findOneBy({ id: item.producto_id });
    if (!producto) throw new Error(`Producto con ID ${item.producto_id} no encontrado`);

    const solicitudItem = solicitudItemRepository.create({
      solicitud_id: solicitudGuardada.id,
      producto_id: item.producto_id,
      nombre_producto: producto.nombre,
      cantidad_solicitada: item.cantidad_solicitada,
      unidad_medida: producto.unidad_medida,
    });

    itemsGuardados.push(await solicitudItemRepository.save(solicitudItem));
  }

  solicitudGuardada.items = itemsGuardados;
  return solicitudGuardada;
}

export async function aprobarSolicitud(id, data) {
  const solicitud = await findSolicitudById(id);

  if (solicitud.estado !== "pendiente") {
    throw new Error(`No se puede aprobar una solicitud en estado: ${solicitud.estado}`);
  }

  if (!data.aprobado_por) {
    throw new Error("Debe indicar quién aprueba la solicitud");
  }

  const items = await solicitudItemRepository.find({
    where: { solicitud_id: solicitud.id },
  });

  const itemsSinStock = [];
  for (const item of items) {
    const producto = await productoRepository.findOneBy({ id: item.producto_id });
    if (!producto || producto.stock_actual < item.cantidad_solicitada) {
      itemsSinStock.push({
        producto_id: item.producto_id,
        nombre_producto: item.nombre_producto,
        stock_actual: producto ? producto.stock_actual : 0,
        cantidad_solicitada: item.cantidad_solicitada,
      });
    }
  }

  if (itemsSinStock.length > 0) {
    const error = new Error("Stock insuficiente para uno o más productos");
    error.detalle = itemsSinStock;
    throw error;
  }

  solicitud.estado = "aprobada";
  solicitud.aprobado_por = data.aprobado_por;
  solicitud.fecha_aprobacion = new Date();
  await solicitudRepository.save(solicitud);

  const ordenDespacho = ordenDespachoRepository.create({
    solicitud_id: solicitud.id,
    estado: "pendiente",
  });
  const ordenGuardada = await ordenDespachoRepository.save(ordenDespacho);

  for (const item of items) {
    const ordenItem = ordenDespachoItemRepository.create({
      orden_id: ordenGuardada.id,
      producto_id: item.producto_id,
      nombre_producto: item.nombre_producto,
      cantidad_despachada: item.cantidad_solicitada,
      unidad_medida: item.unidad_medida,
    });
    await ordenDespachoItemRepository.save(ordenItem);
  }

  return {
    solicitud,
    orden_despacho: ordenGuardada,
    mensaje: "Solicitud aprobada y orden de despacho generada exitosamente",
  };
}

export async function rechazarSolicitud(id, data) {
  const solicitud = await findSolicitudById(id);

  if (solicitud.estado !== "pendiente") {
    throw new Error(`No se puede rechazar una solicitud en estado: ${solicitud.estado}`);
  }

  if (!data.motivo_rechazo) {
    throw new Error("Debe indicar el motivo del rechazo");
  }

  solicitud.estado = "rechazada";
  solicitud.motivo_rechazo = data.motivo_rechazo;
  solicitud.aprobado_por = data.aprobado_por || null;

  return await solicitudRepository.save(solicitud);
}
