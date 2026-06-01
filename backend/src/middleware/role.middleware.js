import { handleErrorClient } from "../Handlers/responseHandlers.js";

<<<<<<< HEAD
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return handleErrorClient(res, 403, "Acceso denegado. No se encontró el rol del usuario.");
    }

    if (!allowedRoles.includes(userRole)) {
      return handleErrorClient(res, 403, "Acceso denegado. No tienes permisos para esta acción.");
=======
//Verifico los roles
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // El usuario debe estar autenticado previamente
    const user = req.user;

    if (!user) {
      return handleErrorClient(res, 401, "Para realizar esta acción primero debes iniciar sesión");
    }

    if (!allowedRoles.includes(user.role)) {
      return handleErrorClient(res, 403, `Lo sentimos, tu rol de '${user.role}' no tiene permisos para acceder aquí`);
>>>>>>> Bryan
    }

    next();
  };
<<<<<<< HEAD
}
=======
};

export const isAdminBodega = checkRole(["admin_bodega"]);
export const isJefeCuadrilla = checkRole(["jefe_cuadrilla"]);
export const isVoluntario = checkRole(["voluntario"]);
export const authorize = checkRole;
>>>>>>> Bryan
