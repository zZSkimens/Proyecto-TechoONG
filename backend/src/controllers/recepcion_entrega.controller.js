import {
  findRecepciones,
  findRecepcionById,
  confirmarRecepcion,
  getTrazabilidad,
} from "../services/recepcion_entrega.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function getAllRecepciones(req, res) {
  try {
    const filtros = req.query;
    const recepciones = await findRecepciones(filtros);
    handleSuccess(res, 200, "Recepciones obtenidas exitosamente", recepciones);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener las recepciones", error.message);
  }
}

export async function getRecepcionById(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return handleErrorClient(res, 400, "ID de recepción inválido");
    }

    const recepcion = await findRecepcionById(id);
    handleSuccess(res, 200, "Recepción obtenida exitosamente", recepcion);
  } catch (error) {
    handleErrorClient(res, 404, error.message);
  }
}

export async function confirmar(req, res) {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return handleErrorClient(res, 400, "Datos de la recepción son requeridos");
    }

    const resultado = await confirmarRecepcion(data);
    handleSuccess(res, 201, resultado.mensaje, resultado);
  } catch (error) {
    if (
      error.message.includes("obligatorio") ||
      error.message.includes("Debe") ||
      error.message.includes("Ya existe") ||
      error.message.includes("no ha sido")
    ) {
      return handleErrorClient(res, 400, error.message);
    }
    handleErrorServer(res, 500, "Error al confirmar la recepción", error.message);
  }
}

export async function trazabilidad(req, res) {
  try {
    const { solicitudId } = req.params;

    if (!solicitudId || isNaN(solicitudId)) {
      return handleErrorClient(res, 400, "ID de solicitud inválido");
    }

    const resultado = await getTrazabilidad(solicitudId);
    handleSuccess(res, 200, "Trazabilidad obtenida exitosamente", resultado);
  } catch (error) {
    handleErrorClient(res, 404, error.message);
  }
}
