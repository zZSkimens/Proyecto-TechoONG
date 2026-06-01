import { AppDataSource } from "../config/configDB.js";
import { Chofer } from "../entities/chofer.entity.js";

export async function createChoferService(choferData) {
  const choferRepository = AppDataSource.getRepository(Chofer);
  const newChofer = choferRepository.create(choferData);
  return await choferRepository.save(newChofer);
}

export async function getChoferesService() {
  const choferRepository = AppDataSource.getRepository(Chofer);
  return await choferRepository.find();
}

export async function getChoferByIdService(id) {
  const choferRepository = AppDataSource.getRepository(Chofer);
  return await choferRepository.findOne({ where: { id } });
}

export async function updateChoferService(id, choferData) {
  const choferRepository = AppDataSource.getRepository(Chofer);
  const chofer = await choferRepository.findOne({ where: { id } });
  if (!chofer) return null;
  choferRepository.merge(chofer, choferData);
  return await choferRepository.save(chofer);
}

export async function deleteChoferService(id) {
  const choferRepository = AppDataSource.getRepository(Chofer);
  const chofer = await choferRepository.findOne({ where: { id } });
  if (!chofer) return null;
  await choferRepository.remove(chofer);
  return chofer;
}
