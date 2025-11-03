import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './App.css'; 

import usuariosAzul from './assets/usuarios-azul.png';
import usuariosNegro from './assets/usuarios-negro.png';
import agregarAzul from './assets/agregar-azul.png';
import agregarNegro from './assets/agregar-negro.png';
import consultasAzul from './assets/consultas-azul.png';
import consultasNegro from './assets/consultas-negro.png';
import salirImg from './assets/salir.png';
import flechaImg from './assets/flecha-para-cerrar-barra.png';
import recetaIconoAzul from './assets/editar-azul.png';
import recetaIconoNegro from './assets/editar-negro.png';


function SidebarDoctor({ isCollapsed, toggleSidebar }) { 
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('rol');
        localStorage.removeItem('nombre');
        localStorage.removeItem('userId'); // Limpiar el ID al salir
        navigate('/login'); 
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            
            <div className="logo-section">
                <span className="logo-text">[ LOGO ]</span>
            </div>

            <nav className="nav-menu">
                
                <NavLink 
                    to="/doctor/ver-pacientes" 
                    className="nav-item"
                >
                    {({ isActive }) => (
                        <>
                            <img src={isActive ? usuariosAzul : usuariosNegro} alt="Ver pacientes" />
                            <span className="nav-text">Mis Pacientes</span>
                        </>
                    )}
                </NavLink>

                <NavLink 
                    to="/doctor/agregar-receta" 
                    className="nav-item"
                >
                    {({ isActive }) => (
                        <>
                            <img src={isActive ? agregarAzul : agregarNegro} alt="Agregar receta" />
                            <span className="nav-text">Agregar receta</span>
                        </>
                    )}
                </NavLink>

                <NavLink 
                    to="/doctor/ver-recetas" 
                    className="nav-item"
                >
                    {({ isActive }) => (
                        <>
                            <img src={isActive ? recetaIconoAzul : recetaIconoNegro} alt="Ver recetas" />
                            <span className="nav-text">Mis Recetas</span>
                        </>
                    )}
                </NavLink>

                <NavLink 
                    to="/doctor/agregar-pacientes" 
                    className="nav-item"
                >
                    {({ isActive }) => (
                        <>
                            <img src={isActive ? agregarAzul : agregarNegro} alt="Agregar pacientes" />
                            <span className="nav-text">Agregar pacientes</span>
                        </>
                    )}
                </NavLink>

                <NavLink 
                    to="/doctor/gestionar-consultas" 
                    className="nav-item"
                >
                    {({ isActive }) => (
                        <>
                            <img src={isActive ? consultasAzul : consultasNegro} alt="Gestionar Consultas" />
                            <span className="nav-text">Consultas</span>
                        </>
                    )}
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="nav-item logout-btn" onClick={handleLogout}>
                    <img src={salirImg} alt="Salir" />
                    <span className="nav-text">Salir</span>
                </div>

                <div className="toggle-btn" onClick={toggleSidebar}>
                    <img 
                        src={flechaImg} 
                        alt="Toggle" 
                        className={isCollapsed ? 'flipped' : ''} 
                    />
                </div>
            </div>
        </div>
    );
}

export default SidebarDoctor;