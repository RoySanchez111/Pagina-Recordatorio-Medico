import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './SidebarDoctor'; 
import './App.css'; 

function DoctorDashboardLayout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [doctorName, setDoctorName] = useState('Doctor'); 

    useEffect(() => {
        const nombreGuardado = localStorage.getItem('nombre'); 
        if (nombreGuardado) {
            setDoctorName(nombreGuardado.split(' ')[0]); 
        }
    }, []); 

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
                
                <header className="main-header">
                    <div className="header-title-section">
                    </div>

                    <div className="doctor-info">
                        <span className="doctor-name">{doctorName}</span>
                        <span className="doctor-title">Médico</span>
                    </div>
                </header>

                <div className="page-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}

export default DoctorDashboardLayout;