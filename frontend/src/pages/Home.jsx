import '../styles/Home.css';

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    title: 'Gestión de Solicitudes',
    text: 'Crea, aprueba y realiza seguimiento de solicitudes de alimentación desde terreno hasta bodega.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
    title: 'Control de Inventario',
    text: 'Administra productos en bodega, controla stock, despachos y movimientos de inventario en tiempo real.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Coordinación de Voluntarios',
    text: 'Organiza cuadrillas, asigna voluntarios a obras y coordina viajes a terreno.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Trazabilidad Completa',
    text: 'Seguimiento de cada solicitud desde su creación hasta la entrega final con historial de estados.',
  },
];

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Animated background elements */}
      <div className="home-bg-decoration">
        <div className="home-bg-orb home-bg-orb-1" />
        <div className="home-bg-orb home-bg-orb-2" />
        <div className="home-bg-orb home-bg-orb-3" />
      </div>

      {/* About Section */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>¿Qué es TECHO?</h2>
          <p>Conoce nuestra organización y misión</p>
        </div>
        <div className="home-about-grid">
          <div className="home-about-card home-about-main">
            <div className="home-about-icon-wrap">
              <svg viewBox="0 0 100 100" width="48" height="48">
                <circle cx="50" cy="50" r="48" fill="#1DA1D4" />
                <path d="M50 20 L30 45 L38 45 L38 65 L62 65 L62 45 L70 45 Z" fill="white" />
              </svg>
            </div>
            <h3>Nuestra Misión</h3>
            <p>
              <strong>TECHO - Chile</strong> es una organización sin fines de lucro, presente en Latinoamérica y el Caribe,
              que busca superar la situación de pobreza que viven miles de personas en asentamientos informales,
              a través de la acción conjunta de voluntarios y comunidades.
            </p>
            <p>
              Trabajamos para construir una sociedad justa y sin pobreza, donde todas las personas tengan las
              oportunidades para desarrollar sus capacidades y ejercer sus derechos ciudadanos.
            </p>
          </div>

          <div className="home-about-card">
            <div className="home-about-card-accent" style={{ background: 'linear-gradient(135deg, #1DA1D4, #00d2ff)' }} />
            <h3>¿Quiénes Somos?</h3>
            <p>
              Somos un equipo de voluntarios, profesionales y comunidades que trabajan en conjunto
              para dar respuesta a la emergencia habitacional en Chile. A través de construcciones comunitarias,
              gestión de campamentos y proyectos de habilitación social, buscamos transformar realidades.
            </p>
            <ul className="home-about-list">
              <li>
                <span className="home-about-dot" style={{ background: '#1DA1D4' }} />
                Voluntarios comprometidos con el cambio social
              </li>
              <li>
                <span className="home-about-dot" style={{ background: '#22c55e' }} />
                Presencia en más de 30 comunas a nivel nacional
              </li>
              <li>
                <span className="home-about-dot" style={{ background: '#f59e0b' }} />
                Miles de viviendas construidas desde nuestros inicios
              </li>
            </ul>
          </div>

          <div className="home-about-card">
            <div className="home-about-card-accent" style={{ background: 'linear-gradient(135deg, #1DA1D4, #14b8a6)' }} />
            <h3>¿Qué Hace Este Software?</h3>
            <p>
              Este sistema de gestión logística fue desarrollado para optimizar las operaciones
              de TECHO Chile durante las construcciones en terreno. Permite:
            </p>
            <ul className="home-about-list">
              <li>
                <span className="home-about-dot" style={{ background: '#1DA1D4' }} />
                Gestionar solicitudes de alimentación para cuadrillas
              </li>
              <li>
                <span className="home-about-dot" style={{ background: '#00d2ff' }} />
                Controlar inventario y despachos de bodega
              </li>
              <li>
                <span className="home-about-dot" style={{ background: '#ef4444' }} />
                Coordinar viajes y despliegues a obras
              </li>
              <li>
                <span className="home-about-dot" style={{ background: '#22c55e' }} />
                Organizar cuadrillas y perfiles de voluntarios
              </li>
              <li>
                <span className="home-about-dot" style={{ background: '#f59e0b' }} />
                Trazabilidad completa de cada proceso
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Banner Image Section */}
      <section className="home-section">
        <div className="home-banner">
          <img
            src="/techo-banner.jpg"
            alt="Voluntarios de TECHO Chile celebrando frente a una vivienda construida"
            className="home-banner-img"
          />
          <div className="home-banner-overlay">
            <div className="home-banner-content">
              <svg viewBox="0 0 100 100" width="56" height="56">
                <circle cx="50" cy="50" r="48" fill="#1DA1D4" />
                <path d="M50 20 L30 45 L38 45 L38 65 L62 65 L62 45 L70 45 Z" fill="white" />
              </svg>
              <div>
                <h2>TECHO Chile</h2>
                <p>Construyendo comunidades, transformando vidas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>Funcionalidades del Sistema</h2>
          <p>Herramientas diseñadas para la gestión eficiente en terreno</p>
        </div>
        <div className="home-features-grid">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="home-feature-card"
              style={{ '--feature-delay': `${i * 0.08}s` }}
            >
              <div className="home-feature-icon">
                {feature.icon}
              </div>
              <h4>{feature.title}</h4>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <svg viewBox="0 0 100 100" width="24" height="24">
              <circle cx="50" cy="50" r="48" fill="#1DA1D4" />
              <path d="M50 20 L30 45 L38 45 L38 65 L62 65 L62 45 L70 45 Z" fill="white" />
            </svg>
            <span>TECHO Chile — Sistema de Gestión Logística</span>
          </div>
          <p>Construyendo un futuro sin pobreza, juntos.</p>
        </div>
      </footer>
    </div>
  );
}
