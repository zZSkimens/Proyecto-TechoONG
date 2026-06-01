import {
  findOrdenes,
  findOrdenById,
  procesarDespacho,
  getComprobante,
} from "../services/orden_despacho.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function getAllOrdenes(req, res) {
  try {
    const filtros = req.query;
    const ordenes = await findOrdenes(filtros);
    handleSuccess(res, 200, "Órdenes de despacho obtenidas exitosamente", ordenes);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener las órdenes de despacho", error.message);
  }
}

export async function getOrdenById(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return handleErrorClient(res, 400, "ID de orden inválido");
    }

    const orden = await findOrdenById(id);
    handleSuccess(res, 200, "Orden de despacho obtenida exitosamente", orden);
  } catch (error) {
    handleErrorClient(res, 404, error.message);
  }
}

export async function despachar(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id || isNaN(id)) {
      return handleErrorClient(res, 400, "ID de orden inválido");
    }

    const resultado = await procesarDespacho(id, data);
    handleSuccess(res, 200, resultado.mensaje, resultado);
  } catch (error) {
    if (error.message.includes("insuficiente") || error.message.includes("Debe indicar") || error.message.includes("ya fue")) {
      return handleErrorClient(res, 400, error.message);
    }
    handleErrorServer(res, 500, "Error al procesar el despacho", error.message);
  }
}

export async function obtenerComprobante(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return handleErrorClient(res, 400, "ID de orden inválido");
    }

    const comprobante = await getComprobante(id);
    handleSuccess(res, 200, "Comprobante de despacho generado exitosamente", comprobante);
  } catch (error) {
    if (error.message.includes("no ha sido despachada")) {
      return handleErrorClient(res, 400, error.message);
    }
    handleErrorClient(res, 404, error.message);
  }
}
