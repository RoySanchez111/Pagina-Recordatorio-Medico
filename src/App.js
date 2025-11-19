import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import DashboardLayoutAdmin from './DashboardLayoutAdmin';
import DashboardLayoutDoctor from './DashboardLayoutDoctor';
import Usuarios from './Usuarios';
import AgregarUsuario from './AgregarUsuario';
import EditarUsuario from './EditarUsuario';
import './App.css';

import VerPacientes from './VerPacientes';
import AgregarPacientes from './AgregarPacientes';
import AgregarReceta from './AgregarReceta'; 
import VerRecetas from './VerRecetas';
import GestionConsultas from './GestionConsultas';
import Perfil from './Perfil';
import ChangePassword from './ChangePassword'; 

// --- CORRECCIÓN CRÍTICA: BLINDAJE DE MAYÚSCULAS/MINÚSCULAS ---
const ProtectedRoute = ({ children, rolPermitido }) => {
  const rol = localStorage.getItem('rol');
  
  if (!rol) return <Navigate to="/login" replace />;

  // Normalizamos ambos lados a minúsculas para evitar errores de escritura
  const rolUsuario = rol.toLowerCase().trim();
  const rolRequerido = rolPermitido.toLowerCase().trim();

  if (rolUsuario !== rolRequerido) {
    // Si el rol no coincide, redirigimos según el rol que SÍ tiene el usuario
    switch (rolUsuario) {
      case 'administrador': return <Navigate to="/dashboard/usuarios" replace />;
      case 'doctor': return <Navigate to="/doctor/ver-pacientes" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }
  return children;
};

// Protección común para rutas compartidas (Cambiar Contraseña)
const CommonProtectedRoute = ({ children }) => {
  const rol = localStorage.getItem('rol');
  if (!rol) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* RUTA GLOBAL PARA CAMBIO DE CONTRASEÑA 
          Esta es la que llama Perfil.js con navigate('/change-password')
      */}
      <Route 
        path="/change-password" 
        element={
          <CommonProtectedRoute>
            <ChangePassword />
          </CommonProtectedRoute>
        } 
      />

      {/* Rutas de ADMINISTRADOR */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute rolPermitido="Administrador">
            <DashboardLayoutAdmin />
          </ProtectedRoute>
        }
      >
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="agregar-usuario" element={<AgregarUsuario />} />
        <Route path="editar-usuario" element={<EditarUsuario />} />
        {/* Ruta anidada opcional si quieres que aparezca dentro del layout */}
        <Route path="change-password" element={<ChangePassword />} /> 
        <Route index element={<Usuarios />} />
      </Route>

      {/* Rutas de DOCTOR */}
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute rolPermitido="Doctor">
            <DashboardLayoutDoctor />
          </ProtectedRoute>
        }
      >
        <Route path="ver-pacientes" element={<VerPacientes />} />
        <Route path="agregar-pacientes" element={<AgregarPacientes />} />
        <Route path="agregar-receta" element={<AgregarReceta />} />
        <Route path="ver-recetas" element={<VerRecetas />} />
        <Route path="gestionar-consultas" element={<GestionConsultas />} />
        <Route path="perfil" element={<Perfil />} />
        {/* Ruta anidada opcional */}
        <Route path="change-password" element={<ChangePassword />} /> 
        <Route index element={<VerPacientes />} />
      </Route>

      {/* Cualquier ruta desconocida manda al Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;