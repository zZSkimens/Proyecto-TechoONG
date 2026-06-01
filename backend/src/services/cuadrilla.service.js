import { AppDataSource } from "../config/configDb.js";
import { Cuadrilla } from "../entities/cuadrilla.entity.js";

export async function createCuadrilla(data) {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  const nuevaCuadrilla = cuadrillaRepository.create(data);
  return await cuadrillaRepository.save(nuevaCuadrilla);
}

export async function getCuadrillas() {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  const despachoItemRepository = AppDataSource.getRepository("DespachoItem");

  const cuadrillas = await cuadrillaRepository.find();

  // Para cada cuadrilla, buscamos sus items despachados
  for (const cuadrilla of cuadrillas) {
    const items = await despachoItemRepository.find({
      where: { despacho: { cuadrilla: { id: cuadrilla.id } } },
      relations: ["item"]
    });

    // Agrupamos y formateamos los items para que sean fáciles de leer
    cuadrilla.items_asignados = items.map(di => ({
      id: di.item.id,
      nombre: di.item.name,
      categoria: di.item.category,
      cantidad: di.cantidad
    }));
  }

  return cuadrillas;
}

export async function getCuadrillaById(id) {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  return await cuadrillaRepository.findOneBy({ id });
}

export async function updateCuadrilla(id, data) {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  const existingCuadrilla = await cuadrillaRepository.findOneBy({ id: parseInt(id) });

  if (!existingCuadrilla) return null;

  const updatedCuadrilla = cuadrillaRepository.merge(existingCuadrilla, data);
  return await cuadrillaRepository.save(updatedCuadrilla);
}

export async function deleteCuadrilla(id) {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const cuadrillaId = parseInt(id);
    const cuadrilla = await queryRunner.manager.findOneBy("Cuadrilla", { id: cuadrillaId });
    if (!cuadrilla) return null;

    // 1. Busca todos los despachos de la cuadrilla
    const despachos = await queryRunner.manager.find("Despacho", {
      where: { cuadrilla: { id: cuadrillaId } }
    });

    for (const despacho of despachos) {
      // 2. Busca los items de cada despacho
      const despachoItems = await queryRunner.manager.find("DespachoItem", {
        where: { despacho: { id: despacho.id } },
        relations: ["item"]
      });

      for (const dItem of despachoItems) {
        // 3. Si es Herramienta, debe devolver al stock
        if (dItem.item.category === "Herramienta") {
          const item = await queryRunner.manager.findOneBy("Item", { id: dItem.item.id });
          if (item) {
            item.stock += dItem.cantidad;
            await queryRunner.manager.save("Item", item);
          }
        }
        // Borra registro del item despachado
        await queryRunner.manager.remove("DespachoItem", dItem);
      }
      // Borra despacho
      await queryRunner.manager.remove("Despacho", despacho);
    }

    // 4. Finalmente se borra la cuadrilla
    await queryRunner.manager.remove("Cuadrilla", cuadrilla);

    await queryRunner.commitTransaction();
    return true;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
