import React, { useState, useEffect } from 'react';
import './App.css';
import ModalMedicamento from './AgregarMedicamento'; 
import usuariosData from './usuarios.json';
import editarAzul from './assets/editar-azul.png'; 

// --- Función para obtener la fecha de hoy ---
const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

function AgregarReceta() {
  const [pacientes, setPacientes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([
    {
      nombre: "Paracetamol 500mg",
      dosis: "1 cápsula",
      frecuencia: "cada 8 horas",
      duracion: "7 días",
      instrucciones: ""
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [fecha, setFecha] = useState(getTodayDate());
  const [diagnostico, setDiagnostico] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem('usuarios')) || usuariosData;
    const pacientesFiltrados = guardados.filter(u => u.rol === 'Paciente');
    setPacientes(pacientesFiltrados);
  }, []);

  const handleAddMedicamento = (nuevo) => {
    setMedicamentos(prev => [...prev, nuevo]);
  };

  const handleRemoveMedicamento = (index) => {
    if (window.confirm(`¿Seguro que quieres eliminar ${medicamentos[index].nombre}?`)) {
      setMedicamentos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    alert('Receta guardada (simulación)');
  };

  return (
    <div className="form-usuario-container">
      <h2 className="page-title">
        <img src={editarAzul} alt="Agregar Receta" />
        Agregar receta
      </h2>

      <div className="user-form-card">
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>Nombre(s)</label>
            <select 
              className="rol-input" 
              value={selectedPaciente}
              onChange={(e) => setSelectedPaciente(e.target.value)}
            >
              <option value="" disabled>Selecciona un paciente</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombreCompleto} (ID: {p.id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fecha de Emisión</label>
            <input 
              type="date" 
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Diagnóstico Principal</label>
            <input 
              type="text" 
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              placeholder="Infección respiratoria superior"
            />
          </div>
          
          <div className="form-group">
            <label>Observaciones</label>
            <textarea 
              rows="4" 
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Paciente con fiebre y tos persistente, se recomienda reposo y aumento de líquidos."
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>Medicamentos</label>
            <div className="medicamentos-list">
              {medicamentos.length > 0 ? medicamentos.map((med, index) => (
                <div key={index} className="medicamento-item">
                  <div className="medicamento-info">
                    <strong>{med.nombre}</strong>
                    <p>{med.dosis} • {med.frecuencia} • Duración: {med.duracion}</p>
                  </div>
                  <div className="medicamento-actions">
                    <button 
                      type="button" 
                      className="btn-secundario" 
                      onClick={() => alert('Editar medicamento (no implementado)')}
                    >
                      Editar
                    </button>
                    <button 
                      type="button" 
                      className="btn-eliminar" 
                      onClick={() => handleRemoveMedicamento(index)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )) : (
                <p style={{textAlign: 'center', color: '#777'}}>No hay medicamentos agregados.</p>
              )}
            </div>
          </div>

          <button 
            type="button" 
            className="btn"
            style={{width: '100%', backgroundColor: '#e4e9ff', color: '#4a6fff', fontWeight: 'bold'}}
            onClick={() => setIsModalOpen(true)}
          >
            + Agregar Medicamento
          </button>
        </form>
      </div>

      <ModalMedicamento 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddMedicamento}
      />
    </div>
  );
}

export default AgregarReceta;
