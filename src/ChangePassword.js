import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
    const [contraseñaActual, setContraseñaActual] = useState('');
    const [nuevaContraseña, setNuevaContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState(''); // 'error' o 'success'
    const navigate = useNavigate();

    const handleChangePassword = (event) => {
        event.preventDefault();

        // Limpiar mensajes anteriores
        setMensaje('');
        setTipoMensaje('');

        // Validar campos vacíos
        if (!contraseñaActual || !nuevaContraseña || !confirmarContraseña) {
            setMensaje('Por favor, completa todos los campos');
            setTipoMensaje('error');
            return;
        }

        // Obtener usuario actual del localStorage
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('correo');
        const userName = localStorage.getItem('nombre');

        if (!userId) {
            setMensaje('No se encontró información del usuario. Por favor, inicie sesión nuevamente.');
            setTipoMensaje('error');
            return;
        }

        // Verificar contraseña actual
        const storedUsers = JSON.parse(localStorage.getItem('usuarios')) || [];
        const currentUser = storedUsers.find(user => 
            user.id === userId || user.correo === userEmail || user.nombreCompleto === userName
        );

        if (!currentUser) {
            setMensaje('No se pudo encontrar el usuario');
            setTipoMensaje('error');
            return;
        }

        // Validar contraseña actual
        if (currentUser.contraseña !== contraseñaActual) {
            setMensaje('La contraseña actual es incorrecta');
            setTipoMensaje('error');
            return;
        }

        // Validar que la nueva contraseña no sea igual a la actual
        if (contraseñaActual === nuevaContraseña) {
            setMensaje('La nueva contraseña no puede ser igual a la actual');
            setTipoMensaje('error');
            return;
        }

        // Validar longitud mínima
        if (nuevaContraseña.length < 6) {
            setMensaje('La contraseña debe tener al menos 6 caracteres');
            setTipoMensaje('error');
            return;
        }

        // Validar que las contraseñas coincidan
        if (nuevaContraseña !== confirmarContraseña) {
            setMensaje('Las nuevas contraseñas no coinciden');
            setTipoMensaje('error');
            return;
        }

        // Actualizar contraseña en el almacenamiento
        const userIndex = storedUsers.findIndex(user => 
            user.id === userId || user.correo === userEmail || user.nombreCompleto === userName
        );

        if (userIndex !== -1) {
            // Actualizar contraseña
            storedUsers[userIndex].contraseña = nuevaContraseña;
            
            // Guardar cambios
            localStorage.setItem('usuarios', JSON.stringify(storedUsers));
            
            // También actualizar en usuariosData si existe
            const usuariosData = JSON.parse(localStorage.getItem('usuariosData')) || [];
            const dataIndex = usuariosData.findIndex(user => 
                user.id === userId || user.correo === userEmail || user.nombreCompleto === userName
            );
            if (dataIndex !== -1) {
                usuariosData[dataIndex].contraseña = nuevaContraseña;
                localStorage.setItem('usuariosData', JSON.stringify(usuariosData));
            }

            setMensaje('¡Contraseña cambiada exitosamente!');
            setTipoMensaje('success');
            
            // Limpiar campos
            setContraseñaActual('');
            setNuevaContraseña('');
            setConfirmarContraseña('');

            // Redirigir después de 2 segundos
            setTimeout(() => {
                const rol = localStorage.getItem('rol');
                if (rol === 'Doctor') {
                    navigate('/doctor/ver-pacientes');
                } else if (rol === 'Administrador') {
                    navigate('/dashboard/usuarios');
                }
            }, 2000);

        } else {
            setMensaje('No se pudo encontrar el usuario para actualizar la contraseña');
            setTipoMensaje('error');
        }
    };

    const handleCancel = () => {
        const rol = localStorage.getItem('rol');
        if (rol === 'Doctor') {
            navigate('/doctor/ver-pacientes');
        } else if (rol === 'Administrador') {
            navigate('/dashboard/usuarios');
        }
    };

    return (
        <div className="change-password-container">
            <div className="change-password-form">
                <h2>CAMBIAR CONTRASEÑA</h2>
                
                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label htmlFor="contraseñaActual">Contraseña actual</label>
                        <input
                            type="password"
                            id="contraseñaActual"
                            value={contraseñaActual}
                            onChange={(e) => setContraseñaActual(e.target.value)}
                            placeholder="Ingresa tu contraseña actual"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="nuevaContraseña">Nueva contraseña</label>
                        <input
                            type="password"
                            id="nuevaContraseña"
                            value={nuevaContraseña}
                            onChange={(e) => setNuevaContraseña(e.target.value)}
                            placeholder="Ingresa nueva contraseña"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmarContraseña">Confirmar nueva contraseña</label>
                        <input
                            type="password"
                            id="confirmarContraseña"
                            value={confirmarContraseña}
                            onChange={(e) => setConfirmarContraseña(e.target.value)}
                            placeholder="Confirma la nueva contraseña"
                            required
                        />
                    </div>

                    {mensaje && (
                        <div className={`mensaje ${tipoMensaje}`}>
                            {mensaje}
                        </div>
                    )}

                    <div className="button-group">
                        <button type="submit" className="btn-primary">
                            Cambiar contraseña
                        </button>
                        <button type="button" className="btn-secondary" onClick={handleCancel}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;
