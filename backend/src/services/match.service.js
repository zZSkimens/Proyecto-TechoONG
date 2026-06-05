import { AppDataSource } from "../config/configDb.js";
import { Obra } from "../entities/obra.entity.js";
import { Perfil } from "../entities/perfil.entity.js";

const obraRepository = AppDataSource.getRepository(Obra);
const perfilRepository = AppDataSource.getRepository(Perfil);

export async function calcularMatchInteligente(obraId) {
  const obra = await obraRepository.findOneBy({ id: obraId });
  if (!obra) {
    throw new Error(`La obra con ID ${obraId} no existe.`);
  }

  const voluntarios = await perfilRepository.find({
    where: {
      rol: "voluntario",
      estado: "habilitado",
    },
    relations: ["user"],
  });

  const reqSkills = obra.competencias_requeridas || [];
  const reqCerts = obra.certificaciones_requeridas || [];
  const obraZona = obra.zona;

  const resultados = voluntarios.map((voluntario) => {
    const volSkills = voluntario.competencias || [];
    const volCerts = voluntario.certificaciones || [];
    const volZona = voluntario.zona_asignada;

    const skillsCoincidentes = volSkills.filter(skill => 
      typeof skill === "string" && reqSkills.some(reqSkill => 
        typeof reqSkill === "string" && reqSkill.toLowerCase().trim() === skill.toLowerCase().trim()
      )
    );
    const scoreSkills = reqSkills.length > 0 ? (skillsCoincidentes.length / reqSkills.length) : 1.0;

    const certsCoincidentes = volCerts.filter(cert => 
      typeof cert === "string" && reqCerts.some(reqCert => 
        typeof reqCert === "string" && reqCert.toLowerCase().trim() === cert.toLowerCase().trim()
      )
    );
    const scoreCerts = reqCerts.length > 0 ? (certsCoincidentes.length / reqCerts.length) : 1.0;

    const coincideZona = typeof volZona === "string" && typeof obraZona === "string" && 
      volZona.toLowerCase().trim() === obraZona.toLowerCase().trim();
    const scoreZona = coincideZona ? 1.0 : 0.0;

    // Ponderación: 40% competencias, 40% certificaciones, 20% zona geográfica
    const pesoSkills = 0.4;
    const pesoCerts = 0.4;
    const pesoZona = 0.2;

    const scoreTotal = (scoreSkills * pesoSkills) + (scoreCerts * pesoCerts) + (scoreZona * pesoZona);

    return {
      voluntario_id: voluntario.id,
      nombre_completo: voluntario.nombre_completo,
      rut: voluntario.user ? voluntario.user.rut : null,
      email: voluntario.user ? voluntario.user.email : null,
      telefono: voluntario.telefono,
      zona_asignada: volZona,
      competencias: volSkills,
      certificaciones: volCerts,
      match: {
        porcentaje_coincidencia: Math.round(scoreTotal * 100),
        competencias_coincidentes: skillsCoincidentes,
        certificaciones_coincidentes: certsCoincidentes,
        coincide_zona: coincideZona,
      }
    };
  });

  resultados.sort((a, b) => b.match.porcentaje_coincidencia - a.match.porcentaje_coincidencia);

  return {
    obra: {
      id: obra.id,
      nombre: obra.nombre,
      zona: obra.zona,
      competencias_requeridas: reqSkills,
      certificaciones_requeridas: reqCerts,
    },
    candidatos_compatibles: resultados,
  };
}
