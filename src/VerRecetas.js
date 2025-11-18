import React, { useState, useEffect } from 'react';
import './App.css';
import editarAzul from './assets/editar-azul.png';

const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/";

function VerRecetas() {
    const [recetas, setRecetas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- NUEVO: Estados del modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recetaAEliminar, setRecetaAEliminar] = useState(null);

    // Cargar recetas desde la API
    useEffect(() => {
        const fetchRecetas = async () => {
            try {
                const loggedInDoctorId = localStorage.getItem('userId');
                if (!loggedInDoctorId) throw new Error("No se pudo identificar al doctor.");

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
    }, []);

    // --- ABRIR MODAL ---
    const handleOpenModal = (receta) => {
        setRecetaAEliminar(receta);
        setIsModalOpen(true);
    };

    // --- CERRAR MODAL ---
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setRecetaAEliminar(null);
    };

    // --- CONFIRMAR ELIMINACIÓN ---
    const handleConfirmarEliminar = async () => {
        if (!recetaAEliminar) return;

        const idReceta = recetaAEliminar.id;

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
                throw new Error(data.message || "Error al eliminar la receta.");
            }

            // Eliminar del estado local
            setRecetas(prev => prev.filter(r => r.id !== idReceta));

        } catch (err) {
            alert(`Error al eliminar: ${err.message}`);
        }

        handleCloseModal();
    };

    // --- UI Estados ---
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
                                onClick={() => handleOpenModal(receta)}
                            >
                                Eliminar
                            </button>
                        </div>

                        <hr style={{ borderColor: '#eee', margin: '15px 0' }} />

                        <h5>Medicamentos Recetados:</h5>
                        <div className="medicamentos-list" style={{ maxHeight: 'none' }}>
                            {receta.medicamentos.map(med => (
                                <div key={med.id} className="medicamento-item">
                                    <div className="medicamento-info">
                                        <strong>{med.nombre_medicamento}</strong>
                                        <p>{med.dosis} • {med.frecuencia}h • {med.duracion}</p>
                                        {med.instrucciones && (
                                            <p style={{ color: '#555', fontSize: '0.85rem' }}>
                                                <em>Inst: {med.instrucciones}</em>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- MODAL DE CONFIRMACIÓN --- */}
            {isModalOpen && recetaAEliminar && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Confirmar Eliminación</h3>
                        </div>

                        <div className="modal-body">
                            <p>
                                ¿Está seguro de que desea eliminar la receta de
                                <strong className="user-name-highlight"> {recetaAEliminar.pacienteNombre} </strong>
                                (ID receta:
                                <code className="user-id-highlight"> {recetaAEliminar.id}</code>)?
                            </p>
                            <p className="warning-text">Esta acción es irreversible.</p>
                        </div>

                        <div className="modal-footer">
                            <button className="modal-cancel-btn" onClick={handleCloseModal}>
                                Cancelar
                            </button>
                            <button className="modal-confirm-btn" onClick={handleConfirmarEliminar}>
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default VerRecetas;
