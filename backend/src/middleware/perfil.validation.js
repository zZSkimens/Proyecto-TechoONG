import { handleErrorClient } from "../Handlers/responseHandlers.js";

export function validarPerfil(req, res, next) {
  const { nombre_completo, telefono, rol, informacion_profesional, competencias, certificaciones } = req.body;

  if (rol && rol !== "voluntario" && rol !== "postulante") {
    return handleErrorClient(res, 400, "El rol debe ser 'voluntario' o 'postulante'.");
  }

  if (nombre_completo !== undefined && nombre_completo.trim() === "") {
    return handleErrorClient(res, 400, "El nombre completo no puede estar vacío.");
  }

  if (competencias && !Array.isArray(competencias)) {
    return handleErrorClient(res, 400, "Las competencias deben ser un arreglo de textos.");
  }

  if (certificaciones && !Array.isArray(certificaciones)) {
    return handleErrorClient(res, 400, "Las certificaciones deben ser un arreglo de textos.");
  }

  next();
}
