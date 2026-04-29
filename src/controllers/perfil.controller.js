import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { obtenerPerfilPorUsuario, crearOActualizarPerfil, obtenerTodosLosPerfiles as serviceObtenerTodos, cambiarEstadoPerfil } from "../services/perfil.service.js";

export async function obtenerMiPerfil(req, res) {
  try {
    const userId = req.user.id;
    const perfil = await obtenerPerfilPorUsuario(userId);

    if (!perfil) {
      return handleErrorClient(res, 404, "Perfil no encontrado", null);
    }

    handleSuccess(res, 200, "Perfil obtenido exitosamente", perfil);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener el perfil", error.message);
  }
}

export async function actualizarMiPerfil(req, res) {
  try {
    const userId = req.user.id;
    const datosPerfil = req.body;

    const perfilActualizado = await crearOActualizarPerfil(userId, datosPerfil);

    handleSuccess(res, 200, "Perfil actualizado exitosamente", perfilActualizado);
  } catch (error) {
    handleErrorServer(res, 500, "Error al actualizar el perfil", error.message);
  }
}

export async function obtenerTodosLosPerfiles(req, res) {
  try {
    // Aceptamos query params para filtrar (ej: ?rol=voluntario&competencia=JavaScript)
    const filtros = req.query;
    const perfiles = await serviceObtenerTodos(filtros);

    handleSuccess(res, 200, "Perfiles obtenidos exitosamente", perfiles);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener los perfiles", error.message);
  }
}

export async function validarPerfilPostulante(req, res) {
  try {
    const { id } = req.params;
    const { estado, zona_asignada } = req.body;

    // Validación básica de estado
    const estadosValidos = ["pendiente", "activo", "rechazado"];
    if (!estadosValidos.includes(estado)) {
      return handleErrorClient(res, 400, "Estado inválido. Debe ser pendiente, activo o rechazado.", null);
    }

    const perfilActualizado = await cambiarEstadoPerfil(id, estado, zona_asignada);

    if (!perfilActualizado) {
      return handleErrorClient(res, 404, "Perfil no encontrado", null);
    }

    // Simulación de notificación
    if (perfilActualizado.user) {
      console.log(`\n================ NOTIFICACIÓN ================`);
      console.log(`Para: ${perfilActualizado.user.email}`);
      console.log(`Asunto: Actualización de estado de postulación`);
      console.log(`Mensaje: Tu postulación ahora está en estado: ${estado.toUpperCase()}.`);
      if (estado === "activo" && zona_asignada) {
        console.log(`Se te ha asignado la zona geográfica: ${zona_asignada}`);
      }
      console.log(`================================================\n`);
    }

    // Evitar enviar el objeto user completo en la respuesta
    const respuesta = { ...perfilActualizado };
    delete respuesta.user;

    handleSuccess(res, 200, "Perfil validado y estado actualizado correctamente", respuesta);
  } catch (error) {
    handleErrorServer(res, 500, "Error al validar el perfil", error.message);
  }
}
