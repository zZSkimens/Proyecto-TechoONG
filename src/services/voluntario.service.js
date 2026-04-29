import { AppDataSource } from "../config/configDb.js";
import { Voluntario } from "../entities/voluntario.entity.js";
import { Habilidad } from "../entities/habilidad.entity.js";
import { In } from "typeorm";

const voluntarioRepository = AppDataSource.getRepository(Voluntario);
const habilidadRepository = AppDataSource.getRepository(Habilidad);

export async function createVoluntario(data) {
  const { habilidades, ...voluntarioData } = data;
  const voluntario = voluntarioRepository.create(voluntarioData);
  
  if (habilidades && habilidades.length > 0) {
    const habilidadesFound = await habilidadRepository.findBy({
      id: In(habilidades)
    });
    voluntario.habilidades = habilidadesFound;
  }

  return await voluntarioRepository.save(voluntario);
}

export async function getVoluntarios() {
  return await voluntarioRepository.find({
    relations: ["habilidades"]
  });
}

export async function getVoluntarioById(id) {
  return await voluntarioRepository.findOne({
    where: { id },
    relations: ["habilidades"]
  });
}
