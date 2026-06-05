import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../services/auth.service.js';
import { useState } from 'react';
import '../styles/Sidebar.css';

const ROLE_LINKS = {
  jefe_cuadrilla: ['/solicitudes', '/recepcion', '/cuadrillas'],
  enc_alimentacion: ['/aprobacion', '/trazabilidad'],
  bodega: ['/despacho', '/inventario'],
  administrador: ['/solicitudes', '/recepcion', '/aprobacion', '/despacho', '/inventario', '/trazabilidad', '/cuadrillas'],
  coordinador_viajes: ['/solicitudes', '/recepcion', '/aprobacion', '/despacho', '/inventario', '/trazabilidad', '/cuadrillas', '/viajes'],
  voluntario: ['/viajes'],
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
    label: 'Administración',
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
    ],
  },
];

export default function Sidebar() {
  const user = getUser();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.name ? user.name[0].toUpperCase() : 'U';
  const userRole = user?.role || 'jefe_cuadrilla';
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

      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-inner">
            <div className="sidebar-logo">T</div>
            <div className="sidebar-brand-text">
              <h3>TechoONG</h3>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {SECTIONS.map((section) => {
            const visibleLinks = section.links.filter((link) =>
              allowedLinks.includes(link.to)
            );
            if (visibleLinks.length === 0) return null;

            return (
              <div key={section.label}>
                <span className="sidebar-section-label">{section.label}</span>
                {visibleLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `sidebar-link${isActive ? ' active' : ''}`
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">{initial}</div>
            <span className="sidebar-user-email">{user?.name || 'Usuario'}</span>
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
    </>
  );
}
