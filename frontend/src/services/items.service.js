import { get, post } from './api.js';

export async function getItems() {
  const response = await get('/items');
  return response.data;
}

export async function crearItem(data) {
  const response = await post('/items', data);
  return response.data;
}
