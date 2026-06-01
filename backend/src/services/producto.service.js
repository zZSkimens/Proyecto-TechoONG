import { AppDataSource } from "../config/configDB.js";
import { Producto } from "../entities/producto.entity.js";
import { MovimientoInventario } from "../entities/movimiento_inventario.entity.js";

const productoRepository = AppDataSource.getRepository(Producto);
const movimientoRepository = AppDataSource.getRepository(MovimientoInventario);

export async function findProductos() {
  return await productoRepository.find({ where: { activo: true } });
}

export async function findProductoById(id) {
  const producto = await productoRepository.findOneBy({ id: parseInt(id) });
  if (!producto) {
    throw new Error("Producto no encontrado");
  }
  return producto;
}

export async function createProducto(data) {
  const nuevoProducto = productoRepository.create({
    nombre: data.nombre,
    descripcion: data.descripcion || null,
    unidad_medida: data.unidad_medida,
    stock_actual: data.stock_actual || 0,
    stock_minimo: data.stock_minimo || 0,
  });

  const productoGuardado = await productoRepository.save(nuevoProducto);

  if (productoGuardado.stock_actual > 0) {
    const movimiento = movimientoRepository.create({
      producto_id: productoGuardado.id,
      tipo: "entrada",
      cantidad: productoGuardado.stock_actual,
      stock_anterior: 0,
      stock_posterior: productoGuardado.stock_actual,
      referencia_tipo: "creacion_producto",
      descripcion: `Stock inicial del producto: ${productoGuardado.nombre}`,
      realizado_por: data.realizado_por || "Sistema",
    });
    await movimientoRepository.save(movimiento);
  }

  return productoGuardado;
}

export async function updateProducto(id, changes) {
  const producto = await findProductoById(id);
  const stockAnterior = producto.stock_actual;

  productoRepository.merge(producto, changes);
  const productoActualizado = await productoRepository.save(producto);

  if (changes.stock_actual !== undefined && changes.stock_actual !== stockAnterior) {
    const diferencia = changes.stock_actual - stockAnterior;
    const movimiento = movimientoRepository.create({
      producto_id: productoActualizado.id,
      tipo: diferencia > 0 ? "entrada" : "salida",
      cantidad: Math.abs(diferencia),
      stock_anterior: stockAnterior,
      stock_posterior: changes.stock_actual,
      referencia_tipo: "ajuste_manual",
      descripcion: `Ajuste manual de stock del producto: ${productoActualizado.nombre}`,
      realizado_por: changes.realizado_por || "Sistema",
    });
    await movimientoRepository.save(movimiento);
  }

  return productoActualizado;
}

export async function deleteProducto(id) {
  const producto = await findProductoById(id);
  producto.activo = false;
  return await productoRepository.save(producto);
}

export async function verificarDisponibilidadStock(items) {
  const resultados = [];
  let todoDisponible = true;

  for (const item of items) {
    const producto = await productoRepository.findOneBy({ id: item.producto_id });
    if (!producto) {
      resultados.push({
        producto_id: item.producto_id,
        disponible: false,
        motivo: "Producto no encontrado",
        stock_actual: 0,
        cantidad_solicitada: item.cantidad_solicitada,
      });
      todoDisponible = false;
      continue;
    }

    const disponible = producto.stock_actual >= item.cantidad_solicitada;
    if (!disponible) todoDisponible = false;

    resultados.push({
      producto_id: producto.id,
      nombre_producto: producto.nombre,
      disponible,
      stock_actual: producto.stock_actual,
      cantidad_solicitada: item.cantidad_solicitada,
      faltante: disponible ? 0 : item.cantidad_solicitada - producto.stock_actual,
    });
  }

  return { todoDisponible, detalle: resultados };
}

export async function findMovimientos(filtros = {}) {
  const where = {};
  if (filtros.producto_id) where.producto_id = parseInt(filtros.producto_id);
  if (filtros.tipo) where.tipo = filtros.tipo;

  return await movimientoRepository.find({
    where,
    order: { created_at: "DESC" },
  });
}
