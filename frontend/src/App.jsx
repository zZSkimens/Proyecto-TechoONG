import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { isAuthenticated, getUser } from './services/auth.service.js';
import Sidebar from './components/Sidebar.jsx';
import ToastContainer from './components/Toast.jsx';
import LoginPage from './pages/Login.jsx';
import SolicitudesPage from './pages/Solicitudes.jsx';
import AprobacionPage from './pages/Aprobacion.jsx';
import DespachoPage from './pages/Despacho.jsx';
import RecepcionPage from './pages/Recepcion.jsx';
import TrazabilidadPage from './pages/Trazabilidad.jsx';
import InventarioPage from './pages/Inventario.jsx';
import CuadrillasPage from './pages/Cuadrillas.jsx';
import ViajesPage from './pages/Viajes.jsx';
import ItemsPage from './pages/Items.jsx';
import DespachoHerramientasPage from './pages/DespachoHerramientas.jsx';
import ActaDevolucionPage from './pages/ActaDevolucion.jsx';
import PerfilesPage from './pages/Perfiles.jsx';
import './App.css';

const ROLE_ROUTES = {
  jefe_cuadrilla: ['/solicitudes', '/recepcion', '/cuadrillas', '/perfiles'],
  enc_alimentacion: ['/aprobacion', '/trazabilidad', '/perfiles'],
  bodega: ['/despacho', '/inventario', '/perfiles'],
  admin_bodega: ['/despacho', '/inventario', '/items', '/despacho-herramientas', '/actas-devolucion', '/perfiles'],
  administrador: ['/solicitudes', '/recepcion', '/aprobacion', '/despacho', '/inventario', '/trazabilidad', '/cuadrillas', '/items', '/despacho-herramientas', '/actas-devolucion', '/perfiles'],
  coordinador_viajes: ['/solicitudes', '/recepcion', '/aprobacion', '/despacho', '/inventario', '/trazabilidad', '/cuadrillas', '/viajes', '/actas-devolucion', '/perfiles'],
  voluntario: ['/viajes', '/perfiles'],
};

function getDefaultRoute(role) {
  const routes = ROLE_ROUTES[role];
  return routes && routes.length > 0 ? routes[0] : '/solicitudes';
}

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRoute({ children }) {
  const user = getUser();
  const userRole = user?.role || 'jefe_cuadrilla';
  const allowed = ROLE_ROUTES[userRole] || [];
  const location = useLocation();

  if (!allowed.includes(location.pathname)) {
    return <Navigate to={getDefaultRoute(userRole)} replace />;
  }

  return children;
}

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className={`app-main${collapsed ? ' app-main-collapsed' : ''}`}>
        {children}
      </main>
    </div>
  );
}

export default function App() {

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/solicitudes" element={
                    <RoleRoute><SolicitudesPage /></RoleRoute>
                  } />
                  <Route path="/aprobacion" element={
                    <RoleRoute><AprobacionPage /></RoleRoute>
                  } />
                  <Route path="/despacho" element={
                    <RoleRoute><DespachoPage /></RoleRoute>
                  } />
                  <Route path="/recepcion" element={
                    <RoleRoute><RecepcionPage /></RoleRoute>
                  } />
                  <Route path="/trazabilidad" element={
                    <RoleRoute><TrazabilidadPage /></RoleRoute>
                  } />
                  <Route path="/inventario" element={
                    <RoleRoute><InventarioPage /></RoleRoute>
                  } />
                  <Route path="/cuadrillas" element={
                    <RoleRoute><CuadrillasPage /></RoleRoute>
                  } />
                  <Route path="/viajes" element={
                    <RoleRoute><ViajesPage /></RoleRoute>
                  } />
                  <Route path="/items" element={
                    <RoleRoute><ItemsPage /></RoleRoute>
                  } />
                  <Route path="/despacho-herramientas" element={
                    <RoleRoute><DespachoHerramientasPage /></RoleRoute>
                  } />
                  <Route path="/actas-devolucion" element={
                    <RoleRoute><ActaDevolucionPage /></RoleRoute>
                  } />
                  <Route path="/perfiles" element={
                    <RoleRoute><PerfilesPage /></RoleRoute>
                  } />
                  <Route path="*" element={<DefaultRedirect />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function DefaultRedirect() {
  const user = getUser();
  const userRole = user?.role || 'jefe_cuadrilla';
  return <Navigate to={getDefaultRoute(userRole)} replace />;
}
