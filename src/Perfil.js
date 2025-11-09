import React, { useState } from 'react';

const Perfil = () => {
    const [passwordData, setPasswordData] = useState({
        nuevaContrasena: '',
        confirmarContrasena: ''
    });

    const doctorData = {
        nombre: 'César',
        apellidos: 'Fuero Lopes',
        sexo: 'Masculino',
        numeroConsultorio: '22222222',
        direccionConsultorio: 'JAVAN',
        especialidad: 'Médico'
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        
        if (passwordData.nuevaContrasena !== passwordData.confirmarContrasena) {
            alert('Las contraseñas no coinciden');
            return;
        }

        alert('Contraseña cambiada exitosamente');
        setPasswordData({
            nuevaContrasena: '',
            confirmarContrasena: ''
        });
    };

    return (
        <div className="usuarios-container">
            <h2 className="page-title">Perfil</h2>

            <div className="lista-items-container">
                <div className="item-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h3>{doctorData.nombre}</h3>
                            <p>{doctorData.especialidad}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                        <div>
                            <label><strong>Nombre(s)</strong></label>
                            <p>{doctorData.nombre}</p>
                        </div>
                        
                        <div>
                            <label><strong>Sexo</strong></label>
                            <p>{doctorData.sexo}</p>
                        </div>
                        
                        <div>
                            <label><strong>Apellidos</strong></label>
                            <p>{doctorData.apellidos}</p>
                        </div>
                        
                        <div>
                            <label><strong>Número del Consultorio</strong></label>
                            <p>{doctorData.numeroConsultorio}</p>
                        </div>
                        
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label><strong>Dirección del Consultorio</strong></label>
                            <p>{doctorData.direccionConsultorio}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lista-items-container">
                <div className="item-card">
                    <h3 style={{ marginBottom: '20px', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
                        CAMBIAR CONTRASEÑA
                    </h3>
                    
                    <form onSubmit={handlePasswordSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label><strong>Nueva contraseña</strong></label>
                                <input
                                    type="password"
                                    name="nuevaContrasena"
                                    value={passwordData.nuevaContrasena}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>

                            <div>
                                <label><strong>Confirmar contraseña</strong></label>
                                <input
                                    type="password"
                                    name="confirmarContrasena"
                                    value={passwordData.confirmarContrasena}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                style={{ padding: '10px 30px' }}
                            >
                                Cambiar contraseña
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
