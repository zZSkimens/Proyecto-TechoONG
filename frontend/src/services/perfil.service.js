import { get, post, patch } from './api.js';

export async function getMiPerfil() {
  const response = await get('/perfiles/mi-perfil');
  return response.data;
}

export async function actualizarMiPerfil(data) {
  const response = await post('/perfiles/mi-perfil', data);
  return response.data;
}

export async function getTodosLosPerfiles(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = `/perfiles${query ? `?${query}` : ''}`;
  const response = await get(endpoint);
  return response.data;
}

export async function validarPerfilPostulante(id, data) {
  const response = await patch(`/perfiles/${id}/validar`, data);
  return response.data;
}

export async function getHistorialPerfil(id) {
  const response = await get(`/perfiles/${id}/historial`);
  return response.data;
}

