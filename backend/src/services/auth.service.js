import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByRut } from "./user.service.js";

export async function loginUser(rut, password) {
  const user = await findUserByRut(rut);
  if (!user) {
    throw new Error("Credenciales incorrectas");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

<<<<<<< HEAD
  const payload = { sub: user.id, email: user.email, role: user.role };
=======
  const payload = { 
    sub: user.id, 
    rut: user.rut, 
    name: user.name, 
    role: user.role 
  };
>>>>>>> Bryan
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  delete user.password;
  return { user, token };
}
