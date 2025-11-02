import React, { useState, useEffect } from 'react';
import './App.css';
import usuariosAzul from './assets/usuarios-azul.png';
import usuariosData from './usuarios.json'; // ← Importamos el JSON

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [filtro, setFiltro] = useState('Todos');

    // 🔄 Cargar usuarios desde JSON o localStorage
    useEffect(() => {
        const guardados = JSON.parse(localStorage.getItem('usuarios'));
        if (guardados) {
            setUsuarios(guardados);
        } else {
            setUsuarios(usuariosData);
        }
    }, []);

    // 🎯 Filtrar usuarios según el rol seleccionado
    const usuariosFiltrados = usuarios.filter(u =>
        filtro === 'Todos' ? true : u.rol.toLowerCase() === filtro.toLowerCase()
    );

    return (
        <div className="usuarios-container">
            <h2 className="page-title">
                <img src={usuariosAzul} alt="Usuarios" />
                Usuarios
            </h2>

            {/* --- Botones de Filtro --- */}
            <div className="filter-buttons">
                {['Todos', 'Doctor', 'Paciente', 'Administrador'].map(tipo => (
                    <button
                        key={tipo}
                        className={`filter-btn ${filtro === tipo ? 'active' : ''}`}
                        onClick={() => setFiltro(tipo)}
                    >
                        {tipo}
                    </button>
                ))}
            </div>


            {/* --- Tabla de Usuarios --- */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nombreCompleto || `${user.nombre || ''} ${user.apellido || ''}`}</td>
                                <td>{user.rol}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Usuarios;
