import { registerUsuario, authenticateUsuario, generateAuthToken } from "../services/auth.service.js";

function omitSensitiveFields(usuario) {
  if (!usuario) return null;
  const { password, created_at, updated_at, ...rest } = usuario;
  return rest;
}

export async function registerController(req, res) {
  try {
    const usuario = await registerUsuario(req.body);
    res.status(201).json({
      message: "Registro exitoso",
      data: omitSensitiveFields(usuario),
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "Error en el registro",
    });
  }
}

export async function loginController(req, res) {
  try {
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
  }
}
