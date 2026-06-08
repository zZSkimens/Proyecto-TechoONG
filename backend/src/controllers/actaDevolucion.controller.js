import { getActasDevolucion, crearActaDevolucion, procesarActaDevolucion } from "../services/actaDevolucion.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function getActasDevolucionController(req, res) {
  try {
    const actas = await getActasDevolucion();
    handleSuccess(res, 200, "Actas de devolución obtenidas exitosamente", actas);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener actas de devolución", error.message);
  }
}

export async function crearActaDevolucionController(req, res) {
  try {
    const { cuadrilla_nombre, encargado, dias_trabajados, items_sobrantes } = req.body;

    if (!cuadrilla_nombre || !dias_trabajados) {
      return handleErrorClient(res, 400, "Se requiere el nombre de la cuadrilla y los días trabajados");
    }

    if (!items_sobrantes || !Array.isArray(items_sobrantes) || items_sobrantes.length === 0) {
      return handleErrorClient(res, 400, "Se requiere al menos un item sobrante para crear el acta");
    }

    for (const item of items_sobrantes) {
      if (!item.itemId || !item.cantidad || item.cantidad <= 0) {
        return handleErrorClient(res, 400, "Cada item debe tener 'itemId' y una 'cantidad' válida mayor a cero");
      }
    }

    const resultado = await crearActaDevolucion({
      cuadrilla_nombre,
      encargado: encargado || "",
      dias_trabajados: parseInt(dias_trabajados),
      items_sobrantes,
    });

    handleSuccess(res, 201, "Acta de devolución creada exitosamente. Pendiente de revisión por bodega.", resultado);
  } catch (error) {
    if (error.message.includes("no existe")) {
      return handleErrorClient(res, 400, error.message);
    }
    handleErrorServer(res, 500, "Error al crear acta de devolución", error.message);
  }
}

export async function procesarActaDevolucionController(req, res) {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return handleErrorClient(res, 400, "Se requiere un arreglo de items con su estado revisado ('Disponible' o 'Dañada')");
    }

    for (const item of items) {
      if (!item.actaItemId || !item.estado) {
        return handleErrorClient(res, 400, "Cada item debe tener 'actaItemId' y un 'estado' ('Disponible' o 'Dañada')");
      }
    }

    const resultado = await procesarActaDevolucion(parseInt(id), items);
    handleSuccess(res, 200, "Acta procesada exitosamente. Los items disponibles han sido devueltos al inventario.", resultado);
  } catch (error) {
    if (
      error.message.includes("no existe") ||
      error.message.includes("ya ha sido procesada") ||
      error.message.includes("Falta la revisión") ||
      error.message.includes("Estado inválido")
    ) {
      return handleErrorClient(res, 400, error.message);
    }
    handleErrorServer(res, 500, "Error al procesar acta de devolución", error.message);
  }
}
