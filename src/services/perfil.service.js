import { AppDataSource } from "../config/configDB.js";
import { Perfil } from "../entities/perfil.entity.js";

const perfilRepository = AppDataSource.getRepository(Perfil);

export async function obtenerPerfilPorUsuario(userId) {
  return await perfilRepository.findOneBy({ user_id: userId });
}

export async function crearOActualizarPerfil(userId, datosPerfil) {
  let perfil = await obtenerPerfilPorUsuario(userId);

  if (perfil) {
    // Actualizar perfil existente
    perfilRepository.merge(perfil, datosPerfil);
    return await perfilRepository.save(perfil);
  } else {
    // Crear nuevo perfil
    const nuevoPerfil = perfilRepository.create({
      user_id: userId,
      ...datosPerfil,
    });
    return await perfilRepository.save(nuevoPerfil);
  }
}

export async function obtenerTodosLosPerfiles(filtros = {}) {
  const query = perfilRepository.createQueryBuilder("perfil")
    .leftJoinAndSelect("perfil.user", "user"); // Traer el usuario asociado gracias a la nueva relación

  if (filtros.rol) {
    query.andWhere("perfil.rol = :rol", { rol: filtros.rol });
  }

  // Búsqueda simple en el JSON convertido a texto (específico para PostgreSQL)
  if (filtros.competencia) {
    query.andWhere("perfil.competencias::text ILIKE :competencia", { 
      competencia: `%${filtros.competencia}%` 
    });
  }

  return await query.getMany();
}
