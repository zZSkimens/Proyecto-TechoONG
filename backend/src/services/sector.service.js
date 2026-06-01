import { AppDataSource } from "../config/configDB.js";
import { Sector } from "../entities/sector.entity.js";

export async function createSectorService(sectorData) {
  const sectorRepository = AppDataSource.getRepository(Sector);
  const newSector = sectorRepository.create(sectorData);
  return await sectorRepository.save(newSector);
}

export async function getSectoresService() {
  const sectorRepository = AppDataSource.getRepository(Sector);
  return await sectorRepository.find();
}

export async function getSectorByIdService(id) {
  const sectorRepository = AppDataSource.getRepository(Sector);
  return await sectorRepository.findOne({ where: { id } });
}

export async function updateSectorService(id, sectorData) {
  const sectorRepository = AppDataSource.getRepository(Sector);
  const sector = await sectorRepository.findOne({ where: { id } });
  if (!sector) return null;
  sectorRepository.merge(sector, sectorData);
  return await sectorRepository.save(sector);
}

export async function deleteSectorService(id) {
  const sectorRepository = AppDataSource.getRepository(Sector);
  const sector = await sectorRepository.findOne({ where: { id } });
  if (!sector) return null;
  await sectorRepository.remove(sector);
  return sector;
}
