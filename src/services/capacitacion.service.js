import { AppDataSource } from "../config/configDB.js";
import { Capacitacion } from "../entities/capacitacion.entity.js";
import { PerfilCapacitacion } from "../entities/perfilCapacitacion.entity.js";
import { Perfil } from "../entities/perfil.entity.js";

const capacitacionRepository = AppDataSource.getRepository(Capacitacion);
const perfilCapacitacionRepository = AppDataSource.getRepository(PerfilCapacitacion);
const perfilRepository = AppDataSource.getRepository(Perfil);

export async function crearCapacitacion(datos) {
  const nuevaCapacitacion = capacitacionRepository.create(datos);
  return await capacitacionRepository.save(nuevaCapacitacion);
}

export async function obtenerTodasLasCapacitaciones() {
  return await capacitacionRepository.find();
}

export async function registrarProgresoVoluntario(perfilId, capacitacionId, estado, fechaCompletacion = null) {
  const perfil = await perfilRepository.findOneBy({ id: perfilId });
  if (!perfil) {
    throw new Error("Perfil no encontrado.");
  }

  const capacitacion = await capacitacionRepository.findOneBy({ id: capacitacionId });
  if (!capacitacion) {
    throw new Error("Capacitación no encontrada.");
  }

  let registro = await perfilCapacitacionRepository.findOneBy({
    perfil_id: perfilId,
    capacitacion_id: capacitacionId,
  });

  if (registro) {
    registro.estado = estado;
    if (estado === "completado") {
      registro.fecha_completacion = fechaCompletacion || new Date();
    } else {
      registro.fecha_completacion = null;
    }
    return await perfilCapacitacionRepository.save(registro);
  } else {
    const nuevoRegistro = perfilCapacitacionRepository.create({
      perfil_id: perfilId,
      capacitacion_id: capacitacionId,
      estado,
      fecha_completacion: estado === "completado" ? (fechaCompletacion || new Date()) : null,
    });
    return await perfilCapacitacionRepository.save(nuevoRegistro);
  }
}
