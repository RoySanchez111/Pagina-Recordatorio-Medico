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

    // --- Generador de contraseñas de 6 dígitos ---
    const generarPassword = () => {
        const password = Math.floor(100000 + Math.random() * 900000);
        return password.toString();
    };

    // --- Generar y establecer contraseña automáticamente ---
    const generarYEstablecerPassword = () => {
        const nuevaPassword = generarPassword();
        setFormData({ 
            ...formData, 
            contraseña: nuevaPassword 
        });
    };

    // --- Manejar cambio en campos de texto ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Manejar carga de archivo (cédula en PDF) ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Verificar que sea un PDF
            if (file.type !== 'application/pdf') {
                alert('Por favor, selecciona un archivo PDF');
                e.target.value = ''; // Limpiar el input
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                // Guardamos el PDF como base64 para poder almacenarlo
                setFormData({ 
                    ...formData, 
                    cedulaPDF: reader.result,
                    cedulaNombre: file.name // Guardamos también el nombre del archivo
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Cuando cambia el rol del select ---
    const handleRolChange = (e) => {
        const valor = e.target.value;
        setRol(valor);
        setMostrarCampos(!!valor);
        
        // Generar contraseña automáticamente cuando se selecciona un rol
        if (valor) {
            setTimeout(() => {
                generarYEstablecerPassword();
            }, 100);
        }
    };

    // --- Guardar el nuevo usuario ---
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar que todos los campos requeridos estén llenos
        if (!formData.nombreCompleto || !formData.correo || !formData.contraseña) {
            alert('Por favor, completa todos los campos requeridos');
            return;
        }

        const nuevo = {
            id: usuarios.length + 1,
            rol: rol.charAt(0).toUpperCase() + rol.slice(1),
            avatar: defaultAvatar,
            ...formData,
        };

        const actualizados = [...usuarios, nuevo];
        setUsuarios(actualizados);
        localStorage.setItem('usuarios', JSON.stringify(actualizados));

        alert(`✅ Usuario agregado con éxito\nContraseña generada: ${formData.contraseña}\n\n¡No olvides compartir esta contraseña con el usuario!`);
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
                                    <label>Nombre completo *</label>
                                    <input 
                                        name="nombreCompleto" 
                                        value={formData.nombreCompleto || ''}
                                        onChange={handleChange} 
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Correo *</label>
                                    <input 
                                        type="email" 
                                        name="correo" 
                                        value={formData.correo || ''}
                                        onChange={handleChange} 
                                        required
                                    />
                                </div>

                                {/* Campo modificado: subir PDF de la cédula */}
                                <div className="form-group">
                                    <label>Cédula profesional (PDF)</label>
                                    <input
                                        type="file"
                                        name="cedula"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileChange}
                                    />
                                    {formData.cedulaNombre && (
                                        <p className="file-name">Archivo seleccionado: {formData.cedulaNombre}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Especialidad</label>
                                    <input 
                                        name="especialidad" 
                                        value={formData.especialidad || ''}
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono de consultorio</label>
                                    <input 
                                        name="telefono" 
                                        value={formData.telefono || ''}
                                        onChange={handleChange} 
                                    />
                                </div>
                                
                                {/* Campo de contraseña con generador */}
                                <div className="form-group full">
                                    <label>Contraseña *</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input 
                                            type="text" 
                                            name="contraseña" 
                                            value={formData.contraseña || ''}
                                            onChange={handleChange}
                                            placeholder="Se generará automáticamente"
                                            readOnly
                                            style={{ 
                                                flex: 1,
                                                backgroundColor: '#f5f5f5',
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={generarYEstablecerPassword}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Generar
                                        </button>
                                    </div>
                                    <small style={{ color: '#666', fontSize: '12px' }}>
                                        Contraseña de 6 dígitos generada automáticamente
                                    </small>
                                </div>
                                
                                <div className="form-group full-width">
                                    <label>Dirección de consultorio</label>
                                    <input 
                                        name="direccion" 
                                        value={formData.direccion || ''}
                                        onChange={handleChange} 
                                    />
                                </div>
                            </>
                        )}

                        {rol === 'administrador' && (
                            <>
                                <div className="form-group full-width">
                                    <label>Correo *</label>
                                    <input 
                                        type="email" 
                                        name="correo" 
                                        value={formData.correo || ''}
                                        onChange={handleChange} 
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Nombre completo *</label>
                                    <input 
                                        name="nombreCompleto" 
                                        value={formData.nombreCompleto || ''}
                                        onChange={handleChange} 
                                        required
                                    />
                                </div>
                                
                                {/* Campo de contraseña con generador */}
                                <div className="form-group full-width">
                                    <label>Contraseña *</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input 
                                            type="text" 
                                            name="contraseña" 
                                            value={formData.contraseña || ''}
                                            onChange={handleChange}
                                            placeholder="Se generará automáticamente"
                                            readOnly
                                            style={{ 
                                                flex: 1,
                                                backgroundColor: '#f5f5f5',
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={generarYEstablecerPassword}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Generar
                                        </button>
                                    </div>
                                    <small style={{ color: '#666', fontSize: '12px' }}>
                                        Contraseña de 6 dígitos generada automáticamente
                                    </small>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* --- Botón para guardar --- */}
                {mostrarCampos && (
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            Guardar Usuario
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default AgregarUsuario;
