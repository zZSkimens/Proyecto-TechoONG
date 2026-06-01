import { handleErrorClient } from "../Handlers/responseHandlers.js";

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return handleErrorClient(res, 403, "Acceso denegado. No se encontró el rol del usuario.");
    }

    if (!allowedRoles.includes(userRole)) {
      return handleErrorClient(res, 403, "Acceso denegado. No tienes permisos para esta acción.");
    }

    next();
  };
}
