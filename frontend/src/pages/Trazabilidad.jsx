import { useState } from 'react';
import { getTrazabilidad } from '../services/recepciones.service.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { showToast } from '../helpers/toast.js';
import '../styles/Trazabilidad.css';

export default function TrazabilidadPage() {
  const [solicitudId, setSolicitudId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleBuscar(e) {
    e.preventDefault();
    if (!solicitudId.trim()) {
      showToast('Ingrese el ID de la solicitud', 'error');
      return;
    }
    setLoading(true);
    setData(null);
    try {
      const result = await getTrazabilidad(solicitudId);
      setData(result);
    } catch (err) {
      showToast(err.data?.message || err.message || 'Solicitud no encontrada', 'error');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleString('es-CL') : '-';

  const getStepStatus = (stepData) => {
    if (stepData) return 'completed';
    return '';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trazabilidad</h1>
          <p className="page-subtitle">Seguimiento completo del flujo de una solicitud de alimentos</p>
        </div>
      </div>

      <form className="trazabilidad-search" onSubmit={handleBuscar}>
        <input
          className="input"
          type="number"
          min="1"
          placeholder="ID de la solicitud (ej: 1)"
          value={solicitudId}
          onChange={(e) => setSolicitudId(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {loading && <div className="loading"><div className="spinner" /></div>}

      {data && (
        <>
          {/* Flow status badge */}
          <div className={`flujo-badge ${data.flujo_completo ? 'completo' : 'en-proceso'}`}>
            {data.flujo_completo ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Flujo Completo
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                En Proceso — Estado: {data.estado_actual}
              </>
            )}
          </div>

          {/* Timeline */}
          <div className="timeline">
            {/* Step 1: Solicitud */}
            <div className="timeline-step">
              <div className={`timeline-dot ${data.solicitud ? 'completed' : ''}`} />
              <div className="timeline-content">
                <div className="timeline-title">
                  Solicitud Creada
                  <StatusBadge estado={data.solicitud?.estado} />
                </div>
                <div className="timeline-date">{formatDate(data.solicitud?.created_at)}</div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Solicitante</span>
                    <span className="detail-value">{data.solicitud?.nombre_solicitante}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Actividad</span>
                    <span className="detail-value">{data.solicitud?.actividad}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Destino</span>
                    <span className="detail-value">{data.solicitud?.destino}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha Entrega</span>
                    <span className="detail-value">{formatDate(data.solicitud?.fecha_entrega)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Responsable Recepción</span>
                    <span className="detail-value">{data.solicitud?.responsable_recepcion}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Aprobación */}
            <div className="timeline-step">
              <div className={`timeline-dot ${data.solicitud?.fecha_aprobacion ? 'completed' : ''}`} />
              <div className={`timeline-content${!data.solicitud?.fecha_aprobacion ? ' inactive' : ''}`}>
                <div className="timeline-title">Aprobación</div>
                {data.solicitud?.fecha_aprobacion ? (
                  <>
                    <div className="timeline-date">{formatDate(data.solicitud.fecha_aprobacion)}</div>
                    <div className="detail-item">
                      <span className="detail-label">Aprobado por (ID)</span>
                      <span className="detail-value">{data.solicitud.aprobado_por}</span>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: 14 }}>Pendiente de aprobación</p>
                )}
                {data.solicitud?.motivo_rechazo && (
                  <div className="detail-item" style={{ marginTop: 'var(--space-sm)' }}>
                    <span className="detail-label">Motivo de Rechazo</span>
                    <span className="detail-value" style={{ color: 'var(--error)' }}>{data.solicitud.motivo_rechazo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Despacho */}
            <div className="timeline-step">
              <div className={`timeline-dot ${data.orden_despacho?.fecha_despacho ? 'completed' : getStepStatus(data.orden_despacho) === 'completed' ? 'active' : ''}`} />
              <div className={`timeline-content${!data.orden_despacho ? ' inactive' : ''}`}>
                <div className="timeline-title">Despacho
                  {data.orden_despacho && <StatusBadge estado={data.orden_despacho.estado} />}
                </div>
                {data.orden_despacho ? (
                  <>
                    {data.orden_despacho.fecha_despacho && (
                      <div className="timeline-date">{formatDate(data.orden_despacho.fecha_despacho)}</div>
                    )}
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Orden Nº</span>
                        <span className="detail-value">#{data.orden_despacho.id}</span>
                      </div>
                      {data.orden_despacho.despachado_por && (
                        <div className="detail-item">
                          <span className="detail-label">Despachado por</span>
                          <span className="detail-value">{data.orden_despacho.despachado_por}</span>
                        </div>
                      )}
                    </div>
                    {data.orden_despacho.items?.length > 0 && (
                      <div style={{ marginTop: 'var(--space-md)' }}>
                        <div className="table-container">
                          <table className="table">
                            <thead>
                              <tr><th>Producto</th><th>Cantidad</th><th>Unidad</th></tr>
                            </thead>
                            <tbody>
                              {data.orden_despacho.items.map((item, i) => (
                                <tr key={i}>
                                  <td style={{ color: 'var(--text-primary)' }}>{item.nombre_producto}</td>
                                  <td>{item.cantidad_despachada}</td>
                                  <td>{item.unidad_medida}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: 14 }}>Pendiente de generación de orden</p>
                )}
              </div>
            </div>

            {/* Step 4: Recepción */}
            <div className="timeline-step">
              <div className={`timeline-dot ${data.recepcion ? 'completed' : ''}`} />
              <div className={`timeline-content${!data.recepcion ? ' inactive' : ''}`}>
                <div className="timeline-title">
                  Recepción
                  {data.recepcion && <StatusBadge estado={data.recepcion.estado_general} />}
                </div>
                {data.recepcion ? (
                  <>
                    <div className="timeline-date">{formatDate(data.recepcion.fecha_recepcion)}</div>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Recibido por</span>
                        <span className="detail-value">{data.recepcion.recibido_por}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Estado General</span>
                        <span className="detail-value"><StatusBadge estado={data.recepcion.estado_general} /></span>
                      </div>
                    </div>
                    {data.recepcion.items?.length > 0 && (
                      <div style={{ marginTop: 'var(--space-md)' }}>
                        <div className="table-container">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Producto</th>
                                <th>Esperado</th>
                                <th>Recibido</th>
                                <th>Estado</th>
                                <th>Obs.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.recepcion.items.map((item, i) => (
                                <tr key={i}>
                                  <td style={{ color: 'var(--text-primary)' }}>{item.nombre_producto}</td>
                                  <td>{item.cantidad_esperada}</td>
                                  <td style={{
                                    color: item.cantidad_recibida < item.cantidad_esperada ? 'var(--warning)' : 'var(--text-secondary)',
                                    fontWeight: item.cantidad_recibida < item.cantidad_esperada ? 600 : 400,
                                  }}>
                                    {item.cantidad_recibida}
                                  </td>
                                  <td><StatusBadge estado={item.estado_producto} /></td>
                                  <td style={{ fontSize: 13 }}>{item.observaciones || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {data.recepcion.observaciones_generales && (
                      <div className="detail-item" style={{ marginTop: 'var(--space-md)' }}>
                        <span className="detail-label">Observaciones Generales</span>
                        <span className="detail-value">{data.recepcion.observaciones_generales}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: 14 }}>Pendiente de confirmación de recepción</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
