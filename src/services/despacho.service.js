import { AppDataSource } from "../config/configDb.js";
import { Despacho } from "../entities/despacho.entity.js";
import { DespachoItem } from "../entities/despachoItem.entity.js";
import { Item } from "../entities/item.entity.js";
import { Cuadrilla } from "../entities/cuadrilla.entity.js";

export async function createDespacho(cuadrillaId, itemsToDispatch) {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Verificar Cuadrilla
    const cuadrilla = await queryRunner.manager.findOneBy(Cuadrilla, { id: cuadrillaId });
    if (!cuadrilla) {
      throw new Error("La cuadrilla no existe");
    }

    // 2. Crear registro de Despacho
    const despacho = queryRunner.manager.create(Despacho, {
      cuadrilla: cuadrillaId
    });
    const savedDespacho = await queryRunner.manager.save(despacho);

    const despachoItemsDetails = [];

    // 3. Procesar items y validar stock
    for (const reqItem of itemsToDispatch) {
      const item = await queryRunner.manager.findOneBy(Item, { id: reqItem.itemId });
      if (!item) {
        throw new Error(`El item con ID ${reqItem.itemId} no existe`);
      }

      if (item.stock < reqItem.cantidad) {
        throw new Error(`Stock insuficiente para el item '${item.name}'. Stock actual: ${item.stock}, Solicitado: ${reqItem.cantidad}`);
      }

      // Descontar stock
      item.stock -= reqItem.cantidad;
      await queryRunner.manager.save(Item, item);

      // Crear registro de DespachoItem
      const despachoItem = queryRunner.manager.create(DespachoItem, {
        despacho: savedDespacho.id,
        item: item.id,
        cantidad: reqItem.cantidad
      });
      const savedDespachoItem = await queryRunner.manager.save(despachoItem);
      despachoItemsDetails.push({ ...savedDespachoItem, item_name: item.name });
    }

    // 4. Confirmar transacción
    await queryRunner.commitTransaction();

    return {
      despacho: savedDespacho,
      items: despachoItemsDetails
    };

  } catch (error) {
    // Revertir todo en caso de error
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

export async function getDespachos() {
  const despachoRepository = AppDataSource.getRepository(Despacho);
  return await despachoRepository.find({
    relations: ["cuadrilla"],
  });
}

export async function getDespachosByCuadrilla(cuadrillaId) {
  const despachoRepository = AppDataSource.getRepository(Despacho);
  const despachoItemRepository = AppDataSource.getRepository(DespachoItem);
  
  const despachos = await despachoRepository.find({
    where: { cuadrilla: { id: cuadrillaId } },
    relations: ["cuadrilla"],
  });

  for (const d of despachos) {
    const items = await despachoItemRepository.find({
       where: { despacho: { id: d.id } },
       relations: ["item"]
    });
    d.items = items.map(di => ({
       id: di.item.id,
       name: di.item.name,
       category: di.item.category,
       cantidad: di.cantidad
    }));
  }

  return despachos;
}

export async function devolverItems(despachoId, itemsDevueltos) {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const despacho = await queryRunner.manager.findOneBy(Despacho, { id: despachoId });
    if (!despacho) {
      throw new Error("El despacho no existe");
    }

    const devoluciones = [];

    for (const reqItem of itemsDevueltos) {
      const despachoItem = await queryRunner.manager.findOneBy(DespachoItem, {
        despacho: { id: despachoId },
        item: { id: reqItem.itemId }
      });

      if (!despachoItem) {
         throw new Error(`El item con ID ${reqItem.itemId} no forma parte de este despacho.`);
      }

      if (reqItem.cantidad > despachoItem.cantidad) {
          throw new Error(`No se puede devolver más cantidad de la que fue despachada para el item ID ${reqItem.itemId}.`);
      }

      const item = await queryRunner.manager.findOneBy(Item, { id: reqItem.itemId });
      if (!item) {
        throw new Error(`El item con ID ${reqItem.itemId} no existe`);
      }

      // Re-ingresar stock
      item.stock += reqItem.cantidad;
      await queryRunner.manager.save(Item, item);

      devoluciones.push({ itemId: item.id, itemName: item.name, cantidadDevuelta: reqItem.cantidad });
    }

    await queryRunner.commitTransaction();
    return devoluciones;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
