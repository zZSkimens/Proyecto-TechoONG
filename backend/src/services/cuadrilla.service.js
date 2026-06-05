import { AppDataSource } from "../config/configDb.js";
import { Cuadrilla } from "../entities/cuadrilla.entity.js";

export async function createCuadrillaService(cuadrillaData) {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  const newCuadrilla = cuadrillaRepository.create(cuadrillaData);
  return await cuadrillaRepository.save(newCuadrilla);
}

export async function getCuadrillasService() {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  return await cuadrillaRepository.find({
    relations: ["sector", "voluntarios"],
  });
}

export async function getCuadrillaByIdService(id) {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  return await cuadrillaRepository.findOne({
    where: { id },
    relations: ["sector", "voluntarios"],
  });
}

export async function updateCuadrillaService(id, cuadrillaData) {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  const cuadrilla = await cuadrillaRepository.findOne({ where: { id } });
  if (!cuadrilla) return null;
  cuadrillaRepository.merge(cuadrilla, cuadrillaData);
  return await cuadrillaRepository.save(cuadrilla);
}

export async function deleteCuadrillaService(id) {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  const cuadrilla = await cuadrillaRepository.findOne({ where: { id } });
  if (!cuadrilla) return null;
  await cuadrillaRepository.remove(cuadrilla);
  return cuadrilla;
}
