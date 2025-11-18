import React, { useState, useEffect } from 'react';
import './App.css';

// --- ¡AÑADIDO! ---
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/"; // <-- PEGA TU URL

function GestionConsultas() {
    const [consultas, setConsultas] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // <-- AÑADIDO
    const [error, setError] = useState(null); // <-- AÑADIDO
    const [doctorId, setDoctorId] = useState(null); // <-- AÑADIDO
    
    const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const [mostrarModalReprogramar, setMostrarModalReprogramar] = useState(false);
    const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
    const [nuevaFecha, setNuevaFecha] = useState('');
    const [motivoCancelacion, setMotivoCancelacion] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');

    // --- ELIMINADOS los datos de ejemplo ---

    // --- MODIFICADO: Carga las consultas desde la API ---
    useEffect(() => {
        const loggedInDoctorId = localStorage.getItem('userId');
        if (loggedInDoctorId) {
            setDoctorId(loggedInDoctorId);
            cargarConsultas(loggedInDoctorId);
        } else {
            setError("No se pudo identificar al doctor. Inicie sesión de nuevo.");
            setIsLoading(false);
        }
    }, []);

    const cargarConsultas = async (docId) => {
        setIsLoading(true);
        setError(null);
        try {
            const payload = {
                action: "getConsultasByDoctor",
                data: { doctorId: docId }
            };
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "No se pudieron cargar las consultas");
            }
            const data = await response.json();
            setConsultas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
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

    // --- MODIFICADO: Llama a la API ---
    const handleUpdateStatus = async (id, newStatus, datosAdicionales = {}) => {
        const consultaOriginal = consultas.find(c => c.id === id);
        // Actualización optimista (actualiza UI primero)
        const actualizadas = consultas.map(c => 
            c.id === id ? { ...c, status: newStatus, ...datosAdicionales } : c
        );
        setConsultas(actualizadas);
        cerrarMenu();

        try {
            const payload = {
                action: "updateConsultaStatus",
                data: { consultaId: id, newStatus: newStatus }
            };
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            // Si tiene éxito, no hacemos nada (ya está en la UI)
        } catch (err) {
            // Si falla, revertimos el cambio
            alert("Error al actualizar el estado. Revirtiendo.");
            setConsultas(consultas.map(c => c.id === id ? consultaOriginal : c));
        }
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

    // --- MODIFICADO: Llama a la API ---
    const handleReprogramar = async () => {
        if (!nuevaFecha) {
            alert('Por favor, selecciona una nueva fecha');
            return;
        }

        const id = consultaSeleccionada.id;
        const fechaOriginal = consultaSeleccionada.fechaOriginal || consultaSeleccionada.fecha;

        // Actualización optimista
        const actualizadas = consultas.map(c => 
            c.id === id ? { ...c, status: 'reprogramada', fecha: nuevaFecha, fechaOriginal: fechaOriginal } : c
        );
        setConsultas(actualizadas);
        cerrarModalReprogramar();

        try {
            const payload = {
                action: "reprogramarConsulta",
                data: {
                    consultaId: id,
                    nuevaFecha: nuevaFecha,
                    fechaOriginal: fechaOriginal
                }
            };
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            alert("Error al reprogramar. Revirtiendo.");
            setConsultas(consultas.map(c => c.id === id ? consultaSeleccionada : c));
        }
    };

    // --- MODIFICADO: Llama a la API ---
    const handleCancelar = async () => {
        if (!motivoCancelacion.trim()) {
            alert('Por favor, especifica el motivo de la cancelación');
            return;
        }

        const id = consultaSeleccionada.id;

        // Actualización optimista
        const actualizadas = consultas.map(c => 
            c.id === id ? { ...c, status: 'cancelada', motivoCancelacion: motivoCancelacion, fechaCancelacion: new Date().toISOString() } : c
        );
        setConsultas(actualizadas);
        cerrarModalCancelar();

        try {
            const payload = {
                action: "cancelarConsulta",
                data: {
                    consultaId: id,
                    motivoCancelacion: motivoCancelacion
                }
            };
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            alert("Error al cancelar. Revirtiendo.");
            setConsultas(consultas.map(c => c.id === id ? consultaSeleccionada : c));
        }
    };

    // --- Funciones de ayuda (sin cambios) ---
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

    // --- MODIFICADO: Ahora calcula desde el estado 'consultas' ---
    const stats = {
        total: consultas.length,
        pendientes: consultas.filter(c => c.status === 'pendiente').length,
        aceptadas: consultas.filter(c => c.status === 'aceptada').length,
        reprogramadas: consultas.filter(c => c.status === 'reprogramada').length,
        canceladas: consultas.filter(c => c.status === 'cancelada').length
    };

    // --- ESTADOS DE CARGA Y ERROR ---
    if (isLoading) {
        return (
            <div className="gestion-consultas-container">
                <div className="header-section">
                    <h1 className="page-title">Gestión de Consultas Médicas</h1>
                </div>
                <p style={{ textAlign: 'center', padding: '40px' }}>Cargando consultas...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="gestion-consultas-container">
                <div className="header-section">
                    <h1 className="page-title">Gestión de Consultas Médicas</h1>
                </div>
                <p style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                    Error al cargar: {error}
                </p>
            </div>
        );
    }

    return (
        <div className="gestion-consultas-container">
            {/* Header (sin cambios) */}
            <div className="header-section">
                <h1 className="page-title">Gestión de Consultas Médicas</h1>
                <p className="page-subtitle">Administra y organiza las consultas de tus pacientes</p>
            </div>

            {/* Contenedor Principal */}
            <div className="main-content-container">
                {/* Estadísticas (sin cambios) */}
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

                {/* Filtros (sin cambios) */}
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

                {/* Lista de consultas (sin cambios, leerá de 'consultasFiltradas') */}
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
                                            {/* --- MODIFICADO: Leemos 'pacienteNombre' de la API --- */}
                                            <h3 className="paciente-nombre">{consulta.pacienteNombre}</h3>
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
                                                {/* --- MODIFICADO: Leemos 'doctorNombre' de la API --- */}
                                                <span className="info-value">{consulta.doctorNombre}</span>
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

                                    {/* Menú desplegable (sin cambios) */}
                                    {mostrarMenu && consultaSeleccionada && consultaSeleccionada.id === consulta.id && (
                                        <div className="menu-desplegable">
                                            <div className="menu-header">
                                                <span>Opciones para {consultaSeleccionada.pacienteNombre}</span>
                                            </div>
                                            <div className="menu-contenido">
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

            {/* Modal para reprogramar (sin cambios) */}
            {mostrarModalReprogramar && (
                <div className="modal-overlay" onClick={cerrarModalReprogramar}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Reprogramar Consulta</h2>
                            </div>
                            <div className="modal-body">
                                <div className="info-field">
                                    <strong>Paciente:</strong> {consultaSeleccionada?.pacienteNombre}
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

            {/* Modal para cancelar (sin cambios) */}
            {mostrarModalCancelar && (
                <div className="modal-overlay" onClick={cerrarModalCancelar}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Cancelar Consulta</h2>
                            </div>
                            <div className="modal-body">
                                <div className="info-field">
                                    <strong>Paciente:</strong> {consultaSeleccionada?.pacienteNombre}
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