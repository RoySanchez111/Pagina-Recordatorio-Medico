import { Routes, Route } from 'react-router-dom';
import Login from './Login'; // Tu componente de Login
import DashboardLayout from './DashboardLayout'; // El nuevo layout
import Usuarios from './Usuarios';
import AgregarUsuario from './AgregarUsuario';
import EditarUsuario from './EditarUsuario';
import './App.css';
import './opciones de accesibilidad';
function App() {
  return (
    <Routes>
      {/* Ruta 1: El Login (ocupa toda la página) */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Ruta 2: El "Dashboard" que usa el layout compartido */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Estas son las páginas "hijas" que se mostrarán dentro del layout */}
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="agregar-usuario" element={<AgregarUsuario />} />
        <Route path="editar-usuario" element={<EditarUsuario />} />
        
        {/* Opcional: una ruta por defecto */}
        <Route index element={<Usuarios />} /> 
      </Route>
    </Routes>
  );
}

export default App;
