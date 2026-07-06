import { AppDataSource } from "../config/configDb.js";
import { Cuadrilla } from "../entities/cuadrilla.entity.js";

export async function createCuadrilla(data) {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  const payload = { ...data };
  if (data.obra_id) {
    const obraRepo = AppDataSource.getRepository("Obra");
    const obra = await obraRepo.findOneBy({ id: parseInt(data.obra_id) });
    if (obra) {
      payload.obra = obra;
      if (!payload.zona_afectada) payload.zona_afectada = obra.zona;
    }
    delete payload.obra_id;
  }
  if (!payload.encargado) payload.encargado = "";
  const nuevaCuadrilla = cuadrillaRepository.create(payload);
  const guardada = await cuadrillaRepository.save(nuevaCuadrilla);
  guardada.obra_id = guardada.obra ? guardada.obra.id : null;
  return guardada;
}

export async function getCuadrillas() {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  const despachoItemRepository = AppDataSource.getRepository("DespachoItem");

  const cuadrillas = await cuadrillaRepository.find({ relations: ["obra"] });

  // Para cada cuadrilla, buscamos sus items despachados y mapeamos obra_id
  for (const cuadrilla of cuadrillas) {
    cuadrilla.obra_id = cuadrilla.obra ? cuadrilla.obra.id : null;
    const items = await despachoItemRepository.find({
      where: { 
        despacho: { 
          cuadrilla: { id: cuadrilla.id },
          estado: "Pendiente"
        } 
      },
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


export async function updateCuadrilla(id, data) {
  const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
  const existingCuadrilla = await cuadrillaRepository.findOne({
    where: { id: parseInt(id) },
    relations: ["obra"],
  });

  if (!existingCuadrilla) return null;

  const updatePayload = { ...data };
  if (data.obra_id !== undefined) {
    if (data.obra_id) {
      const obraRepo = AppDataSource.getRepository("Obra");
      const obra = await obraRepo.findOneBy({ id: parseInt(data.obra_id) });
      updatePayload.obra = obra || null;
      if (obra && !updatePayload.zona_afectada) updatePayload.zona_afectada = obra.zona;
    } else {
      updatePayload.obra = null;
    }
    delete updatePayload.obra_id;
  }

  const updatedCuadrilla = cuadrillaRepository.merge(existingCuadrilla, updatePayload);
  const guardada = await cuadrillaRepository.save(updatedCuadrilla);
  guardada.obra_id = guardada.obra ? guardada.obra.id : null;
  return guardada;
}


// Disolver cuadrilla: limpia despachos/items SIN devolver stock al inventario
// (el stock se devuelve cuando el admin_bodega procesa el acta de devolución)
export async function dissolverCuadrilla(id) {
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
      // 2. Desvincular actas de devolución que referencien este despacho
      const actas = await queryRunner.manager.find("ActaDevolucion", {
        where: { despacho: { id: despacho.id } }
      });

      for (const acta of actas) {
        // Borrar los items del acta primero
        const actaItems = await queryRunner.manager.find("ActaDevolucionItem", {
          where: { acta_devolucion: { id: acta.id } }
        });
        for (const actaItem of actaItems) {
          await queryRunner.manager.remove("ActaDevolucionItem", actaItem);
        }
        // Desvincular el despacho del acta (se mantiene el acta como registro histórico)
        acta.despacho = null;
        await queryRunner.manager.save("ActaDevolucion", acta);
      }

      // 3. Busca los items de cada despacho
      const despachoItems = await queryRunner.manager.find("DespachoItem", {
        where: { despacho: { id: despacho.id } },
        relations: ["item"]
      });

      for (const dItem of despachoItems) {
        // NO se devuelve stock - eso lo maneja el acta de devolución
        await queryRunner.manager.remove("DespachoItem", dItem);
      }
      // Borra despacho
      await queryRunner.manager.remove("Despacho", despacho);
    }

    // 3. Finalmente se borra la cuadrilla
    const cuadrillaData = { name: cuadrilla.name, encargado: cuadrilla.encargado };
    await queryRunner.manager.remove("Cuadrilla", cuadrilla);

    await queryRunner.commitTransaction();
    return cuadrillaData;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

