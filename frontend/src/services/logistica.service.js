import { get, post, put, del } from './api.js';

// Datos mockados por defecto para que la presentación y el uso funcionen de inmediato
const MOCK_SECTORES = [
  { id: 1, nombre: 'Sector Norte - Campamento Esperanza', ubicacion: 'Valparaíso', descripcion: 'Zona afectada por deslizamientos de tierra. Requiere remoción de escombros y apoyo habitacional.' },
  { id: 2, nombre: 'Sector Sur - Campamento Los Aromos', ubicacion: 'Viña del Mar', descripcion: 'Sector plano afectado por incendios forestales. Requiere reconstrucción de viviendas de emergencia.' },
  { id: 3, nombre: 'Sector Centro - Quebrada Las Cañas', ubicacion: 'Valparaíso', descripcion: 'Zona de difícil acceso. Requiere labores de limpieza, canalización y entrega de víveres.' },
];

const MOCK_CHOFERES = [
  { id: 1, nombres: 'Juan', apellidos: 'Pérez Silva', rut: '12.345.678-9', licencia_conducir: 'Clase A2', telefono: '+56912345678' },
  { id: 2, nombres: 'Mauricio', apellidos: 'Gómez Tapia', rut: '15.678.901-2', licencia_conducir: 'Clase B', telefono: '+56987654321' },
  { id: 3, nombres: 'Carlos', apellidos: 'Mendoza Plaza', rut: '14.234.567-K', licencia_conducir: 'Clase A4', telefono: '+56955566778' },
];

const MOCK_VOLUNTARIOS = [
  { rut: '20.145.789-3', nombres: 'Lucas', apellidos: 'Barrios', correo: 'lucas@gmail.com' },
  { rut: '19.852.364-7', nombres: 'Catalina', apellidos: 'Perez', correo: 'catalina@gmail.com' },
  { rut: '21.002.345-6', nombres: 'Sofía', apellidos: 'Rojas', correo: 'sofia@gmail.com' },
  { rut: '18.994.556-8', nombres: 'Martín', apellidos: 'Soto', correo: 'martin@gmail.com' },
  { rut: '22.123.456-7', nombres: 'Valentina', apellidos: 'Garrido', correo: 'valentina@gmail.com' },
  { rut: '20.556.778-9', nombres: 'Diego', apellidos: 'Muñoz', correo: 'diego@gmail.com' },
];

// Helper para inicializar datos simulados en localStorage para persistencia visual en el frontend
function getStoredLocalData() {
  let cuadrillas = localStorage.getItem('local_cuadrillas');
  let despliegues = localStorage.getItem('local_despliegues');
  let bitacora = localStorage.getItem('local_bitacora');

  if (!cuadrillas) {
    cuadrillas = [
      { id: 101, name: 'Cuadrilla Alfa', encargado: 'Roberto Hurtado', zona_afectada: 'Sector Norte - Campamento Esperanza', voluntarios: ['lucas@gmail.com', 'catalina@gmail.com'], modo_emergencia: false, max_voluntarios: 6 },
      { id: 102, name: 'Cuadrilla Beta (Fénix)', encargado: 'Catalina Perez', zona_afectada: 'Sector Sur - Campamento Los Aromos', voluntarios: ['sofia@gmail.com', 'martin@gmail.com', 'valentina@gmail.com'], modo_emergencia: true, max_voluntarios: 10 }
    ];
    localStorage.setItem('local_cuadrillas', JSON.stringify(cuadrillas));
  } else {
    cuadrillas = JSON.parse(cuadrillas);
  }

  if (!despliegues) {
    despliegues = [
      { id: 201, ruta: 'Ruta 68 - Troncal Sur - Camino Central', fecha_salida: new Date(Date.now() - 3600000 * 2).toISOString(), estado: 'en_camino', cuadrilla_id: 101, chofer_id: 1, patente: 'HG-PT-45', vehiculo: 'Camioneta Techo #2' },
      { id: 202, ruta: 'Camino Las Palmas - Vía Local', fecha_salida: new Date(Date.now() - 3600000 * 4).toISOString(), estado: 'finalizado', cuadrilla_id: 102, chofer_id: 2, patente: 'KL-XM-88', vehiculo: 'Furgón Logístico #1' }
    ];
    localStorage.setItem('local_despliegues', JSON.stringify(despliegues));
  } else {
    despliegues = JSON.parse(despliegues);
  }

  if (!bitacora) {
    bitacora = [
      { id: 1, fecha: new Date(Date.now() - 3600000 * 4).toISOString(), tipo: 'info', mensaje: 'Planificación de la Cuadrilla Beta (Fénix) asignada a Sector Sur - Campamento Los Aromos.' },
      { id: 2, fecha: new Date(Date.now() - 3600000 * 3.8).toISOString(), tipo: 'success', mensaje: 'Despacho autorizado para Cuadrilla Beta. Chofer: Mauricio Gómez, Furgón Logístico #1 (KL-XM-88).' },
      { id: 3, fecha: new Date(Date.now() - 3600000 * 2).toISOString(), tipo: 'info', mensaje: 'Planificación de la Cuadrilla Alfa asignada a Sector Norte - Campamento Esperanza.' },
      { id: 4, fecha: new Date(Date.now() - 3600000 * 1.8).toISOString(), tipo: 'success', mensaje: 'Despacho autorizado para Cuadrilla Alfa. Chofer: Juan Pérez, Camioneta Techo #2 (HG-PT-45).' },
      { id: 5, fecha: new Date(Date.now() - 3600000 * 0.5).toISOString(), tipo: 'warning', mensaje: 'Llegada a terreno reportada para la Cuadrilla Beta en Sector Sur.' }
    ];
    localStorage.setItem('local_bitacora', JSON.stringify(bitacora));
  } else {
    bitacora = JSON.parse(bitacora);
  }

  return { cuadrillas, despliegues, bitacora };
}

// Guarda los datos locales
function saveStoredLocalData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Registrar un movimiento en la bitacora de seguridad
export function registrarMovimiento(mensaje, tipo = 'info') {
  const { bitacora } = getStoredLocalData();
  const nuevoRegistro = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    tipo, // info, success, warning, danger
    mensaje
  };
  const updatedBitacora = [nuevoRegistro, ...bitacora];
  saveStoredLocalData('local_bitacora', updatedBitacora);
  return updatedBitacora;
}

export function obtenerBitacora() {
  const { bitacora } = getStoredLocalData();
  return bitacora;
}

// ----------------------------------------------------
// SECTORES
// ----------------------------------------------------
export async function getSectores() {
  try {
    const res = await get('/sectores');
    if (res && res.data && res.data.length > 0) return res.data;
    // Si la llamada responde pero está vacía, enviamos el mock
    return MOCK_SECTORES;
  } catch (error) {
    console.warn('API /sectores falló. Usando fallback mock.', error);
    return MOCK_SECTORES;
  }
}

// ----------------------------------------------------
// CHOFERES
// ----------------------------------------------------
export async function getChoferes() {
  try {
    const res = await get('/choferes');
    const apiData = Array.isArray(res) ? res : (res?.data || []);
    if (apiData.length > 0) {
      return apiData;
    }
    const local = localStorage.getItem('local_choferes');
    return local ? JSON.parse(local) : MOCK_CHOFERES;
  } catch (error) {
    console.warn('API /choferes falló. Usando fallback mock.', error);
    const local = localStorage.getItem('local_choferes');
    return local ? JSON.parse(local) : MOCK_CHOFERES;
  }
}

export async function crearChofer(data) {
  try {
    const res = await post('/choferes', data);
    if (res && res.data) {
      return res.data;
    }
  } catch (error) {
    console.warn('API crearChofer falló. Guardando localmente.', error);
  }

  let localChoferes = localStorage.getItem('local_choferes');
  if (!localChoferes) {
    localChoferes = [...MOCK_CHOFERES];
  } else {
    localChoferes = JSON.parse(localChoferes);
  }

  const nuevoChofer = {
    id: Date.now(),
    nombres: data.nombres,
    apellidos: data.apellidos,
    rut: data.rut || `12.345.${Math.floor(Math.random() * 900) + 100}-9`,
    licencia_conducir: data.licencia_conducir || 'Clase B',
    telefono: data.telefono || ''
  };

  localChoferes.push(nuevoChofer);
  localStorage.setItem('local_choferes', JSON.stringify(localChoferes));
  return nuevoChofer;
}

// ----------------------------------------------------
// VOLUNTARIOS
// ----------------------------------------------------
export async function getVoluntarios() {
  try {
    const res = await get('/voluntarios');
    if (res && res.data && res.data.length > 0) return res.data;
    return MOCK_VOLUNTARIOS;
  } catch (error) {
    console.warn('API /voluntarios falló. Usando fallback mock.', error);
    return MOCK_VOLUNTARIOS;
  }
}

// ----------------------------------------------------
// CUADRILLAS
// ----------------------------------------------------
export async function getCuadrillas() {
  try {
    const res = await get('/cuadrillas');
    if (res && res.data) {
      // Cruzar con los datos mock en caso de que esté vacío el backend
      if (res.data.length === 0) {
        const { cuadrillas } = getStoredLocalData();
        return cuadrillas;
      }
      return res.data;
    }
    const { cuadrillas } = getStoredLocalData();
    return cuadrillas;
  } catch (error) {
    console.warn('API /cuadrillas falló o no existe. Usando fallback mock.', error);
    const { cuadrillas } = getStoredLocalData();
    return cuadrillas;
  }
}

export async function crearCuadrilla(data) {
  try {
    const res = await post('/cuadrillas', data);
    if (res && res.data) {
      registrarMovimiento(`Cuadrilla '${data.name}' planificada exitosamente en sector '${data.zona_afectada}' por el usuario.`, 'info');
      return res.data;
    }
  } catch (error) {
    console.warn('API crearCuadrilla falló. Registrando localmente.', error);
  }

  // Fallback local
  const { cuadrillas } = getStoredLocalData();
  const nuevaCuadrilla = {
    id: Date.now(),
    name: data.name,
    encargado: data.encargado,
    zona_afectada: data.zona_afectada,
    voluntarios: data.voluntarios || [],
    modo_emergencia: data.modo_emergencia || false,
    max_voluntarios: data.modo_emergencia ? 10 : 6,
    created_at: new Date().toISOString()
  };
  cuadrillas.push(nuevaCuadrilla);
  saveStoredLocalData('local_cuadrillas', cuadrillas);
  
  registrarMovimiento(`[Local] Cuadrilla '${nuevaCuadrilla.name}' planificada en sector '${nuevaCuadrilla.zona_afectada}' por el usuario (Modo Offline/Local).`, 'info');
  return nuevaCuadrilla;
}

export async function actualizarCuadrilla(id, data) {
  try {
    const res = await put(`/cuadrillas/${id}`, data);
    if (res && res.data) {
      registrarMovimiento(`Cuadrilla ID #${id} actualizada.`, 'info');
      return res.data;
    }
  } catch (error) {
    console.warn('API actualizarCuadrilla falló. Actualizando localmente.', error);
  }

  // Fallback local
  const { cuadrillas } = getStoredLocalData();
  const index = cuadrillas.findIndex(c => c.id === parseInt(id) || c.id === id);
  if (index !== -1) {
    cuadrillas[index] = { ...cuadrillas[index], ...data };
    saveStoredLocalData('local_cuadrillas', cuadrillas);
    registrarMovimiento(`[Local] Cuadrilla '${cuadrillas[index].name}' actualizada por el usuario.`, 'info');
    return cuadrillas[index];
  }
  throw new Error('Cuadrilla no encontrada');
}

export async function eliminarCuadrilla(id) {
  try {
    const res = await del(`/cuadrillas/${id}`);
    registrarMovimiento(`Cuadrilla ID #${id} eliminada. Recursos liberados.`, 'warning');
    return res;
  } catch (error) {
    console.warn('API eliminarCuadrilla falló. Eliminando localmente.', error);
  }

  // Fallback local
  const { cuadrillas } = getStoredLocalData();
  const target = cuadrillas.find(c => c.id === parseInt(id) || c.id === id);
  const filtered = cuadrillas.filter(c => c.id !== parseInt(id) && c.id !== id);
  saveStoredLocalData('local_cuadrillas', filtered);
  if (target) {
    registrarMovimiento(`[Local] Cuadrilla '${target.name}' eliminada. Voluntarios y herramientas liberados.`, 'warning');
  }
  return { success: true };
}

// ----------------------------------------------------
// DESPLIEGUES (DESPACHO Y SEGUIMIENTO)
// ----------------------------------------------------
export async function getDespliegues() {
  try {
    const res = await get('/despliegues');
    if (res) {
      // Normalizar respuesta si es un array directo o viene en .data
      const data = Array.isArray(res) ? res : (res.data || []);
      if (data.length === 0) {
        const { despliegues } = getStoredLocalData();
        return despliegues;
      }
      return data;
    }
    const { despliegues } = getStoredLocalData();
    return despliegues;
  } catch (error) {
    console.warn('API /despliegues falló. Usando mock.', error);
    const { despliegues } = getStoredLocalData();
    return despliegues;
  }
}

export async function crearDespliegue(data) {
  try {
    const res = await post('/despliegues', data);
    if (res) {
      const responseData = res.data || res;
      registrarMovimiento(`Despliegue creado para cuadrilla ID #${data.cuadrilla_id || data.cuadrilla}.`, 'success');
      return responseData;
    }
  } catch (error) {
    console.warn('API crearDespliegue falló. Guardando localmente.', error);
  }

  // Fallback local
  const { despliegues } = getStoredLocalData();
  const nuevoDespliegue = {
    id: Date.now(),
    ruta: data.ruta || 'Ruta no especificada',
    fecha_salida: new Date().toISOString(),
    estado: 'en_camino',
    cuadrilla_id: data.cuadrilla_id || data.cuadrilla,
    chofer_id: data.chofer_id || data.chofer,
    patente: data.patente || 'Sin Patente',
    vehiculo: data.vehiculo || 'Vehículo General'
  };
  despliegues.push(nuevoDespliegue);
  saveStoredLocalData('local_despliegues', despliegues);

  // Obtener info adicional para bitácora
  const { cuadrillas } = getStoredLocalData();
  const crew = cuadrillas.find(c => c.id === nuevoDespliegue.cuadrilla_id);
  const crewName = crew ? crew.name : `ID #${nuevoDespliegue.cuadrilla_id}`;
  
  registrarMovimiento(`[Despacho] Cuadrilla '${crewName}' en camino. Chofer asignado, Vehículo: ${nuevoDespliegue.vehiculo} (${nuevoDespliegue.patente}).`, 'success');
  return nuevoDespliegue;
}

export async function actualizarEstadoDespliegue(id, nuevoEstado) {
  try {
    const res = await put(`/despliegues/${id}`, { estado: nuevoEstado });
    if (res) {
      const data = res.data || res;
      registrarMovimiento(`Despliegue ID #${id} actualizado a estado '${nuevoEstado}'.`, 'info');
      return data;
    }
  } catch (error) {
    console.warn('API actualizarDespliegue falló. Guardando localmente.', error);
  }

  // Fallback local
  const { despliegues, cuadrillas } = getStoredLocalData();
  const index = despliegues.findIndex(d => d.id === parseInt(id) || d.id === id);
  if (index !== -1) {
    despliegues[index].estado = nuevoEstado;
    saveStoredLocalData('local_despliegues', despliegues);

    const crew = cuadrillas.find(c => c.id === despliegues[index].cuadrilla_id);
    const crewName = crew ? crew.name : `ID #${despliegues[index].cuadrilla_id}`;

    let msg = `[Seguimiento] Cuadrilla '${crewName}' ha cambiado su estado a '${nuevoEstado}'.`;
    let type = 'info';
    if (nuevoEstado === 'en_terreno') {
      msg = `[Seguimiento] Cuadrilla '${crewName}' ha llegado a terreno e inicia labores operativas.`;
      type = 'warning';
    } else if (nuevoEstado === 'retornando') {
      msg = `[Seguimiento] Cuadrilla '${crewName}' ha finalizado labores en terreno y está retornando al centro logístico.`;
      type = 'info';
    } else if (nuevoEstado === 'finalizado') {
      msg = `[Seguimiento] Cuadrilla '${crewName}' ha retornado con éxito. Despliegue finalizado y registrado como exitoso.`;
      type = 'success';
    }

    registrarMovimiento(msg, type);
    return despliegues[index];
  }
  throw new Error('Despliegue no encontrado');
}
