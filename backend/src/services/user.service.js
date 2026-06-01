import { AppDataSource } from "../config/configDB.js";
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
  });
  return await userRepository.save(newUser);
}

export async function findUserByRut(rut) {
  const userRepository = AppDataSource.getRepository(User);
  return await userRepository.findOneBy({ rut });
}
