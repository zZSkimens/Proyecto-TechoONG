import { AppDataSource } from "../config/configDb.js";
import { Obra } from "../entities/obra.entity.js";
import { Voluntario } from "../entities/voluntario.entity.js";

const obraRepository = AppDataSource.getRepository(Obra);
const voluntarioRepository = AppDataSource.getRepository(Voluntario);

export async function getMatchForProject(obraId) {
  // 1. Obtener la obra y sus habilidades requeridas
  const obra = await obraRepository.findOne({
    where: { id: obraId },
    relations: ["habilidadesRequeridas"]
  });

  if (!obra) {
    throw new Error("Obra no encontrada");
  }

  const requeridasIds = obra.habilidadesRequeridas.map(h => h.id);

  if (requeridasIds.length === 0) {
    return { obra, matches: [] }; // No requiere habilidades específicas
  }

  // 2. Obtener todos los voluntarios disponibles y sus habilidades
  const voluntariosDisponibles = await voluntarioRepository.find({
    where: { disponible: true },
    relations: ["habilidades"]
  });

  // 3. Calcular coincidencias
  const matches = voluntariosDisponibles.map(voluntario => {
    const voluntarioHabilidadesIds = voluntario.habilidades.map(h => h.id);
    const coincidencias = requeridasIds.filter(id => voluntarioHabilidadesIds.includes(id));
    
    return {
      voluntario,
      matchCount: coincidencias.length,
      porcentajeMatch: Math.round((coincidencias.length / requeridasIds.length) * 100)
    };
  });

  // 4. Filtrar los que tienen al menos una coincidencia y ordenar de mayor a menor
  const bestMatches = matches
    .filter(m => m.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);

  return {
    obra,
    matches: bestMatches
  };
}
