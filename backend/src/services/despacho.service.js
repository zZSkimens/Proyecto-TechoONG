import { AppDataSource } from "../config/configDb.js";
import { Despacho } from "../entities/despacho.entity.js";
import { DespachoItem } from "../entities/despachoItem.entity.js";
import { Item } from "../entities/item.entity.js";
import { Cuadrilla } from "../entities/cuadrilla.entity.js";
import { ActaDevolucion } from "../entities/actaDevolucion.entity.js";
import { ActaDevolucionItem } from "../entities/actaDevolucionItem.entity.js";

export async function createDespacho(cuadrillaId, itemsToDispatch) {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Verificamos la cuadrilla
    const cuadrilla = await queryRunner.manager.findOneBy(Cuadrilla, { id: cuadrillaId });
    if (!cuadrilla) {
      throw new Error("La cuadrilla no existe");
    }

    // 2. Creamos el registro de Despacho
    const despacho = queryRunner.manager.create(Despacho, {
      cuadrilla: cuadrillaId
    });
    const savedDespacho = await queryRunner.manager.save(Despacho, despacho);

    const despachoItemsDetails = [];

    // 3. Procesamos los items y validamos el stock
    for (const reqItem of itemsToDispatch) {
      const item = await queryRunner.manager.findOneBy(Item, { id: reqItem.itemId });
      if (!item) {
        throw new Error(`El item con ID ${reqItem.itemId} no existe`);
      }

      if (item.stock < reqItem.cantidad) {
        throw new Error(`Stock insuficiente para el item '${item.name}'. Stock actual: ${item.stock}, Solicitado: ${reqItem.cantidad}`);
      }
      item.stock -= reqItem.cantidad;
      await queryRunner.manager.save(Item, item);

      // Crea el registro de en el DespachoItem
      const despachoItem = queryRunner.manager.create(DespachoItem, {
        despacho: savedDespacho.id,
        item: item.id,
        cantidad: reqItem.cantidad
      });
      const savedDespachoItem = await queryRunner.manager.save(DespachoItem, despachoItem);
      despachoItemsDetails.push({ ...savedDespachoItem, item_name: item.name });
    }

    // 4. Confirmamos la transacción de items (Herramientas y Materiales)
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
  const despachoItemRepository = AppDataSource.getRepository(DespachoItem);
  const itemRepository = AppDataSource.getRepository(Item);

  const despachos = await despachoRepository.find({
    relations: ["cuadrilla"],
  });

  for (const d of despachos) {
    const despachoItems = await despachoItemRepository.find({
      where: { despacho: { id: d.id } },
      relations: ["item"]
    });
    d.items = despachoItems.map(di => ({
      id: di.item.id,
      name: di.item.name,
      category: di.item.category,
      cantidad: di.cantidad,
      stock: di.item.stock
    }));
  }

  return despachos;
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
    const despacho = await queryRunner.manager.findOne(Despacho, {
      where: { id: despachoId },
      relations: ["cuadrilla"]
    });

    if (!despacho) {
      throw new Error("El despacho no existe");
    }

    if (despacho.estado === "Devuelto") {
      throw new Error("Este despacho ya ha sido devuelto y procesado");
    }

    const despachoItems = await queryRunner.manager.find(DespachoItem, {
      where: { despacho: { id: despachoId } },
      relations: ["item"]
    });

    const actaDevolucion = queryRunner.manager.create(ActaDevolucion, {
      despacho: despacho.id
    });
    const savedActa = await queryRunner.manager.save(ActaDevolucion, actaDevolucion);

    const devoluciones = [];

    // Validar y procesar cada item del despacho
    for (const dItem of despachoItems) {
      const isHerramienta = dItem.item.category === "Herramienta";

      const reqItem = itemsDevueltos.find(i => i.itemId === dItem.item.id);

      if (isHerramienta) {
        if (!reqItem || !reqItem.estados) {
          throw new Error(`Falta información de estados para la herramienta: ${dItem.item.name} (ID: ${dItem.item.id}). Es obligatorio reportar el estado de todas las herramientas despachadas.`);
        }

        const cantDisponible = reqItem.estados["Disponible"] || 0;
        const cantDanada = reqItem.estados["Dañada"] || 0;
        const cantExtraviada = reqItem.estados["Extraviada"] || 0;

        const totalDeclarado = cantDisponible + cantDanada + cantExtraviada;

        if (totalDeclarado !== dItem.cantidad) {
          throw new Error(`La cantidad total devuelta (${totalDeclarado}) para la herramienta ${dItem.item.name} no coincide con la despachada (${dItem.cantidad}).`);
        }

        // Crear registros de items en el acta
        const states = [
          { estado: "Disponible", cantidad: cantDisponible },
          { estado: "Dañada", cantidad: cantDanada },
          { estado: "Extraviada", cantidad: cantExtraviada }
        ];

        for (const st of states) {
          if (st.cantidad > 0) {
            const actaItem = queryRunner.manager.create(ActaDevolucionItem, {
              acta_devolucion: savedActa.id,
              item: dItem.item.id,
              estado: st.estado,
              cantidad: st.cantidad
            });
            await queryRunner.manager.save(ActaDevolucionItem, actaItem);
            devoluciones.push({ itemId: dItem.item.id, itemName: dItem.item.name, estado: st.estado, cantidad: st.cantidad });

            // Solo Disponible vuelve al stock regular
            if (st.estado === "Disponible") {
              dItem.item.stock += st.cantidad;
              await queryRunner.manager.save(Item, dItem.item);
            }
          }
        }
      } else {
        // Es un Material (consumible)
        if (reqItem && reqItem.estados) {
          const cantDisponible = reqItem.estados["Disponible"] || 0;
          if (cantDisponible > 0) {
            if (cantDisponible > dItem.cantidad) {
              throw new Error(`No se puede devolver más cantidad de la que fue despachada para el material ID ${dItem.item.id}.`);
            }
            const actaItem = queryRunner.manager.create(ActaDevolucionItem, {
              acta_devolucion: savedActa.id,
              item: dItem.item.id,
              estado: "Disponible",
              cantidad: cantDisponible
            });
            await queryRunner.manager.save(ActaDevolucionItem, actaItem);
            devoluciones.push({ itemId: dItem.item.id, itemName: dItem.item.name, estado: "Disponible", cantidad: cantDisponible });

            dItem.item.stock += cantDisponible;
            await queryRunner.manager.save(Item, dItem.item);
          }
        }
      }
    }

    // Actualizar estado del despacho
    despacho.estado = "Devuelto";
    await queryRunner.manager.save(Despacho, despacho);

    await queryRunner.commitTransaction();
    return {
      actaDevolucion: savedActa,
      items: devoluciones
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
