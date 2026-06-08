import React, { useState, useEffect } from 'react';
import { getActasDevolucion, procesarActaDevolucion } from '../services/actaDevolucion.service.js';
import { getUser } from '../services/auth.service.js';
import Modal from '../components/Modal.jsx';
import { showToast } from '../helpers/toast.js';

export default function ActaDevolucionPage() {
  const [actas, setActas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProcesar, setShowProcesar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedActa, setSelectedActa] = useState(null);
  
  // Estado para la revisión de items: { actaItemId: 'Disponible' | 'Dañada' }
  const [revisiones, setRevisiones] = useState({});

  const user = getUser();
  const isAdminBodega = user?.role === 'admin_bodega' || user?.role === 'administrador';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getActasDevolucion();
      setActas(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar actas', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openProcesarModal(acta) {
    setSelectedActa(acta);
    
    // Inicializar revisiones
    const initialRev = {};
    if (acta.items_devueltos) {
      acta.items_devueltos.forEach(item => {
        // Por defecto, todo a Disponible
        initialRev[item.id] = 'Disponible';
      });
    }
    setRevisiones(initialRev);
    setShowProcesar(true);
  }

  function handleRevisionChange(actaItemId, estado) {
    setRevisiones(prev => ({ ...prev, [actaItemId]: estado }));
  }

  async function handleProcesar(e) {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const itemsPayload = Object.entries(revisiones).map(([actaItemId, estado]) => ({
        actaItemId: parseInt(actaItemId),
        estado
      }));

      await procesarActaDevolucion(selectedActa.id, itemsPayload);
      
      showToast('Acta procesada exitosamente. Los items disponibles regresaron al inventario.');
      setShowProcesar(false);
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al procesar acta', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Actas de Devolución</h1>
          <p className="page-subtitle">Revisar items devueltos por cuadrillas disueltas</p>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : actas.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p>No hay actas de devolución registradas</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cuadrilla</th>
                <th>Encargado</th>
                <th>Días Trab.</th>
                <th>Estado</th>
                <th>Fecha Creada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actas.map((acta) => (
                <tr key={acta.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{acta.id}</td>
                  <td style={{ fontWeight: 500 }}>{acta.cuadrilla_nombre || 'N/A'}</td>
                  <td>{acta.encargado || 'N/A'}</td>
                  <td>{acta.dias_trabajados || '-'}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: acta.estado === 'Pendiente' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: acta.estado === 'Pendiente' ? 'var(--warning)' : 'var(--success)',
                    }}>
                      {acta.estado}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(acta.created_at)}</td>
                  <td>
                    {acta.estado === 'Pendiente' ? (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => openProcesarModal(acta)}
                        disabled={!isAdminBodega}
                        title={!isAdminBodega ? 'Solo Bodega puede procesar actas' : 'Procesar acta'}
                      >
                        Revisar y Procesar
                      </button>
                    ) : (
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setSelectedActa(acta);
                          setShowProcesar(true);
                        }}
                      >
                        Ver Detalle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Procesar / Ver Detalle Acta */}
      <Modal
        isOpen={showProcesar}
        onClose={() => {
          setShowProcesar(false);
          setSelectedActa(null);
        }}
        title={`Acta de Devolución #${selectedActa?.id}`}
        large
        footer={
          selectedActa?.estado === 'Pendiente' && isAdminBodega ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setShowProcesar(false)}>Cancelar</button>
              <button type="button" onClick={handleProcesar} className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Procesando...' : 'Confirmar Devolución al Inventario'}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={() => setShowProcesar(false)}>Cerrar</button>
          )
        }
      >
        {selectedActa && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 'var(--space-md)',
            }}>
              <div style={{ background: 'var(--bg-surface)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cuadrilla</span>
                <p style={{ fontWeight: 600, marginTop: 4 }}>{selectedActa.cuadrilla_nombre}</p>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Encargado</span>
                <p style={{ fontWeight: 600, marginTop: 4 }}>{selectedActa.encargado}</p>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Días Trabajados</span>
                <p style={{ fontWeight: 600, marginTop: 4 }}>{selectedActa.dias_trabajados}</p>
              </div>
            </div>

            {selectedActa.estado === 'Pendiente' && isAdminBodega && (
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}>
                <p style={{ color: 'var(--info)', fontSize: 14, fontWeight: 500 }}>
                  Por favor, revisa el estado de cada ítem sobrante. Los ítems marcados como <strong>"Disponible"</strong> volverán a sumar stock en el inventario. Las herramientas marcadas como <strong>"Dañada"</strong> se darán de baja automáticamente.
                </p>
              </div>
            )}

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Categoría</th>
                    <th>Cantidad Sobrante</th>
                    <th>Estado de Revisión</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedActa.items_devueltos?.map((item) => {
                    const isPendiente = selectedActa.estado === 'Pendiente' && isAdminBodega;
                    
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.nombre}</td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: 11,
                            fontWeight: 600,
                            background: item.categoria === 'Herramienta' ? 'var(--info-subtle)' : 'rgba(139, 92, 246, 0.12)',
                            color: item.categoria === 'Herramienta' ? 'var(--info)' : '#a78bfa',
                          }}>
                            {item.categoria}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{item.cantidad}</td>
                        <td>
                          {isPendiente ? (
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={`rev_${item.id}`}
                                  value="Disponible"
                                  checked={revisiones[item.id] === 'Disponible'}
                                  onChange={(e) => handleRevisionChange(item.id, e.target.value)}
                                />
                                <span style={{ color: 'var(--success)', fontWeight: 500, fontSize: 14 }}>Disponible</span>
                              </label>
                              
                              {item.categoria === 'Herramienta' && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginLeft: 16 }}>
                                  <input
                                    type="radio"
                                    name={`rev_${item.id}`}
                                    value="Dañada"
                                    checked={revisiones[item.id] === 'Dañada'}
                                    onChange={(e) => handleRevisionChange(item.id, e.target.value)}
                                  />
                                  <span style={{ color: 'var(--error)', fontWeight: 500, fontSize: 14 }}>Dañada</span>
                                </label>
                              )}
                            </div>
                          ) : (
                            <span style={{
                              fontWeight: 600,
                              color: item.estado === 'Disponible' ? 'var(--success)' : (item.estado === 'Dañada' ? 'var(--error)' : 'var(--warning)')
                            }}>
                              {item.estado}
                              {item.estado === 'Disponible' && ' (Regresó a stock)'}
                              {item.estado === 'Dañada' && ' (Dada de baja)'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
