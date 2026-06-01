import {findProductos,findProductoById,createProducto,updateProducto,deleteProducto,verificarDisponibilidadStock, findMovimientos,} from "../services/producto.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function getAllProductos(req, res) {
  try {
    const productos = await findProductos();
    handleSuccess(res, 200, "Productos obtenidos exitosamente", productos);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener los productos", error.message);
  }
}

export async function getProductoById(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return handleErrorClient(res, 400, "ID de producto inválido");
    }

    const producto = await findProductoById(id);
    handleSuccess(res, 200, "Producto obtenido exitosamente", producto);
  } catch (error) {
    handleErrorClient(res, 404, error.message);
  }
}

export async function crearProducto(req, res) {
  try {
    const data = req.body;

    if (!data.nombre) {
      return handleErrorClient(res, 400, "El nombre del producto es obligatorio");
    }
    if (!data.unidad_medida) {
      return handleErrorClient(res, 400, "La unidad de medida es obligatoria");
    }

    const nuevoProducto = await createProducto(data);
    handleSuccess(res, 201, "Producto creado exitosamente", nuevoProducto);
  } catch (error) {
    handleErrorServer(res, 500, "Error al crear el producto", error.message);
  }
}

export async function actualizarProducto(req, res) {
  try {
    const { id } = req.params;
    const changes = req.body;

    if (!id || isNaN(id)) {
      return handleErrorClient(res, 400, "ID de producto inválido");
    }

    if (!changes || Object.keys(changes).length === 0) {
      return handleErrorClient(res, 400, "Datos para actualizar son requeridos");
    }

    const productoActualizado = await updateProducto(id, changes);
    handleSuccess(res, 200, "Producto actualizado exitosamente", productoActualizado);
  } catch (error) {
    handleErrorClient(res, 404, error.message);
  }
}

export async function eliminarProducto(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return handleErrorClient(res, 400, "ID de producto inválido");
    }

    await deleteProducto(id);
    handleSuccess(res, 200, "Producto eliminado exitosamente", { id });
  } catch (error) {
    handleErrorClient(res, 404, error.message);
  }
}

export async function verificarStock(req, res) {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return handleErrorClient(res, 400, "Debe enviar una lista de items para verificar");
    }

    const resultado = await verificarDisponibilidadStock(items);
    handleSuccess(res, 200, "Verificación de stock completada", resultado);
  } catch (error) {
    handleErrorServer(res, 500, "Error al verificar stock", error.message);
  }
}

export async function getMovimientos(req, res) {
  try {
    const filtros = req.query;
    const movimientos = await findMovimientos(filtros);
    handleSuccess(res, 200, "Movimientos obtenidos exitosamente", movimientos);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener movimientos", error.message);
  }
}
