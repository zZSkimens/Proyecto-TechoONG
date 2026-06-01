import {
  findSolicitudes,
  findSolicitudById,
  createSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
} from "../services/solicitud_alimento.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function getAllSolicitudes(req, res) {
  try {
    const filtros = req.query;
    const solicitudes = await findSolicitudes(filtros);
    handleSuccess(res, 200, "Solicitudes obtenidas exitosamente", solicitudes);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener las solicitudes", error.message);
  }
}

export async function getSolicitudById(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return handleErrorClient(res, 400, "ID de solicitud inválido");
    }

    const solicitud = await findSolicitudById(id);
    handleSuccess(res, 200, "Solicitud obtenida exitosamente", solicitud);
  } catch (error) {
    handleErrorClient(res, 404, error.message);
  }
}

export async function crearSolicitud(req, res) {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return handleErrorClient(res, 400, "Datos de la solicitud son requeridos");
    }

    const nuevaSolicitud = await createSolicitud(data);
    handleSuccess(res, 201, "Solicitud de alimentos creada exitosamente", nuevaSolicitud);
  } catch (error) {
    if (error.message.includes("obligatorio") || error.message.includes("debe")) {
      return handleErrorClient(res, 400, error.message);
    }
    handleErrorServer(res, 500, "Error al crear la solicitud", error.message);
  }
}

export async function aprobar(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id || isNaN(id)) {
      return handleErrorClient(res, 400, "ID de solicitud inválido");
    }

    const resultado = await aprobarSolicitud(id, data);
    handleSuccess(res, 200, resultado.mensaje, resultado);
  } catch (error) {
    if (error.detalle) {
      return handleErrorClient(res, 400, error.message, error.detalle);
    }
    if (error.message.includes("No se puede") || error.message.includes("Debe indicar")) {
      return handleErrorClient(res, 400, error.message);
    }
    handleErrorServer(res, 500, "Error al aprobar la solicitud", error.message);
  }
}

export async function rechazar(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id || isNaN(id)) {
      return handleErrorClient(res, 400, "ID de solicitud inválido");
    }

    const solicitudRechazada = await rechazarSolicitud(id, data);
    handleSuccess(res, 200, "Solicitud rechazada", solicitudRechazada);
  } catch (error) {
    if (error.message.includes("No se puede") || error.message.includes("Debe indicar")) {
      return handleErrorClient(res, 400, error.message);
    }
    handleErrorServer(res, 500, "Error al rechazar la solicitud", error.message);
  }
}
