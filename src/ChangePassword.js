import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import './App.css'; 

const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/"; 

function ChangePassword() {
    const [contraseñaActual, setContraseñaActual] = useState('');
    const [nuevaContraseña, setNuevaContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState(''); 
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    // Función auxiliar para redirigir según el rol (sin importar mayúsculas/minúsculas)
    const redirigirUsuario = () => {
        const rol = localStorage.getItem('rol');
        const rolNormalizado = rol ? rol.toLowerCase().trim() : '';

        if (rolNormalizado === 'doctor') {
            navigate('/doctor/ver-pacientes');
        } else if (rolNormalizado === 'administrador') {
            navigate('/dashboard/usuarios');
        } else {
            navigate('/login');
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        setMensaje('');
        setTipoMensaje('');

        // Validaciones básicas
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

        // Recuperar ID
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            setMensaje('Sesión no válida. Por favor, cierra sesión y vuelve a entrar.');
            setTipoMensaje('error');
            return;
        }

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
                throw new Error(data.message || 'Error al cambiar la contraseña');
            }

            setMensaje('¡Contraseña cambiada exitosamente!');
            setTipoMensaje('success');
            
            setContraseñaActual('');
            setNuevaContraseña('');
            setConfirmarContraseña('');

            // Redirigir después de 2 segundos
            setTimeout(() => {
                redirigirUsuario();
            }, 2000);

        } catch (err) {
            console.error("Error API:", err);
            setMensaje(err.message);
            setTipoMensaje('error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        redirigirUsuario();
    };

    return (
        <div className="change-password-container">
            <div className="change-password-form">
                <h2>CAMBIAR CONTRASEÑA</h2>
                
                <form onSubmit={handleChangePassword}>
                    <fieldset disabled={loading} style={{border: 'none', padding: 0, margin: 0}}>
                        <div className="form-group">
                            <label>Contraseña actual</label>
                            <input
                                type="password"
                                value={contraseñaActual}
                                onChange={(e) => setContraseñaActual(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Nueva contraseña</label>
                            <input
                                type="password"
                                value={nuevaContraseña}
                                onChange={(e) => setNuevaContraseña(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirmar nueva contraseña</label>
                            <input
                                type="password"
                                value={confirmarContraseña}
                                onChange={(e) => setConfirmarContraseña(e.target.value)}
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