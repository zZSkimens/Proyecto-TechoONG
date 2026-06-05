import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { Usuario } from "../entities/usuario.entity.js";
import { JWT_SECRET } from "../config/configEnv.js";

const usuarioRepository = AppDataSource.getRepository(Usuario);

export async function registerUsuario(data) {
  const existing = await usuarioRepository.findOne({
    where: { correo: data.correo },
  });

  if (existing) {
    const error = new Error("Correo ya registrado");
    error.status = 409;
    throw error;
  }

  const { correo, password } = data;
  if (!correo || !password) {
    const error = new Error("Correo y contraseña son obligatorios");
    error.status = 400;
    throw error;
  }

  const usuario = usuarioRepository.create({
    correo,
    password: await bcrypt.hash(password, 10),
  });

  return await usuarioRepository.save(usuario);
}

export async function authenticateUsuario(correo, password) {
  const usuario = await usuarioRepository.findOne({
    where: { correo },
  });

  if (!usuario || !usuario.password) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, usuario.password);
  if (!isPasswordValid) {
    return null;
  }

  return usuario;
}

export function generateAuthToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
    },
    JWT_SECRET,
    {
      expiresIn: "8h",
    }
  );
}
