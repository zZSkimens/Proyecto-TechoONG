import { createCuadrilla, getCuadrillas, updateCuadrilla, getCuadrillaById, deleteCuadrilla, dissolverCuadrilla } from "../services/cuadrilla.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function createCuadrillaController(req, res) {
  try {
    const data = req.body;

    if (!data.name || (!data.zona_afectada && !data.obra_id)) {
      return handleErrorClient(res, 400, "Nombre y Obra (o zona afectada) son requeridos");
    }
    if (!data.encargado) data.encargado = "";

    const voluntarios = data.voluntarios || [];
    const modoEmergencia = data.modo_emergencia || false;
    const maxPermitido = modoEmergencia ? 10 : 6;

    if (voluntarios.length > maxPermitido) {
      return handleErrorClient(res, 400, `El máximo de voluntarios permitido en modo ${modoEmergencia ? 'EMERGENCIA' : 'NORMAL'} es ${maxPermitido}`);
    }

    data.max_voluntarios = maxPermitido;
    data.voluntarios = voluntarios;

    const newCuadrilla = await createCuadrilla(data);
    handleSuccess(res, 201, "Cuadrilla creada exitosamente", newCuadrilla);
  } catch (error) {
    if (error.code === '23505') {
      return handleErrorClient(res, 409, "Ya existe una cuadrilla con ese nombre");
    }
    handleErrorServer(res, 500, "Error al crear cuadrilla", error.message);
  }
}

export async function updateCuadrillaController(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const voluntarios = data.voluntarios;
    const modoEmergencia = data.modo_emergencia;

    // Si se está cambiando el modo o los voluntarios, validamos
    if (voluntarios !== undefined || modoEmergencia !== undefined) {
      const maxPermitido = modoEmergencia ? 10 : 6;
      if (voluntarios && voluntarios.length > maxPermitido) {
        return handleErrorClient(res, 400, `No se puede actualizar: el máximo permitido en modo ${modoEmergencia ? 'EMERGENCIA' : 'NORMAL'} es ${maxPermitido}`);
      }
      data.max_voluntarios = maxPermitido;
    }

    const updatedCuadrilla = await updateCuadrilla(id, data);
    if (!updatedCuadrilla) {
      return handleErrorClient(res, 404, "Cuadrilla no encontrada");
    }
    handleSuccess(res, 200, "Cuadrilla actualizada exitosamente", updatedCuadrilla);
  } catch (error) {
    handleErrorServer(res, 500, "Error al actualizar cuadrilla", error.message);
  }
}

export async function joinCuadrillaController(req, res) {
  try {
    const { id } = req.params;
    const userRut = req.user.rut; // Obtenido del token por el authMiddleware
    const userName = req.user.name;

    // Buscamos la cuadrilla
    const cuadrilla = await getCuadrillaById(id);
    if (!cuadrilla) {
      return handleErrorClient(res, 404, "Cuadrilla no encontrada");
    }

    // Verificamos si el voluntario ya está en la cuadrilla
    const listaVoluntarios = cuadrilla.voluntarios || [];
    if (listaVoluntarios.includes(userRut)) {
      return handleErrorClient(res, 400, "Ya eres parte de esta cuadrilla");
    }

    // Verificamos el límite de voluntarios
    if (listaVoluntarios.length >= cuadrilla.max_voluntarios) {
      return handleErrorClient(res, 400, `La cuadrilla está llena. El máximo permitido es ${cuadrilla.max_voluntarios}`);
    }

    // Agregamos al voluntario (guardamos su RUT)
    listaVoluntarios.push(userRut);
    const updated = await updateCuadrilla(id, { voluntarios: listaVoluntarios });

    handleSuccess(res, 200, "Te has unido a la cuadrilla exitosamente", updated);
  } catch (error) {
    handleErrorServer(res, 500, "Error al unirse a la cuadrilla", error.message);
  }
}

export async function getCuadrillasController(req, res) {
  try {
    const cuadrillas = await getCuadrillas();
    handleSuccess(res, 200, "Cuadrillas obtenidas exitosamente", cuadrillas);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener cuadrillas", error.message);
  }
}

//Eliminamos la cuadrilla y devolveremos las herramientas (solamente eso)
export async function deleteCuadrillaController(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteCuadrilla(id);

    if (!result) {
      return handleErrorClient(res, 404, "Cuadrilla no encontrada");
    }

    handleSuccess(res, 200, "Cuadrilla eliminada exitosamente. Las herramientas han sido devueltas al inventario.");
  } catch (error) {
    handleErrorServer(res, 500, "Error al eliminar cuadrilla", error.message);
  }
}

// Disolver cuadrilla sin devolver stock (se crea acta de devolución aparte)
export async function dissolverCuadrillaController(req, res) {
  try {
    const { id } = req.params;
    const result = await dissolverCuadrilla(id);

    if (!result) {
      return handleErrorClient(res, 404, "Cuadrilla no encontrada");
    }

    handleSuccess(res, 200, "Cuadrilla disuelta exitosamente. Los items sobrantes están pendientes de revisión en el acta de devolución.", result);
  } catch (error) {
    handleErrorServer(res, 500, "Error al disolver cuadrilla", error.message);
  }
}
