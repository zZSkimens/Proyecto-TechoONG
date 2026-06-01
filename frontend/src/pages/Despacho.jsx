import { useState, useEffect } from 'react';
import { getOrdenes, procesarDespacho, getComprobante } from '../services/despacho.service.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import { showToast } from '../helpers/toast.js';
import '../styles/Despacho.css';

export default function DespachoPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [despachadoPor, setDespachadoPor] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [processing, setProcessing] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [showComprobante, setShowComprobante] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    loadOrdenes();
  }, [filtroEstado]);

  async function loadOrdenes() {
    setLoading(true);
    try {
      const filtros = {};
      if (filtroEstado) filtros.estado = filtroEstado;
      const data = await getOrdenes(filtros);
      setOrdenes(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar órdenes', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDespachar() {
    if (!selected || !despachadoPor.trim()) {
      showToast('Debe indicar quién realiza el despacho', 'error');
      return;
    }
    setProcessing(true);
    try {
      const resultado = await procesarDespacho(selected.id, {
        despachado_por: despachadoPor,
        observaciones: observaciones || undefined,
      });
      showToast('Despacho procesado exitosamente. Stock actualizado.');
      setSelected(null);
      setDespachadoPor('');
      setObservaciones('');
      if (resultado?.comprobante) {
        setComprobante(resultado.comprobante);
        setShowComprobante(true);
      }
      loadOrdenes();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al procesar despacho', 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleVerComprobante(ordenId) {
    try {
      const data = await getComprobante(ordenId);
      setComprobante(data);
      setShowComprobante(true);
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al obtener comprobante', 'error');
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleString('es-CL') : '-';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Órdenes de Despacho</h1>
          <p className="page-subtitle">Preparar y confirmar despachos de alimentos — Personal de Bodega</p>
        </div>
      </div>

      <div className="filter-bar">
        <select
          className="select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="despachada">Despachada</option>
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : ordenes.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <p>No hay órdenes de despacho</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Solicitud</th>
                <th>Estado</th>
                <th>Productos</th>
                <th>Despachado por</th>
                <th>Fecha Despacho</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{orden.id}</td>
                  <td>#{orden.solicitud_id}</td>
                  <td><StatusBadge estado={orden.estado} /></td>
                  <td>{orden.items?.length || 0} ítem(s)</td>
                  <td>{orden.despachado_por || '-'}</td>
                  <td style={{ fontSize: 13 }}>{formatDate(orden.fecha_despacho)}</td>
                  <td>
                    {orden.estado === 'pendiente' ? (
                      <button className="btn btn-warning btn-sm" onClick={() => { setSelected(orden); setDespachadoPor(''); setObservaciones(''); }}>
                        Despachar
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleVerComprobante(orden.id)}>
                        Ver Comprobante
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Despachar Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Despachar Orden #${selected.id}` : ''}
        large
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cancelar</button>
            <button className="btn btn-warning" onClick={handleDespachar} disabled={processing || !despachadoPor.trim()}>
              {processing ? 'Procesando...' : 'Confirmar Despacho'}
            </button>
          </>
        }
      >
        {selected && (
          <>
            <div className="detail-section">
              <h3>Productos a Despachar</h3>
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
                    {selected.items?.map((item) => (
                      <tr key={item.id}>
                        <td style={{ color: 'var(--text-primary)' }}>{item.nombre_producto}</td>
                        <td>{item.cantidad_despachada}</td>
                        <td>{item.unidad_medida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
              <div className="form-group">
                <label className="form-label">Despachado por *</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Nombre del responsable de bodega"
                  value={despachadoPor}
                  onChange={(e) => setDespachadoPor(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="textarea"
                  placeholder="Notas adicionales del despacho (opcional)"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>
            </div>

            <div className="stock-warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Al confirmar, el sistema descontará las cantidades del inventario automáticamente.
            </div>
          </>
        )}
      </Modal>

      {/* Comprobante Modal */}
      <Modal
        isOpen={showComprobante}
        onClose={() => { setShowComprobante(false); setComprobante(null); }}
        title="Comprobante de Despacho"
        large
      >
        {comprobante?.comprobante_despacho && (
          <div className="comprobante">
            <div className="comprobante-header">
              <h3>✓ Comprobante Digital</h3>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Orden #{comprobante.comprobante_despacho.numero_orden}
              </span>
            </div>
            <div className="comprobante-body">
              <div className="detail-item">
                <span className="detail-label">Nº Solicitud</span>
                <span className="detail-value">#{comprobante.comprobante_despacho.numero_solicitud}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha Despacho</span>
                <span className="detail-value">{formatDate(comprobante.comprobante_despacho.fecha_despacho)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Despachado por</span>
                <span className="detail-value">{comprobante.comprobante_despacho.despachado_por}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Destino</span>
                <span className="detail-value">{comprobante.comprobante_despacho.destino}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Actividad</span>
                <span className="detail-value">{comprobante.comprobante_despacho.actividad}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Responsable Recepción</span>
                <span className="detail-value">{comprobante.comprobante_despacho.responsable_recepcion}</span>
              </div>
            </div>
            <div className="comprobante-items">
              <h4 style={{ marginBottom: 'var(--space-sm)', fontSize: 14, color: 'var(--text-muted)' }}>DETALLE DE PRODUCTOS</h4>
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
                    {comprobante.comprobante_despacho.items?.map((item, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-primary)' }}>{item.producto}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.unidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {comprobante.comprobante_despacho.observaciones && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <span className="detail-label">Observaciones: </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{comprobante.comprobante_despacho.observaciones}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
