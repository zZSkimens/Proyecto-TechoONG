import { loginUser } from "../services/auth.service.js";
import { createUser } from "../services/user.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function login(req, res) {
  try {
    const { rut, password } = req.body;

    if (!rut || !password) {
      return handleErrorClient(res, 400, "RUT y contraseña son requeridos");
    }

    const data = await loginUser(rut, password);
    handleSuccess(res, 200, "Login exitoso", data);
  } catch (error) {
    handleErrorClient(res, 401, error.message);
  }
}

export async function register(req, res) {
  try {
    const data = req.body;

    if (!data.rut || !data.password || !data.name) {
      return handleErrorClient(res, 400, "RUT, nombre y contraseña son requeridos");
    }

    const newUser = await createUser(data);
<<<<<<< HEAD:backend/src/controllers/auth.controller.js
    delete newUser.password; 
    handleSuccess(res, 201, "Usuario registrado exitosamente", newUser);
  } catch (error) {
<<<<<<< HEAD
    if (error.code === '23505') { 
=======
    delete newUser.password;
    handleSuccess(res, 201, "Usuario registrado exitosamente", newUser);
  } catch (error) {
    if (error.code === '23505') {
>>>>>>> Vicente:src/controllers/auth.controller.js
      handleErrorClient(res, 409, "El email ya está registrado");
=======
    if (error.code === '23505') { // Código de error de PostgreSQL
      handleErrorClient(res, 409, "El RUT ya está registrado");
>>>>>>> Bryan
    } else {
      handleErrorServer(res, 500, "Error interno del servidor", error.message);
    }
  }
}
