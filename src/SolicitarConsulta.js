import React, { useState } from 'react';
import './App.css';
import agregarAzul from './assets/usuarios-azul.png'; // Reutilizamos un icono

function SolicitarConsulta() {
    const [paciente, setPaciente] = useState('');
    const [doctor, setDoctor] = useState('');
    const [fecha, setFecha] = useState('');
    const [motivo, setMotivo] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const guardadas = JSON.parse(localStorage.getItem('consultas')) || [];
        
        const nuevaConsulta = {
            id: Date.now(),
            paciente,
            doctor,
            fecha,
            motivo,
            status: 'pendiente' // Estado inicial
        };
        
        const actualizadas = [...guardadas, nuevaConsulta];
        localStorage.setItem('consultas', JSON.stringify(actualizadas));

        alert('Consulta solicitada con éxito. Un doctor la revisará.');
        setPaciente('');
        setDoctor('');
        setFecha('');
        setMotivo('');
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={agregarAzul} alt="Solicitar" />
                Solicitar Consulta Médica
            </h2>

            <form className="user-form-card" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Tu Nombre Completo</label>
                        <input value={paciente} onChange={(e) => setPaciente(e.target.value)} required />
                    </div>
                     <div className="form-group">
                        <label>Fecha Deseada</label>
                        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                    </div>
                    <div className="form-group full-width">
                        <label>Doctor (Opcional)</label>
                        <input value={doctor} onChange={(e) => setDoctor(e.target.value)} />
                    </div>
                    <div className="form-group full-width">
                        <label>Motivo de la consulta</label>
                        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        Enviar Solicitud
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SolicitarConsulta;