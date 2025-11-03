import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './SidebarDoctor'; // Importamos el Sidebar
import './App.css'; // Usa el CSS global

function DoctorDashboardLayout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // --- NUEVO ESTADO PARA EL NOMBRE DEL DOCTOR ---
    const [doctorName, setDoctorName] = useState('Doctor'); // Valor por defecto

    // --- Cargar nombre del doctor al montar ---
    useEffect(() => {
        // 'nombre' debe coincidir con la 'key' que guardas en Login.js
        const nombreGuardado = localStorage.getItem('nombre'); 
        if (nombreGuardado) {
            // Tomamos solo el primer nombre (Ej. "Nicolás" de "Nicolás Alvarez")
            setDoctorName(nombreGuardado.split(' ')[0]); 
        }
    }, []); // Se ejecuta solo una vez al cargar el layout

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // --- IMPORTANTE ---
    // Eliminamos 'currentTitle', 'handleNavigation' y la prop 'onNavigate' del Sidebar.
    // El título ahora vivirá dentro de cada componente (VerPacientes, AgregarReceta, etc.)
    // para imitar el layout del Admin.

    return (
        <div className="dashboard-container">
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                toggleSidebar={toggleSidebar}
                // onNavigate ya no se pasa
            />
            
            <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                
                {/* 1. Cabecera (Header) - MODIFICADA */}
                <header className="main-header">
                    {/* EL TÍTULO AZUL (.view-title) SE HA ELIMINADO DE AQUÍ.
                      Ahora usaremos .page-title dentro de cada componente hijo
                      para que coincida con el diseño del Admin.
                    */}
                    <div className="header-title-section">
                        {/* Esta sección ahora está vacía */}
                    </div>

                    {/* Información del Doctor (AHORA DINÁMICO) */}
                    <div className="doctor-info">
                        {/* Se usa el estado 'doctorName' */}
                        <span className="doctor-name">{doctorName}</span>
                        <span className="doctor-title">Médico</span>
                    </div>
                </header>

                {/* 2. Contenido de la Página */}
                <div className="page-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}

export default DoctorDashboardLayout;
