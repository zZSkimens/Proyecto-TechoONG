import { createCuadrilla, getCuadrillas } from "../services/cuadrilla.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function createCuadrillaController(req, res) {
  try {
    const data = req.body;
    if (!data.name) {
      return handleErrorClient(res, 400, "El nombre de la cuadrilla es requerido");
    }
    const newCuadrilla = await createCuadrilla(data);
    handleSuccess(res, 201, "Cuadrilla creada exitosamente", newCuadrilla);
  } catch (error) {
    if (error.code === '23505') { 
      return handleErrorClient(res, 409, "Ya existe una cuadrilla con ese nombre");
    }
    handleErrorServer(res, 500, "Error al crear cuadrilla", error.message);
  }
}

export async function getCuadrillasController(req, res) {
  try {
    const cuadrillas = await getCuadrillas();
    handleSuccess(res, 200, "Cuadrillas obtenidas exitosamente", cuadrillas);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener cuadrillas", error.message);
  }
}
