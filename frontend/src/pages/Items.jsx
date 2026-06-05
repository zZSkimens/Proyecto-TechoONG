import { useState, useEffect } from 'react';
import { getItems, crearItem } from '../services/items.service.js';
import Modal from '../components/Modal.jsx';
import { showToast } from '../helpers/toast.js';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      showToast('Nombre y categoría son requeridos', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await crearItem({
        ...formData,
        stock: parseInt(formData.stock) || 0,
      });
      showToast('Producto añadido exitosamente');
      setShowNew(false);
      setFormData({ name: '', category: '', stock: 0 });
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al añadir producto', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const filteredItems = filtroCategoria
    ? items.filter((item) => item.category === filtroCategoria)
    : items;

  const stats = {
    total: items.length,
    herramientas: items.filter((i) => i.category === 'Herramienta').length,
    materiales: items.filter((i) => i.category === 'Material').length,
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CL') : '-';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Añadir Productos</h1>
          <p className="page-subtitle">Gestionar herramientas y materiales del inventario</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Producto
        </button>
      </div>

      {/* Stats */}
      <div className="solicitudes-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--info)' }}>{stats.herramientas}</span>
          <span className="stat-label">Herramientas</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--warning)' }}>{stats.materiales}</span>
          <span className="stat-label">Materiales</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="select"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          <option value="Herramienta">Herramienta</option>
          <option value="Material">Material</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <p>No hay productos registrados</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: item.category === 'Herramienta' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: item.category === 'Herramienta' ? 'var(--info)' : 'var(--warning)',
                    }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.stock}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Item Modal */}
      <Modal
        isOpen={showNew}
        onClose={() => setShowNew(false)}
        title="Nuevo Producto"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancelar</button>
            <button type="submit" form="item-form" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Añadiendo...' : 'Añadir Producto'}
            </button>
          </>
        }
      >
        <form id="item-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Nombre del Producto *</label>
            <input
              className="input"
              type="text"
              placeholder="Ej: Martillo, Clavos, Cemento"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select
                className="select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="Herramienta">Herramienta</option>
                <option value="Material">Material</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stock Inicial</label>
              <input
                className="input"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
