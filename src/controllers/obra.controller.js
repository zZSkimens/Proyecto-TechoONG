import { createObra, getObras, getObraById } from "../services/obra.service.js";

export async function createObraController(req, res) {
  try {
    const data = req.body;
    const obra = await createObra(data);
    res.status(201).json({
      message: "Obra creada exitosamente",
      data: obra
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear obra", error: error.message });
  }
}

export async function getObrasController(req, res) {
  try {
    const obras = await getObras();
    res.status(200).json({ data: obras });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener obras", error: error.message });
  }
}

export async function getObraByIdController(req, res) {
  try {
    const id = parseInt(req.params.id);
    const obra = await getObraById(id);
    if (!obra) {
      return res.status(404).json({ message: "Obra no encontrada" });
    }
    res.status(200).json({ data: obra });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener obra", error: error.message });
  }
}
