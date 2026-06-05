import { useState, useEffect } from 'react';
import { getCuadrillas, crearCuadrilla, eliminarCuadrilla, actualizarCuadrilla } from '../services/cuadrillas.service.js';
import { get, post, put, del } from '../services/api.js';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { showToast } from '../helpers/toast.js';
import { getUser } from '../services/auth.service.js';
import '../styles/Viajes.css';

export default function ViajesPage() {
  const user = getUser();
  const isVolunteer = user?.role === 'voluntario';

  const [activeTab, setActiveTab] = useState('planning');
  
  // Data lists
  const [cuadrillas, setCuadrillas] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [deployments, setDeployments] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [showNewCrew, setShowNewCrew] = useState(false);
  const [showNewDriver, setShowNewDriver] = useState(false);
  const [showNewSector, setShowNewSector] = useState(false);
  const [submittingCrew, setSubmittingCrew] = useState(false);
  const [submittingDriver, setSubmittingDriver] = useState(false);
  const [submittingSector, setSubmittingSector] = useState(false);
  
  // Selection
  const [selectedCuadrilla, setSelectedCuadrilla] = useState(null);

  // Forms
  const [crewFormData, setCrewFormData] = useState({
    name: '',
    encargado: '',
    zona_afectada: '',
    modo_emergencia: false,
    max_voluntarios: 6,
  });

  const [driverFormData, setDriverFormData] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    telefono: '',
    licencia_conducir: 'B',
  });

  const [sectorFormData, setSectorFormData] = useState({
    nombre: '',
    ubicacion: '',
    descripcion: '',
  });

  const [dispatchForm, setDispatchForm] = useState({
    cuadrillaId: '',
    choferId: '',
    sectorId: '',
    sectorText: '',
    ruta: '',
    fechaSalida: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load Cuadrillas
      const cuadrillasData = await getCuadrillas();
      setCuadrillas(Array.isArray(cuadrillasData) ? cuadrillasData : []);

      // Load Volunteers
      const volRes = await get('/voluntarios');
      setVolunteers(Array.isArray(volRes?.data) ? volRes.data : []);

      // Load Drivers
      const driversData = await get('/choferes');
      setDrivers(Array.isArray(driversData) ? driversData : []);

      // Load Sectores
      const sectorsData = await get('/sectores');
      setSectors(Array.isArray(sectorsData) ? sectorsData : []);

      // Load Deployments
      const deploymentsData = await get('/despliegues');
      setDeployments(Array.isArray(deploymentsData) ? deploymentsData : []);

    } catch (err) {
      showToast(err.message || 'Error al cargar los datos operativos', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Refresh data after key operations
  async function refreshData() {
    try {
      const cuadrillasData = await getCuadrillas();
      setCuadrillas(Array.isArray(cuadrillasData) ? cuadrillasData : []);
      
      const volRes = await get('/voluntarios');
      setVolunteers(Array.isArray(volRes?.data) ? volRes.data : []);

      const deploymentsData = await get('/despliegues');
      setDeployments(Array.isArray(deploymentsData) ? deploymentsData : []);

      const sectorsData = await get('/sectores');
      setSectors(Array.isArray(sectorsData) ? sectorsData : []);

      // Keep selection in sync
      if (selectedCuadrilla) {
        const updated = cuadrillasData.find(c => c.id === selectedCuadrilla.id);
        setSelectedCuadrilla(updated || null);
      }
    } catch (err) {
      console.error('Error refreshing data', err);
    }
  }

  // TAB 1: Crew Operations (Viajes-isolated copy of CRUD)
  async function handleCrewSubmit(e) {
    e.preventDefault();
    setSubmittingCrew(true);
    try {
      await crearCuadrilla({
        ...crewFormData,
        max_voluntarios: parseInt(crewFormData.max_voluntarios)
      });
      showToast('Cuadrilla de viaje creada exitosamente');
      setShowNewCrew(false);
      setCrewFormData({
        name: '',
        encargado: '',
        zona_afectada: '',
        modo_emergencia: false,
        max_voluntarios: 6,
      });
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al crear cuadrilla', 'error');
    } finally {
      setSubmittingCrew(false);
    }
  }

  async function handleCrewDelete(id) {
    if (!window.confirm('¿Está seguro de que desea eliminar esta cuadrilla? Las herramientas asociadas serán devueltas.')) return;
    try {
      await eliminarCuadrilla(id);
      showToast('Cuadrilla eliminada correctamente');
      if (selectedCuadrilla?.id === id) {
        setSelectedCuadrilla(null);
      }
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al eliminar cuadrilla', 'error');
    }
  }

  async function handleAssignVolunteer(volRut) {
    if (!selectedCuadrilla) return;
    const currentList = selectedCuadrilla.voluntarios || [];
    if (currentList.includes(volRut)) {
      showToast('El voluntario ya está en la cuadrilla', 'warning');
      return;
    }

    if (currentList.length >= selectedCuadrilla.max_voluntarios) {
      showToast(`Cuadrilla llena. Capacidad máxima: ${selectedCuadrilla.max_voluntarios}`, 'error');
      return;
    }

    const updatedList = [...currentList, volRut];
    try {
      await actualizarCuadrilla(selectedCuadrilla.id, { voluntarios: updatedList });
      showToast('Voluntario asignado a la cuadrilla');
      refreshData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al asignar voluntario', 'error');
    }
  }

  async function handleRemoveVolunteer(volRut) {
    if (!selectedCuadrilla) return;
    const currentList = selectedCuadrilla.voluntarios || [];
    const updatedList = currentList.filter(rut => rut !== volRut);
    try {
      await actualizarCuadrilla(selectedCuadrilla.id, { voluntarios: updatedList });
      showToast('Voluntario retirado de la cuadrilla');
      refreshData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al retirar voluntario', 'error');
    }
  }

  function handleEmergenciaChange(e) {
    const isChecked = e.target.checked;
    if (isChecked) {
      if (!window.confirm('¿Está seguro de activar el modo emergencia? Se notificará a los voluntarios y la capacidad se ampliará a 10.')) {
        return;
      }
    }
    setCrewFormData(prev => ({
      ...prev,
      modo_emergencia: isChecked,
      max_voluntarios: isChecked ? 10 : 6
    }));
  }

  // TAB 2: Driver Operations
  async function handleDriverSubmit(e) {
    e.preventDefault();
    setSubmittingDriver(true);
    try {
      await post('/choferes', driverFormData);
      showToast('Conductor registrado exitosamente');
      setShowNewDriver(false);
      setDriverFormData({
        nombres: '',
        apellidos: '',
        rut: '',
        telefono: '',
        licencia_conducir: 'B',
      });
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al registrar conductor', 'error');
    } finally {
      setSubmittingDriver(false);
    }
  }

  // TAB: Sector Operations
  async function handleSectorSubmit(e) {
    e.preventDefault();
    setSubmittingSector(true);
    try {
      await post('/sectores', sectorFormData);
      showToast('Sector registrado exitosamente');
      setShowNewSector(false);
      setSectorFormData({
        nombre: '',
        ubicacion: '',
        descripcion: '',
      });
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al registrar sector', 'error');
    } finally {
      setSubmittingSector(false);
    }
  }

  async function handleDriverDelete(id) {
    if (!window.confirm('¿Está seguro de que desea eliminar este conductor?')) return;
    try {
      await del(`/choferes/${id}`);
      showToast('Conductor eliminado correctamente');
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al eliminar conductor', 'error');
    }
  }

  async function handleSectorDelete(id) {
    if (!window.confirm('¿Está seguro de que desea eliminar este sector?')) return;
    try {
      await del(`/sectores/${id}`);
      showToast('Sector eliminado correctamente');
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al eliminar sector', 'error');
    }
  }

  // TAB 3: Dispatch Actions
  async function handleCreateDispatch(e) {
    e.preventDefault();
    if (!dispatchForm.cuadrillaId || !dispatchForm.choferId || (!dispatchForm.sectorId && !dispatchForm.sectorText)) {
      showToast('Complete todos los campos requeridos', 'error');
      return;
    }

    let sectorName = '';
    if (dispatchForm.sectorId && dispatchForm.sectorId !== 'custom') {
      const sec = sectors.find(s => s.id === parseInt(dispatchForm.sectorId));
      sectorName = sec ? sec.nombre : 'Sector';
    } else {
      sectorName = dispatchForm.sectorText;
    }

    const payload = {
      cuadrilla: { id: parseInt(dispatchForm.cuadrillaId) },
      chofer: { id: parseInt(dispatchForm.choferId) },
      ruta: dispatchForm.ruta || `Ruta hacia ${sectorName}`,
      fecha_salida: dispatchForm.fechaSalida ? new Date(dispatchForm.fechaSalida).toISOString() : new Date().toISOString(),
      estado: 'pendiente'
    };

    try {
      await post('/despliegues', payload);
      showToast('Despacho programado y registrado con éxito');
      setDispatchForm({
        cuadrillaId: '',
        choferId: '',
        sectorId: '',
        sectorText: '',
        ruta: '',
        fechaSalida: '',
      });
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al registrar despacho', 'error');
    }
  }

  async function handleStartDeployment(id) {
    try {
      await put(`/despliegues/${id}`, {
        estado: 'en_camino',
        fecha_salida: new Date().toISOString()
      });
      showToast('Viaje iniciado. Cuadrilla en tránsito.');
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al iniciar viaje', 'error');
    }
  }

  async function handleFinishDeployment(id) {
    try {
      await put(`/despliegues/${id}`, {
        estado: 'finalizado'
      });
      showToast('Viaje finalizado. Personal de regreso en base.');
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al finalizar viaje', 'error');
    }
  }

  // Calculations
  const activeDeployments = deployments.filter(d => d.estado === 'en_camino');
  const emergencyCrewsCount = cuadrillas.filter(c => c.modo_emergencia).length;
  
  const assignedVolunteersRuts = new Set(cuadrillas.flatMap(c => c.voluntarios || []));
  const availableVolunteers = volunteers.filter(v => v.disponible && !assignedVolunteersRuts.has(v.rut));

  // Dynamic movement logs for Tracking Tab
  const generateMovementLogs = () => {
    const logs = [];

    // Deployment logs
    deployments.forEach(d => {
      const crewName = d.cuadrilla?.name || `Cuadrilla #${d.cuadrilla_id}`;
      const driverName = d.chofer ? `${d.chofer.nombres} ${d.chofer.apellidos}` : 'Chofer No Registrado';
      
      if (d.fecha_salida) {
        logs.push({
          id: `dep-start-${d.id}`,
          timestamp: new Date(d.fecha_salida),
          title: `Despacho Iniciado: ${crewName}`,
          body: `Viaje en ruta. Conductor: ${driverName}. Ruta: ${d.ruta}`,
          type: 'active'
        });
      }

      if (d.estado === 'finalizado') {
        const finishedDate = new Date(d.fecha_salida || Date.now());
        finishedDate.setHours(finishedDate.getHours() + 2); // Simulado
        logs.push({
          id: `dep-end-${d.id}`,
          timestamp: finishedDate,
          title: `Misión Retornada: ${crewName}`,
          body: `Retorno de cuadrilla verificado. Vehículo y conductor regresaron a base de forma segura.`,
          type: 'normal'
        });
      }
    });

    // Crew logs
    cuadrillas.forEach(c => {
      if (c.created_at) {
        logs.push({
          id: `crew-create-${c.id}`,
          timestamp: new Date(c.created_at),
          title: `Planificación de Cuadrilla: ${c.name}`,
          body: `Registrada para la zona ${c.zona_afectada}. Coordinador responsable: ${c.encargado}.`,
          type: 'normal'
        });
      }

      if (c.modo_emergencia) {
        const alertDate = new Date(c.updated_at || c.created_at);
        logs.push({
          id: `crew-alert-${c.id}`,
          timestamp: alertDate,
          title: `¡Modo Emergencia! ${c.name}`,
          body: `Activación de modo de crisis. Capacidad extendida a 10 integrantes.`,
          type: 'emergency'
        });
      }
    });

    return logs.sort((a, b) => b.timestamp - a.timestamp);
  };

  const movementLogs = generateMovementLogs();
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CL') : '-';
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '';

  if (isVolunteer) {
    const myCrew = cuadrillas.find(c => (c.voluntarios || []).includes(user.rut));
    const myDeployment = myCrew ? deployments.find(d => d.cuadrilla?.id === myCrew.id && d.estado !== 'finalizado') : null;

    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Mi Agenda de Viajes</h1>
            <p className="page-subtitle">Información sobre tu cuadrilla designada y salidas programadas a terreno</p>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : !myCrew ? (
          <div className="empty-state" style={{ padding: 'var(--space-xl)', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Sin Asignación Activa</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Actualmente no te encuentras asignado a ninguna cuadrilla ni viaje de emergencia en el sistema.
              Por favor, ponte en contacto con tu Jefe de Cuadrilla o Coordinador de Logística para recibir asignación.
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '20px auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            
            {/* Crew Card */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: 'var(--space-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--primary-color)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Cuadrilla Designada</span>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{myCrew.name}</h2>
                </div>
                {myCrew.modo_emergencia && (
                  <span style={{ background: 'rgba(244, 67, 54, 0.1)', color: '#F44336', padding: '6px 12px', borderRadius: '4px', fontSize: 12, fontWeight: 700 }}>
                    ⚠️ EMERGENCIA ACTIVA
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', fontSize: 14 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>Coordinador a Cargo</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{myCrew.encargado}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>Zona de Operaciones</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{myCrew.zona_afectada}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>Miembros de Cuadrilla</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{(myCrew.voluntarios || []).length} voluntarios</strong>
                </div>
              </div>
            </div>

            {/* Travel / Dispatch Card */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: 'var(--space-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                Detalles del Viaje Programado
              </h3>

              {!myDeployment ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    No hay salidas o viajes programados a terreno para tu cuadrilla en este momento.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 108, 0, 0.03)', padding: '12px var(--space-md)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Estado del Despliegue</span>
                      <div style={{ marginTop: '4px' }}><StatusBadge estado={myDeployment.estado} /></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fecha / Hora Salida</span>
                      <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: 14, marginTop: '4px' }}>
                        {formatDate(myDeployment.fecha_salida)} a las {formatTime(myDeployment.fecha_salida)} hrs
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)', marginTop: '8px' }}>
                    <div style={{ padding: 'var(--space-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Conductor Asignado</span>
                      <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>
                        {myDeployment.chofer ? `${myDeployment.chofer.nombres} ${myDeployment.chofer.apellidos}` : 'Por asignar'}
                      </strong>
                      {myDeployment.chofer && (
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span>📞 Teléfono: {myDeployment.chofer.telefono || 'No registrado'}</span>
                          <span>🪪 Licencia: Clase {myDeployment.chofer.licencia_conducir || 'B'}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: 'var(--space-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ruta e Instrucciones</span>
                      <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
                        {myDeployment.ruta || 'Ruta estándar hacia sector afectado'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: '8px', margin: '8px 0 0 0' }}>
                        * Recuerda presentarte en la base de despacho 15 minutos antes de la hora indicada con tu credencial y equipo de seguridad.
                      </p>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      {/* Title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Centro Logístico de Viajes</h1>
          <p className="page-subtitle">Despacho, monitoreo y auditoría de seguridad para cuadrillas de voluntarios</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="viajes-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{cuadrillas.length}</span>
            <span className="stat-label">Cuadrillas Activas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 108, 0, 0.1)', color: 'var(--primary-color)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="17" y1="11" x2="23" y2="11" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{drivers.length}</span>
            <span className="stat-label">Choferes Registrados</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{activeDeployments.length}</span>
            <span className="stat-label">Viajes en Terreno</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(244, 67, 54, 0.1)', color: '#F44336' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{emergencyCrewsCount}</span>
            <span className="stat-label">Modos de Emergencia</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'planning' ? 'active' : ''}`}
          onClick={() => setActiveTab('planning')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Cuadrillas de Viaje
        </button>
        <button
          className={`tab-btn ${activeTab === 'drivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('drivers')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="17" y1="11" x2="23" y2="11" />
          </svg>
          Conductores
        </button>
        <button
          className={`tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('dispatch')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          Despacho y Salidas
        </button>
        <button
          className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Seguimiento y Registro
        </button>
        <button
          className={`tab-btn ${activeTab === 'sectors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sectors')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Sectores
        </button>
        <button
          className={`tab-btn ${activeTab === 'volunteers' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteers')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Voluntarios
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <>
          {/* TAB 1: CUADRILLAS */}
          {activeTab === 'planning' && (
            <div className="planning-container">
              {/* Left Column: Crews Table */}
              <div className="table-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600 }}>Planificación de Cuadrillas</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowNewCrew(true)}>
                    Nueva Cuadrilla
                  </button>
                </div>
                {cuadrillas.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay cuadrillas creadas en el sistema</p>
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Coordinador</th>
                        <th>Cobertura Inicial</th>
                        <th>Miembros</th>
                        <th>Emergencia</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuadrillas.map((c) => (
                        <tr
                          key={c.id}
                          style={{
                            cursor: 'pointer',
                            background: selectedCuadrilla?.id === c.id ? 'rgba(239, 108, 0, 0.05)' : '',
                            borderLeft: selectedCuadrilla?.id === c.id ? '3px solid var(--primary-color)' : ''
                          }}
                          onClick={() => setSelectedCuadrilla(c)}
                        >
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td>{c.encargado}</td>
                          <td>{c.zona_afectada}</td>
                          <td>{(c.voluntarios || []).length} / {c.max_voluntarios}</td>
                          <td>
                            {c.modo_emergencia ? (
                              <span style={{ color: 'var(--error)', fontWeight: 600 }}>Sí</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>No</span>
                            )}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleCrewDelete(c.id)} style={{ color: 'var(--error)' }}>
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Right Column: Member Editor */}
              <div>
                {selectedCuadrilla ? (
                  <div className="crew-details-panel">
                    <div className="panel-header">
                      <span className="panel-title">{selectedCuadrilla.name}</span>
                      {selectedCuadrilla.modo_emergencia && (
                        <span className="badge badge-rechazada" style={{ fontSize: 11 }}>Emergencia Activa</span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p><strong>Coordinador:</strong> {selectedCuadrilla.encargado}</p>
                      <p><strong>Zona de Cobertura:</strong> {selectedCuadrilla.zona_afectada}</p>
                      <p><strong>Capacidad:</strong> {(selectedCuadrilla.voluntarios || []).length} de {selectedCuadrilla.max_voluntarios} voluntarios</p>
                    </div>

                    <div style={{ marginTop: 'var(--space-sm)' }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: '8px' }}>Miembros Asignados</h4>
                      {(!selectedCuadrilla.voluntarios || selectedCuadrilla.voluntarios.length === 0) ? (
                        <p style={{ fontStyle: 'italic', fontSize: 12, color: 'var(--text-muted)' }}>Sin miembros asignados.</p>
                      ) : (
                        <div className="assigned-volunteers-list">
                          {volunteers
                            .filter(v => selectedCuadrilla.voluntarios.includes(v.rut))
                            .map(v => (
                              <div key={v.id} className="assigned-volunteer-item">
                                <div className="assigned-volunteer-info">
                                  <span className="assigned-name">{v.nombres} {v.apellidos}</span>
                                  <span className="assigned-rut">{v.rut}</span>
                                </div>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  style={{ color: 'var(--error)', padding: '2px 6px', fontSize: 12 }}
                                  onClick={() => handleRemoveVolunteer(v.rut)}
                                >
                                  Quitar
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 'var(--space-sm)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: '8px' }}>Asignar Voluntario Disponible</h4>
                      {availableVolunteers.length === 0 ? (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No hay voluntarios disponibles.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <select
                            className="select"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignVolunteer(e.target.value);
                                e.target.value = "";
                              }
                            }}
                          >
                            <option value="" disabled>Seleccione voluntario...</option>
                            {availableVolunteers.map(v => (
                              <option key={v.id} value={v.rut}>
                                {v.nombres} {v.apellidos} ({v.rut})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="crew-details-panel" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '220px', textAlign: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Seleccione una cuadrilla para ver y gestionar sus voluntarios asignados.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DRIVERS */}
          {activeTab === 'drivers' && (
            <div className="table-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>Registro de Conductores</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowNewDriver(true)}>
                  Registrar Conductor
                </button>
              </div>

              {drivers.length === 0 ? (
                <div className="empty-state">
                  <p>No hay conductores registrados en la plataforma</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre Completo</th>
                      <th>RUT</th>
                      <th>Teléfono</th>
                      <th>Clase de Licencia</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((d) => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 600 }}>#{d.id}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.nombres} {d.apellidos}</td>
                        <td>{d.rut}</td>
                        <td>{d.telefono || '-'}</td>
                        <td>
                          <span className="badge badge-conforme" style={{ fontWeight: '600' }}>
                            Clase {d.licencia_conducir || 'B'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--error)' }}
                            onClick={() => handleDriverDelete(d.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: DISPATCH */}
          {activeTab === 'dispatch' && (
            <div>
              {/* Dispatch Form Card */}
              <div className="dispatch-form-card">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-md)' }}>Programar y Confirmar Salida</h3>
                <form onSubmit={handleCreateDispatch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
                  
                  <div className="form-group">
                    <label className="form-label">Seleccionar Cuadrilla *</label>
                    <select
                      className="select"
                      value={dispatchForm.cuadrillaId}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, cuadrillaId: e.target.value })}
                      required
                    >
                      <option value="">-- Seleccione cuadrilla --</option>
                      {cuadrillas.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({(c.voluntarios || []).length} voluntarios)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Conductor a Cargo *</label>
                    <select
                      className="select"
                      value={dispatchForm.choferId}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, choferId: e.target.value })}
                      required
                    >
                      <option value="">-- Seleccione chofer --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.nombres} {d.apellidos} (Clase {d.licencia_conducir || 'B'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ubicación / Sector Destino *</label>
                    <select
                      className="select"
                      value={dispatchForm.sectorId}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, sectorId: e.target.value })}
                      required
                    >
                      <option value="">-- Seleccione sector --</option>
                      {sectors.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre} ({s.ubicacion || 'S/U'})</option>
                      ))}
                      <option value="custom">Otro sector (Registro manual)</option>
                    </select>
                  </div>

                  {dispatchForm.sectorId === 'custom' && (
                    <div className="form-group">
                      <label className="form-label">Nombre del Sector Manual *</label>
                      <input
                        className="input"
                        type="text"
                        placeholder="Ej: Sector Alto Biobío"
                        value={dispatchForm.sectorText}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, sectorText: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Instrucciones de Ruta</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="Ej: Ruta 5 Sur -> Desvío Camino Viejo"
                      value={dispatchForm.ruta}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, ruta: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha/Hora Programada</label>
                    <input
                      className="input"
                      type="datetime-local"
                      value={dispatchForm.fechaSalida}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, fechaSalida: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end', display: 'flex', marginTop: 'var(--space-sm)' }}>
                    <button className="btn btn-warning" type="submit">
                      Registrar Despacho de Viaje
                    </button>
                  </div>
                </form>
              </div>

              {/* Deployments List */}
              <div className="table-container">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-md)' }}>Control Operativo de Despliegues</h3>
                {deployments.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay viajes ni salidas programadas en el sistema</p>
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Orden Viaje</th>
                        <th>Cuadrilla</th>
                        <th>Conductor</th>
                        <th>Ruta Establecida</th>
                        <th>Fecha de Salida</th>
                        <th>Estado</th>
                        <th>Control Operativo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deployments.map(d => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 600 }}>#{d.id}</td>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.cuadrilla?.name || `Cuadrilla #${d.cuadrilla_id}`}</td>
                          <td>{d.chofer ? `${d.chofer.nombres} ${d.chofer.apellidos}` : 'Sin Asignar'}</td>
                          <td>{d.ruta || 'Ruta estándar'}</td>
                          <td>{formatDate(d.fecha_salida)} {formatTime(d.fecha_salida)}</td>
                          <td>
                            <StatusBadge estado={d.estado} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {d.estado === 'pendiente' && (
                                <button className="btn btn-warning btn-sm" onClick={() => handleStartDeployment(d.id)}>
                                  Iniciar Viaje
                                </button>
                              )}
                              {d.estado === 'en_camino' && (
                                <button className="btn btn-success btn-sm" style={{ background: '#4CAF50', borderColor: '#4CAF50', color: 'white' }} onClick={() => handleFinishDeployment(d.id)}>
                                  Confirmar Retorno
                                </button>
                              )}
                              {d.estado === 'finalizado' && (
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Completado y Auditado</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TRACKING */}
          {activeTab === 'tracking' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: 'var(--space-lg)', alignItems: 'start' }}>
              
              {/* Left Column: Live Status Cards */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-md)' }}>Monitoreo en Tiempo Real</h3>
                {cuadrillas.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay cuadrillas registradas para monitoreo</p>
                  </div>
                ) : (
                  <div className="tracking-grid">
                    {cuadrillas.map(c => {
                      const activeDep = deployments.find(d => d.cuadrilla?.id === c.id && d.estado === 'en_camino');
                      const isEnTerreno = !!activeDep;
                      const hasPendingDep = deployments.some(d => d.cuadrilla?.id === c.id && d.estado === 'pendiente');

                      let statusClass = 'inactive';
                      let statusText = 'En Base (Disponible)';
                      if (isEnTerreno) {
                        statusClass = 'active';
                        statusText = 'En Terreno';
                      } else if (hasPendingDep) {
                        statusClass = 'inactive';
                        statusText = 'Despacho Programado';
                      }

                      if (c.modo_emergencia) {
                        statusClass = 'emergency';
                      }

                      return (
                        <div key={c.id} className={`tracking-card ${statusClass}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</h4>
                            <span style={{ fontSize: 12, fontWeight: 600 }} className={isEnTerreno ? 'color-success' : 'color-text-muted'}>
                              {statusText}
                            </span>
                          </div>

                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: '4px' }}>
                            <p><strong>Coordinador:</strong> {c.encargado}</p>
                            <p><strong>Voluntarios:</strong> {(c.voluntarios || []).length} miembros</p>
                            <p><strong>Cobertura:</strong> {c.zona_afectada}</p>
                            
                            {isEnTerreno && (
                              <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(76, 175, 80, 0.05)', borderRadius: '4px', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                                <p style={{ color: '#4CAF50', fontWeight: 600, fontSize: 12 }}>VIAJE ACTIVO #{activeDep.id}</p>
                                <p style={{ fontSize: 11 }}><strong>Conductor:</strong> {activeDep.chofer ? `${activeDep.chofer.nombres} ${activeDep.chofer.apellidos}` : 'Sin Chofer'}</p>
                                <p style={{ fontSize: 11 }}><strong>Ruta:</strong> {activeDep.ruta}</p>
                                <p style={{ fontSize: 11 }}><strong>Salida:</strong> {formatTime(activeDep.fecha_salida)}</p>
                              </div>
                            )}
                          </div>

                          {c.modo_emergencia && (
                            <div style={{ background: 'rgba(244, 67, 54, 0.1)', color: '#F44336', padding: '6px', borderRadius: '4px', fontSize: 11, fontWeight: 600, textAlign: 'center', marginTop: '4px' }}>
                              ⚠️ MODO EMERGENCIA ACTIVADO
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Timeline Movement Logs */}
              <div className="timeline-card">
                <h3 style={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                  Bitácora de Seguridad
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                  Auditoría automática de ingresos de cuadrillas, salidas a terreno y retornos de vehículos para resguardo de personal.
                </p>

                {movementLogs.length === 0 ? (
                  <p style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-md)' }}>
                    No hay eventos registrados.
                  </p>
                ) : (
                  <div className="log-timeline">
                    {movementLogs.slice(0, 15).map(log => (
                      <div key={log.id} className="log-item">
                        <div className={`log-dot ${log.type}`} />
                        <div className="log-header">
                          <span className="log-title">{log.title}</span>
                          <span className="log-time">{formatDate(log.timestamp)} {formatTime(log.timestamp)}</span>
                        </div>
                        <p className="log-body">{log.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: SECTORES */}
          {activeTab === 'sectors' && (
            <div className="table-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>Registro de Sectores Afectados</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowNewSector(true)}>
                  Registrar Sector
                </button>
              </div>

              {sectors.length === 0 ? (
                <div className="empty-state">
                  <p>No hay sectores registrados en el sistema</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre del Sector</th>
                      <th>Ubicación / Coordenadas</th>
                      <th>Descripción de Daños / Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectors.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>#{s.id}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.nombre}</td>
                        <td>{s.ubicacion || 'No especificada'}</td>
                        <td>{s.descripcion || 'Sin descripción'}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--error)' }}
                            onClick={() => handleSectorDelete(s.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 6: VOLUNTARIOS */}
          {activeTab === 'volunteers' && (
            <div className="table-container">
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-md)' }}>Listado y Disponibilidad de Voluntarios</h2>
              {volunteers.length === 0 ? (
                <div className="empty-state">
                  <p>No hay voluntarios registrados en el sistema</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>RUT</th>
                      <th>Nombre Completo</th>
                      <th>Correo Electrónico</th>
                      <th>Teléfono</th>
                      <th>Disponibilidad</th>
                      <th>Cuadrilla Designada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((v) => {
                      const assignedCrew = cuadrillas.find(c => (c.voluntarios || []).includes(v.rut));
                      return (
                        <tr key={v.id}>
                          <td style={{ fontWeight: 600 }}>{v.rut}</td>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.nombres} {v.apellidos}</td>
                          <td>{v.correo || v.email || '-'}</td>
                          <td>{v.telefono || '-'}</td>
                          <td>
                            {v.disponible ? (
                              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>● Disponible</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>○ No disponible</span>
                            )}
                          </td>
                          <td>
                            {assignedCrew ? (
                              <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                {assignedCrew.name}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin asignar</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* New Cuadrilla Modal */}
      <Modal
        isOpen={showNewCrew}
        onClose={() => setShowNewCrew(false)}
        title="Crear Cuadrilla de Viaje"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setShowNewCrew(false)}>Cancelar</button>
            <button type="submit" form="new-crew-form" className="btn btn-primary" disabled={submittingCrew}>
              {submittingCrew ? 'Creando...' : 'Crear Cuadrilla'}
            </button>
          </>
        }
      >
        <form id="new-crew-form" onSubmit={handleCrewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Nombre de Cuadrilla *</label>
            <input
              className="input"
              type="text"
              placeholder="Ej: Cuadrilla Centinela"
              value={crewFormData.name}
              onChange={(e) => setCrewFormData({ ...crewFormData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Coordinador/Encargado *</label>
            <input
              className="input"
              type="text"
              placeholder="Nombre del responsable de cuadrilla"
              value={crewFormData.encargado}
              onChange={(e) => setCrewFormData({ ...crewFormData, encargado: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Zona de Cobertura Inicial *</label>
            <input
              className="input"
              type="text"
              placeholder="Ej: Sector Poniente, Calle Prat"
              value={crewFormData.zona_afectada}
              onChange={(e) => setCrewFormData({ ...crewFormData, zona_afectada: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Capacidad de Voluntarios</label>
              <input
                className="input"
                type="number"
                min="1"
                max={crewFormData.modo_emergencia ? 10 : 6}
                value={crewFormData.max_voluntarios}
                onChange={(e) => {
                  let val = parseInt(e.target.value) || 1;
                  const limit = crewFormData.modo_emergencia ? 10 : 6;
                  if (val > limit) val = limit;
                  setCrewFormData({ ...crewFormData, max_voluntarios: val });
                }}
                required
              />
            </div>
            <div className="form-group" style={{ justifyContent: 'center' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '28px' }}>
                <input
                  type="checkbox"
                  checked={crewFormData.modo_emergencia}
                  onChange={handleEmergenciaChange}
                />
                Modo Emergencia
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* New Driver Modal */}
      <Modal
        isOpen={showNewDriver}
        onClose={() => setShowNewDriver(false)}
        title="Registrar Conductor"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setShowNewDriver(false)}>Cancelar</button>
            <button type="submit" form="new-driver-form" className="btn btn-primary" disabled={submittingDriver}>
              {submittingDriver ? 'Registrando...' : 'Registrar Conductor'}
            </button>
          </>
        }
      >
        <form id="new-driver-form" onSubmit={handleDriverSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombres *</label>
              <input
                className="input"
                type="text"
                placeholder="Ej: Juan"
                value={driverFormData.nombres}
                onChange={(e) => setDriverFormData({ ...driverFormData, nombres: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apellidos *</label>
              <input
                className="input"
                type="text"
                placeholder="Ej: Pérez González"
                value={driverFormData.apellidos}
                onChange={(e) => setDriverFormData({ ...driverFormData, apellidos: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">RUT Conductor *</label>
              <input
                className="input"
                type="text"
                placeholder="Ej: 12.345.678-9"
                value={driverFormData.rut}
                onChange={(e) => setDriverFormData({ ...driverFormData, rut: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Clase de Licencia</label>
              <select
                className="select"
                value={driverFormData.licencia_conducir}
                onChange={(e) => setDriverFormData({ ...driverFormData, licencia_conducir: e.target.value })}
              >
                <option value="B">Clase B (Vehículo Particular)</option>
                <option value="A2">Clase A2 (Ambulancia, Taxi)</option>
                <option value="A4">Clase A4 (Camión de Carga)</option>
                <option value="F">Clase F (Vehículos de Emergencia)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono de Contacto</label>
            <input
              className="input"
              type="tel"
              placeholder="Ej: +56912345678"
              value={driverFormData.telefono}
              onChange={(e) => setDriverFormData({ ...driverFormData, telefono: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* New Sector Modal */}
      <Modal
        isOpen={showNewSector}
        onClose={() => setShowNewSector(false)}
        title="Registrar Nuevo Sector"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setShowNewSector(false)}>Cancelar</button>
            <button type="submit" form="new-sector-form" className="btn btn-primary" disabled={submittingSector}>
              {submittingSector ? 'Registrando...' : 'Registrar Sector'}
            </button>
          </>
        }
      >
        <form id="new-sector-form" onSubmit={handleSectorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Nombre del Sector *</label>
            <input
              className="input"
              type="text"
              placeholder="Ej: Sector Las Colinas, Talcahuano"
              value={sectorFormData.nombre}
              onChange={(e) => setSectorFormData({ ...sectorFormData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Ubicación / Coordenadas</label>
            <input
              className="input"
              type="text"
              placeholder="Ej: Región del Biobío, Chile"
              value={sectorFormData.ubicacion}
              onChange={(e) => setSectorFormData({ ...sectorFormData, ubicacion: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción de Daños / Notas</label>
            <textarea
              className="input"
              placeholder="Describa la situación del sector o prioridades..."
              rows="3"
              style={{ resize: 'vertical', fontFamily: 'inherit', padding: '10px' }}
              value={sectorFormData.descripcion}
              onChange={(e) => setSectorFormData({ ...sectorFormData, descripcion: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
