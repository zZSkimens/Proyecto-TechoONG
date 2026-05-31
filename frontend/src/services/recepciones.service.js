import { get, post } from './api.js';

export async function getRecepciones(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  const endpoint = params ? `/recepciones?${params}` : '/recepciones';
  const response = await get(endpoint);
  return response.data;
}

export async function getRecepcionById(id) {
  const response = await get(`/recepciones/${id}`);
  return response.data;
}

export async function confirmarRecepcion(data) {
  const response = await post('/recepciones/confirmar', data);
  return response.data;
}

export async function getTrazabilidad(solicitudId) {
  const response = await get(`/recepciones/trazabilidad/${solicitudId}`);
  return response.data;
}
