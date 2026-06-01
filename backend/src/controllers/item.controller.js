import { createItem, getItems } from "../services/item.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function createItemController(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.category) {
      return handleErrorClient(res, 400, "Nombre y categoría son requeridos");
    }
    if (data.category !== 'Herramienta' && data.category !== 'Material') {
      return handleErrorClient(res, 400, "La categoría debe ser 'Herramienta' o 'Material'");
    }
    const newItem = await createItem(data);
    handleSuccess(res, 201, "Item creado exitosamente", newItem);
  } catch (error) {
    handleErrorServer(res, 500, "Error al crear el item", error.message);
  }
}

export async function getItemsController(req, res) {
  try {
    const items = await getItems();
    handleSuccess(res, 200, "Items obtenidos exitosamente", items);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener items", error.message);
  }
}
