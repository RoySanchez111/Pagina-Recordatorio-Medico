import React, { useState, useEffect } from 'react';

const Perfil = () => {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        contrasenaActual: '',
        nuevaContrasena: '',
        confirmarContrasena: ''
    });
    const [doctorData, setDoctorData] = useState({
        nombre: '',
        apellidos: '',
        sexo: '',
        numeroConsultorio: '',
        direccionConsultorio: '',
        especialidad: 'Médico'
    });
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState('');

    useEffect(() => {
        // Obtener datos del doctor desde localStorage
        const nombreCompleto = localStorage.getItem('nombre') || '';
        const sexo = localStorage.getItem('sexo') || 'Masculino';
        const numeroConsultorio = localStorage.getItem('numeroConsultorio') || 'No especificado';
        const direccionConsultorio = localStorage.getItem('direccionConsultorio') || 'No especificada';
        const especialidad = localStorage.getItem('especialidad') || 'Médico';
        
        // Separar nombre y apellidos si están en el mismo campo
        const nombresArray = nombreCompleto.split(' ');
        const nombre = nombresArray[0] || '';
        const apellidos = nombresArray.slice(1).join(' ') || '';

        setDoctorData({
            nombre: nombre || 'Doctor',
            apellidos: apellidos || '',
            sexo: sexo,
            numeroConsultorio: numeroConsultorio,
            direccionConsultorio: direccionConsultorio,
            especialidad: especialidad
        });
    }, []);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        
        // Limpiar mensajes anteriores
        setMensaje('');
        setTipoMensaje('');

        // Validar campos vacíos
        if (!passwordData.contrasenaActual || !passwordData.nuevaContrasena || !passwordData.confirmarContrasena) {
            setMensaje('Por favor, completa todos los campos');
            setTipoMensaje('error');
            return;
        }

        // Obtener información del usuario actual
        const userEmail = localStorage.getItem('correo');
        const userName = localStorage.getItem('nombre');
        const userId = localStorage.getItem('userId');

        // Buscar usuario en localStorage
        const storedUsers = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuariosData = JSON.parse(localStorage.getItem('usuariosData')) || [];
        
        // Usar storedUsers o usuariosData
        let usersToCheck = [...storedUsers];
        if (usersToCheck.length === 0 && usuariosData.length > 0) {
            usersToCheck = [...usuariosData];
        }

        // Buscar usuario por diferentes criterios
        const currentUser = usersToCheck.find(user => {
            return (
                (user.id && user.id.toString() === userId?.toString()) ||
                (user.correo && user.correo === userEmail) ||
                (user.nombreCompleto && user.nombreCompleto === userName) ||
                (user.nombre && user.nombre === userName) ||
                (user.email && user.email === userEmail)
            );
        });

        if (!currentUser) {
            setMensaje('No se pudo encontrar el usuario. Contacte al administrador.');
            setTipoMensaje('error');
            return;
        }

        // Verificar contraseña actual
        const contraseñaGuardada = currentUser.contraseña || currentUser.password || currentUser.contrasena;
        
        if (contraseñaGuardada !== passwordData.contrasenaActual) {
            setMensaje('La contraseña actual es incorrecta');
            setTipoMensaje('error');
            return;
        }

        // Validaciones de nueva contraseña
        if (passwordData.contrasenaActual === passwordData.nuevaContrasena) {
            setMensaje('La nueva contraseña no puede ser igual a la actual');
            setTipoMensaje('error');
            return;
        }

        if (passwordData.nuevaContrasena.length < 6) {
            setMensaje('La contraseña debe tener al menos 6 caracteres');
            setTipoMensaje('error');
            return;
        }

        if (passwordData.nuevaContrasena !== passwordData.confirmarContrasena) {
            setMensaje('Las nuevas contraseñas no coinciden');
            setTipoMensaje('error');
            return;
        }

        // Actualizar contraseña
        const userIndex = usersToCheck.findIndex(user => {
            return (
                (user.id && user.id.toString() === userId?.toString()) ||
                (user.correo && user.correo === userEmail) ||
                (user.nombreCompleto && user.nombreCompleto === userName) ||
                (user.nombre && user.nombre === userName) ||
                (user.email && user.email === userEmail)
            );
        });

        if (userIndex !== -1) {
            // Actualizar contraseña
            usersToCheck[userIndex].contraseña = passwordData.nuevaContrasena;
            
            // Guardar en localStorage
            if (storedUsers.length > 0) {
                localStorage.setItem('usuarios', JSON.stringify(usersToCheck));
            } else {
                localStorage.setItem('usuariosData', JSON.stringify(usersToCheck));
            }

            // También actualizar en el otro almacenamiento si existe
            if (usuariosData.length > 0 && storedUsers.length > 0) {
                const dataIndex = usuariosData.findIndex(user => {
                    return (
                        (user.id && user.id.toString() === userId?.toString()) ||
                        (user.correo && user.correo === userEmail) ||
                        (user.nombreCompleto && user.nombreCompleto === userName)
                    );
                });
                if (dataIndex !== -1) {
                    usuariosData[dataIndex].contraseña = passwordData.nuevaContrasena;
                    localStorage.setItem('usuariosData', JSON.stringify(usuariosData));
                }
            }

            setMensaje('¡Contraseña cambiada exitosamente!');
            setTipoMensaje('success');
            
            // Limpiar campos después de 2 segundos y cerrar modal
            setTimeout(() => {
                setPasswordData({
                    contrasenaActual: '',
                    nuevaContrasena: '',
                    confirmarContrasena: ''
                });
                setShowPasswordModal(false);
                setMensaje('');
                setTipoMensaje('');
            }, 2000);

        } else {
            setMensaje('Error al actualizar la contraseña');
            setTipoMensaje('error');
        }
    };

    const closeModal = () => {
        setShowPasswordModal(false);
        setPasswordData({
            contrasenaActual: '',
            nuevaContrasena: '',
            confirmarContrasena: ''
        });
        setMensaje('');
        setTipoMensaje('');
    };

    // Estilos para mensajes
    const getMessageStyles = () => {
        const baseStyles = {
            padding: '12px',
            borderRadius: '6px',
            margin: '15px 10px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '14px'
        };

        if (tipoMensaje === 'error') {
            return {
                ...baseStyles,
                backgroundColor: '#f8d7da',
                color: '#721c24',
                border: '1px solid #f5c6cb'
            };
        } else if (tipoMensaje === 'success') {
            return {
                ...baseStyles,
                backgroundColor: '#d4edda',
                color: '#155724',
                border: '1px solid #c3e6cb'
            };
        }

        return baseStyles;
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* TÍTULO EN AZUL */}
            <h2 style={{ marginBottom: '20px', color: '#3498db' }}>Perfil</h2>

            {/* Tarjeta de información del doctor */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '25px',
                marginBottom: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '25px',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #eee'
                }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#3498db',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginRight: '15px'
                    }}>
                        {doctorData.nombre.charAt(0)}
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0' }}>{doctorData.nombre} {doctorData.apellidos}</h3>
                        <p style={{ margin: 0, color: '#666' }}>{doctorData.especialidad}</p>
                    </div>
                </div>

                {/* Grid de información dividida en recuadros */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '15px',
                    marginBottom: '25px'
                }}>
                    <div style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '15px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Nombre(s)</div>
                        <div style={{ color: '#555' }}>{doctorData.nombre}</div>
                    </div>
                    
                    <div style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '15px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Sexo</div>
                        <div style={{ color: '#555' }}>{doctorData.sexo}</div>
                    </div>
                    
                    <div style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '15px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Apellidos</div>
                        <div style={{ color: '#555' }}>{doctorData.apellidos}</div>
                    </div>
                    
                    <div style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '15px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Número del Consultorio</div>
                        <div style={{ color: '#555' }}>{doctorData.numeroConsultorio}</div>
                    </div>
                    
                    <div style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '15px',
                        backgroundColor: '#f9f9f9',
                        gridColumn: '1 / -1'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Dirección del Consultorio</div>
                        <div style={{ color: '#555' }}>{doctorData.direccionConsultorio}</div>
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button 
                        style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
                        onClick={() => setShowPasswordModal(true)}
                    >
                        Cambiar contraseña
                    </button>
                </div>
            </div>

            {/* Modal para cambiar contraseña */}
            {showPasswordModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '35px',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '450px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                        border: '1px solid #e0e0e0'
                    }}>
                        {/* Header del modal */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '30px',
                            paddingBottom: '20px',
                            borderBottom: '2px solid #3498db'
                        }}>
                            <h3 style={{ 
                                margin: 0,
                                color: '#2c3e50',
                                fontSize: '22px',
                                fontWeight: 'bold'
                            }}>
                                CAMBIAR CONTRASEÑA
                            </h3>
                        </div>
                        
                        <form onSubmit={handlePasswordSubmit}>
                            {/* Campo Contraseña Actual */}
                            <div style={{ 
                                marginBottom: '25px',
                                padding: '0 10px'
                            }}>
                                <div style={{ 
                                    marginBottom: '12px', 
                                    fontWeight: 'bold', 
                                    color: '#2c3e50',
                                    fontSize: '15px'
                                }}>
                                    Contraseña actual
                                </div>
                                <input
                                    type="password"
                                    name="contrasenaActual"
                                    value={passwordData.contrasenaActual}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        border: '2px solid #e0e0e0', 
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        transition: 'border-color 0.3s',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3498db'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    placeholder="Ingresa tu contraseña actual"
                                />
                            </div>

                            {/* Campo Nueva Contraseña */}
                            <div style={{ 
                                marginBottom: '25px',
                                padding: '0 10px'
                            }}>
                                <div style={{ 
                                    marginBottom: '12px', 
                                    fontWeight: 'bold', 
                                    color: '#2c3e50',
                                    fontSize: '15px'
                                }}>
                                    Nueva contraseña
                                </div>
                                <input
                                    type="password"
                                    name="nuevaContrasena"
                                    value={passwordData.nuevaContrasena}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        border: '2px solid #e0e0e0', 
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        transition: 'border-color 0.3s',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3498db'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    placeholder="Ingresa nueva contraseña"
                                />
                            </div>

                            {/* Campo Confirmar Contraseña */}
                            <div style={{ 
                                marginBottom: '25px',
                                padding: '0 10px'
                            }}>
                                <div style={{ 
                                    marginBottom: '12px', 
                                    fontWeight: 'bold', 
                                    color: '#2c3e50',
                                    fontSize: '15px'
                                }}>
                                    Confirmar contraseña
                                </div>
                                <input
                                    type="password"
                                    name="confirmarContrasena"
                                    value={passwordData.confirmarContrasena}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        border: '2px solid #e0e0e0', 
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        transition: 'border-color 0.3s',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3498db'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    placeholder="Confirma la contraseña"
                                />
                            </div>

                            {/* Mensaje de estado */}
                            {mensaje && (
                                <div style={getMessageStyles()}>
                                    {mensaje}
                                </div>
                            )}

                            {/* Botones */}
                            <div style={{ 
                                display: 'flex', 
                                gap: '15px',
                                justifyContent: 'center',
                                padding: '0 10px'
                            }}>
                                <button 
                                    type="submit" 
                                    style={{ 
                                        backgroundColor: '#27ae60',
                                        color: 'white',
                                        border: 'none',
                                        padding: '14px 30px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        flex: 1,
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#219a52'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
                                >
                                    Cambiar
                                </button>
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    style={{ 
                                        backgroundColor: '#95a5a6',
                                        color: 'white',
                                        border: 'none',
                                        padding: '14px 30px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        flex: 1,
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#7f8c8d'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#95a5a6'}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;
