import React, { useState, useEffect } from 'react';
import './App.css';
import ModalMedicamento from './AgregarMedicamento'; 
import usuariosData from './usuarios.json';
import editarAzul from './assets/editar-azul.png'; 

const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

function AgregarReceta() {
  const [pacientes, setPacientes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [fecha, setFecha] = useState(getTodayDate());
  const [diagnostico, setDiagnostico] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [medicamentoAEditar, setMedicamentoAEditar] = useState(null);
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    const loggedInDoctorId = parseInt(localStorage.getItem('userId'));
    setDoctorId(loggedInDoctorId);
    
    const guardados = JSON.parse(localStorage.getItem('usuarios')) || usuariosData;
    const pacientesDelDoctor = guardados.filter(u => 
        u.rol === 'Paciente' && u.doctorId === loggedInDoctorId
    );
    setPacientes(pacientesDelDoctor);
  }, []);

  const handleSaveMedicamento = (medicamentoGuardado) => {
    if (medicamentoAEditar !== null) {
      const indexAActualizar = medicamentoAEditar.index;
      setMedicamentos(prev => 
        prev.map((med, i) => 
          i === indexAActualizar ? medicamentoGuardado : med
        )
      );
    } else {
      setMedicamentos(prev => [...prev, medicamentoGuardado]);
    }
    handleCloseModal();
  };

  const handleRemoveMedicamento = (index) => {
    if (window.confirm(`¿Seguro que quieres eliminar ${medicamentos[index].nombre}?`)) {
      setMedicamentos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleOpenModalAgregar = () => {
    setMedicamentoAEditar(null);
    setIsModalOpen(true);
  };

  const handleOpenModalEditar = (index) => {
    setMedicamentoAEditar({
      index: index,
      data: medicamentos[index]
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMedicamentoAEditar(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!selectedPaciente) {
      alert('Error: Debe seleccionar un paciente.');
      return;
    }
    if (medicamentos.length === 0) {
      alert('Error: Debe agregar al menos un medicamento a la receta.');
      return;
    }
    if (!diagnostico) {
      alert('Error: Debe ingresar un diagnóstico.');
      return;
    }

    const pacienteInfo = pacientes.find(p => p.id === parseInt(selectedPaciente));
    const nombrePaciente = pacienteInfo ? pacienteInfo.nombreCompleto : 'ID ' + selectedPaciente;

    const nuevaReceta = {
      id: new Date().getTime(),
      pacienteId: parseInt(selectedPaciente),
      pacienteNombre: nombrePaciente,
      fecha: fecha,
      diagnostico: diagnostico,
      observaciones: observaciones,
      medicamentos: medicamentos,
      doctorId: doctorId
    };

    const recetasActuales = JSON.parse(localStorage.getItem('recetasGuardadas')) || [];
    const recetasActualizadas = [...recetasActuales, nuevaReceta];
    localStorage.setItem('recetasGuardadas', JSON.stringify(recetasActualizadas));

    alert(`✅ Receta asignada con éxito a ${nombrePaciente}.`);

    setMedicamentos([]);
    setSelectedPaciente("");
    setFecha(getTodayDate());
    setDiagnostico("");
    setObservaciones("");
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
              required
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
              required
            />
          </div>
          
          <div className="form-group">
            <label>Diagnóstico Principal</label>
            <input 
              type="text" 
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              placeholder="Infección respiratoria superior"
              required
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
                      onClick={() => handleOpenModalEditar(index)} 
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
            onClick={handleOpenModalAgregar}
          >
            + Agregar Medicamento
          </button>

          <div className="form-actions" style={{marginTop: '30px'}}>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Asignar Receta al Paciente
            </button>
          </div>

        </form>
      </div>

      <ModalMedicamento 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveMedicamento}
        medicamentoInicial={medicamentoAEditar ? medicamentoAEditar.data : null}
      />
    </div>
  );
}

export default AgregarReceta;