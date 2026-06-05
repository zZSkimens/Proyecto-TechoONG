import {
  createDespliegueService,
  getDesplieguesService,
  getDespliegueByIdService,
  updateDespliegueService,
  deleteDespliegueService,
} from "../services/despliegue.service.js";

export async function createDespliegue(req, res) {
  try {
    const despliegue = await createDespliegueService(req.body);
    res.status(201).json(despliegue);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el despliegue", error: error.message });
  }
}

export async function getDespliegues(req, res) {
  try {
    const despliegues = await getDesplieguesService();
    res.status(200).json(despliegues);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener despliegues", error: error.message });
  }
}

export async function getDespliegueById(req, res) {
  try {
    const despliegue = await getDespliegueByIdService(req.params.id);
    if (!despliegue) {
      return res.status(404).json({ message: "Despliegue no encontrado" });
    }
    res.status(200).json(despliegue);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el despliegue", error: error.message });
  }
}

export async function updateDespliegue(req, res) {
  try {
    const despliegue = await updateDespliegueService(req.params.id, req.body);
    if (!despliegue) {
      return res.status(404).json({ message: "Despliegue no encontrado" });
    }
    res.status(200).json(despliegue);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el despliegue", error: error.message });
  }
}

export async function deleteDespliegue(req, res) {
  try {
    const despliegue = await deleteDespliegueService(req.params.id);
    if (!despliegue) {
      return res.status(404).json({ message: "Despliegue no encontrado" });
    }
    res.status(200).json({ message: "Despliegue eliminado exitosamente", despliegue });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el despliegue", error: error.message });
  }
}
