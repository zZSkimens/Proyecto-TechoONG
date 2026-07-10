import { AppDataSource } from "./configDb.js";
import { User } from "../entities/user.entity.js";
import { Obra } from "../entities/obra.entity.js";
import { Voluntario } from "../entities/voluntario.entity.js";
import { Perfil } from "../entities/perfil.entity.js";
import bcrypt from "bcrypt";

export async function createInitialUsers() {
  const userRepository = AppDataSource.getRepository(User);
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
      rut: "17654321-5",
      name: "María González",
      password: "EncAlim2024",
      role: "enc_alimentacion"
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
    },
    {
      rut: "87654321-0",
      name: "Carlos Viajes",
      password: "123456",
      role: "coordinador_viajes"
    },
    {
      rut: "13579246-8",
      name: "Juan Coordinador",
      password: "coord",
      role: "coordinador"
    },
    {
      rut: "21111111-1",
      name: "Andres",
      password: "password123",
      role: "postulante"
    },
    {
      rut: "22222222-2",
      name: "Sofia",
      password: "password123",
      role: "postulante"
    },
    {
      rut: "23333333-3",
      name: "Diego",
      password: "password123",
      role: "postulante"
    },
    {
      rut: "24444444-4",
      name: "Camila",
      password: "password123",
      role: "postulante"
    },
    {
      rut: "25555555-5",
      name: "Mateo",
      password: "password123",
      role: "postulante"
    },
    {
      rut: "26666666-6",
      name: "Valentina",
      password: "password123",
      role: "postulante"
    },
    {
      rut: "27777777-7",
      name: "Sebastian Vidal",
      password: "VolunPass3",
      role: "voluntario"
    },
    {
      rut: "28888888-8",
      name: "Martina Lagos",
      password: "VolunPass4",
      role: "voluntario"
    },
    {
      rut: "29999999-9",
      name: "Joaquin Torres",
      password: "VolunPass5",
      role: "voluntario"
    },
    {
      rut: "10000000-0",
      name: "Antonia",
      password: "password123",
      role: "postulante"
    },
    {
      rut: "10000001-1",
      name: "Benjamin",
      password: "password123",
      role: "postulante"
    },
    {
      rut: "10000002-2",
      name: "Constanza",
      password: "password123",
      role: "postulante"
    },
    {
      rut: "10000003-3",
      name: "Daniel",
      password: "password123",
      role: "postulante"
    },
    {
      rut: "10000004-4",
      name: "Emilia",
      password: "password123",
      role: "postulante"
    },
    {
      rut: "10000005-5",
      name: "Felipe Gonzalez",
      password: "VolunPass6",
      role: "voluntario"
    },
    {
      rut: "10000006-6",
      name: "Gabriela Diaz",
      password: "VolunPass7",
      role: "voluntario"
    },
    {
      rut: "10000007-7",
      name: "Hernan Silva",
      password: "VolunPass8",
      role: "voluntario"
    },
    {
      rut: "10000008-8",
      name: "Isidora Castro",
      password: "VolunPass9",
      role: "voluntario"
    },
    {
      rut: "10000009-9",
      name: "Javier Soto",
      password: "VolunPass10",
      role: "voluntario"
    }
  ];

  const perfilRepository = AppDataSource.getRepository(Perfil);

  for (const userData of usersToSeed) {
    let user = await userRepository.findOneBy({ rut: userData.rut });
    if (!user) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      user = userRepository.create({
        ...userData,
        password: hashedPassword
      });
      await userRepository.save(user);
      console.log(`=> Configuración Inicial: Usuario creado: ${userData.name} (Rol: ${userData.role})`);
    }

    const existingPerfil = await perfilRepository.findOneBy({ user_id: user.id });
    if (!existingPerfil) {
      const perfil = perfilRepository.create({
        user_id: user.id,
        nombre_completo: user.name,
        rol: user.role,
        estado: user.role === "postulante" ? "registrado" : "activo",
        competencias: user.role === "postulante" ? ["Liderazgo de Equipos", "Carpintería"] : [],
        certificaciones: user.role === "postulante" ? ["Curso Prevención de Riesgos"] : []
      });
      await perfilRepository.save(perfil);
      console.log(`=> Configuración Inicial: Perfil creado para: ${userData.name}`);
    }
  }

  const voluntarioRepository = AppDataSource.getRepository(Voluntario);
  const volunteersToSeed = [
    {
      rut: "20145789-3",
      nombres: "Lucas",
      apellidos: "Barrios",
      correo: "lucas.barrios@correo.cl",
      password: "VolunPass1",
      disponible: true
    },
    {
      rut: "19852364-7",
      nombres: "Catalina",
      apellidos: "Perez",
      correo: "catalina.perez@correo.cl",
      password: "VolunPass2",
      disponible: true
    },
    {
      rut: "27777777-7",
      nombres: "Sebastian",
      apellidos: "Vidal",
      correo: "sebastian@correo.cl",
      password: "VolunPass3",
      disponible: true
    },
    {
      rut: "28888888-8",
      nombres: "Martina",
      apellidos: "Lagos",
      correo: "martina@correo.cl",
      password: "VolunPass4",
      disponible: true
    },
    {
      rut: "29999999-9",
      nombres: "Joaquin",
      apellidos: "Torres",
      correo: "joaquin@correo.cl",
      password: "VolunPass5",
      disponible: true
    },
    {
      rut: "10000005-5",
      nombres: "Felipe",
      apellidos: "Gonzalez",
      correo: "felipe@correo.cl",
      password: "VolunPass6",
      disponible: true
    },
    {
      rut: "10000006-6",
      nombres: "Gabriela",
      apellidos: "Diaz",
      correo: "gabriela@correo.cl",
      password: "VolunPass7",
      disponible: true
    },
    {
      rut: "10000007-7",
      nombres: "Hernan",
      apellidos: "Silva",
      correo: "hernan@correo.cl",
      password: "VolunPass8",
      disponible: true
    },
    {
      rut: "10000008-8",
      nombres: "Isidora",
      apellidos: "Castro",
      correo: "isidora@correo.cl",
      password: "VolunPass9",
      disponible: true
    },
    {
      rut: "10000009-9",
      nombres: "Javier",
      apellidos: "Soto",
      correo: "javier@correo.cl",
      password: "VolunPass10",
      disponible: true
    }
  ];

  for (const volData of volunteersToSeed) {
    const existingVol = await voluntarioRepository.findOneBy({ rut: volData.rut });
    if (!existingVol) {
      const hashedPassword = await bcrypt.hash(volData.password, 10);
      const voluntario = voluntarioRepository.create({
        ...volData,
        password: hashedPassword
      });
      await voluntarioRepository.save(voluntario);
      console.log(`=> Configuración Inicial: Voluntario creado: ${volData.nombres} ${volData.apellidos} (RUT: ${volData.rut})`);
    }
  }

  const obraRepository = AppDataSource.getRepository(Obra);
  const obrasToSeed = [
    {
      nombre: "Construcción Viviendas de Emergencia - Incendios Valparaíso",
      descripcion: "Construcción de viviendas de emergencia (mediaguas) para familias damnificadas por los mega incendios en los cerros de Valparaíso.",
      zona: "Valparaíso",
      competencias_requeridas: ["Carpintería", "Electricidad", "Liderazgo de Equipos"],
      certificaciones_requeridas: ["Curso Prevención de Riesgos", "Primeros Auxilios"]
    },
    {
      nombre: "Levantamiento de Viviendas Progresivas - Santiago",
      descripcion: "Construcción de módulos habitacionales definitivos para la erradicación de campamentos urbanos apoyados por TECHO.",
      zona: "Santiago",
      competencias_requeridas: ["Albañilería", "Pintura", "Fontanería/Plomería"],
      certificaciones_requeridas: ["Primeros Auxilios Avanzado"]
    },
    {
      nombre: "Reconstrucción Post-Incendios Forestales - Biobío",
      descripcion: "Armado de viviendas de emergencia, techumbre y limpieza de terrenos para familias afectadas por incendios forestales.",
      zona: "Biobío",
      competencias_requeridas: ["Carpintería", "Estructuras Metálicas"],
      certificaciones_requeridas: ["Curso Prevención de Riesgos"]
    },
    {
      nombre: "Construccion Viviendas de Emergencia - Maule",
      descripcion: "Construcción rápida de módulos habitacionales para familias que perdieron sus casas",
      zona: "Maule",
      competencias_requeridas: ["Carpintería", "Albañilería", "Prevención de Riesgos"],
      certificaciones_requeridas: []
    },
    {
      nombre: "Construcción de Viviendas Definitivas - Araucanía",
      descripcion: "Proyecto TECHO: Construcción de viviendas con aislamiento térmico y sellado para comunidades rurales enfrentando bajas temperaturas.",
      zona: "Araucanía",
      competencias_requeridas: ["Carpintería", "Estructuras Metálicas"],
      certificaciones_requeridas: ["Curso Prevención de Riesgos", "Primeros Auxilios"]
    },
    {
      nombre: "Levantamiento de Sede Comunitaria y Viviendas - O'Higgins",
      descripcion: "Construcción de viviendas de emergencia y una sede comunitaria rápida para familias afectadas por los recientes incendios.",
      zona: "O'Higgins",
      competencias_requeridas: ["Pintura", "Logística", "Liderazgo de Equipos"],
      certificaciones_requeridas: ["Primeros Auxilios Avanzado"]
    }
  ];

  for (const obraData of obrasToSeed) {
    const existingObra = await obraRepository.findOneBy({ nombre: obraData.nombre });
    if (!existingObra) {
      const obra = obraRepository.create(obraData);
      await obraRepository.save(obra);
      console.log(`=> Configuración Inicial: Obra creada: ${obraData.nombre}`);
    }
  }
}
