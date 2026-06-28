import { get, post, patch } from './api.js';

export const getReuniones = async () => {
  const response = await get('/reuniones');
  return response.data;
};

export const crearReunion = async (reunionData) => {
  const response = await post('/reuniones', reunionData);
  return response.data;
};

export const actualizarEstadoReunion = async (id, estado) => {
  const response = await patch(`/reuniones/${id}/estado`, { estado });
  return response.data;
};
