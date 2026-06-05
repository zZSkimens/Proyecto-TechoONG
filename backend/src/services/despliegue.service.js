import { AppDataSource } from "../config/configDb.js";
import { Despliegue } from "../entities/despliegue.entity.js";

export async function createDespliegueService(despliegueData) {
  const despliegueRepository = AppDataSource.getRepository(Despliegue);
  const newDespliegue = despliegueRepository.create(despliegueData);
  return await despliegueRepository.save(newDespliegue);
}

export async function getDesplieguesService() {
  const despliegueRepository = AppDataSource.getRepository(Despliegue);
  return await despliegueRepository.find({
    relations: ["cuadrilla", "chofer"],
  });
}

export async function getDespliegueByIdService(id) {
  const despliegueRepository = AppDataSource.getRepository(Despliegue);
  return await despliegueRepository.findOne({
    where: { id },
    relations: ["cuadrilla", "chofer"],
  });
}

export async function updateDespliegueService(id, despliegueData) {
  const despliegueRepository = AppDataSource.getRepository(Despliegue);
  const despliegue = await despliegueRepository.findOne({ where: { id } });
  if (!despliegue) return null;
  despliegueRepository.merge(despliegue, despliegueData);
  return await despliegueRepository.save(despliegue);
}

export async function deleteDespliegueService(id) {
  const despliegueRepository = AppDataSource.getRepository(Despliegue);
  const despliegue = await despliegueRepository.findOne({ where: { id } });
  if (!despliegue) return null;
  await despliegueRepository.remove(despliegue);
  return despliegue;
}
