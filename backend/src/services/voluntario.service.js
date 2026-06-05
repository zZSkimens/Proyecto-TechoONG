import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { Voluntario } from "../entities/voluntario.entity.js";
import { Cuadrilla } from "../entities/cuadrilla.entity.js";
import { In } from "typeorm";

const voluntarioRepository = AppDataSource.getRepository(Voluntario);
const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);

export async function createVoluntario(data) {
  const { cuadrillas, password, ...voluntarioData } = data;

  const savedData = {
    ...voluntarioData,
    ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
  };

  const voluntario = voluntarioRepository.create(savedData);

  if (cuadrillas && cuadrillas.length > 0) {
    const cuadrillasFound = await cuadrillaRepository.findBy({
      id: In(cuadrillas),
    });
    voluntario.cuadrillas = cuadrillasFound;
  }

  return await voluntarioRepository.save(voluntario);
}

export async function getVoluntarios() {
  return await voluntarioRepository.find({
    relations: ["cuadrillas"]
  });
}

export async function getVoluntarioById(id) {
  return await voluntarioRepository.findOne({
    where: { id },
    relations: ["cuadrillas"]
  });
}
