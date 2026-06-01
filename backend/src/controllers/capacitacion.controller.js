import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { crearCapacitacion, obtenerTodasLasCapacitaciones, registrarProgresoVoluntario } from "../services/capacitacion.service.js";

export async function crearNuevaCapacitacion(req, res) {
  try {
    const { nombre, descripcion, horas } = req.body;

    if (!nombre) {
      return handleErrorClient(res, 400, "El nombre de la capacitación es requerido.");
    }

    const capacitacion = await crearCapacitacion({ nombre, descripcion, horas });
    handleSuccess(res, 201, "Capacitación creada exitosamente", capacitacion);
  } catch (error) {
    handleErrorServer(res, 500, "Error al crear la capacitación", error.message);
  }
}

export async function listarCapacitaciones(req, res) {
  try {
    const capacitaciones = await obtenerTodasLasCapacitaciones();
    handleSuccess(res, 200, "Capacitaciones obtenidas exitosamente", capacitaciones);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener las capacitaciones", error.message);
  }
}

export async function actualizarProgreso(req, res) {
  try {
    const { perfil_id, capacitacion_id, estado, fecha_completacion } = req.body;

    if (!perfil_id || !capacitacion_id || !estado) {
      return handleErrorClient(res, 400, "Los campos perfil_id, capacitacion_id y estado son requeridos.");
    }

    const estadosValidos = ["cursando", "completado", "reprobado"];
    if (!estadosValidos.includes(estado)) {
      return handleErrorClient(res, 400, "Estado inválido. Debe ser cursando, completado o reprobado.");
    }

    const registro = await registrarProgresoVoluntario(
      parseInt(perfil_id),
      parseInt(capacitacion_id),
      estado,
      fecha_completacion
    );

    handleSuccess(res, 200, "Progreso de capacitación registrado correctamente", registro);
  } catch (error) {
    if (error.message.includes("no encontrado") || error.message.includes("no encontrada")) {
      return handleErrorClient(res, 404, error.message);
    }
    handleErrorServer(res, 500, "Error al registrar el progreso", error.message);
  }
}
