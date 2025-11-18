import React, { useState, useEffect } from 'react';
import './App.css';
import usuariosAzul from './assets/usuarios-azul.png';

// <-- AÑADIDO: Tu URL de API
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/";

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [filtro, setFiltro] = useState('Todos');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- ESTADOS PARA EL MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState(null); // 'success' o 'error'

    // Cargar usuarios desde la API
    useEffect(() => {
        const fetchUsuarios = async () => {
            setIsLoading(true);
            setError(null);
            setDeleteStatus(null);

            try {
                const payload = {
                    action: "getAllUsers",
                    data: {}
                };
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || "No se pudieron cargar los usuarios");
                }

                const data = await response.json();
                setUsuarios(data);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

    // Abrir modal
    const handleOpenModal = (user) => {
        setError(null);
        setUsuarioAEliminar(user);
        setIsModalOpen(true);
    };

    // Cerrar modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUsuarioAEliminar(null);
        setDeleteStatus(null);
    };

    // Confirmar eliminación
    const handleConfirmarEliminar = async () => {
        if (!usuarioAEliminar || !usuarioAEliminar.id) return;

        const userId = usuarioAEliminar.id;
        const usuariosOriginales = [...usuarios];

        handleCloseModal();

        // Optimista
        setUsuarios(prevUsuarios => prevUsuarios.filter(u => u.id !== userId));

        try {
            const payload = {
                action: "deleteUser",
                data: { userId: userId }
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Error al eliminar");
            }

            setDeleteStatus('success');

        } catch (err) {
            setUsuarios(usuariosOriginales);
            setError(`Error al eliminar: ${err.message}`);
            setDeleteStatus('error');
        }
    };

    // Filtrar usuarios
    const usuariosFiltrados = usuarios.filter(u =>
        filtro === 'Todos' ? true : u.rol.toLowerCase() === filtro.toLowerCase()
    );

    // ESTADOS UI
    if (isLoading) {
        return (
            <div className="usuarios-container">
                <h2 className="page-title">
                    <img src={usuariosAzul} alt="Usuarios" />
                    Usuarios
                </h2>
                <p className="loading-message">Cargando usuarios...</p>
            </div>
        );
    }

    if (error && deleteStatus !== 'error') {
        return (
            <div className="usuarios-container">
                <h2 className="page-title">
                    <img src={usuariosAzul} alt="Usuarios" />
                    Usuarios
                </h2>
                <p className="error-message">Error al cargar: {error}</p>
            </div>
        );
    }

    return (
        <div className="usuarios-container">
            <h2 className="page-title">
                <img src={usuariosAzul} alt="Usuarios" />
                Usuarios
            </h2>

            {/* Mensaje de eliminación */}
            {deleteStatus === 'success' && (
                <div className="status-message success">
                    ¡Usuario eliminado con éxito!
                </div>
            )}
            {deleteStatus === 'error' && (
                <div className="status-message error">
                    {error}
                </div>
            )}

            {/* Filtros */}
            <div className="filter-buttons">
                {['Todos', 'Doctor', 'Administrador'].map(tipo => (
                    <button
                        key={tipo}
                        className={`filter-btn ${filtro === tipo ? 'active' : ''}`}
                        onClick={() => setFiltro(tipo)}
                    >
                        {tipo}
                    </button>
                ))}
            </div>

            {/* Tabla */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Rol</th>
                            <th>Correo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nombreCompleto}</td>
                                <td>{user.rol}</td>
                                <td>{user.correo}</td>
                                <td>
                                    <button
                                        className="btn-eliminar"
                                        onClick={() => handleOpenModal(user)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && usuarioAEliminar && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Confirmar Eliminación</h3>
                        </div>
                        <div className="modal-body">
                            <p>
                                ¿Está seguro de que desea eliminar al usuario
                                <strong className="user-name-highlight">
                                    {` ${usuarioAEliminar.nombreCompleto} `}
                                </strong>
                                con ID
                                <code className="user-id-highlight">
                                    {` ${usuarioAEliminar.id} `}
                                </code>?
                            </p>
                            <p className="warning-text">Esta acción es irreversible.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-cancel-btn" onClick={handleCloseModal}>
                                Cancelar
                            </button>
                            <button className="modal-confirm-btn" onClick={handleConfirmarEliminar}>
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Usuarios;
