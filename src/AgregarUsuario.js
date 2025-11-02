import React, { useState } from 'react';
import './App.css';
import agregarAzul from './assets/agregar-azul.png';
import defaultAvatar from './assets/default-profile-image.png';
import usuariosData from './usuarios.json';

function AgregarUsuario() {
    // --- Estados principales ---
    const [rol, setRol] = useState('');
    const [mostrarCampos, setMostrarCampos] = useState(false);
    const [formData, setFormData] = useState({});
    const [usuarios, setUsuarios] = useState(
        JSON.parse(localStorage.getItem('usuarios')) || usuariosData
    );

    // --- Manejar cambio en campos de texto ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Manejar carga de archivo (imagen de cédula) ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Guardamos la imagen como base64 para poder mostrarla o guardarla
                setFormData({ ...formData, cedulaImagen: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Cuando cambia el rol del select ---
    const handleRolChange = (e) => {
        const valor = e.target.value;
        setRol(valor);
        setMostrarCampos(!!valor);
    };

    // --- Guardar el nuevo usuario ---
    const handleSubmit = (e) => {
        e.preventDefault();

        const nuevo = {
            id: usuarios.length + 1,
            rol: rol.charAt(0).toUpperCase() + rol.slice(1),
            avatar: defaultAvatar,
            ...formData,
        };

        const actualizados = [...usuarios, nuevo];
        setUsuarios(actualizados);
        localStorage.setItem('usuarios', JSON.stringify(actualizados));

        alert('✅ Usuario agregado con éxito');
        setFormData({});
        setRol('');
        setMostrarCampos(false);
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={agregarAzul} alt="Agregar" />
                Agregar Usuario
            </h2>

            <form className="user-form-card" onSubmit={handleSubmit}>
                {/* --- Pestaña desplegable para elegir rol --- */}
                <div className="rol-card">
                    <label htmlFor="rol" className="rol-label">
                        ¿Qué es?
                    </label>
                    <select
                        id="rol"
                        name="rol"
                        className="rol-input"
                        value={rol}
                        onChange={handleRolChange}
                    >
                        <option value="">Selecciona una opción</option>
                        <option value="doctor">Doctor</option>
                        <option value="administrador">Administrador</option>
                    </select>
                </div>

                {/* --- Campos según el rol elegido --- */}
                {mostrarCampos && (
                    <div className="form-grid">
                        {rol === 'doctor' && (
                            <>
                                <div className="form-group full-width">
                                    <label>Nombre completo</label>
                                    <input name="nombreCompleto" onChange={handleChange} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Correo</label>
                                    <input type="email" name="correo" onChange={handleChange} />
                                </div>

                                {/* Campo modificado: subir imagen de la cédula */}
                                <div className="form-group">
                                    <label>Cédula profesional (imagen)</label>
                                    <input
                                        type="file"
                                        name="cedula"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Especialidad</label>
                                    <input name="especialidad" onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input name="telefono" onChange={handleChange} />
                                </div>
                                <div className="form-group full">
                                    <label>Contraseña</label>
                                    <input type="password" name="contraseña" onChange={handleChange} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Dirección</label>
                                    <input name="direccion" onChange={handleChange} />
                                </div>
                            </>
                        )}

                        {rol === 'administrador' && (
                            <>
                                <div className="form-group full-width">
                                    <label>Correo</label>
                                    <input type="email" name="correo" onChange={handleChange} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Nombre completo</label>
                                    <input name="nombreCompleto" onChange={handleChange} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Contraseña</label>
                                    <input type="password" name="contraseña" onChange={handleChange} />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* --- Botón para guardar --- */}
                {mostrarCampos && (
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            Guardar
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default AgregarUsuario;
