import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

export async function createUser(data) {
  const userRepository = AppDataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = userRepository.create({
    email: data.email,
    password: hashedPassword,
  });

  return await userRepository.save(newUser);
}

export async function findUserByEmail(email) {
  const userRepository = AppDataSource.getRepository(User);
  return await userRepository.findOneBy({ email });
}
