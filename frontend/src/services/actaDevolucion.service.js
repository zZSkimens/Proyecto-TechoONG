import { get, post } from './api.js';

export async function getActasDevolucion() {
  const response = await get('/actas-devolucion');
  return response.data;
}

export async function crearActaDevolucion(data) {
  const response = await post('/actas-devolucion', data);
  return response.data;
}

export async function procesarActaDevolucion(id, items) {
  const response = await post(`/actas-devolucion/${id}/procesar`, { items });
  return response.data;
}
