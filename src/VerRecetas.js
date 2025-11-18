import React, { useState, useEffect } from 'react';
import './App.css';
import editarAzul from './assets/editar-azul.png'; 

// <-- AÑADIDO: Tu URL de API
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/"; // <-- PEGA TU URL

function VerRecetas() {
    const [recetas, setRecetas] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // <-- AÑADIDO
    const [error, setError] = useState(null); // <-- AÑADIDO

    // <-- MODIFICADO: Ahora carga desde la API de AWS
    useEffect(() => {
        const fetchRecetas = async () => {
            try {
                const loggedInDoctorId = localStorage.getItem('userId');
                if (!loggedInDoctorId) {
                    throw new Error("No se pudo identificar al doctor.");
                }

                const payload = {
                    action: "getRecipesByDoctor",
                    data: { doctorId: loggedInDoctorId }
                };

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || "No se pudieron cargar las recetas.");
                }

                const recetasDeLaNube = await response.json();
                setRecetas(recetasDeLaNube);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecetas();
    }, []); // Se ejecuta una vez

    // <-- MODIFICADO: Ahora llama a la API para eliminar
    const handleEliminarReceta = async (idReceta) => {
        // (Quitamos window.confirm)
        try {
            const payload = {
                action: "deleteRecipe",
                data: { recetaId: idReceta }
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Error al eliminar");
            }

            // Si se elimina de la API, la quitamos del estado local
            setRecetas(prevRecetas => prevRecetas.filter(r => r.id !== idReceta));

        } catch (err) {
            alert(`Error al eliminar: ${err.message}`);
        }
    };

    // --- MANEJO DE ESTADOS DE CARGA Y ERROR ---
    if (isLoading) {
        return (
            <div className="form-usuario-container">
                <h2 className="page-title">
                    <img src={editarAzul} alt="Recetas" />
                    Mis Recetas Emitidas
                </h2>
                <p style={{ textAlign: 'center', padding: '20px' }}>Cargando recetas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="form-usuario-container">
                <h2 className="page-title">
                    <img src={editarAzul} alt="Recetas" />
                    Mis Recetas Emitidas
                </h2>
                <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                    Error al cargar: {error}
                </p>
            </div>
        );
    }
    
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

                {/* --- MODIFICADO: 'fechaEmision' y 'nombre_medicamento' --- */}
                {[...recetas].reverse().map(receta => (
                    <div key={receta.id} className="item-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4>Paciente: {receta.pacienteNombre} (ID: {receta.id_paciente})</h4>
                                <p><strong>Fecha:</strong> {receta.fechaEmision}</p>
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
                            {receta.medicamentos.map((med) => (
                                <div key={med.id} className="medicamento-item">
                                    <div className="medicamento-info">
                                        <strong>{med.nombre_medicamento}</strong>
                                        <p>{med.dosis} • {med.frecuencia}h • {med.duracion}</p>
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