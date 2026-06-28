import { createReunionService, getReunionesService, getReunionByIdService, updateReunionEstadoService } from "../services/reunion.service.js";

export async function getReuniones(req, res) {
  try {
    const reuniones = await getReunionesService();
    res.status(200).json({
      message: "Reuniones obtenidas exitosamente",
      data: reuniones,
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
}

export async function createReunion(req, res) {
  try {
    const data = req.body;
    if (!data.voluntario_id || !data.fecha || !data.tipo || !data.modalidad) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const nuevaReunion = await createReunionService(data);
    res.status(201).json({
      message: "Reunión agendada exitosamente",
      data: nuevaReunion,
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
}

export async function updateReunionEstado(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({ message: "El estado es requerido" });
    }

    const reunionActualizada = await updateReunionEstadoService(id, estado);
    if (!reunionActualizada) {
      return res.status(404).json({ message: "Reunión no encontrada" });
    }

    res.status(200).json({
      message: "Estado de la reunión actualizado",
      data: reunionActualizada,
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
}
