import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMiPerfil, actualizarMiPerfil, getTodosLosPerfiles, validarPerfilPostulante, getHistorialPerfil } from '../services/perfil.service.js';
import { getObras, getMatchParaObra } from '../services/obra.service.js';
import { getCuadrillas, actualizarCuadrilla } from '../services/cuadrillas.service.js';
import { getUser } from '../services/auth.service.js';
import { showToast } from '../helpers/toast.js';
import Modal from '../components/Modal.jsx';
import '../styles/Perfiles.css';

const SUGGESTED_COMPETENCIAS = [
  'Carpintería',
  'Electricidad',
  'Fontanería/Plomería',
  'Albañilería',
  'Estructuras Metálicas',
  'Pintura',
  'Primeros Auxilios',
  'Liderazgo de Equipos',
  'Logística',
  'Prevención de Riesgos'
];

const SUGGESTED_CERTIFICACIONES = [
  'Curso Prevención de Riesgos',
  'Licencia Clase B',
  'Licencia Clase A2/A4',
  'Certificación SEC',
  'Primeros Auxilios Avanzado',
  'Operador de Maquinaria Pesada'
];

export default function PerfilesPage() {
  const user = getUser();
  const isAdmin = user?.role === 'administrador';
  const isCoordinador = user?.role === 'administrador' || user?.role === 'jefe_cuadrilla';
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('mi-perfil');

  // --- Mi Perfil State ---
  const [perfil, setPerfil] = useState({
    nombre_completo: '',
    telefono: '',
    rol: 'postulante',
    informacion_profesional: '',
    informacion_academica: '',
    competencias: [],
    certificaciones: [],
  });
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [newCompetencia, setNewCompetencia] = useState('');
  const [newCertificacion, setNewCertificacion] = useState('');
  const [compSuggestions, setCompSuggestions] = useState([]);
  const [certSuggestions, setCertSuggestions] = useState([]);

  // --- Validación State ---
  const [perfiles, setPerfiles] = useState([]);
  const [loadingPerfiles, setLoadingPerfiles] = useState(false);
  const [selectedPerfil, setSelectedPerfil] = useState(null);
  const [validarForm, setValidarForm] = useState({
    estado: 'registrado',
    zona_asignada: '',
    comentario: '',
  });
  const [validating, setValidating] = useState(false);
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroCompetencia, setFiltroCompetencia] = useState('');
  
  // Historial Log State
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // --- Match State ---
  const [obras, setObras] = useState([]);
  const [selectedCuadrillaId, setSelectedCuadrillaId] = useState('');
  const [matchData, setMatchData] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  
  // Cuadrilla Selection State
  const [cuadrillas, setCuadrillas] = useState([]);
  const [assigningCuadrilla, setAssigningCuadrilla] = useState(null); // voluntario_id of candidate being assigned

  useEffect(() => {
    loadMiPerfil();
    if (isAdmin) {
      loadTodosLosPerfiles();
    }
    if (isCoordinador) {
      loadObras();
      loadCuadrillas();
    }
  }, [isAdmin, isCoordinador]);

  // --- Mi Perfil Actions ---
  async function loadMiPerfil() {
    setLoadingPerfil(true);
    try {
      const data = await getMiPerfil();
      if (data) {
        setPerfil({
          nombre_completo: data.nombre_completo || '',
          telefono: data.telefono || '',
          rol: data.rol || 'postulante',
          informacion_profesional: data.informacion_profesional || '',
          informacion_academica: data.informacion_academica || '',
          competencias: Array.isArray(data.competencias) ? data.competencias : [],
          certificaciones: Array.isArray(data.certificaciones) ? data.certificaciones : [],
        });
      }
    } catch (err) {
      if (err.status !== 404) {
        showToast(err.message || 'Error al cargar tu perfil', 'error');
      }
    } finally {
      setLoadingPerfil(false);
    }
  }

  async function handleSavePerfil(e) {
    e.preventDefault();
    setSavingPerfil(true);
    try {
      await actualizarMiPerfil(perfil);
      showToast('Perfil actualizado correctamente');
      loadMiPerfil();
      if (isAdmin) {
        loadTodosLosPerfiles();
      }
    } catch (err) {
      showToast(err.message || 'Error al guardar el perfil', 'error');
    } finally {
      setSavingPerfil(false);
    }
  }

  // --- Autocomplete Sugerencias Competencias ---
  const handleCompetenciaChange = (value) => {
    setNewCompetencia(value);
    if (!value.trim()) {
      setCompSuggestions([]);
      return;
    }
    const filtered = SUGGESTED_COMPETENCIAS.filter(c => 
      c.toLowerCase().includes(value.toLowerCase()) && 
      !perfil.competencias.includes(c)
    );
    setCompSuggestions(filtered);
  };

  const selectCompetenciaSuggestion = (value) => {
    if (!perfil.competencias.includes(value)) {
      setPerfil({ ...perfil, competencias: [...perfil.competencias, value] });
    }
    setNewCompetencia('');
    setCompSuggestions([]);
  };

  const addCompetencia = () => {
    const val = newCompetencia.trim();
    if (val && !perfil.competencias.includes(val)) {
      setPerfil({ ...perfil, competencias: [...perfil.competencias, val] });
      setNewCompetencia('');
      setCompSuggestions([]);
    }
  };

  const removeCompetencia = (index) => {
    setPerfil({
      ...perfil,
      competencias: perfil.competencias.filter((_, i) => i !== index),
    });
  };

  // --- Autocomplete Sugerencias Certificaciones ---
  const handleCertificacionChange = (value) => {
    setNewCertificacion(value);
    if (!value.trim()) {
      setCertSuggestions([]);
      return;
    }
    const filtered = SUGGESTED_CERTIFICACIONES.filter(c => 
      c.toLowerCase().includes(value.toLowerCase()) && 
      !perfil.certificaciones.includes(c)
    );
    setCertSuggestions(filtered);
  };

  const selectCertificacionSuggestion = (value) => {
    if (!perfil.certificaciones.includes(value)) {
      setPerfil({ ...perfil, certificaciones: [...perfil.certificaciones, value] });
    }
    setNewCertificacion('');
    setCertSuggestions([]);
  };

  const addCertificacion = () => {
    const val = newCertificacion.trim();
    if (val && !perfil.certificaciones.includes(val)) {
      setPerfil({ ...perfil, certificaciones: [...perfil.certificaciones, val] });
      setNewCertificacion('');
      setCertSuggestions([]);
    }
  };

  const removeCertificacion = (index) => {
    setPerfil({
      ...perfil,
      certificaciones: perfil.certificaciones.filter((_, i) => i !== index),
    });
  };

  // --- Validación Actions ---
  async function loadTodosLosPerfiles() {
    setLoadingPerfiles(true);
    try {
      const filters = {};
      if (filtroRol) filters.rol = filtroRol;
      if (filtroCompetencia) filters.competencia = filtroCompetencia;
      const data = await getTodosLosPerfiles(filters);
      setPerfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar perfiles', 'error');
    } finally {
      setLoadingPerfiles(false);
    }
  }

  async function handleValidarPerfil(e) {
    e.preventDefault();
    if (!selectedPerfil) return;
    setValidating(true);
    try {
      await validarPerfilPostulante(selectedPerfil.id, validarForm);
      showToast('Perfil evaluado exitosamente');
      setSelectedPerfil(null);
      setValidarForm({ estado: 'registrado', zona_asignada: '', comentario: '' });
      loadTodosLosPerfiles();
    } catch (err) {
      showToast(err.message || 'Error al validar perfil', 'error');
    } finally {
      setValidating(false);
    }
  }

  const openValidarModal = async (p) => {
    setSelectedPerfil(p);
    setValidarForm({
      estado: p.estado || 'registrado',
      zona_asignada: p.zona_asignada || '',
      comentario: '',
    });
    
    // Cargar Historial
    setLoadingHistorial(true);
    setHistorial([]);
    try {
      const histData = await getHistorialPerfil(p.id);
      setHistorial(Array.isArray(histData) ? histData : []);
    } catch (err) {
      showToast('No se pudo obtener el historial de estados', 'warning');
    } finally {
      setLoadingHistorial(false);
    }
  };

  // --- Match Actions ---
  async function loadObras() {
    try {
      const data = await getObras();
      setObras(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar obras', 'error');
    }
  }

  async function loadCuadrillas() {
    try {
      const data = await getCuadrillas();
      setCuadrillas(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Error al cargar cuadrillas', 'error');
    }
  }

  async function handleCalculateMatchForCuadrilla(cuadrillaId, listCuadrillas = cuadrillas) {
    if (!cuadrillaId) {
      setMatchData(null);
      return;
    }
    const targetCuadrilla = listCuadrillas.find(c => c.id === parseInt(cuadrillaId));
    if (!targetCuadrilla || (!targetCuadrilla.obra_id && !targetCuadrilla.obra?.id)) {
      showToast('La cuadrilla seleccionada no tiene una obra técnica asociada', 'warning');
      setMatchData(null);
      return;
    }
    const obraIdToFetch = targetCuadrilla.obra_id || targetCuadrilla.obra.id;
    setLoadingMatch(true);
    try {
      const data = await getMatchParaObra(obraIdToFetch);
      setMatchData(data);
    } catch (err) {
      showToast(err.message || 'Error al calcular match inteligente', 'error');
      setMatchData(null);
    } finally {
      setLoadingMatch(false);
    }
  }

  // Asignar voluntario o especialista a cuadrilla
  async function handleAssignToCuadrilla(candidate, asEspecialista = false) {
    if (!selectedCuadrillaId) {
      showToast('Por favor, selecciona una cuadrilla arriba primero.', 'warning');
      return;
    }
    if (!candidate.rut && !asEspecialista) {
      showToast('El voluntario no tiene un RUT asociado en el sistema.', 'error');
      return;
    }
    
    setAssigningCuadrilla(candidate.voluntario_id);
    try {
      const targetCuadrilla = cuadrillas.find(c => c.id === parseInt(selectedCuadrillaId));
      if (!targetCuadrilla) {
        showToast('Cuadrilla no encontrada', 'error');
        return;
      }
      
      if (asEspecialista) {
        if (targetCuadrilla.encargado && targetCuadrilla.encargado !== "") {
          if (!window.confirm(`Esta cuadrilla ya tiene asignado como especialista a "${targetCuadrilla.encargado}". ¿Deseas reemplazarlo por "${candidate.nombre_completo}"?`)) {
            return;
          }
        }
        await actualizarCuadrilla(selectedCuadrillaId, { encargado: candidate.nombre_completo });
        showToast(`Asignado como Especialista / Encargado de: ${targetCuadrilla.name}`);
      } else {
        const currentVoluntarios = targetCuadrilla.voluntarios || [];
        if (currentVoluntarios.includes(candidate.rut)) {
          showToast('El voluntario ya pertenece a esta cuadrilla', 'warning');
          return;
        }
        if (currentVoluntarios.length >= targetCuadrilla.max_voluntarios) {
          showToast(`La cuadrilla ya está llena (${targetCuadrilla.max_voluntarios} máx. voluntarios)`, 'error');
          return;
        }
        const newVoluntarios = [...currentVoluntarios, candidate.rut];
        await actualizarCuadrilla(selectedCuadrillaId, { voluntarios: newVoluntarios });
        showToast(`Asignado correctamente como voluntario a: ${targetCuadrilla.name}`);
      }
      
      const updatedCuadrillas = await getCuadrillas();
      setCuadrillas(Array.isArray(updatedCuadrillas) ? updatedCuadrillas : []);
    } catch (err) {
      showToast(err.message || 'Error al asignar a cuadrilla', 'error');
    } finally {
      setAssigningCuadrilla(null);
    }
  }

  return (
    <div className="page" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Perfiles y Match Inteligente</h1>
          <p className="page-subtitle">Crea tu currículum, evalúa nuevos postulantes y realiza emparejamiento con requerimientos técnicos</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="filter-bar" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'mi-perfil' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('mi-perfil')}
        >
          Mi Perfil (CV)
        </button>
        {isAdmin && (
          <button
            className={`btn ${activeTab === 'validacion' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('validacion')}
          >
            Validación de Postulantes
          </button>
        )}
        {isCoordinador && (
          <button
            className={`btn ${activeTab === 'match' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('match')}
          >
            Match de Obras
          </button>
        )}
      </div>

      {/* Tab 1: Mi Perfil */}
      {activeTab === 'mi-perfil' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-header">
            <h2 className="card-title">Mi Currículum Vitae Digital</h2>
          </div>

          {loadingPerfil ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <form onSubmit={handleSavePerfil} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input
                    type="text"
                    className="input"
                    value={perfil.nombre_completo}
                    onChange={(e) => setPerfil({ ...perfil, nombre_completo: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono de Contacto</label>
                  <input
                    type="text"
                    className="input"
                    value={perfil.telefono}
                    onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
                    placeholder="Ej: +56912345678"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Rol de Perfil</label>
                <select
                  className="select"
                  value={perfil.rol}
                  onChange={(e) => setPerfil({ ...perfil, rol: e.target.value })}
                >
                  <option value="postulante">Postulante</option>
                  <option value="voluntario">Voluntario</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Información Académica</label>
                <textarea
                  className="textarea"
                  value={perfil.informacion_academica}
                  onChange={(e) => setPerfil({ ...perfil, informacion_academica: e.target.value })}
                  placeholder="Estudios realizados, títulos, cursos, etc..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Información Profesional / Experiencia laboral</label>
                <textarea
                  className="textarea"
                  value={perfil.informacion_profesional}
                  onChange={(e) => setPerfil({ ...perfil, informacion_profesional: e.target.value })}
                  placeholder="Experiencia previa relevante, constructora, etc..."
                  rows={3}
                />
              </div>

              {/* Competencias con Autocomplete */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Competencias Técnicas y Habilidades (Sugerencias al escribir)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    value={newCompetencia}
                    onChange={(e) => handleCompetenciaChange(e.target.value)}
                    placeholder="Ej: Carpintería, Electricidad, Liderazgo"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompetencia(); } }}
                  />
                  <button type="button" className="btn btn-ghost" onClick={addCompetencia}>Añadir</button>
                </div>
                
                {compSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '70px',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    zIndex: 10,
                    maxHeight: '150px',
                    overflowY: 'auto',
                    boxShadow: 'var(--shadow-lg)'
                  }}>
                    {compSuggestions.map((sug, i) => (
                      <div
                        key={i}
                        onClick={() => selectCompetenciaSuggestion(sug)}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--glass-bg)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        {sug}
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {perfil.competencias.map((comp, idx) => (
                    <span key={idx} className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {comp}
                      <button type="button" onClick={() => removeCompetencia(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                    </span>
                  ))}
                  {perfil.competencias.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No has añadido competencias aún.</span>}
                </div>
              </div>

              {/* Certificaciones con Autocomplete */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Certificaciones y Cursos (Sugerencias al escribir)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    value={newCertificacion}
                    onChange={(e) => handleCertificacionChange(e.target.value)}
                    placeholder="Ej: Curso Prevención de Riesgos, Licencia Clase B"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCertificacion(); } }}
                  />
                  <button type="button" className="btn btn-ghost" onClick={addCertificacion}>Añadir</button>
                </div>
                
                {certSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '70px',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    zIndex: 10,
                    maxHeight: '150px',
                    overflowY: 'auto',
                    boxShadow: 'var(--shadow-lg)'
                  }}>
                    {certSuggestions.map((sug, i) => (
                      <div
                        key={i}
                        onClick={() => selectCertificacionSuggestion(sug)}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--glass-bg)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        {sug}
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {perfil.certificaciones.map((cert, idx) => (
                    <span key={idx} className="badge" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {cert}
                      <button type="button" onClick={() => removeCertificacion(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                    </span>
                  ))}
                  {perfil.certificaciones.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No has añadido certificaciones aún.</span>}
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-md)', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={savingPerfil}>
                  {savingPerfil ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: Validación de Postulantes */}
      {activeTab === 'validacion' && isAdmin && (
        <div>
          <div className="filter-bar" style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div className="form-group" style={{ minWidth: '150px' }}>
              <label className="form-label">Filtrar por Rol</label>
              <select className="select" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                <option value="">Todos</option>
                <option value="postulante">Postulantes</option>
                <option value="voluntario">Voluntarios</option>
              </select>
            </div>
            <div className="form-group" style={{ flexGrow: 1 }}>
              <label className="form-label">Buscar por Competencia</label>
              <input
                type="text"
                className="input"
                placeholder="Ej: Carpintería"
                value={filtroCompetencia}
                onChange={(e) => setFiltroCompetencia(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={loadTodosLosPerfiles}>
              Filtrar
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            {loadingPerfiles ? (
              <div className="loading"><div className="spinner" /></div>
            ) : perfiles.length === 0 ? (
              <div className="empty-state">
                <p>No se encontraron perfiles con los filtros indicados.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Zona Asignada</th>
                      <th>Competencias</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perfiles.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>#{p.id}</td>
                        <td style={{ color: 'var(--text-primary)' }}>{p.nombre_completo || 'Sin nombre'}</td>
                        <td>
                          <span className="badge" style={{ background: p.rol === 'voluntario' ? 'var(--success-subtle)' : 'var(--info-subtle)', color: p.rol === 'voluntario' ? 'var(--success)' : 'var(--info)' }}>
                            {p.rol}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${p.estado === 'habilitado' ? 'entregada' : p.estado === 'rechazado' ? 'rechazada' : 'pendiente'}`}>
                            {p.estado}
                          </span>
                        </td>
                        <td>{p.zona_asignada || 'Ninguna'}</td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {p.competencias?.slice(0, 3).map((c, i) => (
                              <span key={i} className="badge" style={{ fontSize: 10, padding: '2px 6px', background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>{c}</span>
                            ))}
                            {p.competencias?.length > 3 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{p.competencias.length - 3}</span>}
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => openValidarModal(p)}>
                            Evaluar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Match Inteligente */}
      {activeTab === 'match' && isCoordinador && (
        <div>
          <div className="filter-bar" style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', justifyContent: 'space-between' }}>
            <div className="form-group" style={{ flexGrow: 1, maxWidth: '600px' }}>
              <label className="form-label">Selecciona una Cuadrilla para Asignar Personal</label>
              <select
                className="select"
                value={selectedCuadrillaId}
                onChange={(e) => {
                  setSelectedCuadrillaId(e.target.value);
                  handleCalculateMatchForCuadrilla(e.target.value);
                }}
              >
                <option value="">-- Seleccionar Cuadrilla --</option>
                {cuadrillas.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name} [Obra: {q.obra?.nombre || 'Sin obra'}] (Esp: {q.encargado ? '1/1' : '0/1'} | Vol: {(q.voluntarios?.length || 0)}/{q.max_voluntarios})
                  </option>
                ))}
              </select>
            </div>
            {selectedCuadrillaId && (
              <button className="btn btn-ghost" style={{ marginTop: '24px' }} onClick={() => handleCalculateMatchForCuadrilla(selectedCuadrillaId)}>
                Recalcular Match
              </button>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            {loadingMatch ? (
              <div className="loading"><div className="spinner" /></div>
            ) : !selectedCuadrillaId ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                <p>Selecciona una cuadrilla creada para evaluar e integrar especialistas y voluntarios compatibles</p>
              </div>
            ) : matchData ? (() => {
              const selectedQuad = cuadrillas.find(q => q.id === parseInt(selectedCuadrillaId));
              return (
              <div>
                {/* Cuadrilla & Obra Details */}
                <div className="card" style={{ marginBottom: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, color: 'var(--accent-hover)' }}>
                      Requerimientos de la Cuadrilla: {selectedQuad?.name} <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>(Obra: {matchData.obra.nombre})</span>
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="badge" style={{ background: selectedQuad?.encargado ? 'var(--success-subtle)' : 'var(--warning-subtle)', color: selectedQuad?.encargado ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                        Especialista: {selectedQuad?.encargado ? `1/1 (${selectedQuad.encargado})` : '0/1 (Falta asignar)'}
                      </span>
                      <span className="badge" style={{ background: (selectedQuad?.voluntarios?.length || 0) >= (selectedQuad?.max_voluntarios || 6) ? 'var(--success-subtle)' : 'var(--info-subtle)', color: (selectedQuad?.voluntarios?.length || 0) >= (selectedQuad?.max_voluntarios || 6) ? 'var(--success)' : 'var(--info)', fontWeight: 600 }}>
                        Voluntarios: {(selectedQuad?.voluntarios?.length || 0)}/{selectedQuad?.max_voluntarios || 6}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '12px' }}>
                    <div>
                      <span className="form-label">Zona de Operación</span>
                      <p style={{ color: 'var(--text-primary)', fontWeight: 500, margin: '4px 0 0 0' }}>{matchData.obra.zona}</p>
                    </div>
                    <div>
                      <span className="form-label">Competencias Requeridas</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {matchData.obra.competencias_requeridas?.map((skill, i) => (
                          <span key={i} className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>{skill}</span>
                        )) || 'Ninguna'}
                      </div>
                    </div>
                    <div>
                      <span className="form-label">Certificaciones Requeridas</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {matchData.obra.certificaciones_requeridas?.map((cert, i) => (
                          <span key={i} className="badge" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa' }}>{cert}</span>
                        )) || 'Ninguna'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Results */}
                <h3>Candidatos Compatibles para esta Cuadrilla</h3>
                <div className="table-container" style={{ marginTop: '12px' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Voluntario</th>
                        <th>Coincidencia</th>
                        <th>Zona Coincide?</th>
                        <th>Habilidades Match</th>
                        <th>Certificaciones Match</th>
                        <th>Asignación Directa a Cuadrilla</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchData.candidatos_compatibles?.map((c, idx) => {
                        const isEspecialista = selectedQuad?.encargado === c.nombre_completo;
                        const isVoluntario = selectedQuad?.voluntarios?.includes(c.rut);
                        return (
                        <tr key={idx}>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                            {c.nombre_completo}
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>RUT: {c.rut || 'No provisto'}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '60px', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${c.match.porcentaje_coincidencia}%`,
                                  height: '100%',
                                  background: c.match.porcentaje_coincidencia > 70 ? 'var(--success)' : c.match.porcentaje_coincidencia > 40 ? 'var(--warning)' : 'var(--error)'
                                }} />
                              </div>
                              <span style={{
                                fontWeight: 700,
                                color: c.match.porcentaje_coincidencia > 70 ? 'var(--success)' : c.match.porcentaje_coincidencia > 40 ? 'var(--warning)' : 'var(--error)'
                              }}>
                                {c.match.porcentaje_coincidencia}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${c.match.coincide_zona ? 'entregada' : 'rechazada'}`}>
                              {c.match.coincide_zona ? 'Sí' : 'No'} ({c.zona_asignada || 'No asignada'})
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {c.competencias?.map((s, i) => {
                                const coinc = c.match.competencias_coincidentes.includes(s);
                                return (
                                  <span key={i} className="badge" style={{ fontSize: 10, padding: '2px 6px', background: coinc ? 'var(--success-subtle)' : 'var(--glass-bg)', color: coinc ? 'var(--success)' : 'var(--text-secondary)' }}>
                                    {s}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {c.certificaciones?.map((cert, i) => {
                                const coinc = c.match.certificaciones_coincidentes.includes(cert);
                                return (
                                  <span key={i} className="badge" style={{ fontSize: 10, padding: '2px 6px', background: coinc ? 'var(--success-subtle)' : 'var(--glass-bg)', color: coinc ? 'var(--success)' : 'var(--text-secondary)' }}>
                                    {cert}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {isEspecialista ? (
                                <span className="badge" style={{ background: 'var(--success-subtle)', color: 'var(--success)', fontWeight: 700, padding: '6px 10px' }}>
                                  ✓ Especialista (0/1 Lleno)
                                </span>
                              ) : isVoluntario ? (
                                <span className="badge" style={{ background: 'var(--info-subtle)', color: 'var(--info)', fontWeight: 700, padding: '6px 10px' }}>
                                  ✓ Voluntario Asignado
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    style={{ borderColor: 'var(--warning)', color: 'var(--warning)', padding: '6px 10px', fontSize: 11, fontWeight: 600 }}
                                    onClick={() => handleAssignToCuadrilla(c, true)}
                                    disabled={assigningCuadrilla === c.voluntario_id || (selectedQuad?.encargado && selectedQuad.encargado !== "")}
                                    title={selectedQuad?.encargado && selectedQuad.encargado !== "" ? `Ya hay especialista: ${selectedQuad.encargado}` : "Asignar en cupo 0/1 de especialista"}
                                  >
                                    ★ Asignar Especialista
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '6px 10px', fontSize: 11 }}
                                    onClick={() => handleAssignToCuadrilla(c, false)}
                                    disabled={assigningCuadrilla === c.voluntario_id || (selectedQuad?.voluntarios?.length || 0) >= (selectedQuad?.max_voluntarios || 6)}
                                  >
                                    + Asignar Voluntario
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                      {(!matchData.candidatos_compatibles || matchData.candidatos_compatibles.length === 0) && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            No hay voluntarios habilitados registrados en el sistema.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              );
            })() : null}
          </div>
        </div>
      )}

      {/* Evaluation Modal for Admins */}
      <Modal
        isOpen={!!selectedPerfil}
        onClose={() => setSelectedPerfil(null)}
        title={selectedPerfil ? `Evaluar Perfil: ${selectedPerfil.nombre_completo || 'Sin nombre'}` : ''}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setSelectedPerfil(null)}>Cancelar</button>
            <button
              className="btn btn-outline"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
              onClick={() => {
                navigate('/reuniones', { state: { agendarParaVoluntarioId: selectedPerfil?.id } });
              }}
            >
              Agendar Reunión
            </button>
            <button className="btn btn-primary" onClick={handleValidarPerfil} disabled={validating}>
              {validating ? 'Procesando...' : 'Confirmar Evaluación'}
            </button>
          </>
        }
      >
        {selectedPerfil && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Formulario de Evaluación */}
              <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <p><strong>Información Académica:</strong> {selectedPerfil.informacion_academica || 'No provista'}</p>
                  <p style={{ marginTop: '8px' }}><strong>Información Profesional:</strong> {selectedPerfil.informacion_profesional || 'No provista'}</p>
                  <div style={{ marginTop: '8px' }}>
                    <strong>Competencias: </strong>
                    {selectedPerfil.competencias?.map((c, i) => <span key={i} className="badge" style={{ background: 'var(--glass-bg)', marginRight: 4 }}>{c}</span>) || 'Ninguna'}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <strong>Certificaciones: </strong>
                    {selectedPerfil.certificaciones?.map((c, i) => <span key={i} className="badge" style={{ background: 'var(--glass-bg)', marginRight: 4 }}>{c}</span>) || 'Ninguna'}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nuevo Estado *</label>
                  <select
                    className="select"
                    value={validarForm.estado}
                    onChange={(e) => setValidarForm({ ...validarForm, estado: e.target.value })}
                    required
                  >
                    <option value="registrado">Registrado</option>
                    <option value="documentacion_pendiente">Documentación Pendiente</option>
                    <option value="entrevista_agendada">Entrevista Agendada</option>
                    <option value="en_capacitacion">En Capacitación</option>
                    <option value="habilitado">Habilitado / Voluntario Activo</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Zona Geográfica Asignada</label>
                  <select
                    className="select"
                    value={validarForm.zona_asignada}
                    onChange={(e) => setValidarForm({ ...validarForm, zona_asignada: e.target.value })}
                  >
                    <option value="">-- Sin Asignar --</option>
                    <option value="Valparaíso">Valparaíso</option>
                    <option value="Biobío">Biobío</option>
                    <option value="Santiago">Santiago</option>
                    <option value="Maule">Maule</option>
                    <option value="Araucanía">Araucanía</option>
                    <option value="O'Higgins">O'Higgins</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Comentarios de la Decisión</label>
                  <textarea
                    className="textarea"
                    placeholder="Escribe las observaciones del cambio de estado..."
                    value={validarForm.comentario}
                    onChange={(e) => setValidarForm({ ...validarForm, comentario: e.target.value })}
                    rows={3}
                  />
                </div>
              </form>

              {/* Historial Log en Timeline */}
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '16px', maxHeight: '420px', overflowY: 'auto' }}>
                <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Historial de Cambios de Estado</h4>
                {loadingHistorial ? (
                  <div className="loading" style={{ padding: '20px 0' }}><div className="spinner" /></div>
                ) : historial.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No hay cambios de estado registrados para este perfil.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {historial.map((h, i) => (
                      <div key={i} style={{ position: 'relative', paddingBottom: '4px' }}>
                        <div style={{
                          position: 'absolute',
                          left: '-22px',
                          top: '4px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: h.estado_nuevo === 'habilitado' ? 'var(--success)' : h.estado_nuevo === 'rechazado' ? 'var(--error)' : 'var(--accent)'
                        }} />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(h.creado_en).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {h.estado_anterior || 'Inicial'} ➔ {h.estado_nuevo}
                        </div>
                        {h.cambiadoPor && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: '2px' }}>
                            Por: {h.cambiadoPor.name}
                          </div>
                        )}
                        {h.comentario && (
                          <p style={{ fontSize: 12, background: 'var(--bg-elevated)', padding: '6px 10px', borderRadius: '4px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                            "{h.comentario}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
