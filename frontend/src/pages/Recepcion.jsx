import { useState, useEffect } from 'react';
import { getOrdenes } from '../services/despacho.service.js';
import { confirmarRecepcion, getRecepciones } from '../services/recepciones.service.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import { showToast } from '../helpers/toast.js';
import '../styles/Recepcion.css';

export default function RecepcionPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [recepciones, setRecepciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [recibidoPor, setRecibidoPor] = useState('');
  const [obsGenerales, setObsGenerales] = useState('');
  const [itemsRecepcion, setItemsRecepcion] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [tab, setTab] = useState('pendientes');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [ords, recs] = await Promise.all([
        getOrdenes({ estado: 'despachada' }),
        getRecepciones(),
      ]);
      setOrdenes(Array.isArray(ords) ? ords : []);
      setRecepciones(Array.isArray(recs) ? recs : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }

  const ordenesSinRecepcion = ordenes.filter(
    (o) => !recepciones.some((r) => r.orden_despacho_id === o.id)
  );

  function handleSelectOrden(orden) {
    setSelected(orden);
    setRecibidoPor('');
    setObsGenerales('');
    setItemsRecepcion(
      (orden.items || []).map((item) => ({
        producto_id: item.producto_id,
        nombre_producto: item.nombre_producto,
        cantidad_esperada: item.cantidad_despachada,
        cantidad_recibida: item.cantidad_despachada,
        estado_producto: 'bueno',
        observaciones: '',
      }))
    );
  }

  function updateItemRecepcion(index, field, value) {
    setItemsRecepcion((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  async function handleConfirmar() {
    if (!recibidoPor.trim()) {
      showToast('Debe indicar quién recibe la entrega', 'error');
      return;
    }
    setProcessing(true);
    try {
      await confirmarRecepcion({
        orden_despacho_id: selected.id,
        recibido_por: recibidoPor,
        observaciones_generales: obsGenerales || undefined,
        items: itemsRecepcion.map((item) => ({
          producto_id: item.producto_id,
          cantidad_recibida: parseInt(item.cantidad_recibida),
          estado_producto: item.estado_producto,
          observaciones: item.observaciones || undefined,
        })),
      });
      showToast('Recepción confirmada exitosamente. Proceso finalizado.');
      setSelected(null);
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al confirmar recepción', 'error');
    } finally {
      setProcessing(false);
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleString('es-CL') : '-';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Confirmación de Recepción</h1>
          <p className="page-subtitle">Registrar la recepción de alimentos — Jefe de Cuadrilla</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-bar">
        <button
          className={`btn ${tab === 'pendientes' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => setTab('pendientes')}
        >
          Pendientes ({ordenesSinRecepcion.length})
        </button>
        <button
          className={`btn ${tab === 'historial' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => setTab('historial')}
        >
          Historial ({recepciones.length})
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : tab === 'pendientes' ? (
        ordenesSinRecepcion.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <p>No hay entregas pendientes de confirmación</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Solicitud</th>
                  <th>Productos</th>
                  <th>Despachado por</th>
                  <th>Fecha Despacho</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ordenesSinRecepcion.map((orden) => (
                  <tr key={orden.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{orden.id}</td>
                    <td>#{orden.solicitud_id}</td>
                    <td>{orden.items?.length || 0} ítem(s)</td>
                    <td>{orden.despachado_por}</td>
                    <td style={{ fontSize: 13 }}>{formatDate(orden.fecha_despacho)}</td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => handleSelectOrden(orden)}>
                        Confirmar Recepción
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        recepciones.length === 0 ? (
          <div className="empty-state">
            <p>No hay recepciones registradas</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Orden</th>
                  <th>Solicitud</th>
                  <th>Recibido por</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recepciones.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{rec.id}</td>
                    <td>#{rec.orden_despacho_id}</td>
                    <td>#{rec.solicitud_id}</td>
                    <td>{rec.recibido_por}</td>
                    <td><StatusBadge estado={rec.estado_general} /></td>
                    <td style={{ fontSize: 13 }}>{formatDate(rec.fecha_recepcion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Confirm Reception Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Confirmar Recepción — Orden #${selected.id}` : ''}
        large
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cancelar</button>
            <button className="btn btn-success" onClick={handleConfirmar} disabled={processing || !recibidoPor.trim()}>
              {processing ? 'Procesando...' : 'Confirmar Recepción'}
            </button>
          </>
        }
      >
        {selected && (
          <>
            <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
              <label className="form-label">Recibido por *</label>
              <input
                className="input"
                type="text"
                placeholder="Nombre del Jefe de Cuadrilla o responsable"
                value={recibidoPor}
                onChange={(e) => setRecibidoPor(e.target.value)}
              />
            </div>

            <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Detalle de Productos Recibidos
            </h3>

            {itemsRecepcion.map((item, index) => (
              <div className="recepcion-item-card" key={index}>
                <h4>{item.nombre_producto} — Esperado: {item.cantidad_esperada}</h4>
                <div className="recepcion-item-fields">
                  <div className="form-group">
                    <label className="form-label">Cantidad Recibida</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={item.cantidad_recibida}
                      onChange={(e) => updateItemRecepcion(index, 'cantidad_recibida', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select
                      className="select"
                      value={item.estado_producto}
                      onChange={(e) => updateItemRecepcion(index, 'estado_producto', e.target.value)}
                    >
                      <option value="bueno">Bueno</option>
                      <option value="dañado">Dañado</option>
                      <option value="faltante">Faltante</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Observaciones</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="Detalle (opcional)"
                      value={item.observaciones}
                      onChange={(e) => updateItemRecepcion(index, 'observaciones', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
              <label className="form-label">Observaciones Generales</label>
              <textarea
                className="textarea"
                placeholder="Comentarios generales sobre la entrega (opcional)"
                value={obsGenerales}
                onChange={(e) => setObsGenerales(e.target.value)}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
