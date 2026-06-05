import {
  createSectorService,
  getSectoresService,
  getSectorByIdService,
  updateSectorService,
  deleteSectorService,
} from "../services/sector.service.js";

export async function createSector(req, res) {
  try {
    const sector = await createSectorService(req.body);
    res.status(201).json(sector);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el sector", error: error.message });
  }
}

export async function getSectores(req, res) {
  try {
    const sectores = await getSectoresService();
    res.status(200).json(sectores);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener sectores", error: error.message });
  }
}

export async function getSectorById(req, res) {
  try {
    const sector = await getSectorByIdService(req.params.id);
    if (!sector) {
      return res.status(404).json({ message: "Sector no encontrado" });
    }
    res.status(200).json(sector);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el sector", error: error.message });
  }
}

export async function updateSector(req, res) {
  try {
    const sector = await updateSectorService(req.params.id, req.body);
    if (!sector) {
      return res.status(404).json({ message: "Sector no encontrado" });
    }
    res.status(200).json(sector);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el sector", error: error.message });
  }
}

export async function deleteSector(req, res) {
  try {
    const sector = await deleteSectorService(req.params.id);
    if (!sector) {
      return res.status(404).json({ message: "Sector no encontrado" });
    }
    res.status(200).json({ message: "Sector eliminado exitosamente", sector });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el sector", error: error.message });
  }
}
