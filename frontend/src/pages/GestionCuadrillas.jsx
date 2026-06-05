import { useState, useEffect } from 'react';
import { getUser } from '../services/auth.service.js';
import { showToast } from '../helpers/toast.js';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  getSectores,
  getChoferes,
  crearChofer,
  getVoluntarios,
  getCuadrillas,
  crearCuadrilla,
  eliminarCuadrilla,
  getDespliegues,
  crearDespliegue,
  actualizarEstadoDespliegue,
  obtenerBitacora,
  registrarMovimiento
} from '../services/logistica.service.js';
import '../styles/Logistica.css';

export default function GestionCuadrillasPage() {
  const user = getUser();
  const userRole = user?.role || 'jefe_cuadrilla';
  
  // Condición: "solo pueda modificar yo". El rol jefe_cuadrilla o admin son los autorizados a modificar.
  const isEditable = userRole === 'jefe_cuadrilla' || userRole === 'admin';

  // Estados de Datos
  const [sectores, setSectores] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [voluntarios, setVoluntarios] = useState([]);
  const [cuadrillas, setCuadrillas] = useState([]);
  const [despliegues, setDespliegues] = useState([]);
  const [bitacora, setBitacora] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Navegación y Vistas
  const [activeTab, setActiveTab] = useState('planificacion');

  // Formulario Planificación Cuadrilla
  const [crewName, setCrewName] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [crewLeader, setCrewLeader] = useState('');
  const [modoEmergencia, setModoEmergencia] = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);

  // Formulario Despacho
  const [selectedCrewForDispatch, setSelectedCrewForDispatch] = useState(null);
  const [selectedChofer, setSelectedChofer] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [routePath, setRoutePath] = useState('');

  // Formulario Nuevo Chofer
  const [showNewChoferForm, setShowNewChoferForm] = useState(false);
  const [newChoferNombres, setNewChoferNombres] = useState('');
  const [newChoferApellidos, setNewChoferApellidos] = useState('');
  const [newChoferRut, setNewChoferRut] = useState('');
  const [newChoferLicencia, setNewChoferLicencia] = useState('Clase B');
  const [newChoferTelefono, setNewChoferTelefono] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sect, chof, vol, cuad, despl] = await Promise.all([
        getSectores(),
        getChoferes(),
        getVoluntarios(),
        getCuadrillas(),
        getDespliegues(),
      ]);
      setSectores(sect);
      setChoferes(chof);
      setVoluntarios(vol);
      setCuadrillas(cuad);
      setDespliegues(despl);
      setBitacora(obtenerBitacora());
    } catch (err) {
      showToast('Error al cargar datos logísticos: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Manejar Selección de Voluntarios
  const handleToggleVolunteer = (correo) => {
    if (selectedVolunteers.includes(correo)) {
      setSelectedVolunteers(selectedVolunteers.filter(c => c !== correo));
    } else {
      const maxAllowed = modoEmergencia ? 10 : 6;
      if (selectedVolunteers.length >= maxAllowed) {
        showToast(`Límite máximo de voluntarios alcanzado (${maxAllowed} en modo ${modoEmergencia ? 'EMERGENCIA' : 'NORMAL'})`, 'warning');
        return;
      }
      setSelectedVolunteers([...selectedVolunteers, correo]);
    }
  };

  // Crear una nueva cuadrilla
  const handleCreateCrew = async (e) => {
    e.preventDefault();
    if (!isEditable) {
      showToast('No tienes permisos para modificar este módulo', 'error');
      return;
    }
    if (!crewName.trim() || !selectedSector || !crewLeader.trim()) {
      showToast('Completa todos los campos requeridos', 'error');
      return;
    }
    if (selectedVolunteers.length === 0) {
      showToast('Asigna al menos un voluntario a la cuadrilla', 'warning');
      return;
    }

    try {
      const data = {
        name: crewName,
        encargado: crewLeader,
        zona_afectada: selectedSector,
        voluntarios: selectedVolunteers,
        modo_emergencia: modoEmergencia
      };
      await crearCuadrilla(data);
      showToast('Cuadrilla planificada con éxito');
      
      // Limpiar Form
      setCrewName('');
      setSelectedSector('');
      setTaskDescription('');
      setCrewLeader('');
      setModoEmergencia(false);
      setSelectedVolunteers([]);
      
      // Recargar
      loadData();
    } catch (err) {
      showToast(err.message || 'Error al planificar cuadrilla', 'error');
    }
  };

  // Crear un nuevo chofer
  const handleCreateChofer = async (e) => {
    e.preventDefault();
    if (!newChoferNombres || !newChoferApellidos || !newChoferRut) {
      showToast('Nombre, Apellido y RUT son requeridos', 'warning');
      return;
    }
    try {
      const created = await crearChofer({
        nombres: newChoferNombres,
        apellidos: newChoferApellidos,
        rut: newChoferRut,
        licencia_conducir: newChoferLicencia,
        telefono: newChoferTelefono
      });
      showToast('Chofer registrado con éxito');
      
      // Volver a cargar choferes
      const updatedChoferes = await getChoferes();
      setChoferes(updatedChoferes);
      
      // Auto-seleccionar el creado
      setSelectedChofer(created.id);
      
      // Limpiar y cerrar formulario
      setNewChoferNombres('');
      setNewChoferApellidos('');
      setNewChoferRut('');
      setNewChoferLicencia('Clase B');
      setNewChoferTelefono('');
      setShowNewChoferForm(false);
    } catch (err) {
      showToast('Error al registrar chofer: ' + (err.message || err), 'error');
    }
  };

  // Eliminar una cuadrilla planificada
  const handleDeleteCrew = async (id) => {
    if (!isEditable) {
      showToast('No tienes permisos para modificar este módulo', 'error');
      return;
    }
    if (!window.confirm('¿Seguro que desea eliminar esta cuadrilla? Las herramientas y voluntarios asignados quedarán libres.')) {
      return;
    }
    try {
      await eliminarCuadrilla(id);
      showToast('Cuadrilla eliminada correctamente');
      loadData();
    } catch (err) {
      showToast('Error al eliminar cuadrilla: ' + err.message, 'error');
    }
  };

  // Iniciar proceso de despacho para una cuadrilla específica
  const handleSelectForDispatch = (cuadrilla) => {
    setSelectedCrewForDispatch(cuadrilla);
    // Autofill sugerencias de ruta
    setRoutePath(`Ruta Centro hacia ${cuadrilla.zona_afectada}`);
  };

  // Confirmar despacho
  const handleConfirmDispatch = async (e) => {
    e.preventDefault();
    if (!isEditable) {
      showToast('No tienes permisos para modificar este módulo', 'error');
      return;
    }
    if (!selectedCrewForDispatch || !selectedChofer || !vehicleName.trim()) {
      showToast('Todos los datos del despacho son requeridos', 'warning');
      return;
    }

    try {
      const data = {
        cuadrilla_id: selectedCrewForDispatch.id,
        chofer_id: parseInt(selectedChofer),
        vehiculo: vehicleName,
        patente: 'N/A',
        ruta: routePath
      };

      await crearDespliegue(data);
      showToast('Cuadrilla despachada con éxito');
      
      // Limpiar formulario de despacho
      setSelectedCrewForDispatch(null);
      setSelectedChofer('');
      setVehicleName('');
      setRoutePath('');
      
      // Recargar e ir a Seguimiento
      await loadData();
      setActiveTab('seguimiento');
    } catch (err) {
      showToast('Error al procesar despacho: ' + err.message, 'error');
    }
  };

  // Avanzar estado del despliegue
  const handleUpdateStatus = async (despliegueId, currentStatus) => {
    if (!isEditable) {
      showToast('No tienes permisos para modificar este módulo', 'error');
      return;
    }
    
    let nextStatus = '';
    if (currentStatus === 'en_camino') nextStatus = 'en_terreno';
    else if (currentStatus === 'en_terreno') nextStatus = 'retornando';
    else if (currentStatus === 'retornando') nextStatus = 'finalizado';

    if (!nextStatus) return;

    try {
      await actualizarEstadoDespliegue(despliegueId, nextStatus);
      showToast(`Estado actualizado: ${nextStatus.replace('_', ' ')}`);
      loadData();
    } catch (err) {
      showToast('Error al actualizar estado: ' + err.message, 'error');
    }
  };

  const getStatusStepClass = (status, current) => {
    const steps = ['en_camino', 'en_terreno', 'retornando', 'finalizado'];
    const statusIndex = steps.indexOf(status);
    const currentIndex = steps.indexOf(current);
    if (status === current) return 'step active';
    if (statusIndex < currentIndex) return 'step completed';
    return 'step pending';
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div className="page logistica-page-container">
      {/* Header Centralizado */}
      <div className="page-header logistica-header">
        <div>
          <h1 className="page-title">Núcleo de Logística y Despacho</h1>
          <p className="page-subtitle font-sans">
            Planificación de cuadrillas, asignación de choferes, despacho y bitácora de seguridad en tiempo real.
          </p>
        </div>

        {/* Indicador de Rol - Permisos */}
        <div className={`role-badge ${isEditable ? 'authorized' : 'read-only'}`}>
          <div className="role-badge-icon">
            {isEditable ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 11l2 2 4-4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          </div>
          <div className="role-badge-text">
            <span>{isEditable ? 'Modo Coordinación Activa' : 'Modo Consulta Logística'}</span>
            <small>{user?.name} ({userRole})</small>
          </div>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="logistica-tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'planificacion' ? 'active' : ''}`}
          onClick={() => setActiveTab('planificacion')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          1. Planificación de Cuadrillas
        </button>
        <button 
          className={`tab-btn ${activeTab === 'despacho' ? 'active' : ''}`}
          onClick={() => setActiveTab('despacho')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          2. Despacho y Transporte
        </button>
        <button 
          className={`tab-btn ${activeTab === 'seguimiento' ? 'active' : ''}`}
          onClick={() => setActiveTab('seguimiento')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          3. Seguimiento y Seguridad
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑAS */}
      <div className="logistica-tab-content">
        
        {/* PESTAÑA 1: PLANIFICACION */}
        {activeTab === 'planificacion' && (
          <div className="logistica-grid">
            {/* Formulario de Planificación */}
            <div className="card logistica-card form-section-card">
              <h2 className="section-title">Nueva Cuadrilla de Voluntarios</h2>
              <p className="section-desc">Crea una cuadrilla, define el sector objetivo y asigna el recurso humano.</p>
              
              {!isEditable && (
                <div className="lock-overlay-msg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Solo el Jefe de Cuadrilla tiene permisos para planificar.</span>
                </div>
              )}

              <form onSubmit={handleCreateCrew} className={`logistica-form ${!isEditable ? 'disabled' : ''}`}>
                <div className="form-group">
                  <label className="form-label">Nombre de la Cuadrilla *</label>
                  <input 
                    className="input" 
                    type="text" 
                    placeholder="Ej: Cuadrilla Alfa, Reconstructores, etc." 
                    value={crewName}
                    onChange={(e) => setCrewName(e.target.value)}
                    disabled={!isEditable}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Sector Afectado *</label>
                    <input 
                      className="input" 
                      type="text" 
                      placeholder="Ej: Sector Norte, Campamento Esperanza..." 
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      disabled={!isEditable}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Líder / Encargado *</label>
                    <select 
                      className="select" 
                      value={crewLeader}
                      onChange={(e) => setCrewLeader(e.target.value)}
                      disabled={!isEditable}
                      required
                    >
                      <option value="">Seleccione Encargado</option>
                      {voluntarios.map(v => (
                        <option key={v.correo} value={`${v.nombres} ${v.apellidos}`}>{v.nombres} {v.apellidos}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group inline-checkbox-group">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={modoEmergencia}
                      onChange={(e) => {
                        setModoEmergencia(e.target.checked);
                        setSelectedVolunteers([]); // reset por cambio de capacidad
                      }}
                      disabled={!isEditable}
                    />
                    <span className="checkmark"></span>
                    <div className="checkbox-info">
                      <strong>Activar Modo de Emergencia</strong>
                      <span>Aumenta el límite de la cuadrilla de 6 a 10 voluntarios máximos.</span>
                    </div>
                  </label>
                </div>

                {/* Selección de Voluntarios */}
                <div className="form-group volunteers-assignment-box">
                  <div className="form-label flex-between">
                    <span>Asignar Voluntarios ({selectedVolunteers.length} / {modoEmergencia ? 10 : 6}) *</span>
                    <small className="capacity-label">Capacidad Máxima: {modoEmergencia ? '10 (Emergencia)' : '6 (Normal)'}</small>
                  </div>
                  <div className="volunteers-scroll-list">
                    {voluntarios.map(v => {
                      const isChecked = selectedVolunteers.includes(v.correo);
                      return (
                        <div 
                          key={v.correo} 
                          className={`volunteer-item-row ${isChecked ? 'selected' : ''}`}
                          onClick={() => isEditable && handleToggleVolunteer(v.correo)}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {}} // Manejado por onClick de fila
                            disabled={!isEditable}
                          />
                          <div className="volunteer-row-text">
                            <strong>{v.nombres} {v.apellidos}</strong>
                            <small>{v.correo} • {v.rut}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-block submit-btn" 
                  type="submit" 
                  disabled={!isEditable || !crewName.trim() || !selectedSector || selectedVolunteers.length === 0}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Crear y Guardar Cuadrilla
                </button>
              </form>
            </div>

            {/* Listado de Cuadrillas Planificadas */}
            <div className="card logistica-card lists-section-card">
              <h2 className="section-title">Cuadrillas Planificadas ({cuadrillas.length})</h2>
              <p className="section-desc">Cuadrillas vigentes listas para ser despachadas al terreno.</p>
              
              {cuadrillas.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <p>No hay cuadrillas planificadas. Comienza creando una en el formulario.</p>
                </div>
              ) : (
                <div className="cuadrillas-grid-container">
                  {cuadrillas.map(c => {
                    // Verificar si ya está despachada buscando un despliegue activo
                    const estaDespachada = despliegues.some(d => d.cuadrilla_id === c.id && d.estado !== 'finalizado');
                    return (
                      <div key={c.id} className={`cuadrilla-card-item ${estaDespachada ? 'dispatched' : ''}`}>
                        <div className="cuadrilla-card-header">
                          <div>
                            <h3>{c.name}</h3>
                            <span className="target-zone">Sector: {c.zona_afectada}</span>
                          </div>
                          {c.modo_emergencia && <span className="emergency-alert-pill">¡EMERGENCIA!</span>}
                        </div>
                        <div className="cuadrilla-card-body">
                          <p><strong>Líder:</strong> {c.encargado}</p>
                          <p><strong>Voluntarios:</strong> {c.voluntarios?.length || 0} personas asignadas</p>
                          <div className="volunteers-avatar-stack">
                            {c.voluntarios?.map((correo, i) => {
                              const volInfo = voluntarios.find(v => v.correo === correo);
                              const initial = volInfo ? volInfo.nombres[0] : '?';
                              return (
                                <span key={correo} className="avatar-mini" title={volInfo ? `${volInfo.nombres} ${volInfo.apellidos} (${correo})` : correo}>
                                  {initial}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="cuadrilla-card-footer">
                          {estaDespachada ? (
                            <span className="dispatch-success-badge">DESPACHADA</span>
                          ) : (
                            <>
                              <button 
                                className="btn btn-warning btn-sm"
                                onClick={() => handleSelectForDispatch(c)}
                                disabled={!isEditable}
                              >
                                Ir a Despacho
                              </button>
                              {isEditable && (
                                <button 
                                  className="btn btn-ghost btn-sm delete-btn-icon"
                                  onClick={() => handleDeleteCrew(c.id)}
                                  title="Eliminar planificación"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: DESPACHO */}
        {activeTab === 'despacho' && (
          <div className="logistica-grid">
            {/* Formulario de Despacho */}
            <div className="card logistica-card form-section-card">
              <h2 className="section-title">Consola de Despacho Terrestre</h2>
              <p className="section-desc">Asigna chofer, vehículo y ruta de salida para la cuadrilla seleccionada.</p>
              
              {!isEditable && (
                <div className="lock-overlay-msg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Solo personal logístico autorizado puede despachar.</span>
                </div>
              )}

              {!selectedCrewForDispatch ? (
                <div className="select-crew-prompt">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  </svg>
                  <p>Por favor, seleccione una cuadrilla disponible en el panel derecho para iniciar el despacho.</p>
                </div>
              ) : (
                <form onSubmit={handleConfirmDispatch} className={`logistica-form ${!isEditable ? 'disabled' : ''}`}>
                  <div className="selected-crew-preview-info">
                    <h4>Cuadrilla a Despachar: <strong>{selectedCrewForDispatch.name}</strong></h4>
                    <p>Sector Destino: {selectedCrewForDispatch.zona_afectada}</p>
                    <p>Voluntarios: {selectedCrewForDispatch.voluntarios?.length || 0} personas</p>
                  </div>

                  <div className="form-group">
                    <div className="flex-row justify-between align-center" style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label" style={{ margin: 0 }}>Chofer Asignado *</label>
                      {isEditable && (
                        <button 
                          type="button" 
                          className="btn-link-action"
                          onClick={() => setShowNewChoferForm(!showNewChoferForm)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-warning)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                        >
                          {showNewChoferForm ? '✕ Cancelar' : '+ Registrar Chofer'}
                        </button>
                      )}
                    </div>

                    {showNewChoferForm ? (
                      <div className="new-chofer-subform-box" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.75rem', marginTop: '0.25rem' }}>
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', opacity: 0.8 }}>Nombres *</label>
                            <input 
                              type="text" 
                              className="input" 
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.9rem' }}
                              value={newChoferNombres}
                              onChange={(e) => setNewChoferNombres(e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', opacity: 0.8 }}>Apellidos *</label>
                            <input 
                              type="text" 
                              className="input" 
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.9rem' }}
                              value={newChoferApellidos}
                              onChange={(e) => setNewChoferApellidos(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', opacity: 0.8 }}>RUT *</label>
                            <input 
                              type="text" 
                              placeholder="12.345.678-9"
                              className="input" 
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.9rem' }}
                              value={newChoferRut}
                              onChange={(e) => setNewChoferRut(e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', opacity: 0.8 }}>Licencia *</label>
                            <select 
                              className="select" 
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.9rem', height: 'auto' }}
                              value={newChoferLicencia}
                              onChange={(e) => setNewChoferLicencia(e.target.value)}
                            >
                              <option value="Clase B">Clase B (Autos)</option>
                              <option value="Clase A2">Clase A2 (Taxis/Colectivos)</option>
                              <option value="Clase A4">Clase A4 (Carga)</option>
                              <option value="Clase A5">Clase A5 (Articulados)</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', opacity: 0.8 }}>Teléfono</label>
                          <input 
                            type="text" 
                            placeholder="+569..."
                            className="input" 
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.9rem' }}
                            value={newChoferTelefono}
                            onChange={(e) => setNewChoferTelefono(e.target.value)}
                          />
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-warning btn-sm"
                          style={{ width: '100%', padding: '0.4rem 0.75rem' }}
                          onClick={handleCreateChofer}
                        >
                          Guardar y Seleccionar
                        </button>
                      </div>
                    ) : (
                      <select
                        className="select"
                        value={selectedChofer}
                        onChange={(e) => setSelectedChofer(e.target.value)}
                        disabled={!isEditable}
                        required
                      >
                        <option value="">Seleccione Chofer</option>
                        {choferes.map(ch => (
                          <option key={ch.id} value={ch.id}>{ch.nombres} {ch.apellidos} ({ch.licencia_conducir})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vehículo / Transporte *</label>
                    <input 
                      className="input" 
                      type="text" 
                      placeholder="Ej: Camioneta Techo #3, Furgón 4x4" 
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      disabled={!isEditable}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ruta sugerida y Observaciones</label>
                    <textarea 
                      className="textarea" 
                      placeholder="Indique la ruta de despliegue o consignas de seguridad..."
                      value={routePath}
                      onChange={(e) => setRoutePath(e.target.value)}
                      disabled={!isEditable}
                    />
                  </div>

                  <div className="flex-row gap-md" style={{ marginTop: 'var(--space-md)' }}>
                    <button 
                      type="button" 
                      className="btn btn-ghost"
                      onClick={() => setSelectedCrewForDispatch(null)}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="btn btn-warning submit-btn" 
                      type="submit" 
                      disabled={!isEditable}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Autorizar Salida y Despachar
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Cuadrillas pendientes de despacho */}
            <div className="card logistica-card lists-section-card">
              <h2 className="section-title">Pendientes de Despacho</h2>
              <p className="section-desc">Selecciona qué cuadrilla deseas coordinar para su traslado.</p>
              
              {cuadrillas.filter(c => !despliegues.some(d => d.cuadrilla_id === c.id && d.estado !== 'finalizado')).length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p>¡Todas las cuadrillas planificadas ya están despachadas o no hay cuadrillas creadas!</p>
                </div>
              ) : (
                <div className="cuadrillas-grid-container">
                  {cuadrillas
                    .filter(c => !despliegues.some(d => d.cuadrilla_id === c.id && d.estado !== 'finalizado'))
                    .map(c => (
                      <div 
                        key={c.id} 
                        className={`cuadrilla-card-item selection-actionable ${selectedCrewForDispatch?.id === c.id ? 'active-selection' : ''}`}
                        onClick={() => handleSelectForDispatch(c)}
                      >
                        <div className="cuadrilla-card-header">
                          <div>
                            <h3>{c.name}</h3>
                            <span className="target-zone">Sector: {c.zona_afectada}</span>
                          </div>
                          {selectedCrewForDispatch?.id === c.id && <span className="selected-indicator-pill">Seleccionada</span>}
                        </div>
                        <div className="cuadrilla-card-body">
                          <p><strong>Voluntarios:</strong> {c.voluntarios?.length || 0} personas</p>
                          <p><strong>Encargado:</strong> {c.encargado}</p>
                        </div>
                        <div className="cuadrilla-card-footer">
                          <button className="btn btn-warning btn-sm btn-block">
                            Seleccionar para Salida
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: SEGUIMIENTO Y SEGURIDAD */}
        {activeTab === 'seguimiento' && (
          <div className="logistica-seguimiento-layout">
            {/* Monitor de Despliegues en Vivo */}
            <div className="card logistica-card deployments-monitor-card">
              <h2 className="section-title">Seguimiento de Despliegues Activos</h2>
              <p className="section-desc">Monitoreo de la ruta, fases de trabajo y seguridad de cada cuadrilla despachada.</p>
              
              {despliegues.filter(d => d.estado !== 'finalizado').length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <p>No hay despliegues activos en camino o terreno en este momento.</p>
                </div>
              ) : (
                <div className="deployments-list-stack">
                  {despliegues
                    .filter(d => d.estado !== 'finalizado')
                    .map(d => {
                      const crewData = cuadrillas.find(c => c.id === d.cuadrilla_id);
                      const choferData = choferes.find(ch => ch.id === d.chofer_id);
                      
                      return (
                        <div key={d.id} className="deployment-item-card">
                          <div className="deployment-item-header">
                            <div>
                              <h3>{crewData ? crewData.name : `Cuadrilla ID #${d.cuadrilla_id}`}</h3>
                              <span className="destination-route">Sector: {crewData ? crewData.zona_afectada : 'Zona Desconocida'} | Ruta: {d.ruta || 'Ruta General'}</span>
                            </div>
                            <div>
                              <StatusBadge estado={d.estado} />
                            </div>
                          </div>

                          <div className="deployment-item-body flex-row gap-lg">
                            <div className="deployment-transport-info flex-1">
                              <p><strong>Chofer:</strong> {choferData ? `${choferData.nombres} ${choferData.apellidos}` : 'No asignado'} ({choferData?.licencia_conducir})</p>
                              <p><strong>Vehículo:</strong> {d.vehiculo}</p>
                              <p><strong>Fecha/Hora Salida:</strong> {new Date(d.fecha_salida).toLocaleString('es-CL')}</p>
                            </div>

                            {/* Stepper visual de estado */}
                            <div className="deployment-stepper flex-2">
                              <div className="stepper-track-bar"></div>
                              <div className={getStatusStepClass('en_camino', d.estado)}>
                                <span className="step-dot"></span>
                                <span className="step-label">En Camino</span>
                              </div>
                              <div className={getStatusStepClass('en_terreno', d.estado)}>
                                <span className="step-dot"></span>
                                <span className="step-label">En Terreno</span>
                              </div>
                              <div className={getStatusStepClass('retornando', d.estado)}>
                                <span className="step-dot"></span>
                                <span className="step-label">Retornando</span>
                              </div>
                              <div className={getStatusStepClass('finalizado', d.estado)}>
                                <span className="step-dot"></span>
                                <span className="step-label">Retornado</span>
                              </div>
                            </div>
                          </div>

                          {isEditable && (
                            <div className="deployment-item-footer flex-end">
                              {d.estado === 'en_camino' && (
                                <button 
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleUpdateStatus(d.id, d.estado)}
                                >
                                  Confirmar Llegada a Terreno
                                </button>
                              )}
                              {d.estado === 'en_terreno' && (
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleUpdateStatus(d.id, d.estado)}
                                >
                                  Iniciar Retorno de Cuadrilla
                                </button>
                              )}
                              {d.estado === 'retornando' && (
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleUpdateStatus(d.id, d.estado)}
                                >
                                  Confirmar Retorno Exitoso
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Bitácora de Movimientos de Seguridad (Historial) */}
            <div className="card logistica-card safety-logs-card">
              <div className="card-header border-none">
                <div>
                  <h2 className="section-title">Registro de Seguridad de Movimientos</h2>
                  <p className="section-desc">Trazabilidad detallada para auditorías de seguridad y eficiencia operativa.</p>
                </div>
                <button 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => {
                    const cleanBitacora = registrarMovimiento('Auditoría manual solicitada por el usuario. Integridad del sistema validada.', 'info');
                    setBitacora(cleanBitacora);
                  }}
                  disabled={!isEditable}
                >
                  Registrar Evento Manual
                </button>
              </div>

              <div className="bitacora-timeline-box">
                {bitacora.map(log => (
                  <div key={log.id} className={`bitacora-timeline-item type-${log.tipo}`}>
                    <div className="timeline-dot-wrapper">
                      <span className="timeline-dot"></span>
                    </div>
                    <div className="timeline-content-card">
                      <span className="log-time">{new Date(log.fecha).toLocaleTimeString('es-CL')} - {new Date(log.fecha).toLocaleDateString('es-CL')}</span>
                      <p className="log-msg">{log.mensaje}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
