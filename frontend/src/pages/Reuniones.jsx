import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getReuniones, crearReunion, actualizarEstadoReunion } from '../services/reuniones.service.js';
import { getTodosLosPerfiles } from '../services/perfil.service.js';
import { getUser } from '../services/auth.service.js';
import { showToast } from '../helpers/toast.js';
import Modal from '../components/Modal.jsx';
import '../styles/Reuniones.css';

export default function ReunionesPage() {
  const user = getUser();
  const isAdmin = user?.role === 'administrador' || user?.role === 'coordinador';
  const isCoordinador = user?.role === 'administrador' || user?.role === 'coordinador' || user?.role === 'jefe_cuadrilla';
  const location = useLocation();

  const [reuniones, setReuniones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('programada');


  const [showModal, setShowModal] = useState(false);
  const [formValidating, setFormValidating] = useState(false);
  const [perfiles, setPerfiles] = useState([]);
  
  const [formData, setFormData] = useState({
    voluntario_id: '',
    tipo: 'Entrevista de Evaluación',
    fecha: '',
    modalidad: 'Online',
    plataforma: 'Google Meet',
    lugar: ''
  });

  useEffect(() => {
    loadReuniones();
    if (isCoordinador) {
      loadPerfiles();
    }
  }, [isCoordinador]);

  useEffect(() => {
  
    if (location.state?.agendarParaVoluntarioId) {
      setFormData(prev => ({
        ...prev,
        voluntario_id: location.state.agendarParaVoluntarioId
      }));
      setShowModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  async function loadReuniones() {
    setLoading(true);
    try {
      const data = await getReuniones();
      setReuniones(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Error al cargar reuniones', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadPerfiles() {
    try {
      const data = await getTodosLosPerfiles({});
      setPerfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Error al cargar perfiles para agendamiento', 'error');
    }
  }

  const handleCrearReunion = async (e) => {
    e.preventDefault();
    setFormValidating(true);
    try {
      const voluntarioSelected = perfiles.find(p => p.id === Number(formData.voluntario_id));
      const nombrePostulante = voluntarioSelected ? voluntarioSelected.nombre_completo : 'Sin Nombre';

      await crearReunion({
        voluntario_id: Number(formData.voluntario_id),
        nombre_postulante: nombrePostulante,
        tipo: formData.tipo,
        fecha: formData.fecha,
        modalidad: formData.modalidad,
        plataforma: formData.modalidad === 'Online' ? formData.plataforma : null,
        lugar: formData.modalidad === 'Presencial' ? formData.lugar : null
      });
      showToast('Reunión agendada exitosamente');
      setShowModal(false);
      setFormData({ voluntario_id: '', tipo: 'Entrevista de Evaluación', fecha: '', modalidad: 'Online', plataforma: 'Google Meet', lugar: '' });
      loadReuniones();
    } catch (err) {
      showToast(err.message || 'Error al agendar', 'error');
    } finally {
      setFormValidating(false);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await actualizarEstadoReunion(id, nuevoEstado);
      showToast(`Estado cambiado a ${nuevoEstado}`);
      loadReuniones();
    } catch (err) {
      showToast('Error al cambiar estado', 'error');
    }
  };

  const reunionesFiltradas = reuniones.filter(r => {
    if (filtroEstado && r.estado !== filtroEstado) return false;
    return true; 
  });

  return (
    <div className="page" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Agenda y Evaluaciones</h1>
          <p className="page-subtitle">Gestiona las entrevistas, evaluaciones y reuniones del equipo</p>
        </div>
        {isCoordinador && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, marginRight: 8 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <line x1="12" y1="14" x2="12" y2="18"></line>
              <line x1="10" y1="16" x2="14" y2="16"></line>
            </svg>
            Agendar Reunión
          </button>
        )}
      </div>

      <div className="filter-bar" style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '24px' }}>
        <div className="form-group" style={{ minWidth: '200px' }}>
          <label className="form-label">Filtrar por Estado</label>
          <select className="select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todas</option>
            <option value="programada">Programadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : reunionesFiltradas.length === 0 ? (
        <div className="empty-state">
          <p>No se encontraron reuniones con los filtros indicados.</p>
        </div>
      ) : (
        <div className="reuniones-grid">
          {reunionesFiltradas.map(reunion => (
            <div key={reunion.id} className="reunion-card">
              <div className="reunion-header">
                <div>
                  <h3 className="reunion-title">{reunion.nombre_postulante}</h3>
                  <span className={`badge badge-${reunion.estado}`}>{reunion.estado}</span>
                </div>
              </div>
              
              <div style={{ marginTop: '8px' }}>
                <div className="reunion-subtitle">{reunion.tipo}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <div className="reunion-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {new Date(reunion.fecha).toLocaleString('es-CL', { dateStyle: 'full', timeStyle: 'short' })}
                </div>
                {reunion.modalidad === 'Online' ? (
                  <div className="reunion-info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    Online vía <strong style={{ marginLeft: 4 }}>{reunion.plataforma}</strong>
                  </div>
                ) : (
                  <div className="reunion-info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Presencial en <strong style={{ marginLeft: 4 }}>{reunion.lugar}</strong>
                  </div>
                )}
              </div>

              {isCoordinador && reunion.estado === 'programada' && (
                <div className="reunion-actions">
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleCambiarEstado(reunion.id, 'cancelada')}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleCambiarEstado(reunion.id, 'completada')}>
                    Marcar Completada
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isCoordinador && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Agendar Nueva Reunión"
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" form="form-reunion" className="btn btn-primary" disabled={formValidating}>
                {formValidating ? 'Agendando...' : 'Agendar Reunión'}
              </button>
            </>
          }
        >
          <form id="form-reunion" onSubmit={handleCrearReunion} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Postulante / Voluntario *</label>
              <select
                className="select"
                value={formData.voluntario_id}
                onChange={(e) => setFormData({ ...formData, voluntario_id: e.target.value })}
                required
              >
                <option value="">-- Seleccionar --</option>
                {perfiles.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre_completo || `Perfil #${p.id}`} ({p.rol})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Reunión *</label>
              <select
                className="select"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                required
              >
                <option value="Entrevista de Evaluación">Entrevista de Evaluación</option>
                <option value="Evaluación Psicológica">Evaluación Psicológica</option>
                <option value="Onboarding">Onboarding / Inducción</option>
                <option value="Reunión de Coordinación">Reunión de Coordinación</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha y Hora *</label>
              <input
                type="datetime-local"
                className="input"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Modalidad *</label>
              <select
                className="select"
                value={formData.modalidad}
                onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                required
              >
                <option value="Online">Online</option>
                <option value="Presencial">Presencial</option>
              </select>
            </div>

            {formData.modalidad === 'Online' ? (
              <div className="form-group">
                <label className="form-label">Plataforma (App) *</label>
                <select
                  className="select"
                  value={formData.plataforma}
                  onChange={(e) => setFormData({ ...formData, plataforma: e.target.value })}
                  required
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Discord">Discord</option>
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Dirección / Lugar de Reunión *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Oficina central Techo, Sede Valparaíso..."
                  value={formData.lugar}
                  onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                  required
                />
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
