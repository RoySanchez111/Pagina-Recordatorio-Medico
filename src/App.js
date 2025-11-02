import { Routes, Route } from 'react-router-dom';
import Login from './Login'; 
import DashboardLayout from './DashboardLayout'; 
import Usuarios from './Usuarios';
import AgregarUsuario from './AgregarUsuario';
import EditarUsuario from './EditarUsuario';

// --- 1. IMPORTAR LOS NUEVOS COMPONENTES ---
import Recetas from './Recetas';
import GestionConsultas from './GestionConsultas';
import SolicitarConsulta from './SolicitarConsulta';

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
        
        {/* --- 2. AÑADIR LAS NUEVAS RUTAS --- */}
        <Route path="recetas" element={<Recetas />} />
        <Route path="consultas" element={<GestionConsultas />} />
        <Route path="solicitar-consulta" element={<SolicitarConsulta />} />

        {/* Opcional: una ruta por defecto */}
        <Route index element={<Usuarios />} /> 
      </Route>
    </Routes>
  );
}

export default App;