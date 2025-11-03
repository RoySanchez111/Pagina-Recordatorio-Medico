import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import DashboardLayoutAdmin from './DashboardLayoutAdmin';
import DashboardLayoutDoctor from './DashboardLayoutDoctor';
import Usuarios from './Usuarios';
import AgregarUsuario from './AgregarUsuario';
import EditarUsuario from './EditarUsuario';
import './App.css';

// --- IMPORTAR LOS NUEVOS COMPONENTES DEL DOCTOR ---
import VerPacientes from './VerPacientes';
import AgregarPacientes from './AgregarPacientes';
import AgregarReceta from './AgregarReceta'; 
// --- (Ya no necesitas el import de AgregarReceta que tenías antes) ---

// --- BORRASTE LOS CONST VERPACIENTES Y AGREGARPACIENTES DE EJEMPLO ---

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

      {/* ADMIN */}
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

      {/* DOCTOR */}
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute rolPermitido="Doctor">
            <DashboardLayoutDoctor />
          </ProtectedRoute>
        }
      >
        {/* Estas rutas ahora usarán los archivos importados */}
        <Route path="ver-pacientes" element={<VerPacientes />} />
        <Route path="agregar-pacientes" element={<AgregarPacientes />} />
        <Route path="agregar-receta" element={<AgregarReceta />} />
        <Route path="perfil" element={<div>Mi Perfil del Doctor</div>} />
        <Route index element={<VerPacientes />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
