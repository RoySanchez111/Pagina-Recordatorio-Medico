import React, { useState, useEffect } from 'react'; 
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import './App.css'; 

function DashboardLayout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [adminName, setAdminName] = useState('Admin'); 

    useEffect(() => {
        const nombreGuardado = localStorage.getItem('nombre'); 
        if (nombreGuardado) {
            setAdminName(nombreGuardado.split(' ')[0]); 
        }
    }, []); 

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="dashboard-container">
            <Sidebar 
                isSidebarCollapsed={isSidebarCollapsed} 
                toggleSidebar={toggleSidebar} 
            />
            
            <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                
                <header className="main-header">
                    <div className="doctor-info"> 
                        <span className="doctor-name">{adminName}</span>
                        <span className="doctor-title">Admin</span>
                    </div>
                </header>

                <div className="page-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}

export default DashboardLayout;