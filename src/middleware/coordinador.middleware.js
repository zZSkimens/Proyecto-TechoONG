import { handleErrorClient } from "../Handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDB.js";
import { User } from "../entities/user.entity.js";

const userRepository = AppDataSource.getRepository(User);

export async function coordinadorMiddleware(req, res, next) {
  try {
    const userId = req.user.id;
    
    const usuario = await userRepository.findOneBy({ id: userId });
    
    if (!usuario) {
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }

    if (usuario.rol !== "coordinador" && usuario.rol !== "admin") {
      return handleErrorClient(res, 403, "Acceso denegado. Se requieren permisos de coordinador o administrador.");
    }

    next();
  } catch (error) {
    return handleErrorClient(res, 500, "Error verificando permisos de coordinador.", error.message);
  }
}
