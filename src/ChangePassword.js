import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import './App.css'; // Asegúrate de tener tus estilos importados

// Tu URL de API (La que ya tienes configurada)
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/";

function ChangePassword() {
    const [contraseñaActual, setContraseñaActual] = useState('');
    const [nuevaContraseña, setNuevaContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState(''); // 'error' o 'success'
    const [loading, setLoading] = useState(false); // Estado de carga para bloquear el botón
    const navigate = useNavigate();

    const handleChangePassword = async (event) => {
        event.preventDefault();

        // Limpiar mensajes anteriores
        setMensaje('');
        setTipoMensaje('');

        // 1. Validaciones locales
        if (!contraseñaActual || !nuevaContraseña || !confirmarContraseña) {
            setMensaje('Por favor, completa todos los campos');
            setTipoMensaje('error');
            return;
        }

        if (contraseñaActual === nuevaContraseña) {
            setMensaje('La nueva contraseña no puede ser igual a la actual');
            setTipoMensaje('error');
            return;
        }

        if (nuevaContraseña.length < 6) {
            setMensaje('La contraseña debe tener al menos 6 caracteres');
            setTipoMensaje('error');
            return;
        }

        if (nuevaContraseña !== confirmarContraseña) {
            setMensaje('Las nuevas contraseñas no coinciden');
            setTipoMensaje('error');
            return;
        }

        // 2. Obtener usuario actual (Solo necesitamos el ID)
        const userId = localStorage.getItem('userId');

        if (!userId) {
            setMensaje('No se encontró información del usuario. Por favor, inicie sesión nuevamente.');
            setTipoMensaje('error');
            return;
        }

        // 3. Llamar a la API
        setLoading(true);
        
        try {
            const payload = {
                action: "changePassword",
                data: {
                    userId: userId,
                    currentPassword: contraseñaActual,
                    newPassword: nuevaContraseña
                }
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                // Si la API dice que la contraseña actual está mal, o usuario no encontrado
                throw new Error(data.message || 'Error al cambiar la contraseña');
            }

            // --- ÉXITO ---
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
                } else {
                    navigate('/login');
                }
            }, 2000);

        } catch (err) {
            setMensaje(err.message);
            setTipoMensaje('error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        const rol = localStorage.getItem('rol');
        if (rol === 'Doctor') {
            navigate('/doctor/ver-pacientes');
        } else if (rol === 'Administrador') {
            navigate('/dashboard/usuarios');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="change-password-container">
            <div className="change-password-form">
                <h2>CAMBIAR CONTRASEÑA</h2>
                
                <form onSubmit={handleChangePassword}>
                    {/* Usamos fieldset para deshabilitar todo el formulario mientras carga */}
                    <fieldset disabled={loading} style={{border: 'none', padding: 0, margin: 0}}>
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
                            <div className={`mensaje ${tipoMensaje}`} style={{ 
                                padding: '10px', 
                                marginBottom: '15px', 
                                borderRadius: '4px',
                                backgroundColor: tipoMensaje === 'error' ? '#ffebee' : '#e8f5e9',
                                color: tipoMensaje === 'error' ? '#c62828' : '#2e7d32',
                                textAlign: 'center',
                                border: `1px solid ${tipoMensaje === 'error' ? '#ffcdd2' : '#c8e6c9'}`
                            }}>
                                {mensaje}
                            </div>
                        )}

                        <div className="button-group">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Guardando...' : 'Cambiar contraseña'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={handleCancel} disabled={loading}>
                                Cancelar
                            </button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;
