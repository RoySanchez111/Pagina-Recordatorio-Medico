import React, { useState, useEffect } from 'react';
import './App.css';
import usuariosAzul from './assets/usuarios-azul.png';
// import usuariosData from './usuarios.json'; // <-- ELIMINADO

// <-- AÑADIDO: Tu URL de API
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/"; // <-- PEGA TU URL

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [filtro, setFiltro] = useState('Todos');
    const [isLoading, setIsLoading] = useState(true); // <-- AÑADIDO
    const [error, setError] = useState(null); // <-- AÑADIDO

    // <-- MODIFICADO: Cargar usuarios desde la API
    useEffect(() => {
        const fetchUsuarios = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const payload = {
                    action: "getAllUsers",
                    data: {} // No necesitamos enviar datos, pero la API espera el 'action'
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
    }, []); // Se ejecuta una vez al cargar

    // --- ¡NUEVA FUNCIÓN! ---
    // Llama a la API para eliminar un usuario
    const handleEliminarUsuario = async (userId) => {
        // (Quitamos window.confirm por simplicidad)
        
        // Actualización optimista: lo quitamos de la UI primero
        const usuariosOriginales = [...usuarios];
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
            // Si tiene éxito, no hacemos nada (ya se quitó de la UI)

        } catch (err) {
            alert(`Error al eliminar: ${err.message}`);
            // Si falla, revertimos el cambio en la UI
            setUsuarios(usuariosOriginales);
        }
    };

    // 🎯 Filtrar usuarios (lógica sin cambios)
    const usuariosFiltrados = usuarios.filter(u =>
        filtro === 'Todos' ? true : u.rol.toLowerCase() === filtro.toLowerCase()
    );

    // --- ESTADOS DE CARGA Y ERROR ---
    if (isLoading) {
        return (
            <div className="usuarios-container">
                <h2 className="page-title">
                    <img src={usuariosAzul} alt="Usuarios" />
                    Usuarios
                </h2>
                <p style={{ textAlign: 'center', padding: '20px' }}>Cargando usuarios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="usuarios-container">
                <h2 className="page-title">
                    <img src={usuariosAzul} alt="Usuarios" />
                    Usuarios
                </h2>
                <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                    Error al cargar: {error}
                </p>
            </div>
        );
    }

    return (
        <div className="usuarios-container">
            <h2 className="page-title">
                <img src={usuariosAzul} alt="Usuarios" />
                Usuarios
            </h2>

            {/* --- Botones de Filtro (MODIFICADO) --- */}
            <div className="filter-buttons">
                {/* Quitamos el filtro 'Paciente' */}
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


            {/* --- Tabla de Usuarios (MODIFICADA) --- */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Rol</th>
                            <th>Correo</th>
                            <th>Acciones</th> {/* <-- AÑADIDO */}
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
                                    {/* <-- AÑADIDO: Botón de eliminar --> */}
                                    <button
                                        className="btn-eliminar" // (Asegúrate de tener este estilo en App.css)
                                        onClick={() => handleEliminarUsuario(user.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Usuarios;