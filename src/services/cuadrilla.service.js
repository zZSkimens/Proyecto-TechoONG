import { AppDataSource } from "../config/configDb.js";
import { Cuadrilla } from "../entities/cuadrilla.entity.js";

export async function createCuadrilla(data) {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  const nuevaCuadrilla = cuadrillaRepository.create(data);
  return await cuadrillaRepository.save(nuevaCuadrilla);
}

export async function getCuadrillas() {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  return await cuadrillaRepository.find();
}

export async function getCuadrillaById(id) {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  return await cuadrillaRepository.findOneBy({ id });
}
