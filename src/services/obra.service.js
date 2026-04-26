import { AppDataSource } from "../config/configDb.js";
import { Obra } from "../entities/obra.entity.js";
import { Habilidad } from "../entities/habilidad.entity.js";
import { In } from "typeorm";

const obraRepository = AppDataSource.getRepository(Obra);
const habilidadRepository = AppDataSource.getRepository(Habilidad);

export async function createObra(data) {
  const { habilidadesRequeridas, ...obraData } = data;
  const obra = obraRepository.create(obraData);

  if (habilidadesRequeridas && habilidadesRequeridas.length > 0) {
    const habilidadesFound = await habilidadRepository.findBy({
      id: In(habilidadesRequeridas)
    });
    obra.habilidadesRequeridas = habilidadesFound;
  }

  return await obraRepository.save(obra);
}

export async function getObras() {
  return await obraRepository.find({
    relations: ["habilidadesRequeridas"]
  });
}

export async function getObraById(id) {
  return await obraRepository.findOne({
    where: { id },
    relations: ["habilidadesRequeridas"]
  });
}
