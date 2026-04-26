import { createDespacho, getDespachos } from "../services/despacho.service.js";
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
