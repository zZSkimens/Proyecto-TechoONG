import { AppDataSource } from "./configDb.js";
import { User } from "../entities/user.entity.js";
import { Obra } from "../entities/obra.entity.js";
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
      rut: "12345678-9",
      name: "Pedro Coordinador",
      password: "123456",
      role: "jefe_cuadrilla"
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

  // Seed de Obras de prueba
  const obraRepository = AppDataSource.getRepository(Obra);
  const existingObras = await obraRepository.find();
  if (existingObras.length === 0) {
    const obrasToSeed = [
      {
        nombre: "Construcción Viviendas de Emergencia - Valparaíso",
        descripcion: "Construcción y techado rápido para campamento afectado por incendios.",
        zona: "Valparaíso",
        competencias_requeridas: ["Carpintería", "Electricidad", "Liderazgo de Equipos"],
        certificaciones_requeridas: ["Curso Prevención de Riesgos", "Primeros Auxilios"]
      },
      {
        nombre: "Reconstrucción Comunitaria - Santiago Centro",
        descripcion: "Mejoramiento e instalación sanitaria en centro sociocomunitario.",
        zona: "Santiago",
        competencias_requeridas: ["Albañilería", "Pintura", "Fontanería/Plomería"],
        certificaciones_requeridas: ["Primeros Auxilios Avanzado"]
      },
      {
        nombre: "Techado Social - Biobío",
        descripcion: "Instalación de planchas y estructuras metálicas de soporte.",
        zona: "Biobío",
        competencias_requeridas: ["Carpintería", "Estructuras Metálicas"],
        certificaciones_requeridas: ["Curso Prevención de Riesgos"]
      }
    ];

    for (const obraData of obrasToSeed) {
      const obra = obraRepository.create(obraData);
      await obraRepository.save(obra);
      console.log(`=> Configuración Inicial: Obra creada: ${obraData.nombre}`);
    }
  }
}
