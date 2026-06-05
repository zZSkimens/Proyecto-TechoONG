import { AppDataSource } from "./configDb.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

export async function createInitialUsers() {
  const userRepository = AppDataSource.getRepository(User);
  //Creamos usuarios para pruebas
  const usersToSeed = [
    {
      rut: "11111111-1",
      name: "Administrador Global",
      password: "admin",
      role: "administrador"
    },
    {
      rut: "14986372-9",
      name: "Augusto Pinares",
      password: "AugusPI071",
      role: "admin_bodega"
    },
    {
      rut: "16742589-K",
      name: "Roberto Hurtado",
      password: "JefePass2024",
      role: "jefe_cuadrilla"
    },
    {
      rut: "20145789-3",
      name: "Lucas Barrios",
      password: "VolunPass1",
      role: "voluntario"
    },
    {
      rut: "19852364-7",
      name: "Catalina Perez",
      password: "VolunPass2",
      role: "voluntario"
    },
    {
      rut: "22222222-2",
      name: "Coordinador de Viajes",
      password: "viajes",
      role: "coordinador_viajes"
    }
  ];

  for (const userData of usersToSeed) {
    const existingUser = await userRepository.findOneBy({ rut: userData.rut });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = userRepository.create({
        ...userData,
        password: hashedPassword
      });
      await userRepository.save(user);
      console.log(`=> Configuración Inicial: Usuario creado: ${userData.name} (Rol: ${userData.role})`);
    }
  }
}
