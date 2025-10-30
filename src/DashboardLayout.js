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
        </div>
    );
}

export default DashboardLayout;
