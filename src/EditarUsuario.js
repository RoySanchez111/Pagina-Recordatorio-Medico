import React, { useState, useEffect } from 'react';
import './App.css';
import editarAzul from './assets/editar-azul.png';
import defaultAvatar from './assets/default-profile-image.png';

function EditarUsuario() {
    // --- Estados principales ---
    const [claveUnica, setClaveUnica] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioData, setUsuarioData] = useState(null);
    const [editableFields, setEditableFields] = useState({});

    // --- Cargar usuarios desde JSON o localStorage ---
    useEffect(() => {
        const storedData = localStorage.getItem('usuarios');
        if (storedData) {
            setUsuarios(JSON.parse(storedData));
        } else {
            fetch('/usuarios.json')
                .then(res => res.json())
                .then(data => {
                    setUsuarios(data);
                    localStorage.setItem('usuarios', JSON.stringify(data));
                })
                .catch(err => console.error('Error al cargar usuarios.json:', err));
        }
    }, []);

    // --- Buscar usuario por ID ---
    const handleClaveCheck = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const usuarioEncontrado = usuarios.find(u => String(u.id) === claveUnica.trim());
            if (usuarioEncontrado) {
                setUsuarioData(usuarioEncontrado);
                setEditableFields({ ...usuarioEncontrado });
            } else {
                alert('Usuario no encontrado.');
                setUsuarioData(null);
            }
        }
    };

    // --- Manejar cambios en inputs ---
    const handleChange = (e) => {
        setEditableFields({
            ...editableFields,
            [e.target.name]: e.target.value,
        });
    };

    // --- Cargar nuevo PDF de cédula ---
    const handleCedulaImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setEditableFields({
                ...editableFields,
                cedulaImagen: reader.result, // Guardamos el PDF como base64
            });
        };
        reader.readAsDataURL(file);
    };

    // --- Guardar cambios en localStorage ---
    const handleSubmit = (e) => {
        e.preventDefault();
        const nuevosUsuarios = usuarios.map(u =>
            String(u.id) === String(editableFields.id) ? editableFields : u
        );
        setUsuarios(nuevosUsuarios);
        localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
        alert('Usuario actualizado correctamente ✅');
    };

    // --- Eliminar usuario ---
    const handleEliminar = () => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            const nuevosUsuarios = usuarios.filter(u => String(u.id) !== String(claveUnica));
            setUsuarios(nuevosUsuarios);
            localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
            alert('Usuario eliminado ❌');
            handleRecargar();
        }
    };

    // --- Limpiar formulario ---
    const handleRecargar = () => {
        setUsuarioData(null);
        setEditableFields({});
        setClaveUnica('');
    };

    // --- Renderizar los campos según el rol ---
    const renderCamposPorRol = () => {
        if (!usuarioData) return null;
        const rol = usuarioData.rol.toLowerCase();

        switch (rol) {
            case 'doctor':
                return (
                    <>
                        <div className="form-group full-width">
                            <label>Correo</label>
                            <input
                                type="email"
                                name="correo"
                                value={editableFields.correo || ''}
                                onChange={handleChange}
                            />
                        </div>

                        {/* --- Vista de PDF de cédula --- */}
                        <div className="form-group full-width">
                        <label>Cédula Profesional (PDF)</label>

                        {/* --- Vista de PDF de cédula --- */}
                        <div className="preview-wrapper">
                            <img
                            src={defaultAvatar}
                            alt="Cédula profesional"
                            className="preview-image"
                            />
                        </div>

                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleCedulaImageChange}
                        />
                        </div>

                        <div className="form-group">
                            <label>Especialidad</label>
                            <input
                                type="text"
                                name="especialidad"
                                value={editableFields.especialidad || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                name="contraseña"
                                value={editableFields.contraseña || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Teléfono de consultorio</label>
                            <input
                                type="text"
                                name="telefono"
                                value={editableFields.telefono || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Dirección de consultorio</label>
                            <input
                                type="text"
                                name="direccion"
                                value={editableFields.direccion || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </>
                );

            case 'administrador':
                return (
                    <>
                        <div className="form-group full-width">
                            <label>Correo</label>
                            <input
                                type="email"
                                name="correo"
                                value={editableFields.correo || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                name="contraseña"
                                value={editableFields.contraseña || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </>
                );

            case 'paciente':
                return (
                    <>
                        <div className="form-group">
                            <label>Sexo</label>
                            <input
                                type="text"
                                name="sexo"
                                value={editableFields.sexo || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Teléfono</label>
                            <input
                                type="text"
                                name="telefono"
                                value={editableFields.telefono || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Dirección</label>
                            <input
                                type="text"
                                name="direccion"
                                value={editableFields.direccion || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Fecha de nacimiento</label>
                            <input
                                type="date"
                                name="nacimiento"
                                value={editableFields.nacimiento || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Padecimiento</label>
                            <input
                                type="text"
                                name="padecimiento"
                                value={editableFields.padecimiento || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </>
                );

            default:
                return <p>Rol desconocido</p>;
        }
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={editarAzul} alt="Editar" />
                Editar Usuario
            </h2>

            <form className="user-form-card" onSubmit={handleSubmit}>
                {/* --- Campo de ID para buscar usuario --- */}
                <div className="form-group full-width">
                    <label>ID (Presiona Enter para buscar)</label>
                    <input
                        type="text"
                        name="claveUnica"
                        value={claveUnica}
                        onChange={(e) => setClaveUnica(e.target.value)}
                        onKeyDown={handleClaveCheck}
                        disabled={!!usuarioData}
                        placeholder="Ej. 1, 2, 3..."
                    />
                </div>

                {/* --- Si hay usuario encontrado --- */}
                {usuarioData && (
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Rol</label>
                            <input type="text" value={usuarioData.rol} disabled />
                        </div>
                        <div className="form-group full-width">
                            <label>Nombre completo</label>
                            <input type="text" value={usuarioData.nombreCompleto} disabled />
                        </div>

                        {/* --- Campos según el rol --- */}
                        {renderCamposPorRol()}
                    </div>
                )}

                {/* --- Botones de acción --- */}
                {usuarioData && (
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleRecargar}
                        >
                            Limpiar / Nuevo ID
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleEliminar}
                        >
                            Eliminar Usuario
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Guardar Cambios
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default EditarUsuario;
