import React, { useState, useEffect } from 'react'; // 1. Importamos useEffect
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Importamos el Sidebar
import './App.css'; // Usa el CSS global

function DashboardLayout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // --- 2. AÑADIMOS EL ESTADO Y EFECTO (igual que en DoctorDashboardLayout) ---
    const [adminName, setAdminName] = useState('Admin'); // Valor por defecto

    useEffect(() => {
        // Asumimos que el nombre del admin también se guarda en 'nombre'
        const nombreGuardado = localStorage.getItem('nombre'); 
        if (nombreGuardado) {
            // Tomamos solo el primer nombre
            setAdminName(nombreGuardado.split(' ')[0]); 
        }
    }, []); // Se ejecuta solo una vez

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="dashboard-container">
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                toggleSidebar={toggleSidebar} 
            />
            
            <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                
                {/* 1. Cabecera (Header) */}
                <header className="main-header">
                    
                    {/* --- 3. SECCIÓN MODIFICADA --- */}
                    {/* Reemplazamos 'admin-info' por 'doctor-info' para REUTILIZAR el CSS */}
                    <div className="doctor-info"> 
                        {/* Usamos el estado 'adminName' */}
                        <span className="doctor-name">{adminName}</span>
                        {/* El rol es 'Admin' */}
                        <span className="doctor-title">Admin</span>
                    </div>
                    {/* --- FIN DE LA MODIFICACIÓN --- */}

                </header>

                {/* 2. Contenido de la Página */}
                <div className="page-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}

export default DashboardLayout;
