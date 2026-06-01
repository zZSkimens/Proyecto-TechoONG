import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { obtenerPerfilPorUsuario, crearOActualizarPerfil, obtenerTodosLosPerfiles as serviceObtenerTodos, cambiarEstadoPerfil } from "../services/perfil.service.js";
import { AppDataSource } from "../config/configDB.js";
import { Perfil } from "../entities/perfil.entity.js";
import { HistorialEstado } from "../entities/historialEstado.entity.js";

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
    const { nombre_completo, telefono, rol, informacion_profesional, informacion_academica, competencias, certificaciones } = req.body;
    
    const datosFiltrados = { nombre_completo, telefono, rol, informacion_profesional, informacion_academica, competencias, certificaciones };

    const perfilActualizado = await crearOActualizarPerfil(userId, datosFiltrados);

    handleSuccess(res, 200, "Perfil actualizado exitosamente", perfilActualizado);
  } catch (error) {
    handleErrorServer(res, 500, "Error al actualizar el perfil", error.message);
  }
}

export async function obtenerTodosLosPerfiles(req, res) {
  try {
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
    const { estado, zona_asignada, comentario } = req.body;

    const estadosValidos = [
      "registrado",
      "documentacion_pendiente",
      "entrevista_agendada",
      "en_capacitacion",
      "habilitado",
      "rechazado",
    ];
    if (!estadosValidos.includes(estado)) {
      return handleErrorClient(res, 400, "Estado inválido. Debe ser registrado, documentacion_pendiente, entrevista_agendada, en_capacitacion, habilitado o rechazado.", null);
    }

    const perfilRepository = AppDataSource.getRepository(Perfil);
    const perfil = await perfilRepository.findOneBy({ id: parseInt(id) });

    if (!perfil) {
      return handleErrorClient(res, 404, "Perfil no encontrado", null);
    }

    const estadoAnterior = perfil.estado;

    const perfilActualizado = await cambiarEstadoPerfil(id, estado, zona_asignada);

    const historialRepository = AppDataSource.getRepository(HistorialEstado);
    const auditoria = historialRepository.create({
      perfil_id: perfilActualizado.id,
      estado_anterior: estadoAnterior,
      estado_nuevo: estado,
      cambiado_por_id: req.user.id,
      comentario: comentario || "Cambio de estado por el administrador",
    });
    await historialRepository.save(auditoria);

    // Simulación de envío de correo/notificación
    if (perfilActualizado.user) {
      console.log(`\n================ NOTIFICACIÓN ================`);
      console.log(`Para: ${perfilActualizado.user.email}`);
      console.log(`Asunto: Actualización de estado de postulación`);
      console.log(`Mensaje: Tu postulación ahora está en estado: ${estado.toUpperCase()}.`);
      if (estado === "habilitado" && zona_asignada) {
        console.log(`Se te ha asignado la zona geográfica: ${zona_asignada}`);
      }
      console.log(`================================================\n`);
    }

    const respuesta = { ...perfilActualizado };
    delete respuesta.user;

    handleSuccess(res, 200, "Perfil validado y estado actualizado correctamente", respuesta);
  } catch (error) {
    handleErrorServer(res, 500, "Error al validar el perfil", error.message);
  }
}
