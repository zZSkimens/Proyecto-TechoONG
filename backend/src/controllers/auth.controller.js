import { registerUsuario, authenticateUsuario, generateAuthToken } from "../services/auth.service.js";

function omitSensitiveFields(usuario) {
  if (!usuario) return null;
  const { password, created_at, updated_at, ...rest } = usuario;
  return rest;
}

export async function registerController(req, res) {
  try {
<<<<<<< HEAD:backend/src/controllers/auth.controller.js
    const { rut, password } = req.body;

    if (!rut || !password) {
      return handleErrorClient(res, 400, "RUT y contraseña son requeridos");
    }

    const data = await loginUser(rut, password);
    handleSuccess(res, 200, "Login exitoso", data);
=======
    const usuario = await registerUsuario(req.body);
    res.status(201).json({
      message: "Registro exitoso",
      data: omitSensitiveFields(usuario),
    });
>>>>>>> angelo:src/controllers/auth.controller.js
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "Error en el registro",
    });
  }
}

export async function loginController(req, res) {
  try {
<<<<<<< HEAD:backend/src/controllers/auth.controller.js
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
=======
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    const usuario = await authenticateUsuario(correo, password);
    if (!usuario) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    const token = generateAuthToken(usuario);

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      data: {
        token,
        usuario: omitSensitiveFields(usuario),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
>>>>>>> angelo:src/controllers/auth.controller.js
  }
}
