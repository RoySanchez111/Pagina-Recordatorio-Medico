import React, { useState, useEffect } from 'react';
import './App.css';
import ModalMedicamento from './AgregarMedicamento'; 
import usuariosData from './usuarios.json';
import editarAzul from './assets/editar-azul.png'; 

// Validaciones integradas
const validarReceta = (recetaData) => {
  const errores = {};

  // Validar paciente seleccionado
  if (!recetaData.pacienteId) {
    errores.pacienteId = 'Debe seleccionar un paciente';
  }

  // Validar fecha
  if (!recetaData.fecha) {
    errores.fecha = 'La fecha de emisión es requerida';
  } else {
    const fechaReceta = new Date(recetaData.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // No permitir fechas futuras
    if (fechaReceta > hoy) {
      errores.fecha = 'La fecha no puede ser futura';
    }
    
    // No permitir fechas muy antiguas (más de 1 año)
    const minFecha = new Date();
    minFecha.setFullYear(hoy.getFullYear() - 1);
    if (fechaReceta < minFecha) {
      errores.fecha = 'La fecha no puede ser de hace más de 1 año';
    }
  }

  // Validar diagnóstico
  if (!recetaData.diagnostico) {
    errores.diagnostico = 'El diagnóstico es requerido';
  } else {
    const regexDiagnostico = /^[A-Za-zÁáÉéÍíÓóÚúÑñ0-9\s.,-]{5,200}$/;
    if (!regexDiagnostico.test(recetaData.diagnostico.trim())) {
      errores.diagnostico = 'El diagnóstico debe contener entre 5 y 200 caracteres válidos';
    }
  }

  // Validar observaciones (opcional)
  if (recetaData.observaciones && recetaData.observaciones.length > 1000) {
    errores.observaciones = 'Las observaciones no pueden exceder 1000 caracteres';
  }

  // Validar medicamentos
  if (!recetaData.medicamentos || recetaData.medicamentos.length === 0) {
    errores.medicamentos = 'Debe agregar al menos un medicamento';
  } else if (recetaData.medicamentos.length > 10) {
    errores.medicamentos = 'Máximo 10 medicamentos permitidos por receta';
  }

  return {
    hayErrores: Object.keys(errores).length > 0,
    errores: errores
  };
};

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
  const [errores, setErrores] = useState({});

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

  const handleChange = (field, value) => {
    // Limpiar errores cuando el usuario escribe
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: '' }));
    }

    let valorLimpio = value;
    
    // Validaciones en tiempo real
    if (field === 'diagnostico') {
      // Solo letras, números, espacios y caracteres médicos básicos
      valorLimpio = value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ0-9\s.,-]/g, '');
    }

    if (field === 'diagnostico') setDiagnostico(valorLimpio);
    if (field === 'observaciones') setObservaciones(value);
    if (field === 'fecha') setFecha(value);
    if (field === 'selectedPaciente') setSelectedPaciente(value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validar todos los campos de la receta
    const datosReceta = {
      pacienteId: selectedPaciente,
      fecha,
      diagnostico,
      observaciones,
      medicamentos
    };

    const resultadoValidacion = validarReceta(datosReceta);
    
    if (resultadoValidacion.hayErrores) {
      setErrores(resultadoValidacion.errores);
      alert('❌ Por favor corrige los errores en el formulario');
      return;
    }

    const pacienteInfo = pacientes.find(p => p.id === parseInt(selectedPaciente));
    const nombrePaciente = pacienteInfo ? pacienteInfo.nombreCompleto : 'ID ' + selectedPaciente;

    const nuevaReceta = {
      id: new Date().getTime(),
      pacienteId: parseInt(selectedPaciente),
      pacienteNombre: nombrePaciente,
      fecha: fecha,
      diagnostico: diagnostico.trim(),
      observaciones: observaciones.trim(),
      medicamentos: medicamentos,
      doctorId: doctorId
    };

    const recetasActuales = JSON.parse(localStorage.getItem('recetasGuardadas')) || [];
    const recetasActualizadas = [...recetasActuales, nuevaReceta];
    localStorage.setItem('recetasGuardadas', JSON.stringify(recetasActualizadas));

    alert(`✅ Receta asignada con éxito a ${nombrePaciente}.`);

    // Limpiar formulario
    setMedicamentos([]);
    setSelectedPaciente("");
    setFecha(getTodayDate());
    setDiagnostico("");
    setObservaciones("");
    setErrores({});
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
            <label>Nombre(s) *</label>
            <select 
              className={`rol-input ${errores.pacienteId ? 'input-error' : ''}`}
              value={selectedPaciente}
              onChange={(e) => handleChange('selectedPaciente', e.target.value)}
              required
            >
              <option value="" disabled>Selecciona un paciente</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombreCompleto} (ID: {p.id})
                </option>
              ))}
            </select>
            {errores.pacienteId && (
              <span className="error-message">{errores.pacienteId}</span>
            )}
          </div>

          <div className="form-group">
            <label>Fecha de Emisión *</label>
            <input 
              type="date" 
              value={fecha}
              onChange={(e) => handleChange('fecha', e.target.value)}
              required
              className={errores.fecha ? 'input-error' : ''}
            />
            {errores.fecha && (
              <span className="error-message">{errores.fecha}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>Diagnóstico Principal *</label>
            <input 
              type="text" 
              value={diagnostico}
              onChange={(e) => handleChange('diagnostico', e.target.value)}
              placeholder="Infección respiratoria superior"
              required
              className={errores.diagnostico ? 'input-error' : ''}
            />
            {errores.diagnostico && (
              <span className="error-message">{errores.diagnostico}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>Observaciones</label>
            <textarea 
              rows="4" 
              value={observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Paciente con fiebre y tos persistente, se recomienda reposo y aumento de líquidos."
              className={errores.observaciones ? 'input-error' : ''}
            ></textarea>
            {errores.observaciones && (
              <span className="error-message">{errores.observaciones}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>Medicamentos *</label>
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
            {errores.medicamentos && (
              <span className="error-message">{errores.medicamentos}</span>
            )}
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