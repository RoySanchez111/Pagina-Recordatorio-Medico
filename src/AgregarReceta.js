import React, { useState, useEffect } from 'react';
import './App.css'; 
// import ModalMedicamento from './AgregarMedicamento'; // YA NO LO NECESITAMOS, HAREMOS EL FORMULARIO AQUÍ
import editarAzul from './assets/editar-azul.png';

const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/";

// --- VALIDACIONES ---
const validarReceta = (recetaData) => {
  const errores = {};
  if (!recetaData.pacienteId) errores.pacienteId = 'Debe seleccionar un paciente';
  if (!recetaData.fecha) errores.fecha = 'La fecha es requerida';
  if (!recetaData.diagnostico) errores.diagnostico = 'El diagnóstico es requerido';
  
  if (!recetaData.medicamentos || recetaData.medicamentos.length === 0) {
    errores.medicamentos = 'Debe agregar al menos un medicamento';
  }
  return { hayErrores: Object.keys(errores).length > 0, errores: errores };
};

const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

function AgregarReceta() {
  // --- ESTADOS GENERALES ---
  const [pacientes, setPacientes] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [fecha, setFecha] = useState(getTodayDate());
  const [diagnostico, setDiagnostico] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [doctorId, setDoctorId] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  // --- ESTADOS PARA EL MEDICAMENTO ACTUAL (FORMULARIO MANUAL) ---
  const [listaMedicamentos, setListaMedicamentos] = useState([]);
  const [medActual, setMedActual] = useState({
    nombre: '',
    dosis: '',
    horariosInput: '', // Aquí el doctor escribe "08:00, 16:00"
    duracion: '',
    instrucciones: ''
  });

  // 1. CARGAR PACIENTES AL INICIAR
  useEffect(() => {
    const loggedInDoctorId = localStorage.getItem('userId');
    setDoctorId(loggedInDoctorId);

    const fetchPatients = async () => {
      if (!loggedInDoctorId) return;
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: "getPatientsByDoctor",
            data: { doctorId: loggedInDoctorId }
          })
        });
        const patientList = await response.json();
        if (response.ok) {
            setPacientes(patientList);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, []);

  // --- MANEJO DEL FORMULARIO DE MEDICAMENTO ---
  const handleMedChange = (e) => {
    setMedActual({ ...medActual, [e.target.name]: e.target.value });
  };

  const agregarMedicamentoALista = () => {
    // Validaciones simples
    if (!medActual.nombre || !medActual.dosis || !medActual.horariosInput) {
        alert("Nombre, Dosis y Horarios son obligatorios.");
        return;
    }

    // PROCESAMIENTO DE HORAS MANUALES
    // Convertimos "08:00, 14:00 " -> ["08:00", "14:00"]
    const horariosArray = medActual.horariosInput
        .split(',')
        .map(h => h.trim())
        .filter(h => h.length > 0);

    // Validar formato HH:MM (Opcional, pero recomendado)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const validTimes = horariosArray.every(t => timeRegex.test(t));

    if (!validTimes) {
        alert("Formato de hora inválido. Usa HH:MM separados por coma (Ej: 08:00, 20:00)");
        return;
    }

    // Agregamos a la lista visual
    const nuevoMedicamento = {
        ...medActual,
        horarios: horariosArray, // Guardamos el array limpio
        id: Date.now() // ID temporal para la lista
    };

    setListaMedicamentos([...listaMedicamentos, nuevoMedicamento]);
    
    // Limpiar campos
    setMedActual({ nombre: '', dosis: '', horariosInput: '', duracion: '', instrucciones: '' });
  };

  const eliminarMedicamento = (id) => {
    setListaMedicamentos(listaMedicamentos.filter(m => m.id !== id));
  };

  // --- GUARDAR RECETA EN AWS ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrores({});

    // Validar cabecera
    const datosValidar = {
      pacienteId: selectedPaciente,
      fecha,
      diagnostico,
      medicamentos: listaMedicamentos
    };
    
    const resultadoValidacion = validarReceta(datosValidar);
    if (resultadoValidacion.hayErrores) {
      setErrores(resultadoValidacion.errores);
      setLoading(false);
      alert('❌ Faltan datos obligatorios.');
      return;
    }

    // PREPARAR PAYLOAD PARA LAMBDA
    // La Lambda nueva espera 'horarios' como array en cada medicamento
    const medicamentosParaAPI = listaMedicamentos.map(med => ({
        nombre: med.nombre,
        dosis: med.dosis,
        horarios: med.horarios, // Array directo ["08:00", "16:00"]
        duracion: med.duracion,
        instrucciones: med.instrucciones,
        
        // Campos legacy para mantener compatibilidad si algo falla
        frecuencia: `Horarios: ${med.horarios.join(', ')}`,
        primeraIngesta: med.horarios[0] || '',
        cantidadInicial: 0
    }));

    const payload = {
      action: "createRecipe",
      data: {
        id_paciente: selectedPaciente,
        id_doctor: doctorId,
        fechaEmision: fecha,
        diagnostico: diagnostico.trim(),
        observaciones: observaciones.trim(),
        pacienteNombre: pacientes.find(p => p.id === selectedPaciente)?.nombreCompleto || 'Paciente',
        medicamentos: medicamentosParaAPI
      }
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al guardar');

      alert(`✅ Receta guardada exitosamente.`);

      // Reset total
      setListaMedicamentos([]);
      setSelectedPaciente("");
      setFecha(getTodayDate());
      setDiagnostico("");
      setObservaciones("");
      
    } catch (err) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-usuario-container">
      <h2 className="page-title">
        <img src={editarAzul} alt="Agregar Receta" />
        Nueva Receta
      </h2>

      <div className="user-form-card">
        <form onSubmit={handleFormSubmit}>
          <fieldset disabled={loading} style={{border:'none', padding:0}}>
            
            {/* SECCIÓN 1: DATOS GENERALES */}
            <h3 style={{ color: '#3498db', borderBottom: '1px solid #eee', paddingBottom:'10px' }}>1. Datos del Paciente</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Paciente *</label>
                <select 
                  className={errores.pacienteId ? 'input-error' : ''}
                  value={selectedPaciente}
                  onChange={(e) => setSelectedPaciente(e.target.value)}
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nombreCompleto}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha Emisión</label>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
              
              <div className="form-group full-width">
                <label>Diagnóstico *</label>
                <input 
                  type="text" 
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  placeholder="Ej. Hipertensión Arterial"
                  required
                  className={errores.diagnostico ? 'input-error' : ''}
                />
              </div>
            </div>

            {/* SECCIÓN 2: FORMULARIO DE MEDICAMENTOS */}
            <h3 style={{ color: '#3498db', borderBottom: '1px solid #eee', marginTop: '30px', paddingBottom:'10px' }}>2. Agregar Medicamentos</h3>
            
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Medicamento</label>
                        <input name="nombre" value={medActual.nombre} onChange={handleMedChange} placeholder="Ej. Paracetamol" />
                    </div>
                    <div className="form-group">
                        <label>Dosis</label>
                        <input name="dosis" value={medActual.dosis} onChange={handleMedChange} placeholder="Ej. 500 mg" />
                    </div>
                    
                    {/* CAMPO DE HORAS MANUALES */}
                    <div className="form-group full-width">
                        <label style={{color: '#2c3e50', fontWeight:'bold'}}>Horarios de toma (Separados por coma)</label>
                        <input 
                            name="horariosInput" 
                            value={medActual.horariosInput} 
                            onChange={handleMedChange} 
                            placeholder="Ej: 08:00, 14:00, 20:00" 
                            style={{borderColor: '#3498db'}}
                        />
                        <small style={{color: '#666', display:'block', marginTop:'5px'}}>
                            Formato 24h. Escribe las horas exactas. Ej: 08:00, 16:00, 00:00
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Duración</label>
                        <input name="duracion" value={medActual.duracion} onChange={handleMedChange} placeholder="Ej. 5 días" />
                    </div>
                    <div className="form-group">
                        <label>Instrucciones</label>
                        <input name="instrucciones" value={medActual.instrucciones} onChange={handleMedChange} placeholder="Ej. Tomar con alimentos" />
                    </div>
                </div>
                
                <div style={{textAlign: 'right', marginTop: '10px'}}>
                    <button 
                        type="button" 
                        onClick={agregarMedicamentoALista}
                        className="btn"
                        style={{backgroundColor: '#28a745', color: 'white', fontWeight:'bold', padding: '10px 20px'}}
                    >
                        + Agregar a la Lista
                    </button>
                </div>
            </div>

            {/* LISTA VISUAL DE MEDICAMENTOS AGREGADOS */}
            {listaMedicamentos.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h4 style={{color:'#555'}}>Medicamentos en esta receta:</h4>
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                        {listaMedicamentos.map((med) => (
                            <div key={med.id} style={{
                                backgroundColor: 'white', 
                                borderLeft: '4px solid #3498db', 
                                padding: '15px', 
                                borderRadius: '4px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{fontWeight:'bold', fontSize:'16px', color:'#2c3e50'}}>{med.nombre} <span style={{fontWeight:'normal', color:'#666'}}>({med.dosis})</span></div>
                                    <div style={{fontSize:'14px', marginTop:'5px'}}>
                                        <span style={{fontWeight:'bold', color:'#3498db'}}>Horarios:</span> {med.horarios.join(' - ')}
                                    </div>
                                    <div style={{fontSize:'13px', color:'#888', marginTop:'2px'}}>{med.duracion} • {med.instrucciones}</div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => eliminarMedicamento(med.id)}
                                    style={{color: '#e74c3c', background:'none', border:'none', cursor:'pointer', fontSize:'20px', fontWeight:'bold'}}
                                    title="Eliminar"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="form-group full-width">
              <label>Observaciones Generales</label>
              <textarea 
                rows="3" 
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Recomendaciones generales..."
              ></textarea>
            </div>

            <div className="form-actions" style={{marginTop: '30px'}}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || listaMedicamentos.length === 0}
                style={{width: '100%', padding: '15px', fontSize: '16px'}}
              >
                {loading ? "Guardando..." : "Guardar y Asignar Receta"}
              </button>
            </div>

          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default AgregarReceta;