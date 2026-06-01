import { useState, useEffect } from 'react';
import { getSolicitudes, aprobarSolicitud, rechazarSolicitud } from '../services/solicitudes.service.js';
import { getUser } from '../services/auth.service.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import { showToast } from '../helpers/toast.js';
import '../styles/Aprobacion.css';

export default function AprobacionPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showRechazo, setShowRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [processing, setProcessing] = useState(false);
  const user = getUser();

  useEffect(() => {
    loadSolicitudes();
  }, []);

  async function loadSolicitudes() {
    setLoading(true);
    try {
      const data = await getSolicitudes({ estado: 'pendiente' });
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar solicitudes', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAprobar() {
    if (!selected) return;
    setProcessing(true);
    try {
      await aprobarSolicitud(selected.id, { aprobado_por: user?.id || 1 });
      showToast('Solicitud aprobada exitosamente. Orden de despacho generada.');
      setSelected(null);
      loadSolicitudes();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Error al aprobar';
      showToast(msg, 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleRechazar() {
    if (!selected || !motivoRechazo.trim()) {
      showToast('Debe indicar el motivo del rechazo', 'error');
      return;
    }
    setProcessing(true);
    try {
      await rechazarSolicitud(selected.id, {
        motivo_rechazo: motivoRechazo,
        aprobado_por: user?.id || null,
      });
      showToast('Solicitud rechazada');
      setSelected(null);
      setShowRechazo(false);
      setMotivoRechazo('');
      loadSolicitudes();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al rechazar', 'error');
    } finally {
      setProcessing(false);
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CL') : '-';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Aprobación de Solicitudes</h1>
          <p className="page-subtitle">Revisar y aprobar solicitudes pendientes — Encargado de Alimentación</p>
        </div>
        <span className="badge badge-pendiente" style={{ fontSize: 14, padding: '6px 16px' }}>
          {solicitudes.length} pendiente{solicitudes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : solicitudes.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
          </svg>
          <p>No hay solicitudes pendientes de aprobación</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Solicitante</th>
                <th>Actividad</th>
                <th>Destino</th>
                <th>Fecha Entrega</th>
                <th>Productos</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => (
                <tr key={sol.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{sol.id}</td>
                  <td>{sol.nombre_solicitante}</td>
                  <td>{sol.actividad}</td>
                  <td>{sol.destino}</td>
                  <td>{formatDate(sol.fecha_entrega)}</td>
                  <td>{sol.items?.length || 0} ítem(s)</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => { setSelected(sol); setShowRechazo(false); setMotivoRechazo(''); }}>
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Revisar Solicitud #${selected.id}` : ''}
        large
        footer={
          !showRechazo ? (
            <>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cerrar</button>
              <button className="btn btn-danger btn-sm" onClick={() => setShowRechazo(true)} disabled={processing}>
                Rechazar
              </button>
              <button className="btn btn-success" onClick={handleAprobar} disabled={processing}>
                {processing ? 'Procesando...' : 'Aprobar Solicitud'}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => setShowRechazo(false)} disabled={processing}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleRechazar} disabled={processing || !motivoRechazo.trim()}>
                {processing ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
            </>
          )
        }
      >
        {selected && (
          <>
            <div className="detail-section">
              <h3>Información de la Solicitud</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Solicitante</span>
                  <span className="detail-value">{selected.nombre_solicitante}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Actividad</span>
                  <span className="detail-value">{selected.actividad}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Destino</span>
                  <span className="detail-value">{selected.destino}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha de Entrega</span>
                  <span className="detail-value">{formatDate(selected.fecha_entrega)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Responsable Recepción</span>
                  <span className="detail-value">{selected.responsable_recepcion}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Creada</span>
                  <span className="detail-value">{formatDate(selected.created_at)}</span>
                </div>
              </div>
              {selected.observaciones && (
                <div className="detail-item" style={{ marginTop: 'var(--space-md)' }}>
                  <span className="detail-label">Observaciones</span>
                  <span className="detail-value">{selected.observaciones}</span>
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
                    {selected.items?.map((item) => (
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

            {showRechazo && (
              <div className="rechazo-form">
                <label className="form-label" style={{ color: '#fca5a5' }}>Motivo del Rechazo *</label>
                <textarea
                  className="textarea"
                  placeholder="Indique el motivo por el cual se rechaza esta solicitud..."
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  style={{ background: 'var(--bg-base)' }}
                />
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
