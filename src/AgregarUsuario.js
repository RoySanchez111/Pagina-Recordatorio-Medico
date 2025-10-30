import React from 'react';
import './App.css'; // Usa el CSS global
import agregarAzul from './assets/agregar-azul.png';

// Petición 6: Importar la imagen de perfil (asumo .png en assets)
import defaultAvatar from './assets/default-profile-image.png';

function AgregarUsuario() {
    // Funcionalidad (useState, handlers) eliminada

    const handleSubmit = (e) => {
        e.preventDefault();
        // No hace nada
        console.log("Formulario enviado (simulación)");
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={agregarAzul} alt="Agregar" />
                Agregar Usuarios
            </h2>

            <form className="user-form-card" onSubmit={handleSubmit}>
                
                {/* --- Avatar --- */}
                <div className="avatar-section">
                    <img src={defaultAvatar} alt="Avatar" className="avatar-img" />
                    <button type="button" className="edit-avatar-btn"></button>
                </div>

                {/* --- Campos del Formulario (visuales) --- */}
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="rol">¿Qué es?</label>
                        <input type="text" id="rol" name="rol" 
                               placeholder="Doctor / Paciente / Administrador" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre(s)</label>
                        <input type="text" id="nombre" name="nombre" 
                               placeholder="Nicolas" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="apellidos">Apellidos</label>
                        <input type="text" id="apellidos" name="apellidos" 
                               placeholder="Alvarez" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="claveUnica">Clave Única</label>
                        <input type="password" id="claveUnica" name="claveUnica" 
                               placeholder="**********" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="sexo">Sexo</label>
                        <input type="text" id="sexo" name="sexo" 
                               placeholder="**********" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="telefono">Numero de Telefono</label>
                        <input type="tel" id="telefono" name="telefono" 
                               placeholder="+000 111 222 333" />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="direccion">Direccion</label>
                        <input type="text" id="direccion" name="direccion" 
                               placeholder="Direccion" />
                    </div>
                </div>

                {/* --- Botón Guardar --- */}
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Guardar</button>
                </div>

            </form>
        </div>
    );
}

export default AgregarUsuario;
