import { get, post, put } from './api.js';

export async function getCuadrillas() {
  const response = await get('/cuadrillas');
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


export async function disolverCuadrilla(id) {
  const response = await post(`/cuadrillas/${id}/disolver`);
  return response.data;
}
