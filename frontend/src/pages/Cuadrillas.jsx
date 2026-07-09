import React, { useState, useEffect } from 'react';
import { getCuadrillas, crearCuadrilla, disolverCuadrilla as apiDisolverCuadrilla } from '../services/cuadrillas.service.js';
import { getDespachosByCuadrilla } from '../services/despachoHerramientas.service.js';
import { crearActaDevolucion } from '../services/actaDevolucion.service.js';
import { getObras } from '../services/obra.service.js';
import Modal from '../components/Modal.jsx';
import { showToast } from '../helpers/toast.js';

export default function CuadrillasPage() {
  const [cuadrillas, setCuadrillas] = useState([]);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [despachosMap, setDespachosMap] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    obra_id: '',
    modo_emergencia: false,
    max_voluntarios: 6,
    fecha: '',
  });

  const [showDisolver, setShowDisolver] = useState(false);
  const [disolverCuadrilla, setDisolverCuadrilla] = useState(null);
  const [disolverStep, setDisolverStep] = useState(1); // 1=días, 2=items usados, 3=resumen
  const [diasTrabajados, setDiasTrabajados] = useState(1);
  const [itemsUsados, setItemsUsados] = useState({}); // { despachoId_itemId: cantidadUsada }
  const [dissolving, setDissolving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [data, obrasData] = await Promise.all([
        getCuadrillas(),
        getObras().catch(() => [])
      ]);
      setCuadrillas(Array.isArray(data) ? data : []);
      setObras(Array.isArray(obrasData) ? obrasData : []);

      const despachos = {};
      for (const cuadrilla of Array.isArray(data) ? data : []) {
        try {
          const despData = await getDespachosByCuadrilla(cuadrilla.id);
          despachos[cuadrilla.id] = Array.isArray(despData) ? despData : [];
        } catch {
          despachos[cuadrilla.id] = [];
        }
      }
      setDespachosMap(despachos);
    } catch (err) {
      showToast(err.message || 'Error al cargar cuadrillas', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.obra_id) {
      showToast('Por favor selecciona una Obra a operar', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await crearCuadrilla({
        ...formData,
        obra_id: parseInt(formData.obra_id),
        max_voluntarios: parseInt(formData.max_voluntarios)
      });
      showToast('Cuadrilla creada exitosamente');
      setShowNew(false);
      setFormData({
        name: '',
        obra_id: '',
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

  function openDisolverModal(cuadrilla) {
    const despachos = despachosMap[cuadrilla.id] || [];
    setDisolverCuadrilla(cuadrilla);
    setDisolverStep(1);
    setDiasTrabajados(1);

    const initial = {};
    despachos.forEach(despacho => {
      if (despacho.estado === 'Pendiente' && despacho.items) {
        despacho.items.forEach(item => {
          initial[`${despacho.id}_${item.id}`] = '';
        });
      }
    });
    setItemsUsados(initial);
    setShowDisolver(true);
  }

  function closeDisolverModal() {
    setShowDisolver(false);
    setDisolverCuadrilla(null);
    setDisolverStep(1);
    setDiasTrabajados(1);
    setItemsUsados({});
  }

  function getDespachosPendientes() {
    if (!disolverCuadrilla) return [];
    const despachos = despachosMap[disolverCuadrilla.id] || [];
    return despachos.filter(d => d.estado === 'Pendiente');
  }

  function getAllItemsFromDespachos() {
    const pendientes = getDespachosPendientes();
    const allItems = [];
    pendientes.forEach(despacho => {
      if (despacho.items) {
        despacho.items.forEach(item => {
          allItems.push({
            despachoId: despacho.id,
            itemId: item.id,
            key: `${despacho.id}_${item.id}`,
            name: item.name,
            category: item.category,
            cantidadDespachada: item.cantidad,
          });
        });
      }
    });
    return allItems;
  }

  function getResumenSobrantes() {
    const allItems = getAllItemsFromDespachos();
    return allItems.map(item => {
      const usado = parseInt(itemsUsados[item.key]) || 0;
      const sobrante = item.cantidadDespachada - usado;
      return {
        ...item,
        cantidadUsada: usado,
        cantidadSobrante: sobrante,
      };
    });
  }

  function handleItemUsadoChange(key, value, maxCantidad) {
    if (value === '') {
      setItemsUsados(prev => ({ ...prev, [key]: '' }));
      return;
    }
    let val = parseInt(value);
    if (isNaN(val) || val < 0) val = 0;
    if (val > maxCantidad) val = maxCantidad;
    setItemsUsados(prev => ({ ...prev, [key]: val }));
  }

  function canAdvanceStep() {
    if (disolverStep === 1) {
      return diasTrabajados >= 1 && diasTrabajados <= 5;
    }
    if (disolverStep === 2) {
      const allItems = getAllItemsFromDespachos();
      for (const item of allItems) {
        const usado = parseInt(itemsUsados[item.key]) || 0;
        if (usado < 0 || usado > item.cantidadDespachada) return false;
      }
      return true;
    }
    return true;
  }

  async function handleDisolver() {
    if (dissolving) return;
    setDissolving(true);

    try {
      const resumen = getResumenSobrantes();
      const itemsSobrantes = resumen
        .filter(item => item.cantidadSobrante > 0)
        .map(item => ({
          itemId: item.itemId,
          cantidad: item.cantidadSobrante
        }));

      if (itemsSobrantes.length > 0) {
        await crearActaDevolucion({
          cuadrilla_nombre: disolverCuadrilla.name,
          encargado: disolverCuadrilla.encargado,
          dias_trabajados: diasTrabajados,
          items_sobrantes: itemsSobrantes
        });
      }

      await apiDisolverCuadrilla(disolverCuadrilla.id);

      if (itemsSobrantes.length > 0) {
        showToast(`Cuadrilla "${disolverCuadrilla.name}" disuelta. Items sobrantes enviados a revisión de bodega.`);
      } else {
        showToast(`Cuadrilla "${disolverCuadrilla.name}" disuelta exitosamente.`);
      }

      closeDisolverModal();
      loadData();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error al disolver cuadrilla', 'error');
    } finally {
      setDissolving(false);
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

  const resumenSobrantes = disolverStep === 3 ? getResumenSobrantes() : [];
  const totalSobrantes = resumenSobrantes.reduce((sum, r) => sum + r.cantidadSobrante, 0);
  const totalUsados = resumenSobrantes.reduce((sum, r) => sum + r.cantidadUsada, 0);

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
                <th>Obra Asignada</th>
                <th>Especialista (0/1)</th>
                <th>Zona</th>
                <th>Fecha de Inicio</th>
                <th>Voluntarios (N/Max)</th>
                <th>Emergencia</th>
                <th>Creada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuadrillas.map((c) => (
                <React.Fragment key={c.id}>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{c.id}</td>
                    <td>{c.name}</td>
                    <td style={{ fontWeight: 500, color: 'var(--accent)' }}>{c.obra?.nombre || 'General'}</td>
                    <td>
                      {c.encargado && c.encargado !== "" ? (
                        <span className="badge" style={{ background: 'var(--success-subtle)', color: 'var(--success)', fontWeight: 600 }}>1/1 ({c.encargado})</span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)', fontWeight: 600 }}>0/1 (Pendiente en Match)</span>
                      )}
                    </td>
                    <td>{c.zona_afectada}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(c.fecha)}</td>
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ color: (c.voluntarios?.length || 0) >= c.max_voluntarios ? 'var(--success)' : 'var(--text-primary)' }}>
                        {(c.voluntarios?.length || 0)}/{c.max_voluntarios}
                      </span>
                    </td>
                    <td>
                      {c.modo_emergencia ? (
                        <span style={{ color: 'var(--error)', fontWeight: 600 }}>Sí</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>No</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(c.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {despachosMap[c.id] && despachosMap[c.id].length > 0 && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                            title={expandedId === c.id ? "Contraer" : "Ver despachos"}
                            style={{ color: 'var(--info)' }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ transform: expandedId === c.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                            {expandedId === c.id ? 'Ocultar' : 'Despachos'}
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openDisolverModal(c)}
                          style={{ color: 'var(--warning)' }}
                          title="Disolver cuadrilla"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                          Disolver
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === c.id && despachosMap[c.id] && despachosMap[c.id].length > 0 && (
                    <tr style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }} key={`expanded-${c.id}`}>
                      <td colSpan="9">
                        <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Despachos Asignados</h4>
                          <div className="table-container">
                            <table className="table" style={{ margin: 0 }}>
                              <thead>
                                <tr>
                                  <th>Despacho ID</th>
                                  <th>Producto</th>
                                  <th>Categoría</th>
                                  <th>Cantidad</th>
                                  <th>Estado</th>
                                  <th>Fecha</th>
                                </tr>
                              </thead>
                              <tbody>
                                {despachosMap[c.id].map((despacho) =>
                                  despacho.items && despacho.items.length > 0 ? (
                                    despacho.items.map((item, idx) => (
                                      <tr key={`${despacho.id}-${idx}`}>
                                        {idx === 0 && (
                                          <>
                                            <td rowSpan={despacho.items.length} style={{ fontWeight: 600 }}>#{despacho.id}</td>
                                          </>
                                        )}
                                        <td>{item.name}</td>
                                        <td>{item.category}</td>
                                        <td>{item.cantidad}</td>
                                        {idx === 0 && (
                                          <>
                                            <td rowSpan={despacho.items.length}>
                                              <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                background: despacho.estado === 'Pendiente' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                color: despacho.estado === 'Pendiente' ? 'var(--warning)' : 'var(--success)',
                                              }}>
                                                {despacho.estado}
                                              </span>
                                            </td>
                                            <td rowSpan={despacho.items.length} style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                              {formatDate(despacho.created_at)}
                                            </td>
                                          </>
                                        )}
                                      </tr>
                                    ))
                                  ) : null
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
              placeholder="Ej: Cuadrilla Penco, Lirquen 1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Obra a Operar *</label>
            <select
              className="select"
              value={formData.obra_id}
              onChange={(e) => setFormData({ ...formData, obra_id: e.target.value })}
              required
            >
              <option value="">-- Seleccionar Obra --</option>
              {obras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre} ({o.zona})
                </option>
              ))}
            </select>
            {formData.obra_id && (() => {
              const selObra = obras.find(o => o.id === parseInt(formData.obra_id));
              if (!selObra) return null;
              return (
                <div style={{ background: 'var(--glass-bg)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '8px', fontSize: 13 }}>
                  <div><strong>Zona de operación:</strong> {selObra.zona}</div>
                  <div style={{ marginTop: 4 }}><strong>Req. Técnicos:</strong> {selObra.competencias_requeridas?.join(', ') || 'General'}</div>
                  <div style={{ marginTop: 4 }}><strong>Especialista / Encargado:</strong> <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Se asignará en pestaña de Match (Cupo 0/1)</span></div>
                </div>
              );
            })()}
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

      {/* Modal de Disolución Multi-Step */}
      <Modal
        isOpen={showDisolver}
        onClose={closeDisolverModal}
        title={disolverCuadrilla ? `Disolver Cuadrilla: ${disolverCuadrilla.name}` : 'Disolver Cuadrilla'}
        large
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              {disolverStep > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setDisolverStep(disolverStep - 1)}
                  disabled={dissolving}
                >
                  ← Anterior
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-ghost" onClick={closeDisolverModal} disabled={dissolving}>
                Cancelar
              </button>
              {disolverStep < 3 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setDisolverStep(disolverStep + 1)}
                  disabled={!canAdvanceStep()}
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleDisolver}
                  disabled={dissolving}
                  style={{ fontWeight: 600 }}
                >
                  {dissolving ? (
                    <>
                      <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      Disolviendo...
                    </>
                  ) : (
                    'Confirmar Disolución'
                  )}
                </button>
              )}
            </div>
          </div>
        }
      >
        {disolverCuadrilla && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Step Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    background: disolverStep >= step ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: disolverStep >= step ? 'white' : 'var(--text-muted)',
                    border: `2px solid ${disolverStep >= step ? 'var(--accent)' : 'var(--border)'}`,
                    transition: 'all 0.3s ease',
                  }}>
                    {disolverStep > step ? '✓' : step}
                  </div>
                  {step < 3 && (
                    <div style={{
                      width: '60px',
                      height: '2px',
                      background: disolverStep > step ? 'var(--accent)' : 'var(--border)',
                      transition: 'all 0.3s ease',
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Paso 1: Días Trabajados */}
            {disolverStep === 1 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-lg)',
                }}>
                  <h3 style={{ marginBottom: '4px', fontSize: 16 }}>Días Trabajados</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                    Ingresa la cantidad de días que esta cuadrilla trabajó en terreno. El máximo permitido es de 5 días.
                  </p>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                    }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        onClick={() => setDiasTrabajados(Math.max(1, diasTrabajados - 1))}
                        disabled={diasTrabajados <= 1}
                        style={{ width: 44, height: 44, fontSize: 20, fontWeight: 700 }}
                      >
                        −
                      </button>
                      <div style={{
                        width: '100px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-elevated)',
                        border: '2px solid var(--accent)',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '36px',
                        fontWeight: 700,
                        color: 'var(--accent-hover)',
                      }}>
                        {diasTrabajados}
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        onClick={() => setDiasTrabajados(Math.min(5, diasTrabajados + 1))}
                        disabled={diasTrabajados >= 5}
                        style={{ width: 44, height: 44, fontSize: 20, fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '6px',
                      marginTop: '4px'
                    }}>
                      {[1, 2, 3, 4, 5].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDiasTrabajados(d)}
                          style={{
                            width: '40px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${diasTrabajados === d ? 'var(--accent)' : 'var(--border)'}`,
                            background: diasTrabajados === d ? 'var(--accent-subtle)' : 'transparent',
                            color: diasTrabajados === d ? 'var(--accent)' : 'var(--text-muted)',
                            fontWeight: diasTrabajados === d ? 700 : 400,
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {diasTrabajados === 1 ? '1 día' : `${diasTrabajados} días`} de trabajo registrados
                    </span>
                  </div>
                </div>

                {/* Info Card de la cuadrilla */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 'var(--space-md)',
                  marginTop: 'var(--space-lg)',
                }}>
                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Encargado</span>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginTop: 4 }}>{disolverCuadrilla.encargado}</p>
                  </div>
                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zona</span>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginTop: 4 }}>{disolverCuadrilla.zona_afectada}</p>
                  </div>
                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Despachos Pendientes</span>
                    <p style={{ color: 'var(--warning)', fontWeight: 600, marginTop: 4 }}>{getDespachosPendientes().length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Items Utilizados */}
            {disolverStep === 2 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-lg)',
                }}>
                  <h3 style={{ marginBottom: '4px', fontSize: 16 }}>Items Utilizados</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                    Indica la cantidad utilizada de cada item despachado. Los items sobrantes serán devueltos al inventario.
                  </p>

                  {getAllItemsFromDespachos().length === 0 ? (
                    <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48 }}>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      </svg>
                      <p>No hay items despachados pendientes para esta cuadrilla</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Desp. #</th>
                            <th>Item</th>
                            <th>Categoría</th>
                            <th>Cant. Despachada</th>
                            <th>Cant. Utilizada</th>
                            <th>Sobrante</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getAllItemsFromDespachos().map((item) => {
                            const usado = parseInt(itemsUsados[item.key]) || 0;
                            const sobrante = item.cantidadDespachada - usado;
                            return (
                              <tr key={item.key}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{item.despachoId}</td>
                                <td style={{ color: 'var(--text-primary)' }}>{item.name}</td>
                                <td>
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    background: item.category === 'Herramienta' ? 'var(--info-subtle)' : 'rgba(139, 92, 246, 0.12)',
                                    color: item.category === 'Herramienta' ? 'var(--info)' : '#a78bfa',
                                  }}>
                                    {item.category}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>{item.cantidadDespachada}</td>
                                <td>
                                  <input
                                    className="input"
                                    type="number"
                                    min="0"
                                    max={item.cantidadDespachada}
                                    value={itemsUsados[item.key]}
                                    placeholder="0"
                                    onChange={(e) => handleItemUsadoChange(item.key, e.target.value, item.cantidadDespachada)}
                                    onFocus={(e) => { if (e.target.value === '0') e.target.select(); }}
                                    style={{
                                      width: '90px',
                                      padding: '6px 10px',
                                      textAlign: 'center',
                                      fontWeight: itemsUsados[item.key] !== '' ? 600 : 400,
                                    }}
                                  />
                                </td>
                                <td>
                                  <span style={{
                                    fontWeight: 700,
                                    color: sobrante > 0 ? 'var(--success)' : 'var(--text-muted)',
                                    fontSize: 15,
                                  }}>
                                    {sobrante}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Paso 3: Resumen */}
            {disolverStep === 3 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {/* Warning Banner */}
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-md) var(--space-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  marginBottom: 'var(--space-lg)',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" width="24" height="24" style={{ flexShrink: 0 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div>
                    <p style={{ color: 'var(--warning)', fontWeight: 600, fontSize: 14 }}>Esta acción es irreversible</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Al confirmar, se disolverá la cuadrilla y los items sobrantes serán enviados al acta de devolución, que seran reingresados al inventario.</p>
                  </div>
                </div>

                {/* Resumen Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 'var(--space-md)',
                  marginBottom: 'var(--space-lg)',
                }}>
                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    textAlign: 'center',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-hover)' }}>{diasTrabajados}</span>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Días Trabajados</p>
                  </div>
                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    textAlign: 'center',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--error)' }}>{totalUsados}</span>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Items Utilizados</p>
                  </div>
                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    textAlign: 'center',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--warning)' }}>{totalSobrantes}</span>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Enviados a Revisión</p>
                  </div>
                </div>

                {/* Tabla Resumen */}
                {resumenSobrantes.length > 0 ? (
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-lg)',
                  }}>
                    <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 16 }}>Detalle de Items</h3>
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Categoría</th>
                            <th>Despachado</th>
                            <th>Utilizado</th>
                            <th>A Revisión Bodega</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resumenSobrantes.map((item) => (
                            <tr key={item.key}>
                              <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</td>
                              <td>
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  background: item.category === 'Herramienta' ? 'var(--info-subtle)' : 'rgba(139, 92, 246, 0.12)',
                                  color: item.category === 'Herramienta' ? 'var(--info)' : '#a78bfa',
                                }}>
                                  {item.category}
                                </span>
                              </td>
                              <td style={{ fontWeight: 600 }}>{item.cantidadDespachada}</td>
                              <td style={{ color: 'var(--error)', fontWeight: 600 }}>{item.cantidadUsada}</td>
                              <td>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 12px',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  background: item.cantidadSobrante > 0 ? 'rgba(245, 158, 11, 0.15)' : 'var(--glass-bg)',
                                  color: item.cantidadSobrante > 0 ? 'var(--warning)' : 'var(--text-muted)',
                                }}>
                                  {item.cantidadSobrante > 0 && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                  {item.cantidadSobrante}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-xl)',
                    textAlign: 'center',
                  }}>
                    <p style={{ color: 'var(--text-muted)' }}>No hay items despachados pendientes. La cuadrilla se disolverá sin devolución de items.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
