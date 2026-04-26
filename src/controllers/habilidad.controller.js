import { createHabilidad, getHabilidades, getHabilidadById } from "../services/habilidad.service.js";

export async function createHabilidadController(req, res) {
  try {
    const data = req.body;
    const habilidad = await createHabilidad(data);
    res.status(201).json({
      message: "Habilidad creada exitosamente",
      data: habilidad
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear habilidad", error: error.message });
  }
}

export async function getHabilidadesController(req, res) {
  try {
    const habilidades = await getHabilidades();
    res.status(200).json({ data: habilidades });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener habilidades", error: error.message });
  }
}

export async function getHabilidadByIdController(req, res) {
  try {
    const id = parseInt(req.params.id);
    const habilidad = await getHabilidadById(id);
    if (!habilidad) {
      return res.status(404).json({ message: "Habilidad no encontrada" });
    }
    res.status(200).json({ data: habilidad });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener habilidad", error: error.message });
  }
}
