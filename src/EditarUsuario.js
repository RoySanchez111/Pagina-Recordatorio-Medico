import React, { useState } from 'react';
import './App.css'; // Reutilizamos el CSS
import editarAzul from './assets/editar-azul.png';

// Ícono de avatar genérico (ACTUALIZADO a tu archivo local)
import defaultAvatar from './assets/default-profile-image.png';

// Datos falsos que simulan la respuesta de la API
const fakeApiData = {
    '123456': {
        rol: 'Doctor',
        nombre: 'Nicolas',
        apellidos: 'Alvarez',
        telefono: '+000 111 222 333',
        direccion: 'Direccion Ficticia 123',
        avatar: defaultAvatar // Usamos la imagen importada
    },
    '654321': {
        rol: 'Paciente',
        nombre: 'Ana',
        apellidos: 'Gomez',
        telefono: '+111 222 333 444',
        direccion: 'Otra Calle 456',
        avatar: defaultAvatar // Usamos la imagen importada
    }
};

function EditarUsuario() {
    const [claveUnica, setClaveUnica] = useState('');
    const [usuarioData, setUsuarioData] = useState(null); // Guarda los datos del usuario
    
    // Estados separados para los campos editables
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    const handleClaveCheck = (e) => {
        // Si presiona Enter...
        if (e.key === 'Enter') {
            e.preventDefault();
            
            // Simulación de búsqueda en Backend
            const data = fakeApiData[claveUnica];
            
            if (data) {
                setUsuarioData(data);
                // Seteamos los campos editables
                setTelefono(data.telefono);
                setDireccion(data.direccion);
            } else {
                alert("Clave Única no encontrada (Prueba '123456' o '654321')");
                setUsuarioData(null);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Datos a actualizar:", {
            claveUnica: claveUnica,
            telefono: telefono,
            direccion: direccion
        });
        alert("Usuario actualizado (ver consola)");
    };
    
    const handleEliminar = () => {
        // Usamos un simple 'confirm' por ahora
        if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            console.log("Eliminando usuario:", claveUnica);
            alert("Usuario eliminado (simulación)");
            // Limpiar formulario
            setUsuarioData(null);
            setClaveUnica('');
        }
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={editarAzul} alt="Editar" />
                Editar Usuario
            </h2>

            <form className="user-form-card" onSubmit={handleSubmit}>
                
                {/* --- Avatar (solo si hay datos) --- */}
                {usuarioData && (
                    <div className="avatar-section">
                        <img src={usuarioData.avatar || defaultAvatar} alt="Avatar" className="avatar-img" />
                        <button type="button" className="edit-avatar-btn"></button>
                    </div>
                )}

                {/* --- Grid de Campos --- */}
                <div className="form-grid">
                    
                    {/* --- Campo de Clave (siempre visible) --- */}
                    <div className="form-group full-width">
                        <label htmlFor="claveUnica">Clave Única (Presiona Enter para buscar)</label>
                        <input 
                            type="text" 
                            id="claveUnica" 
                            name="claveUnica" 
                            value={claveUnica}
                            onChange={(e) => setClaveUnica(e.target.value)}
                            onKeyDown={handleClaveCheck}
                            disabled={!!usuarioData} /* Se deshabilita después de buscar */
                            placeholder="Escribe 123456 o 654321 y presiona Enter"
                        />
                    </div>

                    {/* --- Campos Ocultos (solo aparecen si hay datos) --- */}
                    {usuarioData && (
                        <>
                            {/* Campos GRISES (deshabilitados) */}
                            <div className="form-group">
                                <label htmlFor="rol">¿Qué es?</label>
                                <input type="text" id="rol" name="rol" 
                                       value={usuarioData.rol} disabled />
                            </div>
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre(s)</label>
                                <input type="text" id="nombre" name="nombre" 
                                       value={usuarioData.nombre} disabled />
                            </div>
                            <div className="form-group">
                                <label htmlFor="apellidos">Apellidos</label>
                                <input type="text" id="apellidos" name="apellidos" 
                                       value={usuarioData.apellidos} disabled />
                            </div>
                            
                            {/* Campos BLANCOS (editables) */}
                            <div className="form-group">
                                <label htmlFor="telefono">Numero de Telefono</label>
                                <input type="tel" id="telefono" name="telefono" 
                                       value={telefono} 
                                       onChange={(e) => setTelefono(e.target.value)} />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="direccion">Direccion</label>
                                <input type="text" id="direccion" name="direccion" 
                                       value={direccion} 
                                       onChange={(e) => setDireccion(e.target.value)} />
                            </div>
                        </>
                    )}
                </div>
                
                {/* --- Botones (solo si hay datos) --- */}
                {usuarioData && (
                    <div className="form-actions">
                        <button type="button" className="btn btn-danger" onClick={handleEliminar}>
                            Eliminar Usuario
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Guardar
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default EditarUsuario;