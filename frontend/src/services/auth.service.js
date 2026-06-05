import { post } from './api.js';

export async function login(email, password) {
  // Mapear correos a los RUTs correspondientes de la base de datos
  const emailToRut = {
    'jefe@techo.org': '16742589-K',
    'admin@techo.org': '14986372-9',
    'voluntario1@techo.org': '20145789-3',
    'voluntario2@techo.org': '19852364-7'
  };
  
  const mappedRut = emailToRut[email.toLowerCase().trim()] || email;
  const response = await post('/auth/login', { email, rut: mappedRut, password });
  const { token, user } = response.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return response.data;
}

export async function register(data) {
  const response = await post('/auth/register', data);
  return response.data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}
