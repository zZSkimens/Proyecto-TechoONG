import { AppDataSource } from "../config/configDb.js";
import { Reunion } from "../entities/reunion.entity.js";
import { Perfil } from "../entities/perfil.entity.js";

export async function createReunionService(data) {
  try {
    const reunionRepository = AppDataSource.getRepository(Reunion);
    const nuevaReunion = reunionRepository.create(data);
    return await reunionRepository.save(nuevaReunion);
  } catch (error) {
    console.error("Error en createReunionService:", error);
    throw error;
  }
}

export async function getReunionesService(user) {
  try {
    const reunionRepository = AppDataSource.getRepository(Reunion);

    if (user && (user.role === 'administrador' || user.role === 'coordinador' || user.role === 'jefe_cuadrilla')) {
      return await reunionRepository.find({
        order: {
          fecha: "ASC",
        },
      });
    } else if (user) {
      const perfilRepository = AppDataSource.getRepository(Perfil);
      const perfil = await perfilRepository.findOneBy({ user_id: user.sub });
      
      if (!perfil) {
        return [];
      }
      
      return await reunionRepository.find({
        where: { voluntario_id: perfil.id },
        order: {
          fecha: "ASC",
        },
      });
    }

    return [];
  } catch (error) {
    console.error("Error en getReunionesService:", error);
    throw error;
  }
}

export async function getReunionByIdService(id) {
  try {
    const reunionRepository = AppDataSource.getRepository(Reunion);
    return await reunionRepository.findOneBy({ id });
  } catch (error) {
    console.error("Error en getReunionByIdService:", error);
    throw error;
  }
}

export async function updateReunionEstadoService(id, estado) {
  try {
    const reunionRepository = AppDataSource.getRepository(Reunion);
    const reunion = await reunionRepository.findOneBy({ id });
    if (!reunion) return null;
    
    reunion.estado = estado;
    return await reunionRepository.save(reunion);
  } catch (error) {
    console.error("Error en updateReunionEstadoService:", error);
    throw error;
  }
}
