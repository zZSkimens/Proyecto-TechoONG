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
