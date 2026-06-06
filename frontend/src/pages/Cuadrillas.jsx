import { useState, useEffect } from 'react';
import { getCuadrillas, crearCuadrilla, eliminarCuadrilla } from '../services/cuadrillas.service.js';
import Modal from '../components/Modal.jsx';
import { showToast } from '../helpers/toast.js';

export default function CuadrillasPage() {
  const [cuadrillas, setCuadrillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    encargado: '',
    zona_afectada: '',
    modo_emergencia: false,
    max_voluntarios: 6,
    fecha: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getCuadrillas();
      setCuadrillas(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar cuadrillas', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearCuadrilla({
        ...formData,
        max_voluntarios: parseInt(formData.max_voluntarios)
      });
      showToast('Cuadrilla creada exitosamente');
      setShowNew(false);
      setFormData({
        name: '',
        encargado: '',
        zona_afectada: '',
        modo_emergencia: false,
        max_voluntarios: 6,
        fecha: '',
      });
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al crear cuadrilla', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Está seguro de que desea eliminar esta cuadrilla?')) return;
    try {
      await eliminarCuadrilla(id);
      showToast('Cuadrilla eliminada exitosamente');
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al eliminar cuadrilla', 'error');
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CL') : '-';

  function handleEmergenciaChange(e) {
    const isChecked = e.target.checked;
    if (isChecked) {
      if (!window.confirm('¿Estas seguro de activar esta opción?, se le notificara a los voluntarios restantes')) {
        return;
      }
    }
    setFormData(prev => ({
      ...prev,
      modo_emergencia: isChecked,
      max_voluntarios: (!isChecked && prev.max_voluntarios > 6) ? 6 : prev.max_voluntarios
    }));
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cuadrillas</h1>
          <p className="page-subtitle">Gestionar la creación y asignación de cuadrillas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Cuadrilla
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : cuadrillas.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p>No hay cuadrillas registradas</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Encargado</th>
                <th>Zona Afectada</th>
                <th>Fecha</th>
                <th>Voluntarios Max.</th>
                <th>Emergencia</th>
                <th>Creada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuadrillas.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.encargado}</td>
                  <td>{c.zona_afectada}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(c.fecha)}</td>
                  <td>{c.max_voluntarios}</td>
                  <td>
                    {c.modo_emergencia ? (
                      <span style={{ color: 'var(--error)', fontWeight: 600 }}>Sí</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(c.created_at)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.id)} style={{ color: 'var(--error)' }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Cuadrilla Modal */}
      <Modal
        isOpen={showNew}
        onClose={() => setShowNew(false)}
        title="Nueva Cuadrilla"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancelar</button>
            <button type="submit" form="cuadrilla-form" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear Cuadrilla'}
            </button>
          </>
        }
      >
        <form id="cuadrilla-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Nombre de Cuadrilla *</label>
            <input
              className="input"
              type="text"
              placeholder="Ej: Cuadrilla Alfa"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Encargado *</label>
            <input
              className="input"
              type="text"
              placeholder="Nombre del jefe de cuadrilla"
              value={formData.encargado}
              onChange={(e) => setFormData({ ...formData, encargado: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Zona Afectada *</label>
            <input
              className="input"
              type="text"
              placeholder="Ej: Sector Norte, Calle Prat"
              value={formData.zona_afectada}
              onChange={(e) => setFormData({ ...formData, zona_afectada: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de Asignación</label>
            <input
              className="input"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Máx. Voluntarios</label>
              <input
                className="input"
                type="number"
                min="1"
                max={formData.modo_emergencia ? undefined : 6}
                value={formData.max_voluntarios}
                onChange={(e) => {
                  let val = parseInt(e.target.value) || 1;
                  if (!formData.modo_emergencia && val > 6) val = 6;
                  setFormData({ ...formData, max_voluntarios: val });
                }}
                required
              />
            </div>
            <div className="form-group" style={{ justifyContent: 'center' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '28px' }}>
                <input
                  type="checkbox"
                  checked={formData.modo_emergencia}
                  onChange={handleEmergenciaChange}
                />
                Modo Emergencia
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
