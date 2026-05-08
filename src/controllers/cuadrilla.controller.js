import {
  createCuadrillaService,
  getCuadrillasService,
  getCuadrillaByIdService,
  updateCuadrillaService,
  deleteCuadrillaService,
} from "../services/cuadrilla.service.js";

export async function createCuadrilla(req, res) {
  try {
    const cuadrilla = await createCuadrillaService(req.body);
    res.status(201).json(cuadrilla);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la cuadrilla", error: error.message });
  }
}

export async function getCuadrillas(req, res) {
  try {
    const cuadrillas = await getCuadrillasService();
    res.status(200).json(cuadrillas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener cuadrillas", error: error.message });
  }
}

export async function getCuadrillaById(req, res) {
  try {
    const cuadrilla = await getCuadrillaByIdService(req.params.id);
    if (!cuadrilla) {
      return res.status(404).json({ message: "Cuadrilla no encontrada" });
    }
    res.status(200).json(cuadrilla);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la cuadrilla", error: error.message });
  }
}

export async function updateCuadrilla(req, res) {
  try {
    const cuadrilla = await updateCuadrillaService(req.params.id, req.body);
    if (!cuadrilla) {
      return res.status(404).json({ message: "Cuadrilla no encontrada" });
    }
    res.status(200).json(cuadrilla);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la cuadrilla", error: error.message });
  }
}

export async function deleteCuadrilla(req, res) {
  try {
    const cuadrilla = await deleteCuadrillaService(req.params.id);
    if (!cuadrilla) {
      return res.status(404).json({ message: "Cuadrilla no encontrada" });
    }
    res.status(200).json({ message: "Cuadrilla eliminada exitosamente", cuadrilla });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la cuadrilla", error: error.message });
  }
}
