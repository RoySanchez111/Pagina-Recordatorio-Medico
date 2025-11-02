import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Importamos el Sidebar
import './App.css'; // Usa el CSS global

function DashboardLayout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Esta función se pasará al Sidebar para que pueda cambiar el estado
    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="dashboard-container">
            {/* El sidebar recibe el estado y la función para cambiarlo */}
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                toggleSidebar={toggleSidebar} 
            />
            
            {/* El contenido principal se ajusta si el sidebar está colapsado */}
            <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                
                {/* 1. Cabecera (Header) */}
                <header className="main-header">
                    <div className="admin-info">
                        <span>Admin</span>
                        <span>Admin</span>
                    </div>
                </header>

                {/* 2. Contenido de la Página (Aquí se cargan Usuarios, Agregar, etc.) */}
                <div className="page-content">
                    {/* Outlet es el marcador de posición de react-router
                        donde se renderizarán las rutas hijas (Usuarios, etc.) */}
                    <Outlet />
                </div>

            </main>

            {/* === BOTONES DE ACCESIBILIDAD === */}
            {/* Botón flotante de accesibilidad */}
            <button id="toggle-accessibility" className="btn-accessibility">
                ♿ Accesibilidad
            </button>

            {/* Panel de opciones de accesibilidad */}
            <div id="accessibility-panel" style={{display: 'none'}}>
                <h3>Opciones de Accesibilidad</h3>
                <button id="increase-text">Aumentar Texto</button>
                <button id="decrease-text">Reducir Texto</button>
                <button id="read-buttons">Leer Botones</button>
                <button id="toggle-contrast">Alto Contraste</button>
                <button id="reset-accessibility">Restablecer</button>
            </div>
            
        </div>
    );
}

export default DashboardLayout;
