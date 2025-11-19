import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos para redirigir

const Perfil = () => {
    const navigate = useNavigate(); // Hook de navegación
    
    // Estado solo para mostrar datos (sin lógica de contraseñas aquí)
    const [doctorData, setDoctorData] = useState({
        nombre: '',
        apellidos: '',
        sexo: '',
        numeroConsultorio: '',
        direccionConsultorio: '',
        especialidad: 'Médico'
    });

    useEffect(() => {
        // 1. Cargar datos seguros desde localStorage (los que guardamos en Login)
        const nombreCompleto = localStorage.getItem('nombre') || '';
        const sexo = localStorage.getItem('sexo') || 'Masculino';
        const numeroConsultorio = localStorage.getItem('numeroConsultorio') || 'No especificado';
        const direccionConsultorio = localStorage.getItem('direccionConsultorio') || 'No especificada';
        const especialidad = localStorage.getItem('especialidad') || 'Médico';
        
        // Separar nombre y apellidos visualmente
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

    // Función simple: Redirigir a la pantalla especializada que ya arreglamos
    const irACambiarPassword = () => {
        // Asumo que tu ruta en App.js es '/change-password' o similar.
        // Si tu ruta se llama diferente, ajusta esta línea.
        navigate('/change-password');
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

                {/* Grid de información */}
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
                    {/* Este botón ahora te lleva a la página ChangePassword.js en lugar de abrir un modal roto */}
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
                        onClick={irACambiarPassword}
                    >
                        Cambiar contraseña
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Perfil;