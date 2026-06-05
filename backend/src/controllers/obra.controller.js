import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import { Obra } from "../entities/obra.entity.js";
import { calcularMatchInteligente } from "../services/match.service.js";

const obraRepository = AppDataSource.getRepository(Obra);

export async function crearObra(req, res) {
  try {
    const { nombre, descripcion, zona, competencias_requeridas, certificaciones_requeridas } = req.body;

    if (!nombre || !zona) {
      return handleErrorClient(res, 400, "El nombre y la zona son requeridos.");
    }

    const nuevaObra = obraRepository.create({
      nombre,
      descripcion,
      zona,
      competencias_requeridas,
      certificaciones_requeridas,
    });

    const obraCreada = await obraRepository.save(nuevaObra);
    handleSuccess(res, 201, "Obra creada exitosamente", obraCreada);
  } catch (error) {
    handleErrorServer(res, 500, "Error al crear la obra", error.message);
  }
}

export async function listarObras(req, res) {
  try {
    const obras = await obraRepository.find();
    handleSuccess(res, 200, "Obras listadas exitosamente", obras);
  } catch (error) {
    handleErrorServer(res, 500, "Error al listar las obras", error.message);
  }
}

export async function obtenerMatchParaObra(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return handleErrorClient(res, 400, "Debe proporcionar el ID de la obra.");
    }

    const resultado = await calcularMatchInteligente(parseInt(id));
    handleSuccess(res, 200, "Coincidencia de personal calculada exitosamente", resultado);
  } catch (error) {
    if (error.message.includes("no existe")) {
      return handleErrorClient(res, 404, error.message);
    }
    handleErrorServer(res, 500, "Error al calcular el match", error.message);
  }
}
