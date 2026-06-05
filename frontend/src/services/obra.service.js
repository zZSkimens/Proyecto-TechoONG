import { get, post } from './api.js';

export async function getObras() {
  const response = await get('/obras');
  return response.data;
}

export async function crearObra(data) {
  const response = await post('/obras', data);
  return response.data;
}

export async function getMatchParaObra(id) {
  const response = await get(`/obras/${id}/match`);
  return response.data;
}
