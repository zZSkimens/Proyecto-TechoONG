import { AppDataSource } from "../config/configDB.js";
import { ActaDevolucion } from "../entities/actaDevolucion.entity.js";
import { ActaDevolucionItem } from "../entities/actaDevolucionItem.entity.js";

export async function getActasDevolucion() {
  const actaRepository = AppDataSource.getRepository(ActaDevolucion);
  const actaItemRepository = AppDataSource.getRepository(ActaDevolucionItem);

  const actas = await actaRepository.find({
    relations: ["despacho", "despacho.cuadrilla"],
    order: { created_at: "DESC" }
  });

  for (const acta of actas) {
    const items = await actaItemRepository.find({
      where: { acta_devolucion: { id: acta.id } },
      relations: ["item"]
    });

    acta.items_devueltos = items.map(ai => ({
      id: ai.item.id,
      nombre: ai.item.name,
      categoria: ai.item.category,
      estado: ai.estado,
      cantidad: ai.cantidad
    }));
  }

  return actas;
}
