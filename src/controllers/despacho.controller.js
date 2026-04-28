import { createDespacho, getDespachos, getDespachosByCuadrilla, devolverItems } from "../services/despacho.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function createDespachoController(req, res) {
  try {
    const { cuadrillaId, items } = req.body;
    
    if (!cuadrillaId || !items || !Array.isArray(items) || items.length === 0) {
      return handleErrorClient(res, 400, "Se requiere el ID de la cuadrilla y un arreglo de items a despachar");
    }

    // Validar formato de los items
    for (const item of items) {
      if (!item.itemId || !item.cantidad || typeof item.cantidad !== 'number' || item.cantidad <= 0) {
        return handleErrorClient(res, 400, "Cada item debe tener 'itemId' y una 'cantidad' válida mayor a cero");
      }
    }

    const resultado = await createDespacho(cuadrillaId, items);
    handleSuccess(res, 201, "Despacho realizado exitosamente", resultado);
  } catch (error) {
    if (error.message.includes("La cuadrilla no existe") || error.message.includes("no existe") || error.message.includes("Stock insuficiente")) {
      return handleErrorClient(res, 400, error.message);
    }
    handleErrorServer(res, 500, "Error interno al procesar el despacho", error.message);
  }
}

export async function getDespachosController(req, res) {
  try {
    const despachos = await getDespachos();
    handleSuccess(res, 200, "Despachos obtenidos exitosamente", despachos);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener despachos", error.message);
  }
}

export async function getDespachosByCuadrillaController(req, res) {
  try {
    const { cuadrillaId } = req.params;
    const despachos = await getDespachosByCuadrilla(parseInt(cuadrillaId));
    handleSuccess(res, 200, "Despachos de la cuadrilla obtenidos exitosamente", despachos);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener despachos de la cuadrilla", error.message);
  }
}

export async function devolverItemsController(req, res) {
  try {
    const { id } = req.params;
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return handleErrorClient(res, 400, "Se requiere un arreglo de items a devolver");
    }

    for (const item of items) {
      if (!item.itemId || !item.cantidad || typeof item.cantidad !== 'number' || item.cantidad <= 0) {
        return handleErrorClient(res, 400, "Cada item devuelto debe tener 'itemId' y una 'cantidad' válida mayor a cero");
      }
    }

    const devoluciones = await devolverItems(parseInt(id), items);
    handleSuccess(res, 200, "Ítems devueltos exitosamente al inventario", devoluciones);
  } catch (error) {
    if (error.message.includes("no existe") || error.message.includes("no forma parte") || error.message.includes("más cantidad")) {
      return handleErrorClient(res, 400, error.message);
    }
    handleErrorServer(res, 500, "Error interno al procesar la devolución", error.message);
  }
}
