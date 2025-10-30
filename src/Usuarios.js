import React from 'react';
import './App.css'; // Usa el CSS global

// Importa el ícono del título
import usuariosAzul from './assets/usuarios-azul.png';

function Usuarios() {
    // Funcionalidad de datos eliminada
    
    return (
        <div className="usuarios-container">
            <h2 className="page-title">
                <img src={usuariosAzul} alt="Usuarios" />
                Usuarios
            </h2>

            {/* --- Botones de Filtro (visuales) --- */}
            <div className="filter-buttons">
                <button className="filter-btn active">Todos</button>
                <button className="filter-btn">Doctores</button>
                <button className="filter-btn">Pacientes</button>
                <button className="filter-btn">Administradores</button>
            </div>

            {/* --- Tabla de Usuarios (visual) --- */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Clave Única</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Filas estáticas sin funcionalidad */}
                        <tr>
                           <td>&nbsp;</td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                         <tr>
                           <td>&nbsp;</td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                         <tr>
                           <td>&nbsp;</td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                         <tr>
                           <td>&nbsp;</td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                         <tr>
                           <td>&nbsp;</td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Usuarios;