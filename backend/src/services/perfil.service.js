import { AppDataSource } from "../config/configDb.js";
import { Perfil } from "../entities/perfil.entity.js";

const perfilRepository = AppDataSource.getRepository(Perfil);

export async function obtenerPerfilPorUsuario(userId) {
  return await perfilRepository.findOneBy({ user_id: userId });
}

export async function crearOActualizarPerfil(userId, datosPerfil) {
  let perfil = await obtenerPerfilPorUsuario(userId);

  if (perfil) {
    perfilRepository.merge(perfil, datosPerfil);
    return await perfilRepository.save(perfil);
  } else {
    const nuevoPerfil = perfilRepository.create({
      user_id: userId,
      ...datosPerfil,
    });
    return await perfilRepository.save(nuevoPerfil);
  }
}

export async function obtenerTodosLosPerfiles(filtros = {}) {
  const query = perfilRepository.createQueryBuilder("perfil")
    .leftJoinAndSelect("perfil.user", "user");

  if (filtros.rol) {
    query.andWhere("perfil.rol = :rol", { rol: filtros.rol });
  }

  if (filtros.competencia) {
    query.andWhere("perfil.competencias::text ILIKE :competencia", { 
      competencia: `%${filtros.competencia}%` 
    });
  }

  return await query.getMany();
}

export async function cambiarEstadoPerfil(perfilId, estado, zonaAsignada = null) {
  const perfil = await perfilRepository.findOne({
    where: { id: perfilId },
    relations: ["user"]
  });

  if (!perfil) {
    return null;
  }

  perfil.estado = estado;
  if (zonaAsignada) {
    perfil.zona_asignada = zonaAsignada;
  }

  return await perfilRepository.save(perfil);
}
