import React, { useState } from 'react';
import './App.css';
import editarAzul from './assets/editar-azul.png';
import pdfIcon from './assets/pdf-icon.png'; 

const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/"; 

function EditarUsuario() {
    // --- Estados principales ---
    const [emailSearch, setEmailSearch] = useState(''); 
    const [usuarioData, setUsuarioData] = useState(null);
    const [editableFields, setEditableFields] = useState({});
    const [loading, setLoading] = useState(false); 


    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setLoading(true);
            setUsuarioData(null);
            
            try {
                const payload = {
                    action: "getUserByEmail",
                    data: { email: emailSearch.trim() }
                };
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Error al buscar');
                }
                
                // Encontramos al usuario
                setUsuarioData(data);
                // Pre-llenamos los campos editables
                // Mapeamos 'password_hash' a 'contraseña' para el formulario
                setEditableFields({ ...data, contraseña: data.password_hash || '' }); 

            } catch (err) {
                alert(err.message);
                setUsuarioData(null);
            } finally {
                setLoading(false);
            }
        }
    };

    // --- Manejar cambios en inputs (Sin cambios) ---
    const handleChange = (e) => {
        setEditableFields({
            ...editableFields,
            [e.target.name]: e.target.value,
        });
    };

    // --- Cargar nuevo PDF de cédula (Sin cambios) ---
    const handleCedulaPDFChange = (e) => {
        // ... (tu código de PDF no cambia) ...
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            alert('Por favor, selecciona un archivo PDF');
            e.target.value = ''; 
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditableFields({
                ...editableFields,
                cedulaPDF: reader.result, 
                cedulaNombre: file.name 
            });
        };
        reader.readAsDataURL(file);
    };

    // --- MODIFICADO: Guardar cambios en la API ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const payload = {
                action: "updateUser",
                data: editableFields // Enviamos el objeto completo
            };
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar');
            }
            
            // Actualizamos el estado local con los datos guardados
            setUsuarioData(data.user);
            setEditableFields(data.user);
            alert('Usuario actualizado correctamente ✅');

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- MODIFICADO: Eliminar usuario de la API ---
    const handleEliminar = async () => {
        // (Quitamos window.confirm)
        setLoading(true);
        
        try {
            const payload = {
                action: "deleteUser",
                data: { userId: usuarioData.id }
            };
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al eliminar');
            }
            
            alert('Usuario eliminado ❌');
            handleRecargar(); // Limpiamos el formulario

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Limpiar formulario (Sin cambios) ---
    const handleRecargar = () => {
        setUsuarioData(null);
        setEditableFields({});
        setEmailSearch(''); // Limpiamos el email
    };

    // --- Descargar PDF de cédula (Sin cambios) ---
    const handleDescargarPDF = () => {
        if (editableFields.cedulaPDF) {
            const link = document.createElement('a');
            link.href = editableFields.cedulaPDF;
            link.download = editableFields.cedulaNombre || 'cedula_profesional.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
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

                        {/* --- Vista de PDF de cédula (Sin cambios) --- */}
                        <div className="form-group full-width">
                            <label>Cédula Profesional (PDF)</label>
                            
                            <div className="preview-wrapper">
                                {editableFields.cedulaPDF ? (
                                    <div className="pdf-preview">
                                        <img 
                                            src={pdfIcon} 
                                            alt="Icono PDF" 
                                            className="pdf-icon"
                                        />
                                        <span className="pdf-name">
                                            {editableFields.cedulaNombre || 'cedula_profesional.pdf'}
                                        </span>
                                        <button 
                                            type="button" 
                                            className="btn-download"
                                            onClick={handleDescargarPDF}
                                        >
                                            Descargar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="no-pdf">
                                        No hay PDF cargado
                                    </div>
                                )}
                            </div>

                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleCedulaPDFChange}
                            />
                            <p className="file-hint">Formatos aceptados: PDF</p>
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
                                name="contraseña" // El campo del form se llama 'contraseña'
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
                                name="contraseña" // El campo del form se llama 'contraseña'
                                value={editableFields.contraseña || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </>
                );

            // --- ¡ELIMINADO! ---
            // Este formulario no debe editar pacientes
            /*
            case 'paciente':
                return ( ... );
            */

            default:
                return <p>Rol desconocido: {rol}</p>;
        }
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={editarAzul} alt="Editar" />
                Editar Usuario
            </h2>

            <form className="user-form-card" onSubmit={handleSubmit}>
                {/* Deshabilitamos todo si está cargando */}
                <fieldset disabled={loading}>
                    {/* --- MODIFICADO: Buscar por Email --- */}
                    <div className="form-group full-width">
                        <label>Email del Usuario (Presiona Enter para buscar)</label>
                        <input
                            type="email"
                            name="emailSearch"
                            value={emailSearch}
                            onChange={(e) => setEmailSearch(e.target.value)}
                            onKeyDown={handleSearch} // <- Cambiado
                            disabled={!!usuarioData || loading} // Deshabilitado si ya encontró o si está cargando
                            placeholder="Ej. doctor@doctor.com"
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
                                <input 
                                    type="text" 
                                    name="nombreCompleto" // <-- MODIFICADO: Hacemos el nombre editable
                                    value={editableFields.nombreCompleto || ''}
                                    onChange={handleChange}
                                />
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
                                Limpiar / Nuevo Email
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleEliminar}
                            >
                                Eliminar Usuario
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    )}
                </fieldset>
            </form>
        </div>
    );
}

export default EditarUsuario;