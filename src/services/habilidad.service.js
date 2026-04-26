import { AppDataSource } from "../config/configDb.js";
import { Habilidad } from "../entities/habilidad.entity.js";

const habilidadRepository = AppDataSource.getRepository(Habilidad);

export async function createHabilidad(data) {
  const nuevaHabilidad = habilidadRepository.create(data);
  return await habilidadRepository.save(nuevaHabilidad);
}

export async function getHabilidades() {
  return await habilidadRepository.find();
}

export async function getHabilidadById(id) {
  return await habilidadRepository.findOneBy({ id });
}
