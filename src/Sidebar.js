import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './App.css'; // Usa el CSS global

// Importa tus imágenes (¡asegúrate que las rutas sean correctas!)
// Asumo que 'logo' es 'image.png' como en tu código
import logo from './assets/image.png'; 
import usuariosAzul from './assets/usuarios-azul.png';
import usuariosNegro from './assets/usuarios-negro.png';
import agregarAzul from './assets/agregar-azul.png';
import agregarNegro from './assets/agregar-negro.png';
import editarAzul from './assets/editar-azul.png';
import editarNegro from './assets/editar-negro.png';
import salirImg from './assets/salir.png';
import flechaImg from './assets/flecha-para-cerrar-barra.png';

function Sidebar({ isCollapsed, toggleSidebar }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Esta es funcionalidad de UI (navegación), la mantenemos
        navigate('/login'); // Redirige al login
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            
            {/* --- LOGO --- */}
            <div className="logo-section">
                {/* <img src={logo} alt="Logo" className="logo" /> */}
                <span className="logo-text">[ LOGO ]</span>
            </div>

            {/* --- NAVEGACIÓN --- */}
            <nav className="nav-menu">
                <NavLink to="/dashboard/usuarios" className="nav-item">
                    {({ isActive }) => (
                        <>
                            <img src={isActive ? usuariosAzul : usuariosNegro} alt="Usuarios" />
                            <span className="nav-text">Usuarios</span>
                        </>
                    )}
                </NavLink>

                <NavLink to="/dashboard/agregar-usuario" className="nav-item">
                    {({ isActive }) => (
                        <>
                            <img src={isActive ? agregarAzul : agregarNegro} alt="Agregar" />
                            <span className="nav-text">Agregar Usuario</span>
                        </>
                    )}
                </NavLink>

                <NavLink to="/dashboard/editar-usuario" className="nav-item">
                    {({ isActive }) => (
                        <>
                            <img src={isActive ? editarAzul : editarNegro} alt="Editar" />
                            <span className="nav-text">Editar Usuario</span>
                        </>
                    )}
                </NavLink>
            </nav>

            {/* --- SALIR Y TOGGLE --- */}
            <div className="sidebar-footer">
                <div className="nav-item logout-btn" onClick={handleLogout}>
                    <img src={salirImg} alt="Salir" />
                    <span className="nav-text">Salir</span>
                </div>

                <div className="toggle-btn" onClick={toggleSidebar}>
                    <img src={flechaImg} alt="Toggle" 
                         className={isCollapsed ? 'flipped' : ''} />
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
