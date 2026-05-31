import { get, post, put } from './api.js';

export async function getSolicitudes(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  const endpoint = params ? `/solicitudes-alimentos?${params}` : '/solicitudes-alimentos';
  const response = await get(endpoint);
  return response.data;
}

export async function getSolicitudById(id) {
  const response = await get(`/solicitudes-alimentos/${id}`);
  return response.data;
}

export async function crearSolicitud(data) {
  const response = await post('/solicitudes-alimentos', data);
  return response.data;
}

export async function aprobarSolicitud(id, data) {
  const response = await put(`/solicitudes-alimentos/${id}/aprobar`, data);
  return response.data;
}

export async function rechazarSolicitud(id, data) {
  const response = await put(`/solicitudes-alimentos/${id}/rechazar`, data);
  return response.data;
}
