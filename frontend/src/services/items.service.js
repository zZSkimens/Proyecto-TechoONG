import { get, post, put, del } from './api.js';

export async function getItems() {
  const response = await get('/items');
  return response.data;
}

export async function crearItem(data) {
  const response = await post('/items', data);
  return response.data;
}

export async function actualizarItem(id, data) {
  const response = await put(`/items/${id}`, data);
  return response.data;
}

export async function eliminarItem(id) {
  const response = await del(`/items/${id}`);
  return response.data;
}
