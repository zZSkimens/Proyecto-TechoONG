import { useState, useEffect } from 'react';
import { getSolicitudes, crearSolicitud } from '../services/solicitudes.service.js';
import { getProductos } from '../services/productos.service.js';
import { getUser } from '../services/auth.service.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import { showToast } from '../helpers/toast.js';
import '../styles/Solicitudes.css';

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [formData, setFormData] = useState({
    fecha_entrega: '',
    destino: '',
    actividad: '',
    responsable_recepcion: '',
    observaciones: '',
    items: [{ producto_id: '', cantidad_solicitada: '' }],
  });
  const [submitting, setSubmitting] = useState(false);

  const user = getUser();

  useEffect(() => {
    loadData();
  }, [filtroEstado]);

  async function loadData() {
    setLoading(true);
    try {
      const filtros = {};
      if (filtroEstado) filtros.estado = filtroEstado;
      const [sols, prods] = await Promise.all([
        getSolicitudes(filtros),
        getProductos(),
      ]);
      setSolicitudes(Array.isArray(sols) ? sols : []);
      setProductos(Array.isArray(prods) ? prods : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { producto_id: '', cantidad_solicitada: '' }],
    }));
  }

  function removeItem(index) {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function updateItem(index, field, value) {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        solicitante_id: user?.id || 1,
        nombre_solicitante: user?.email || 'Jefe de Cuadrilla',
        fecha_entrega: formData.fecha_entrega,
        destino: formData.destino,
        actividad: formData.actividad,
        responsable_recepcion: formData.responsable_recepcion,
        observaciones: formData.observaciones,
        items: formData.items.map((item) => ({
          producto_id: parseInt(item.producto_id),
          cantidad_solicitada: parseInt(item.cantidad_solicitada),
        })),
      };
      await crearSolicitud(payload);
      showToast('Solicitud creada exitosamente');
      setShowNew(false);
      setFormData({
        fecha_entrega: '',
        destino: '',
        actividad: '',
        responsable_recepcion: '',
        observaciones: '',
        items: [{ producto_id: '', cantidad_solicitada: '' }],
      });
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al crear solicitud', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const stats = {
    total: solicitudes.length,
    pendientes: solicitudes.filter((s) => s.estado === 'pendiente').length,
    aprobadas: solicitudes.filter((s) => s.estado === 'aprobada').length,
    entregadas: solicitudes.filter((s) => s.estado === 'entregada').length,
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CL') : '-';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Solicitudes de Alimentos</h1>
          <p className="page-subtitle">Crear y gestionar solicitudes de alimentos para jornadas y actividades</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Solicitud
        </button>
      </div>

      {/* Stats */}
      <div className="solicitudes-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pendientes}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--info)' }}>{stats.aprobadas}</span>
          <span className="stat-label">Aprobadas</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--success)' }}>{stats.entregadas}</span>
          <span className="stat-label">Entregadas</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
          <option value="despachada">Despachada</option>
          <option value="entregada">Entregada</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : solicitudes.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p>No hay solicitudes registradas</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Actividad</th>
                <th>Destino</th>
                <th>Fecha Entrega</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Creada</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => (
                <tr key={sol.id} className="clickable" onClick={() => setShowDetail(sol)}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{sol.id}</td>
                  <td>{sol.actividad}</td>
                  <td>{sol.destino}</td>
                  <td>{formatDate(sol.fecha_entrega)}</td>
                  <td><StatusBadge estado={sol.estado} /></td>
                  <td>{sol.responsable_recepcion}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(sol.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Solicitud Modal */}
      <Modal
        isOpen={showNew}
        onClose={() => setShowNew(false)}
        title="Nueva Solicitud de Alimentos"
        large
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear Solicitud'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha de Entrega *</label>
              <input
                className="input"
                type="date"
                value={formData.fecha_entrega}
                onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Responsable de Recepción *</label>
              <input
                className="input"
                type="text"
                placeholder="Nombre completo"
                value={formData.responsable_recepcion}
                onChange={(e) => setFormData({ ...formData, responsable_recepcion: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Destino *</label>
              <input
                className="input"
                type="text"
                placeholder="Ej: Sede Norte, Campamento Las Torres"
                value={formData.destino}
                onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Jornada / Actividad *</label>
              <input
                className="input"
                type="text"
                placeholder="Ej: Jornada de Construcción Mayo"
                value={formData.actividad}
                onChange={(e) => setFormData({ ...formData, actividad: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Observaciones</label>
            <textarea
              className="textarea"
              placeholder="Notas adicionales (opcional)"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            />
          </div>

          {/* Items */}
          <div className="items-header">
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Productos Solicitados</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
              + Agregar producto
            </button>
          </div>
          <div className="items-list">
            {formData.items.map((item, index) => (
              <div className="item-row" key={index}>
                <div className="form-group">
                  <label className="form-label">Producto</label>
                  <select
                    className="select"
                    value={item.producto_id}
                    onChange={(e) => updateItem(index, 'producto_id', e.target.value)}
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.stock_actual} {p.unidad_medida} disp.)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cantidad</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    placeholder="0"
                    value={item.cantidad_solicitada}
                    onChange={(e) => updateItem(index, 'cantidad_solicitada', e.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeItem(index)}
                  title="Eliminar producto"
                  disabled={formData.items.length <= 1}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title={showDetail ? `Solicitud #${showDetail.id}` : ''}
        large
      >
        {showDetail && (
          <>
            <div className="detail-section">
              <h3>Información General</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Estado</span>
                  <span className="detail-value"><StatusBadge estado={showDetail.estado} /></span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Solicitante</span>
                  <span className="detail-value">{showDetail.nombre_solicitante}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Actividad</span>
                  <span className="detail-value">{showDetail.actividad}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Destino</span>
                  <span className="detail-value">{showDetail.destino}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha de Entrega</span>
                  <span className="detail-value">{formatDate(showDetail.fecha_entrega)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Responsable Recepción</span>
                  <span className="detail-value">{showDetail.responsable_recepcion}</span>
                </div>
              </div>
              {showDetail.observaciones && (
                <div className="detail-item" style={{ marginTop: 'var(--space-md)' }}>
                  <span className="detail-label">Observaciones</span>
                  <span className="detail-value">{showDetail.observaciones}</span>
                </div>
              )}
              {showDetail.motivo_rechazo && (
                <div className="detail-item" style={{ marginTop: 'var(--space-md)' }}>
                  <span className="detail-label">Motivo de Rechazo</span>
                  <span className="detail-value" style={{ color: 'var(--error)' }}>{showDetail.motivo_rechazo}</span>
                </div>
              )}
            </div>
            <div className="detail-section">
              <h3>Productos Solicitados</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showDetail.items?.map((item) => (
                      <tr key={item.id}>
                        <td style={{ color: 'var(--text-primary)' }}>{item.nombre_producto}</td>
                        <td>{item.cantidad_solicitada}</td>
                        <td>{item.unidad_medida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
