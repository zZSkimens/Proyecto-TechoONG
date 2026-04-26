import { handleSuccess, handleError } from "../Handlers/responseHandlers.js";
import { obtenerPerfilPorUsuario, crearOActualizarPerfil, obtenerTodosLosPerfiles as serviceObtenerTodos } from "../services/perfil.service.js";

export async function obtenerMiPerfil(req, res) {
  try {
    const userId = req.user.id;
    const perfil = await obtenerPerfilPorUsuario(userId);

    if (!perfil) {
      return handleSuccess(res, 404, "Perfil no encontrado", null);
    }

    handleSuccess(res, 200, "Perfil obtenido exitosamente", perfil);
  } catch (error) {
    handleError(res, 500, "Error al obtener el perfil", error.message);
  }
}

export async function actualizarMiPerfil(req, res) {
  try {
    const userId = req.user.id;
    const datosPerfil = req.body;

    const perfilActualizado = await crearOActualizarPerfil(userId, datosPerfil);

    handleSuccess(res, 200, "Perfil actualizado exitosamente", perfilActualizado);
  } catch (error) {
    handleError(res, 500, "Error al actualizar el perfil", error.message);
  }
}

export async function obtenerTodosLosPerfiles(req, res) {
  try {
    // Aceptamos query params para filtrar (ej: ?rol=voluntario&competencia=JavaScript)
    const filtros = req.query;
    const perfiles = await serviceObtenerTodos(filtros);

    handleSuccess(res, 200, "Perfiles obtenidos exitosamente", perfiles);
  } catch (error) {
    handleError(res, 500, "Error al obtener los perfiles", error.message);
  }
}
