import { AppDataSource } from "../config/configDb.js";
import { RecepcionEntrega, RecepcionEntregaItem } from "../entities/recepcion_entrega.entity.js";
import { OrdenDespacho, OrdenDespachoItem } from "../entities/orden_despacho.entity.js";
import { SolicitudAlimento } from "../entities/solicitud_alimento.entity.js";

const recepcionRepository = AppDataSource.getRepository(RecepcionEntrega);
const recepcionItemRepository = AppDataSource.getRepository(RecepcionEntregaItem);
const ordenDespachoRepository = AppDataSource.getRepository(OrdenDespacho);
const ordenDespachoItemRepository = AppDataSource.getRepository(OrdenDespachoItem);
const solicitudRepository = AppDataSource.getRepository(SolicitudAlimento);

export async function findRecepciones(filtros = {}) {
  const where = {};
  if (filtros.solicitud_id) where.solicitud_id = parseInt(filtros.solicitud_id);
  if (filtros.orden_despacho_id) where.orden_despacho_id = parseInt(filtros.orden_despacho_id);

  const recepciones = await recepcionRepository.find({
    where,
    order: { created_at: "DESC" },
  });

  for (const recepcion of recepciones) {
    recepcion.items = await recepcionItemRepository.find({
      where: { recepcion_id: recepcion.id },
    });
  }

  return recepciones;
}

export async function findRecepcionById(id) {
  const recepcion = await recepcionRepository.findOneBy({ id: parseInt(id) });
  if (!recepcion) {
    throw new Error("Recepción no encontrada");
  }

  recepcion.items = await recepcionItemRepository.find({
    where: { recepcion_id: recepcion.id },
  });

  return recepcion;
}

export async function confirmarRecepcion(data) {
  if (!data.orden_despacho_id) throw new Error("Debe indicar el ID de la orden de despacho");
  if (!data.recibido_por) throw new Error("Debe indicar quién recibe la entrega");
  if (!data.items || data.items.length === 0) throw new Error("Debe incluir el detalle de productos recibidos");

  const orden = await ordenDespachoRepository.findOneBy({ id: parseInt(data.orden_despacho_id) });
  if (!orden) {
    throw new Error("Orden de despacho no encontrada");
  }
  if (orden.estado !== "despachada") {
    throw new Error("La orden de despacho aún no ha sido despachada");
  }

  const recepcionExistente = await recepcionRepository.findOneBy({
    orden_despacho_id: parseInt(data.orden_despacho_id),
  });
  if (recepcionExistente) {
    throw new Error("Ya existe una recepción registrada para esta orden de despacho");
  }

  const itemsOrden = await ordenDespachoItemRepository.find({
    where: { orden_id: orden.id },
  });

  for (const item of data.items) {
    if (!item.producto_id) throw new Error("Cada item debe tener un producto_id");
    if (item.cantidad_recibida === undefined || item.cantidad_recibida === null) {
      throw new Error("Debe indicar la cantidad recibida para cada producto");
    }
  }

  let estadoGeneral = "conforme";
  for (const item of data.items) {
    if (item.estado_producto === "dañado" || item.estado_producto === "faltante") {
      estadoGeneral = "con_observaciones";
      break;
    }
    const itemOrden = itemsOrden.find((io) => io.producto_id === item.producto_id);
    if (itemOrden && item.cantidad_recibida < itemOrden.cantidad_despachada) {
      estadoGeneral = "con_observaciones";
      break;
    }
  }

  const recepcion = recepcionRepository.create({
    orden_despacho_id: parseInt(data.orden_despacho_id),
    solicitud_id: orden.solicitud_id,
    recibido_por: data.recibido_por,
    fecha_recepcion: new Date(),
    estado_general: estadoGeneral,
    observaciones_generales: data.observaciones_generales || null,
  });

  const recepcionGuardada = await recepcionRepository.save(recepcion);

  const itemsGuardados = [];
  for (const item of data.items) {
    const itemOrden = itemsOrden.find((io) => io.producto_id === item.producto_id);

    const recepcionItem = recepcionItemRepository.create({
      recepcion_id: recepcionGuardada.id,
      producto_id: item.producto_id,
      nombre_producto: itemOrden ? itemOrden.nombre_producto : `Producto ${item.producto_id}`,
      cantidad_esperada: itemOrden ? itemOrden.cantidad_despachada : item.cantidad_recibida,
      cantidad_recibida: item.cantidad_recibida,
      estado_producto: item.estado_producto || "bueno",
      observaciones: item.observaciones || null,
    });

    itemsGuardados.push(await recepcionItemRepository.save(recepcionItem));
  }

  recepcionGuardada.items = itemsGuardados;

  await solicitudRepository.update(
    { id: orden.solicitud_id },
    { estado: "entregada" }
  );

  return {
    recepcion: recepcionGuardada,
    mensaje: "Recepción confirmada exitosamente. Proceso finalizado.",
  };
}

export async function getTrazabilidad(solicitudId) {
  const solicitud = await solicitudRepository.findOneBy({ id: parseInt(solicitudId) });
  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  const orden = await ordenDespachoRepository.findOneBy({ solicitud_id: solicitud.id });
  let ordenItems = [];
  if (orden) {
    ordenItems = await ordenDespachoItemRepository.find({
      where: { orden_id: orden.id },
    });
  }

  let recepcion = null;
  let recepcionItems = [];
  if (orden) {
    recepcion = await recepcionRepository.findOneBy({ orden_despacho_id: orden.id });
    if (recepcion) {
      recepcionItems = await recepcionItemRepository.find({
        where: { recepcion_id: recepcion.id },
      });
    }
  }

  return {
    solicitud,
    orden_despacho: orden ? { ...orden, items: ordenItems } : null,
    recepcion: recepcion ? { ...recepcion, items: recepcionItems } : null,
    estado_actual: solicitud.estado,
    flujo_completo: solicitud.estado === "entregada",
  };
}
