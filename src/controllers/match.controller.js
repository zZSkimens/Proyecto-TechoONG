import { getMatchForProject } from "../services/match.service.js";

export async function getMatchForProjectController(req, res) {
  try {
    const obraId = parseInt(req.params.obraId);
    if (!obraId) {
      return res.status(400).json({ message: "Se requiere un ID de obra válido" });
    }

    const matchData = await getMatchForProject(obraId);
    
    res.status(200).json({
      message: "Match calculado exitosamente",
      data: matchData
    });
  } catch (error) {
    if (error.message === "Obra no encontrada") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al calcular match", error: error.message });
  }
}
