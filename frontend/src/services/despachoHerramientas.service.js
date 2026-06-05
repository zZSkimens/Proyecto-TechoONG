import { get, post } from './api.js';

export async function getDespachosCuadrilla() {
  const response = await get('/despachos');
  return response.data;
}

export async function getDespachosByCuadrilla(cuadrillaId) {
  const response = await get(`/despachos/cuadrilla/${cuadrillaId}`);
  return response.data;
}

export async function crearDespachoHerramientas(cuadrillaId, items) {
  const response = await post('/despachos', { cuadrillaId, items });
  return response.data;
}

export async function devolverItems(despachoId, items) {
  const response = await post(`/despachos/${despachoId}/devolucion`, { items });
  return response.data;
}
