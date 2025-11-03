import React, { useState, useEffect } from 'react';
import './App.css';
import editarAzul from './assets/editar-azul.png'; 

function VerRecetas() {
    const [recetas, setRecetas] = useState([]);
    const [doctorId, setDoctorId] = useState(null);

    useEffect(() => {
        const loggedInDoctorId = parseInt(localStorage.getItem('userId'));
        setDoctorId(loggedInDoctorId);
        
        const guardadas = JSON.parse(localStorage.getItem('recetasGuardadas')) || [];
        const recetasDelDoctor = guardadas.filter(r => r.doctorId === loggedInDoctorId);
        setRecetas(recetasDelDoctor);
    }, []);

    const handleEliminarReceta = (idReceta) => {
        if (window.confirm('¿Estás seguro de eliminar esta receta?')) {
            const actualizadas = recetas.filter(r => r.id !== idReceta);
            setRecetas(actualizadas);
            
            const todasLasRecetas = JSON.parse(localStorage.getItem('recetasGuardadas')) || [];
            const recetasGlobalesActualizadas = todasLasRecetas.filter(r => r.id !== idReceta);
            localStorage.setItem('recetasGuardadas', JSON.stringify(recetasGlobalesActualizadas));
        }
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={editarAzul} alt="Recetas" />
                Mis Recetas Emitidas
            </h2>

            <div className="lista-items-container">
                
                {recetas.length === 0 && (
                    <p style={{ textAlign: 'center' }}>No has emitido ninguna receta.</p>
                )}

                {[...recetas].reverse().map(receta => (
                    <div key={receta.id} className="item-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4>Paciente: {receta.pacienteNombre} (ID: {receta.pacienteId})</h4>
                                <p><strong>Fecha:</strong> {receta.fecha}</p>
                                <p><strong>Diagnóstico:</strong> {receta.diagnostico}</p>
                            </div>
                            <button 
                                className="btn btn-danger" 
                                style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                                onClick={() => handleEliminarReceta(receta.id)}
                            >
                                Eliminar
                            </button>
                        </div>
                        
                        <hr style={{ borderColor: '#eee', margin: '15px 0' }} />

                        <h5>Medicamentos Recetados:</h5>
                        <div className="medicamentos-list" style={{ maxHeight: 'none' }}>
                            {receta.medicamentos.map((med, index) => (
                                <div key={index} className="medicamento-item">
                                    <div className="medicamento-info">
                                        <strong>{med.nombre}</strong>
                                        <p>{med.dosis} • {med.frecuencia} • Duración: {med.duracion}</p>
                                        {med.instrucciones && <p style={{ color: '#555', fontSize: '0.85rem' }}><em>Inst: {med.instrucciones}</em></p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VerRecetas;