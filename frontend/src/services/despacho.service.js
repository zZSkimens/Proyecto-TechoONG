import { get, post } from './api.js';

export async function getOrdenes(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  const endpoint = params ? `/ordenes-despacho?${params}` : '/ordenes-despacho';
  const response = await get(endpoint);
  return response.data;
}

export async function getOrdenById(id) {
  const response = await get(`/ordenes-despacho/${id}`);
  return response.data;
}

export async function procesarDespacho(id, data) {
  const response = await post(`/ordenes-despacho/${id}/despachar`, data);
  return response.data;
}

export async function getComprobante(id) {
  const response = await get(`/ordenes-despacho/${id}/comprobante`);
  return response.data;
}
