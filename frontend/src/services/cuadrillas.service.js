import { get, post, put, del } from './api.js';

export async function getCuadrillas() {
  const response = await get('/cuadrillas');
  return response.data;
}

export async function getCuadrillaById(id) {
  const response = await get(`/cuadrillas/${id}`);
  return response.data;
}

export async function crearCuadrilla(data) {
  const response = await post('/cuadrillas', data);
  return response.data;
}

export async function actualizarCuadrilla(id, data) {
  const response = await put(`/cuadrillas/${id}`, data);
  return response.data;
}

export async function eliminarCuadrilla(id) {
  const response = await del(`/cuadrillas/${id}`);
  return response.data;
}
