import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { Voluntario } from "../entities/voluntario.entity.js";
import { Cuadrilla } from "../entities/cuadrilla.entity.js";
import { In } from "typeorm";

const voluntarioRepository = AppDataSource.getRepository(Voluntario);
const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);

export async function createVoluntario(data) {
  const { cuadrillas, password, ...voluntarioData } = data;

  const savedData = {
    ...voluntarioData,
    ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
  };

  const voluntario = voluntarioRepository.create(savedData);

  if (cuadrillas && cuadrillas.length > 0) {
    const cuadrillasFound = await cuadrillaRepository.findBy({
      id: In(cuadrillas),
    });
    voluntario.cuadrillas = cuadrillasFound;
  }

  return await voluntarioRepository.save(voluntario);
}

export async function getVoluntarios() {
  const voluntariosAntiguos = await voluntarioRepository.find({
    relations: ["cuadrillas"]
  });

  const perfilRepo = AppDataSource.getRepository("Perfil");
  const perfilesVoluntarios = await perfilRepo.find({
    where: { rol: "voluntario" },
    relations: ["user"]
  });

  const combined = [...voluntariosAntiguos];

  for (const p of perfilesVoluntarios) {
    if (p.user && p.user.rut) {
      if (!combined.some(v => v.rut === p.user.rut)) {
        combined.push({
          id: `p_${p.id}`,
          rut: p.user.rut,
          nombres: p.nombre_completo,
          apellidos: "",
          correo: p.user.email,
          telefono: p.telefono,
          disponible: p.estado === "habilitado"
        });
      }
    }
  }

  return combined;
}

export async function getVoluntarioById(id) {
  return await voluntarioRepository.findOne({
    where: { id },
    relations: ["cuadrillas"]
  });
}
