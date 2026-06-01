import { get, post, put, del } from './api.js';

export async function getProductos() {
  const response = await get('/productos');
  return response.data;
}

export async function getProductoById(id) {
  const response = await get(`/productos/${id}`);
  return response.data;
}

export async function crearProducto(data) {
  const response = await post('/productos', data);
  return response.data;
}

export async function actualizarProducto(id, data) {
  const response = await put(`/productos/${id}`, data);
  return response.data;
}

export async function eliminarProducto(id) {
  const response = await del(`/productos/${id}`);
  return response.data;
}

export async function verificarStock(items) {
  const response = await post('/productos/verificar-stock', { items });
  return response.data;
}

export async function getMovimientos(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  const endpoint = params ? `/productos/movimientos?${params}` : '/productos/movimientos';
  const response = await get(endpoint);
  return response.data;
}
