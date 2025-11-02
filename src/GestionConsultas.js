import React, { useState, useEffect } from 'react';
import './App.css';
import editarAzul from './assets/editar-azul.png'; // Reutilizamos un icono

function GestionConsultas() {
    const [consultas, setConsultas] = useState([]);

    useEffect(() => {
        cargarConsultas();
    }, []);

    const cargarConsultas = () => {
        const guardadas = JSON.parse(localStorage.getItem('consultas')) || [];
        setConsultas(guardadas);
    };

    const handleUpdateStatus = (id, newStatus) => {
        const actualizadas = consultas.map(c => 
            c.id === id ? { ...c, status: newStatus } : c
        );
        setConsultas(actualizadas);
        localStorage.setItem('consultas', JSON.stringify(actualizadas));
    };

    const getStatusClass = (status) => {
        if (status === 'aceptada') return 'status-aceptada';
        if (status === 'reprogramada') return 'status-reprogramada';
        return 'status-pendiente';
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={editarAzul} alt="Consultas" />
                Gestionar Consultas
            </h2>

            <div className="lista-items-container">
                
                {consultas.length === 0 && (
                    <p>No hay solicitudes de consulta pendientes.</p>
                )}

                {consultas.map(c => (
                    <div key={c.id} className="item-card">
                        <h4>Paciente: {c.paciente}</h4>
                        <p>Doctor: {c.doctor || 'Sin asignar'}</p>
                        <p>Fecha Solicitada: {c.fecha}</p>
                        <p>Motivo: {c.motivo}</p>
                        
                        <p>
                            Estado: <span className={`status-badge ${getStatusClass(c.status)}`}>
                                {c.status}
                            </span>
                        </p>

                        {c.status === 'pendiente' && (
                            <div className="item-card-actions">
                                <button 
                                    className="btn btn-success"
                                    onClick={() => handleUpdateStatus(c.id, 'aceptada')}
                                >
                                    Aceptar
                                </button>
                                <button 
                                    className="btn btn-warning"
                                    onClick={() => handleUpdateStatus(c.id, 'reprogramada')}
                                >
                                    Reprogramar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GestionConsultas;