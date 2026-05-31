import { useState, useEffect } from 'react';
import { getProductos, crearProducto, actualizarProducto, eliminarProducto, getMovimientos } from '../services/productos.service.js';
import Modal from '../components/Modal.jsx';
import { showToast } from '../helpers/toast.js';
import '../styles/Inventario.css';

export default function InventarioPage() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('productos');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    unidad_medida: '',
    stock_actual: 0,
    stock_minimo: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prods, movs] = await Promise.all([
        getProductos(),
        getMovimientos(),
      ]);
      setProductos(Array.isArray(prods) ? prods : []);
      setMovimientos(Array.isArray(movs) ? movs : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar inventario', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setFormData({ nombre: '', descripcion: '', unidad_medida: '', stock_actual: 0, stock_minimo: 0 });
    setShowForm(true);
  }

  function openEdit(producto) {
    setEditing(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      unidad_medida: producto.unidad_medida,
      stock_actual: producto.stock_actual,
      stock_minimo: producto.stock_minimo,
    });
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!formData.nombre.trim() || !formData.unidad_medida.trim()) {
      showToast('Nombre y unidad de medida son obligatorios', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await actualizarProducto(editing.id, {
          ...formData,
          stock_actual: parseInt(formData.stock_actual),
          stock_minimo: parseInt(formData.stock_minimo),
        });
        showToast('Producto actualizado exitosamente');
      } else {
        await crearProducto({
          ...formData,
          stock_actual: parseInt(formData.stock_actual),
          stock_minimo: parseInt(formData.stock_minimo),
        });
        showToast('Producto creado exitosamente');
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al guardar producto', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Está seguro de desactivar este producto?')) return;
    try {
      await eliminarProducto(id);
      showToast('Producto desactivado');
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al eliminar', 'error');
    }
  }

  const getStockColor = (producto) => {
    if (producto.stock_actual <= 0) return 'var(--error)';
    if (producto.stock_actual <= producto.stock_minimo) return 'var(--warning)';
    return 'var(--success)';
  };

  const getStockPercent = (producto) => {
    if (producto.stock_minimo === 0) return 100;
    const ratio = (producto.stock_actual / (producto.stock_minimo * 3)) * 100;
    return Math.min(ratio, 100);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('es-CL') : '-';

  const productoMap = {};
  productos.forEach((p) => { productoMap[p.id] = p.nombre; });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario de Productos</h1>
          <p className="page-subtitle">Gestionar productos y stock de alimentos</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <div className="view-toggle">
            <button
              className={`btn ${view === 'productos' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              onClick={() => setView('productos')}
            >
              Productos
            </button>
            <button
              className={`btn ${view === 'movimientos' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              onClick={() => setView('movimientos')}
            >
              Movimientos
            </button>
          </div>
          {view === 'productos' && (
            <button className="btn btn-primary" onClick={openNew}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : view === 'productos' ? (
        productos.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <p>No hay productos en el inventario</p>
          </div>
        ) : (
          <div className="inventario-grid">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className={`producto-card${producto.stock_actual <= producto.stock_minimo ? ' low-stock' : ''}`}
                onClick={() => openEdit(producto)}
              >
                <span className="producto-name">{producto.nombre}</span>
                {producto.descripcion && <span className="producto-desc">{producto.descripcion}</span>}
                <div className="producto-stock">
                  <div>
                    <span className="stock-number" style={{ color: getStockColor(producto) }}>
                      {producto.stock_actual}
                    </span>
                    <span className="stock-unit"> {producto.unidad_medida}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Mín: {producto.stock_minimo}
                  </span>
                </div>
                <div className="stock-bar">
                  <div
                    className="stock-bar-fill"
                    style={{
                      width: `${getStockPercent(producto)}%`,
                      background: getStockColor(producto),
                    }}
                  />
                </div>
                <div className="producto-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(producto)}>
                    Editar
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleDelete(producto.id)}>
                    Desactivar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Movimientos view */
        movimientos.length === 0 ? (
          <div className="empty-state">
            <p>No hay movimientos de inventario registrados</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Stock Ant.</th>
                  <th>Stock Post.</th>
                  <th>Descripción</th>
                  <th>Realizado por</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr key={mov.id}>
                    <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{formatDate(mov.created_at)}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{productoMap[mov.producto_id] || `#${mov.producto_id}`}</td>
                    <td>
                      <span className={`movimiento-tipo ${mov.tipo}`}>
                        {mov.tipo === 'entrada' ? '↑' : mov.tipo === 'salida' ? '↓' : '↔'} {mov.tipo}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{mov.cantidad}</td>
                    <td>{mov.stock_anterior}</td>
                    <td>{mov.stock_posterior}</td>
                    <td style={{ fontSize: 13, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {mov.descripcion || '-'}
                    </td>
                    <td>{mov.realizado_por || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Product Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? `Editar: ${editing.nombre}` : 'Nuevo Producto'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Producto'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input
              className="input"
              type="text"
              placeholder="Ej: Arroz, Aceite, Pan"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="textarea"
              placeholder="Descripción del producto (opcional)"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Unidad de Medida *</label>
              <select
                className="select"
                value={formData.unidad_medida}
                onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
              >
                <option value="">Seleccionar</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="unidad">Unidades</option>
                <option value="litro">Litros</option>
                <option value="caja">Cajas</option>
                <option value="paquete">Paquetes</option>
                <option value="bolsa">Bolsas</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stock Actual</label>
              <input
                className="input"
                type="number"
                min="0"
                value={formData.stock_actual}
                onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group" style={{ maxWidth: '50%' }}>
            <label className="form-label">Stock Mínimo</label>
            <input
              className="input"
              type="number"
              min="0"
              value={formData.stock_minimo}
              onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
