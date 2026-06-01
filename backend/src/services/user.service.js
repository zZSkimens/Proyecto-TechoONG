<<<<<<< HEAD
import { AppDataSource } from "../config/configDB.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User);

export async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = userRepository.create({
    email: data.email,
    password: hashedPassword,
    role: data.role || "jefe_cuadrilla",
=======
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

export async function createUser(data) {
  const userRepository = AppDataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = userRepository.create({
    rut: data.rut,
    name: data.name,
    password: hashedPassword,
    role: data.role || "user",
>>>>>>> Bryan
  });

  return await userRepository.save(newUser);
}

<<<<<<< HEAD
export async function findUserByEmail(email) {
  return await userRepository.findOneBy({ email });
=======
export async function findUserByRut(rut) {
  const userRepository = AppDataSource.getRepository(User);
  return await userRepository.findOneBy({ rut });
>>>>>>> Bryan
}
