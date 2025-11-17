import React, { useState, useEffect } from 'react';
import './App.css';

function GestionConsultas() {
    const [consultas, setConsultas] = useState([]);
    const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const [mostrarModalReprogramar, setMostrarModalReprogramar] = useState(false);
    const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
    const [nuevaFecha, setNuevaFecha] = useState('');
    const [motivoCancelacion, setMotivoCancelacion] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');

    // Datos de ejemplo mejorados
    const datosEjemplo = [
        {
            id: 1,
            paciente: "María González",
            edad: 34,
            telefono: "+34 612 345 678",
            doctor: "Dr. Carlos Rodríguez",
            especialidad: "Neurología",
            fecha: "2024-03-15T10:00",
            motivo: "Dolor de cabeza persistente",
            sintomas: "Mareos, visión borrosa",
            status: "pendiente",
            prioridad: "media"
        },
        {
            id: 2,
            paciente: "Juan Pérez",
            edad: 45,
            telefono: "+34 623 456 789",
            doctor: "Dra. Ana Martínez",
            especialidad: "Cardiología",
            fecha: "2024-03-16T14:30",
            motivo: "Control de presión arterial",
            sintomas: "Palpitaciones ocasionales",
            status: "aceptada",
            prioridad: "alta"
        },
        {
            id: 3,
            paciente: "Laura Sánchez",
            edad: 28,
            telefono: "+34 634 567 890",
            doctor: "Dr. Carlos Rodríguez",
            especialidad: "Alergología",
            fecha: "2024-03-17T09:15",
            motivo: "Consulta por alergias estacionales",
            sintomas: "Estornudos, picor ocular",
            status: "reprogramada",
            fechaOriginal: "2024-03-10T09:15",
            prioridad: "baja"
        }
    ];

    useEffect(() => {
        cargarConsultas();
    }, []);

    const cargarConsultas = () => {
        setConsultas(datosEjemplo);
    };

    const abrirMenu = (consulta, event) => {
        event.stopPropagation();
        setConsultaSeleccionada(consulta);
        setMostrarMenu(true);
    };

    const cerrarMenu = () => {
        setMostrarMenu(false);
        setConsultaSeleccionada(null);
    };

    const handleUpdateStatus = (id, newStatus, datosAdicionales = {}) => {
        const actualizadas = consultas.map(c => 
            c.id === id ? { ...c, status: newStatus, ...datosAdicionales } : c
        );
        setConsultas(actualizadas);
        cerrarMenu();
    };

    const abrirModalReprogramar = () => {
        setNuevaFecha(consultaSeleccionada?.fecha || '');
        setMostrarModalReprogramar(true);
        setMostrarMenu(false);
    };

    const cerrarModalReprogramar = () => {
        setMostrarModalReprogramar(false);
        setNuevaFecha('');
    };

    const abrirModalCancelar = () => {
        setMotivoCancelacion('');
        setMostrarModalCancelar(true);
        setMostrarMenu(false);
    };

    const cerrarModalCancelar = () => {
        setMostrarModalCancelar(false);
        setMotivoCancelacion('');
    };

    const handleReprogramar = () => {
        if (!nuevaFecha) {
            alert('Por favor, selecciona una nueva fecha');
            return;
        }

        handleUpdateStatus(consultaSeleccionada.id, 'reprogramada', {
            fecha: nuevaFecha,
            fechaOriginal: consultaSeleccionada.fechaOriginal || consultaSeleccionada.fecha
        });
        cerrarModalReprogramar();
    };

    const handleCancelar = () => {
        if (!motivoCancelacion.trim()) {
            alert('Por favor, especifica el motivo de la cancelación');
            return;
        }

        handleUpdateStatus(consultaSeleccionada.id, 'cancelada', {
            motivoCancelacion: motivoCancelacion,
            fechaCancelacion: new Date().toISOString()
        });
        cerrarModalCancelar();
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'aceptada': return 'status-aceptada';
            case 'reprogramada': return 'status-reprogramada';
            case 'cancelada': return 'status-cancelada';
            case 'completada': return 'status-completada';
            default: return 'status-pendiente';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'aceptada': return 'Aceptada';
            case 'reprogramada': return 'Reprogramada';
            case 'cancelada': return 'Cancelada';
            case 'completada': return 'Completada';
            default: return 'Pendiente';
        }
    };

    const getPrioridadClass = (prioridad) => {
        switch(prioridad) {
            case 'alta': return 'prioridad-alta';
            case 'media': return 'prioridad-media';
            default: return 'prioridad-baja';
        }
    };

    const getPrioridadText = (prioridad) => {
        switch(prioridad) {
            case 'alta': return 'Alta';
            case 'media': return 'Media';
            default: return 'Baja';
        }
    };

    const consultasFiltradas = consultas.filter(consulta => {
        if (filtroEstado === 'todos') return true;
        return consulta.status === filtroEstado;
    });

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = () => {
            if (mostrarMenu) {
                cerrarMenu();
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [mostrarMenu]);

    const stats = {
        total: consultas.length,
        pendientes: consultas.filter(c => c.status === 'pendiente').length,
        aceptadas: consultas.filter(c => c.status === 'aceptada').length,
        reprogramadas: consultas.filter(c => c.status === 'reprogramada').length,
        canceladas: consultas.filter(c => c.status === 'cancelada').length
    };

    return (
        <div className="gestion-consultas-container">
            {/* Header */}
            <div className="header-section">
                <h1 className="page-title">Gestión de Consultas Médicas</h1>
                <p className="page-subtitle">Administra y organiza las consultas de tus pacientes</p>
            </div>

            {/* Contenedor Principal */}
            <div className="main-content-container">
                {/* Estadísticas */}
                <div className="stats-section">
                    <div className="section-title">Resumen de Consultas</div>
                    <div className="stats-container">
                        <div className="stat-card total">
                            <div className="stat-info">
                                <span className="stat-number">{stats.total}</span>
                                <span className="stat-label">Total Consultas</span>
                            </div>
                        </div>
                        <div className="stat-card pendientes">
                            <div className="stat-info">
                                <span className="stat-number">{stats.pendientes}</span>
                                <span className="stat-label">Pendientes</span>
                            </div>
                        </div>
                        <div className="stat-card aceptadas">
                            <div className="stat-info">
                                <span className="stat-number">{stats.aceptadas}</span>
                                <span className="stat-label">Aceptadas</span>
                            </div>
                        </div>
                        <div className="stat-card reprogramadas">
                            <div className="stat-info">
                                <span className="stat-number">{stats.reprogramadas}</span>
                                <span className="stat-label">Reprogramadas</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="filters-section">
                    <div className="section-title">Filtros</div>
                    <div className="filters-container">
                        <div className="filter-group">
                            <label>Filtrar por estado:</label>
                            <select 
                                value={filtroEstado} 
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="filter-select"
                            >
                                <option value="todos">Todos los estados</option>
                                <option value="pendiente">Pendientes</option>
                                <option value="aceptada">Aceptadas</option>
                                <option value="reprogramada">Reprogramadas</option>
                                <option value="cancelada">Canceladas</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Lista de consultas */}
                <div className="consultas-section">
                    <div className="section-title">Lista de Consultas</div>
                    <div className="consultas-grid">
                        {consultasFiltradas.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <h3>No hay consultas</h3>
                                <p>No se encontraron consultas con el filtro seleccionado.</p>
                            </div>
                        ) : (
                            consultasFiltradas.map(consulta => (
                                <div key={consulta.id} className="consulta-card">
                                    <div className="card-header">
                                        <div className="paciente-main-info">
                                            <h3 className="paciente-nombre">{consulta.paciente}</h3>
                                            <div className="paciente-details">
                                                <span className="edad">{consulta.edad} años</span>
                                                <span className="separator">•</span>
                                                <span className="telefono">{consulta.telefono}</span>
                                            </div>
                                        </div>
                                        <div className="card-actions">
                                            <span className={`prioridad-badge ${getPrioridadClass(consulta.prioridad)}`}>
                                                {getPrioridadText(consulta.prioridad)}
                                            </span>
                                            <button 
                                                className="btn-menu"
                                                onClick={(e) => abrirMenu(consulta, e)}
                                            >
                                                <span>⋮</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="info-grid">
                                            <div className="info-row">
                                                <span className="info-label">Doctor:</span>
                                                <span className="info-value">{consulta.doctor}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Especialidad:</span>
                                                <span className="info-value">{consulta.especialidad}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Fecha:</span>
                                                <span className="info-value">
                                                    {new Date(consulta.fecha).toLocaleString('es-ES', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            {consulta.fechaOriginal && (
                                                <div className="info-row">
                                                    <span className="info-label">Fecha Original:</span>
                                                    <span className="info-value original">
                                                        {new Date(consulta.fechaOriginal).toLocaleString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="info-row full-width">
                                                <span className="info-label">Motivo:</span>
                                                <span className="info-value">{consulta.motivo}</span>
                                            </div>
                                            {consulta.sintomas && (
                                                <div className="info-row full-width">
                                                    <span className="info-label">Síntomas:</span>
                                                    <span className="info-value">{consulta.sintomas}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <span className={`status-badge ${getStatusClass(consulta.status)}`}>
                                            {getStatusText(consulta.status)}
                                        </span>
                                        <div className="footer-actions">
                                            {consulta.status === 'aceptada' && (
                                                <button 
                                                    className="btn-action completar"
                                                    onClick={() => handleUpdateStatus(consulta.id, 'completada')}
                                                >
                                                    Marcar Completada
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Menú desplegable */}
                                    {mostrarMenu && consultaSeleccionada && consultaSeleccionada.id === consulta.id && (
                                        <div className="menu-desplegable">
                                            <div className="menu-header">
                                                <span>Opciones para {consultaSeleccionada.paciente}</span>
                                            </div>
                                            <div className="menu-contenido">
                                                {/* Opciones disponibles para todos los estados */}
                                                {consultaSeleccionada.status !== 'aceptada' && (
                                                    <button 
                                                        className="menu-item aceptar"
                                                        onClick={() => handleUpdateStatus(consultaSeleccionada.id, 'aceptada')}
                                                    >
                                                        Aceptar Consulta
                                                    </button>
                                                )}
                                                
                                                {consultaSeleccionada.status !== 'reprogramada' && (
                                                    <button 
                                                        className="menu-item reprogramar"
                                                        onClick={abrirModalReprogramar}
                                                    >
                                                        Reprogramar Consulta
                                                    </button>
                                                )}

                                                {consultaSeleccionada.status !== 'pendiente' && (
                                                    <button 
                                                        className="menu-item pendiente"
                                                        onClick={() => handleUpdateStatus(consultaSeleccionada.id, 'pendiente')}
                                                    >
                                                        Volver a Pendiente
                                                    </button>
                                                )}

                                                {consultaSeleccionada.status !== 'cancelada' && (
                                                    <button 
                                                        className="menu-item cancelar"
                                                        onClick={abrirModalCancelar}
                                                    >
                                                        Cancelar Consulta
                                                    </button>
                                                )}

                                                {consultaSeleccionada.status === 'cancelada' && (
                                                    <button 
                                                        className="menu-item reactivar"
                                                        onClick={() => handleUpdateStatus(consultaSeleccionada.id, 'pendiente')}
                                                    >
                                                        Reactivar Consulta
                                                    </button>
                                                )}

                                                <div className="menu-divider"></div>
                                                <button 
                                                    className="menu-item cerrar"
                                                    onClick={cerrarMenu}
                                                >
                                                    Cerrar Menú
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para reprogramar */}
            {mostrarModalReprogramar && (
                <div className="modal-overlay" onClick={cerrarModalReprogramar}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Reprogramar Consulta</h2>
                            </div>
                            
                            <div className="modal-body">
                                <div className="info-field">
                                    <strong>Paciente:</strong> {consultaSeleccionada?.paciente}
                                </div>
                                <div className="info-field">
                                    <strong>Fecha actual:</strong> {consultaSeleccionada && 
                                        new Date(consultaSeleccionada.fecha).toLocaleString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                    }
                                </div>
                                
                                <div className="form-field">
                                    <label>Nueva fecha y hora:</label>
                                    <input 
                                        type="datetime-local" 
                                        value={nuevaFecha}
                                        onChange={(e) => setNuevaFecha(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                        required
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleReprogramar}
                                >
                                    Confirmar Reprogramación
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={cerrarModalReprogramar}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para cancelar */}
            {mostrarModalCancelar && (
                <div className="modal-overlay" onClick={cerrarModalCancelar}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Cancelar Consulta</h2>
                            </div>
                            
                            <div className="modal-body">
                                <div className="info-field">
                                    <strong>Paciente:</strong> {consultaSeleccionada?.paciente}
                                </div>
                                <div className="info-field">
                                    <strong>Fecha de la consulta:</strong> {consultaSeleccionada && 
                                        new Date(consultaSeleccionada.fecha).toLocaleString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                    }
                                </div>
                                
                                <div className="form-field">
                                    <label>Motivo de la cancelación:</label>
                                    <textarea 
                                        value={motivoCancelacion}
                                        onChange={(e) => setMotivoCancelacion(e.target.value)}
                                        placeholder="Describe el motivo de la cancelación..."
                                        rows="4"
                                        required
                                        className="form-textarea"
                                    />
                                </div>
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    className="btn btn-danger"
                                    onClick={handleCancelar}
                                >
                                    Confirmar Cancelación
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={cerrarModalCancelar}
                                >
                                    Volver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GestionConsultas;
