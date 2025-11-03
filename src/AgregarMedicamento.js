import React, { useState } from 'react';
import './App.css'; // Reusa el CSS

// Props: isOpen, onClose (para cerrar), onAdd (para agregar)
function ModalMedicamento({ isOpen, onClose, onAdd }) {
    const [medicamento, setMedicamento] = useState('');
    const [dosis, setDosis] = useState('');
    const [frecuencia, setFrecuencia] = useState('');
    const [duracion, setDuracion] = useState('');
    const [instrucciones, setInstrucciones] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const nuevoMedicamento = {
            nombre: medicamento,
            dosis,
            frecuencia,
            duracion,
            instrucciones
        };
        onAdd(nuevoMedicamento); // Envía el objeto al padre
        
        // Limpiar y cerrar
        setMedicamento('');
        setDosis('');
        setFrecuencia('');
        setDuracion('');
        setInstrucciones('');
        onClose();
    };
    
    // e.stopPropagation() evita que el clic en el modal cierre el modal
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                
                <div className="modal-header">
                    <h3>AGREGAR MEDICAMENTO</h3>
                </div>
                
                <form className="modal-body" onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        <label>Nombre del Medicamento</label>
                        <input 
                            type="text" 
                            value={medicamento}
                            onChange={(e) => setMedicamento(e.target.value)}
                            placeholder="Amoxicilina"
                        />
                    </div>

                    <div className="form-grid"> {/* Reusa .form-grid */}
                        <div className="form-group">
                            <label>Dosis</label>
                            <input 
                                type="text" 
                                value={dosis}
                                onChange={(e) => setDosis(e.target.value)}
                                placeholder="1 cápsula"
                            />
                        </div>
                        <div className="form-group">
                            <label>Frecuencia</label>
                            <input 
                                type="text" 
                                value={frecuencia}
                                onChange={(e) => setFrecuencia(e.target.value)}
                                placeholder="Cada 8 horas"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Duración del Tratamiento</label>
                        <input 
                            type="text" 
                            value={duracion}
                            onChange={(e) => setDuracion(e.target.value)}
                            placeholder="7 dias"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Instrucciones Especiales</label>
                        <textarea 
                            value={instrucciones}
                            onChange={(e) => setInstrucciones(e.target.value)}
                            rows="4"
                        ></textarea>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Agregar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalMedicamento;