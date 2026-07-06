import { handleErrorClient } from "../Handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";

const userRepository = AppDataSource.getRepository(User);

export async function adminMiddleware(req, res, next) {
  try {
    const userId = req.user.id || req.user.sub;

    const usuario = await userRepository.findOneBy({ id: userId });

    if (!usuario) {
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }

    if (usuario.role !== "admin" && usuario.role !== "administrador" && usuario.role !== "coordinador") {
      return handleErrorClient(res, 403, "Acceso denegado. Se requieren permisos de administrador o coordinador.");
    }

    next();
  } catch (error) {
    return handleErrorClient(res, 500, "Error verificando permisos de administrador.", error.message);
  }
}
