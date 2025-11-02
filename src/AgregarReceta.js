import React, { useState } from 'react';
// Asegúrate de que este archivo CSS contenga los estilos de los formularios y el modal
import './App.css'; 

// ===========================================
// 1. Componente del Modal para Agregar Medicamento
// ===========================================
const MedicamentoModal = ({ isOpen, onClose, onAddMedicamento }) => {
    // Usamos useState para manejar los datos del formulario del modal
    const [nombre, setNombre] = useState('');
    const [dosis, setDosis] = useState('');
    const [frecuencia, setFrecuencia] = useState('');
    const [duracion, setDuracion] = useState('');
    const [instrucciones, setInstrucciones] = useState('');

    if (!isOpen) return null; // Si no está abierto, no renderizar nada

    const handleAdd = () => {
        if (nombre && dosis && frecuencia && duracion) {
            const newMed = {
                id: Date.now(), // ID único para las claves de React
                nombre,
                dosis,
                frecuencia,
                duracion,
                instrucciones
            };
            
            // Llama a la función del componente padre para añadir el medicamento
            onAddMedicamento(newMed);
            
            // Limpiar campos del modal y cerrar
            setNombre('');
            setDosis('');
            setFrecuencia('');
            setDuracion('');
            setInstrucciones('');
            onClose();
        } else {
            alert('Por favor, complete los campos principales del medicamento.');
        }
    };
    
    // El modal usa las clases CSS ya definidas (modal-overlay, modal-content, etc.)
    return (
        <div className="modal-overlay"> 
            <div className="modal-content">
                <h2>AGREGAR MEDICAMENTO</h2>
                <div className="form-group-full">
                    <label>Nombre del Medicamento</label>
                    <input 
                        type="text" 
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Dosis</label>
                        <input 
                            type="text" 
                            value={dosis}
                            onChange={(e) => setDosis(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Frecuencia</label>
                        <input 
                            type="text" 
                            value={frecuencia}
                            onChange={(e) => setFrecuencia(e.target.value)}
                        />
                    </div>
                </div>
                <div className="form-group-full">
                    <label>Duración del Tratamiento</label>
                    <input 
                        type="text" 
                        value={duracion}
                        onChange={(e) => setDuracion(e.target.value)}
                    />
                </div>
                <div className="form-group-full">
                    <label>Instrucciones Especiales</label>
                    <textarea 
                        value={instrucciones}
                        onChange={(e) => setInstrucciones(e.target.value)}
                    ></textarea>
                </div>
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Cerrar</button>
                    <button className="btn-primary" onClick={handleAdd}>Agregar</button>
                </div>
            </div>
        </div>
    );
};


// ===========================================
// 2. Componente principal de la vista "Agregar Receta"
// ===========================================
function AgregarReceta() {
    // Estado para controlar la lista de medicamentos en la receta
    const [medicamentos, setMedicamentos] = useState([
        // Ejemplo de medicamento cargado inicialmente
        { 
            id: 1, 
            nombre: "Paracitamol 500mg", 
            dosis: "1 cápsula", 
            frecuencia: "cada 8 horas", 
            duracion: "7 días", 
            instrucciones: "" 
        } 
    ]);

    // Estado para controlar la visibilidad del modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Función para añadir un nuevo medicamento a la lista
    const handleAddMedicamento = (newMed) => {
        setMedicamentos(prevMeds => [
            ...prevMeds,
            newMed
        ]);
    };

    // Función para eliminar un medicamento de la lista
    const handleDeleteMedicamento = (id) => {
        setMedicamentos(prevMeds => prevMeds.filter(med => med.id !== id));
    };

    // Función para dar formato al texto del medicamento (como en el diseño)
    const formatMedicamentoText = (med) => {
        return `${med.nombre} - ${med.dosis} ${med.frecuencia} - Duración: ${med.duracion}`;
    };

    const handleSaveReceta = () => {
        // Lógica de guardado (simulación)
        alert(`Receta lista para guardar. Total de medicamentos: ${medicamentos.length}`);
    };

    return (
        // Usamos la clase 'view-container' para el fondo blanco y la sombra
        <div className="view-container active"> 
            
            <div className="receta-form-container">
                
                {/* Nota: La imagen de perfil del doctor y el icono de '+' se omiten 
                   para centrarnos en la funcionalidad del formulario y el modal */}
                
                <div className="form-content">
                    
                    {/* Campos de la Receta */}
                    <div className="form-group-full">
                        <label>Nombre(s)</label>
                        <input type="text" defaultValue="Rafael Flores Lopez" />
                    </div>
                    
                    <div className="form-group-full">
                        <label>Fecha de Emisión</label>
                        <input type="date" defaultValue="2025-10-29" />
                    </div>
                    
                    <div className="form-group-full">
                        <label>Diagnóstico Principal</label>
                        <input type="text" defaultValue="Infección respiratoria superior" />
                    </div>
                    
                    <div className="form-group-full">
                        <label>Observaciones</label>
                        <textarea defaultValue="Paciente con fiebre y tos persistente, se recomienda reposo y aumento de líquidos."></textarea>
                    </div>
                    
                    {/* Sección de Medicamentos */}
                    <h4>Medicamentos</h4>
                    <div id="medicamentos-list">
                        {medicamentos.map(med => (
                            <div key={med.id} className="medicamento-item">
                                <span>{formatMedicamentoText(med)}</span>
                                {/* Botón para eliminar */}
                                <button type="button" onClick={() => handleDeleteMedicamento(med.id)}>
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    {/* Botón "+ Agregar Medicamento" que abre el modal */}
                    <button 
                        className="btn-primary" 
                        onClick={() => setIsModalOpen(true)}
                        style={{ marginTop: '20px' }} 
                    >
                        + Agregar Medicamento
                    </button>
                    
                    {/* Botón para Guardar la Receta (opcional, para completar el flujo) */}
                    <button 
                        className="btn-primary" 
                        onClick={handleSaveReceta}
                        style={{ marginTop: '10px', backgroundColor: '#4CAF50' }} 
                    >
                        Guardar Receta
                    </button>
                </div>
            </div>
            
            {/* 3. Renderizado del Modal */}
            <MedicamentoModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAddMedicamento={handleAddMedicamento} 
            />
        </div>
    );
}

export default AgregarReceta;