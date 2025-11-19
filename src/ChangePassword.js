import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/"; 

function ChangePassword() {
    const [contraseñaActual, setContraseñaActual] = useState('');
    const [nuevaContraseña, setNuevaContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState(''); 
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    // Verificación de seguridad al cargar
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            navigate('/login');
        }
    }, [navigate]);

    const redirigirUsuario = () => {
        const rol = localStorage.getItem('rol');
        const rolNormalizado = rol ? String(rol).trim().toLowerCase() : '';

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

        let userId = localStorage.getItem('userId');
        if (userId) userId = userId.replace(/['"]+/g, '').trim();

        if (!userId) {
            setMensaje('Error de sesión. Cierre sesión y vuelva a entrar.');
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

            setTimeout(() => {
                redirigirUsuario();
            }, 2000);

        } catch (err) {
            setMensaje(err.message);
            setTipoMensaje('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f4f6f8',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '450px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                border: '1px solid #e0e0e0'
            }}>
                {/* Título */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    paddingBottom: '20px',
                    borderBottom: '2px solid #3498db'
                }}>
                    <h2 style={{ 
                        margin: 0,
                        color: '#2c3e50',
                        fontSize: '22px',
                        fontWeight: 'bold'
                    }}>
                        CAMBIAR CONTRASEÑA
                    </h2>
                </div>
                
                <form onSubmit={handleChangePassword}>
                    {/* Contraseña Actual */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block',
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            color: '#34495e',
                            fontSize: '14px'
                        }}>
                            Contraseña actual
                        </label>
                        <input
                            type="password"
                            value={contraseñaActual}
                            onChange={(e) => setContraseñaActual(e.target.value)}
                            required
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                border: '2px solid #ecf0f1', 
                                borderRadius: '8px',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3498db'}
                            onBlur={(e) => e.target.style.borderColor = '#ecf0f1'}
                        />
                    </div>

                    {/* Nueva Contraseña */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block',
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            color: '#34495e',
                            fontSize: '14px'
                        }}>
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            value={nuevaContraseña}
                            onChange={(e) => setNuevaContraseña(e.target.value)}
                            required
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                border: '2px solid #ecf0f1', 
                                borderRadius: '8px',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3498db'}
                            onBlur={(e) => e.target.style.borderColor = '#ecf0f1'}
                        />
                    </div>

                    {/* Confirmar Contraseña */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ 
                            display: 'block',
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            color: '#34495e',
                            fontSize: '14px'
                        }}>
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            value={confirmarContraseña}
                            onChange={(e) => setConfirmarContraseña(e.target.value)}
                            required
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                border: '2px solid #ecf0f1', 
                                borderRadius: '8px',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3498db'}
                            onBlur={(e) => e.target.style.borderColor = '#ecf0f1'}
                        />
                    </div>

                    {/* Mensajes de Error/Éxito */}
                    {mensaje && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '20px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            backgroundColor: tipoMensaje === 'error' ? '#ffebee' : '#e8f5e9',
                            color: tipoMensaje === 'error' ? '#c62828' : '#2e7d32',
                            border: `1px solid ${tipoMensaje === 'error' ? '#ef9a9a' : '#a5d6a7'}`
                        }}>
                            {mensaje}
                        </div>
                    )}

                    {/* Botones */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                flex: 1,
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                opacity: loading ? 0.7 : 1,
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#219a52')}
                            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#27ae60')}
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => redirigirUsuario()}
                            disabled={loading}
                            style={{ 
                                flex: 1,
                                backgroundColor: '#95a5a6',
                                color: 'white',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#7f8c8d')}
                            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#95a5a6')}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;