import {
  createChoferService,
  getChoferesService,
  getChoferByIdService,
  updateChoferService,
  deleteChoferService,
} from "../services/chofer.service.js";

export async function createChofer(req, res) {
  try {
    const chofer = await createChoferService(req.body);
    res.status(201).json(chofer);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el chofer", error: error.message });
  }
}

export async function getChoferes(req, res) {
  try {
    const choferes = await getChoferesService();
    res.status(200).json(choferes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener choferes", error: error.message });
  }
}

export async function getChoferById(req, res) {
  try {
    const chofer = await getChoferByIdService(req.params.id);
    if (!chofer) {
      return res.status(404).json({ message: "Chofer no encontrado" });
    }
    res.status(200).json(chofer);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el chofer", error: error.message });
  }
}

export async function updateChofer(req, res) {
  try {
    const chofer = await updateChoferService(req.params.id, req.body);
    if (!chofer) {
      return res.status(404).json({ message: "Chofer no encontrado" });
    }
    res.status(200).json(chofer);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el chofer", error: error.message });
  }
}

export async function deleteChofer(req, res) {
  try {
    const chofer = await deleteChoferService(req.params.id);
    if (!chofer) {
      return res.status(404).json({ message: "Chofer no encontrado" });
    }
    res.status(200).json({ message: "Chofer eliminado exitosamente", chofer });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el chofer", error: error.message });
  }
}
