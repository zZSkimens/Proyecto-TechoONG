import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../services/auth.service.js';
import { useState } from 'react';
import Modal from './Modal.jsx';
import '../styles/Sidebar.css';

const ROLE_LINKS = {
  jefe_cuadrilla: ['/solicitudes', '/recepcion', '/cuadrillas', '/perfiles', '/reuniones'],
  enc_alimentacion: ['/aprobacion', '/trazabilidad'],
  bodega: ['/despacho', '/inventario', '/perfiles'],
  admin_bodega: ['/despacho', '/inventario', '/items', '/despacho-herramientas', '/actas-devolucion', '/perfiles'],
  administrador: ['/solicitudes', '/recepcion', '/aprobacion', '/despacho', '/inventario', '/trazabilidad', '/cuadrillas', '/items', '/despacho-herramientas', '/actas-devolucion', '/perfiles', '/reuniones'],
  coordinador_viajes: ['/solicitudes', '/recepcion', '/aprobacion', '/despacho', '/inventario', '/trazabilidad', '/cuadrillas', '/viajes', '/actas-devolucion', '/perfiles'],
  voluntario: ['/viajes', '/perfiles', '/reuniones'],
};

const SECTIONS = [
  {
    label: 'Jefe de Cuadrilla',
    links: [
      {
        to: '/solicitudes',
        label: 'Solicitudes',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        ),
      },
      {
        to: '/recepcion',
        label: 'Confirmar Recepción',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        ),
      },
      {
        to: '/viajes',
        label: 'Viajes',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Enc. Alimentación',
    links: [
      {
        to: '/aprobacion',
        label: 'Aprobación',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Personal de Bodega',
    links: [
      {
        to: '/despacho',
        label: 'Despacho',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        ),
      },
      {
        to: '/inventario',
        label: 'Inventario',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Seguimiento',
    links: [
      {
        to: '/trazabilidad',
        label: 'Trazabilidad',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Administración para Cuadrillas',
    links: [
      {
        to: '/cuadrillas',
        label: 'Cuadrillas',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        to: '/items',
        label: 'Añadir Items',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
      },
      {
        to: '/despacho-herramientas',
        label: 'Despacho Items',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        ),
      },
      {
        to: '/actas-devolucion',
        label: 'Actas de Devolución',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Cuenta y Perfil',
    links: [
      {
        to: '/perfiles',
        label: 'Mi Perfil',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        to: '/reuniones',
        label: 'Reuniones',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        ),
      },
    ],
  },
];

const ROLE_LABELS = {
  jefe_cuadrilla: 'Jefe de Cuadrilla',
  enc_alimentacion: 'Enc. Alimentación',
  bodega: 'Personal de Bodega',
  admin_bodega: 'Admin. Bodega',
  administrador: 'Administrador',
  coordinador_viajes: 'Coordinador de Viajes',
  voluntario: 'Voluntario',
};

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const user = getUser();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.name ? user.name[0].toUpperCase() : 'U';
  const userRole = user?.role || 'jefe_cuadrilla';
  const roleLabel = ROLE_LABELS[userRole] || userRole;
  const allowedLinks = ROLE_LINKS[userRole] || [];

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      <aside className={`sidebar${mobileOpen ? ' open' : ''}${collapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-inner">
            <div className="sidebar-logo">
              <svg viewBox="0 0 100 100" width="36" height="36">
                <circle cx="50" cy="50" r="48" fill="#1DA1D4" />
                <path d="M50 20 L30 45 L38 45 L38 65 L62 65 L62 45 L70 45 Z" fill="white" />
              </svg>
            </div>
            {!collapsed && (
              <div className="sidebar-brand-text">
                <h3>TechoONG</h3>
              </div>
            )}
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {SECTIONS.map((section) => {
            const visibleLinks = section.links.filter((link) =>
              allowedLinks.includes(link.to)
            );
            if (visibleLinks.length === 0) return null;

            return (
              <div key={section.label}>
                {!collapsed && <span className="sidebar-section-label">{section.label}</span>}
                {visibleLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `sidebar-link${isActive ? ' active' : ''}`
                    }
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? link.label : undefined}
                  >
                    {link.icon}
                    {!collapsed && <span>{link.label}</span>}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-info" onClick={() => setShowUserModal(true)} style={{ cursor: 'pointer' }} title="Ver mis datos">
            <div className="sidebar-avatar">{initial}</div>
            {!collapsed && (
              <div className="sidebar-user-details">
                <span className="sidebar-user-name">{user?.name || 'Usuario'}</span>
                <span className="sidebar-user-role">{roleLabel}</span>
              </div>
            )}
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Cerrar sesión">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="Mi Perfil"
        footer={
          <button className="btn btn-ghost" onClick={() => setShowUserModal(false)}>Cerrar</button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)', padding: 'var(--space-md) 0' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--accent-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--accent-hover)',
          }}>
            {initial}
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {user?.name || 'Usuario'}
            </p>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--accent-subtle)',
              color: 'var(--accent-hover)',
            }}>
              {roleLabel}
            </span>
          </div>
          <div style={{
            width: '100%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
          }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{user?.name || '-'}</p>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RUT</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{user?.rut || '-'}</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
