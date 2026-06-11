import { post } from './api.js';

export async function login(rut, password) {
  const response = await post('/auth/login', { rut, password });
  const { token, user } = response.data;
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
  return response.data;
}

export async function register(data) {
  const response = await post('/auth/register', data);
  return response.data;
}

export function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}

export function getUser() {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!sessionStorage.getItem('token');
}
