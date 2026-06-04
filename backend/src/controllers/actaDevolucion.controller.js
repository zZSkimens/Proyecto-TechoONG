import { getActasDevolucion } from "../services/actaDevolucion.service.js";
import { handleSuccess, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function getActasDevolucionController(req, res) {
  try {
    const actas = await getActasDevolucion();
    handleSuccess(res, 200, "Actas de devolución obtenidas exitosamente", actas);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener actas de devolución", error.message);
  }
}
