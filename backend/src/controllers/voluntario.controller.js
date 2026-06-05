import { createVoluntario, getVoluntarios, getVoluntarioById } from "../services/voluntario.service.js";

function omitPassword(entity) {
  const { password, ...rest } = entity;
  return rest;
}

export async function createVoluntarioController(req, res) {
  try {
    const data = req.body;
    const voluntario = await createVoluntario(data);
    res.status(201).json({
      message: "Voluntario creado exitosamente",
      data: omitPassword(voluntario)
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear voluntario", error: error.message });
  }
}

export async function getVoluntariosController(req, res) {
  try {
    const voluntarios = await getVoluntarios();
    res.status(200).json({ data: voluntarios.map(omitPassword) });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener voluntarios", error: error.message });
  }
}

export async function getVoluntarioByIdController(req, res) {
  try {
    const id = parseInt(req.params.id);
    const voluntario = await getVoluntarioById(id);
    if (!voluntario) {
      return res.status(404).json({ message: "Voluntario no encontrado" });
    }
    res.status(200).json({ data: omitPassword(voluntario) });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener voluntario", error: error.message });
  }
}

