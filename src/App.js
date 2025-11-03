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

const ProtectedRoute = ({ children, rolPermitido }) => {
  const rol = localStorage.getItem('rol');
  if (!rol) return <Navigate to="/login" replace />;
  if (rol !== rolPermitido) {
    switch (rol) {
      case 'Administrador': return <Navigate to="/dashboard" replace />;
      case 'Doctor': return <Navigate to="/doctor" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

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
        <Route index element={<Usuarios />} />
      </Route>

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
        <Route path="perfil" element={<div>Mi Perfil del Doctor</div>} />
        <Route index element={<VerPacientes />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;