import { useState, useEffect } from 'react';
import { getDespachosCuadrilla, crearDespachoHerramientas } from '../services/despachoHerramientas.service.js';
import { getCuadrillas } from '../services/cuadrillas.service.js';
import { getItems } from '../services/items.service.js';
import Modal from '../components/Modal.jsx';
import { showToast } from '../helpers/toast.js';

export default function DespachoHerramientasPage() {
  const [despachos, setDespachos] = useState([]);
  const [cuadrillas, setCuadrillas] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cuadrillaId: '',
    items: [{ itemId: '', cantidad: '' }],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [despData, cuadData, itemData] = await Promise.all([
        getDespachosCuadrilla(),
        getCuadrillas(),
        getItems(),
      ]);
      setDespachos(Array.isArray(despData) ? despData : []);
      setCuadrillas(Array.isArray(cuadData) ? cuadData : []);
      setItems(Array.isArray(itemData) ? itemData : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { itemId: '', cantidad: '' }],
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
    if (!formData.cuadrillaId) {
      showToast('Debe seleccionar una cuadrilla', 'error');
      return;
    }
    for (const item of formData.items) {
      if (!item.itemId || !item.cantidad || parseInt(item.cantidad) <= 0) {
        showToast('Todos los items deben tener un producto seleccionado y una cantidad válida', 'error');
        return;
      }
    }
    setSubmitting(true);
    try {
      await crearDespachoHerramientas(
        parseInt(formData.cuadrillaId),
        formData.items.map((item) => ({
          itemId: parseInt(item.itemId),
          cantidad: parseInt(item.cantidad),
        }))
      );
      showToast('Despacho realizado exitosamente');
      setShowNew(false);
      setFormData({ cuadrillaId: '', items: [{ itemId: '', cantidad: '' }] });
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al crear despacho', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const stats = {
    total: despachos.length,
    pendientes: despachos.filter((d) => d.estado === 'Pendiente').length,
    devueltos: despachos.filter((d) => d.estado === 'Devuelto').length,
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CL') : '-';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Despacho Herramientas</h1>
          <p className="page-subtitle">Despachar herramientas y materiales a las cuadrillas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Despacho
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
          <span className="stat-value" style={{ color: 'var(--success)' }}>{stats.devueltos}</span>
          <span className="stat-label">Devueltos</span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : despachos.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <p>No hay despachos registrados</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cuadrilla</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {despachos.map((d) => (
                <tr key={d.id} className="clickable" onClick={() => setShowDetail(d)}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{d.id}</td>
                  <td>{d.cuadrilla?.name || `Cuadrilla #${d.cuadrilla?.id || '-'}`}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: d.estado === 'Pendiente' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: d.estado === 'Pendiente' ? 'var(--warning)' : 'var(--success)',
                    }}>
                      {d.estado}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(d.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Despacho Modal */}
      <Modal
        isOpen={showNew}
        onClose={() => setShowNew(false)}
        title="Nuevo Despacho de Herramientas"
        large
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancelar</button>
            <button type="submit" form="despacho-herr-form" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Despachando...' : 'Realizar Despacho'}
            </button>
          </>
        }
      >
        <form id="despacho-herr-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Cuadrilla *</label>
            <select
              className="select"
              value={formData.cuadrillaId}
              onChange={(e) => setFormData({ ...formData, cuadrillaId: e.target.value })}
              required
            >
              <option value="">Seleccionar cuadrilla</option>
              {cuadrillas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.encargado}
                </option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div className="items-header">
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Items a Despachar</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
              + Agregar item
            </button>
          </div>
          <div className="items-list">
            {formData.items.map((item, index) => (
              <div className="item-row" key={index}>
                <div className="form-group">
                  <label className="form-label">Producto</label>
                  <select
                    className="select"
                    value={item.itemId}
                    onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} ({it.category}) — Stock: {it.stock}
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
                    value={item.cantidad}
                    onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeItem(index)}
                  title="Eliminar item"
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
        title={showDetail ? `Despacho #${showDetail.id}` : ''}
      >
        {showDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Cuadrilla</span>
                <span className="detail-value">{showDetail.cuadrilla?.name || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado</span>
                <span className="detail-value" style={{
                  color: showDetail.estado === 'Pendiente' ? 'var(--warning)' : 'var(--success)',
                  fontWeight: 600
                }}>
                  {showDetail.estado}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha</span>
                <span className="detail-value">{formatDate(showDetail.created_at)}</span>
              </div>
            </div>
            {showDetail.items && showDetail.items.length > 0 && (
              <div className="detail-section">
                <h3>Items Despachados</h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showDetail.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ color: 'var(--text-primary)' }}>{item.name}</td>
                          <td>{item.category}</td>
                          <td>{item.cantidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
