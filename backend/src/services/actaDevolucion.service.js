import { AppDataSource } from "../config/configDb.js";
import { ActaDevolucion } from "../entities/actaDevolucion.entity.js";
import { ActaDevolucionItem } from "../entities/actaDevolucionItem.entity.js";
import { Item } from "../entities/item.entity.js";

// Obtener todas las actas de devolución
export async function getActasDevolucion() {
  const actaRepository = AppDataSource.getRepository(ActaDevolucion);
  const actaItemRepository = AppDataSource.getRepository(ActaDevolucionItem);

  const actas = await actaRepository.find({
    order: { created_at: "DESC" }
  });

  for (const acta of actas) {
    const items = await actaItemRepository.find({
      where: { acta_devolucion: { id: acta.id } },
      relations: ["item"]
    });

    acta.items_devueltos = items.map(ai => ({
      id: ai.id,
      item_id: ai.item.id,
      nombre: ai.item.name,
      categoria: ai.categoria || ai.item.category,
      estado: ai.estado,
      cantidad: ai.cantidad
    }));
  }

  return actas;
}

// Crear acta de devolución al disolver cuadrilla (jefe_cuadrilla)
export async function crearActaDevolucion(data) {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { cuadrilla_nombre, encargado, dias_trabajados, items_sobrantes } = data;

    // Crear el acta
    const acta = queryRunner.manager.create(ActaDevolucion, {
      estado: "Pendiente",
      dias_trabajados,
      cuadrilla_nombre,
      encargado,
    });
    const savedActa = await queryRunner.manager.save(ActaDevolucion, acta);

    const itemsCreados = [];

    // Crear los items del acta como "Pendiente" (el admin_bodega los revisará)
    for (const itemData of items_sobrantes) {
      // Verificar que el item existe
      const item = await queryRunner.manager.findOneBy(Item, { id: itemData.itemId });
      if (!item) {
        throw new Error(`El item con ID ${itemData.itemId} no existe`);
      }

      const actaItem = queryRunner.manager.create(ActaDevolucionItem, {
        acta_devolucion: savedActa.id,
        item: item.id,
        cantidad: itemData.cantidad,
        estado: "Pendiente",
        categoria: item.category,
      });
      const savedItem = await queryRunner.manager.save(ActaDevolucionItem, actaItem);
      itemsCreados.push({
        id: savedItem.id,
        item_id: item.id,
        nombre: item.name,
        categoria: item.category,
        cantidad: itemData.cantidad,
        estado: "Pendiente"
      });
    }

    await queryRunner.commitTransaction();
    return {
      acta: savedActa,
      items: itemsCreados
    };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// Procesar acta de devolución (admin_bodega revisa y clasifica items)
export async function procesarActaDevolucion(actaId, itemsRevisados) {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const acta = await queryRunner.manager.findOneBy(ActaDevolucion, { id: actaId });
    if (!acta) {
      throw new Error("El acta de devolución no existe");
    }

    if (acta.estado === "Procesada") {
      throw new Error("Esta acta ya ha sido procesada");
    }

    const actaItems = await queryRunner.manager.find(ActaDevolucionItem, {
      where: { acta_devolucion: { id: actaId } },
      relations: ["item"]
    });

    const resultados = [];

    for (const actaItem of actaItems) {
      const revision = itemsRevisados.find(r => r.actaItemId === actaItem.id);
      
      if (!revision || !revision.estado) {
        throw new Error(`Falta la revisión para el item: ${actaItem.item.name} (ID: ${actaItem.id})`);
      }

      const estadoValido = ["Disponible", "Dañada"].includes(revision.estado);
      if (!estadoValido) {
        throw new Error(`Estado inválido para ${actaItem.item.name}: ${revision.estado}. Use "Disponible" o "Dañada"`);
      }

      // Actualizar el estado del item del acta
      actaItem.estado = revision.estado;
      await queryRunner.manager.save(ActaDevolucionItem, actaItem);

      // Si está "Disponible", devolver al stock
      if (revision.estado === "Disponible") {
        const item = await queryRunner.manager.findOneBy(Item, { id: actaItem.item.id });
        if (item) {
          item.stock += actaItem.cantidad;
          await queryRunner.manager.save(Item, item);
        }
      }
      // Si está "Dañada", NO vuelve al stock (se descarta)

      resultados.push({
        item_id: actaItem.item.id,
        nombre: actaItem.item.name,
        categoria: actaItem.categoria || actaItem.item.category,
        cantidad: actaItem.cantidad,
        estado: revision.estado,
        devuelto_al_stock: revision.estado === "Disponible"
      });
    }

    // Marcar acta como procesada
    acta.estado = "Procesada";
    await queryRunner.manager.save(ActaDevolucion, acta);

    await queryRunner.commitTransaction();
    return {
      acta,
      items: resultados
    };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
