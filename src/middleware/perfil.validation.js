import { handleErrorClient } from "../Handlers/responseHandlers.js";

export function validarPerfil(req, res, next) {
  const { nombre_completo, telefono, rol, informacion_profesional, competencias } = req.body;

  // Validar rol
  if (rol && rol !== "voluntario" && rol !== "postulante") {
    return handleErrorClient(res, 400, "El rol debe ser 'voluntario' o 'postulante'.");
  }

  // Validar que nombre no venga vacío si lo mandan
  if (nombre_completo !== undefined && nombre_completo.trim() === "") {
    return handleErrorClient(res, 400, "El nombre completo no puede estar vacío.");
  }

  // Validar competencias (debería ser un arreglo)
  if (competencias && !Array.isArray(competencias)) {
    return handleErrorClient(res, 400, "Las competencias deben ser un arreglo de textos.");
  }

  // Si todo está bien, continuamos
  next();
}
