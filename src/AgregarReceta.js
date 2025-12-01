import React, { useState, useEffect } from 'react';
import './App.css'; 
import editarAzul from './assets/editar-azul.png';

const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/";

// --- OPCIONES DESPLEGABLES ---
const dosisOptions = [
  { value: "capsula", label: "Cápsula(s)" },
  { value: "tableta", label: "Tableta(s)" },
  { value: "pastilla", label: "Pastilla(s)" },
  { value: "comprimido", label: "Comprimido(s)" },
  { value: "cucharadita", label: "Cucharadita(s)" },
  { value: "cucharada", label: "Cucharada(s)" },
  { value: "mililitro", label: "Mililitro(s)" },
  { value: "gramo", label: "Gramo(s)" },
  { value: "mg", label: "Miligramo(s)" },
  { value: "gota", label: "Gota(s)" },
  { value: "inyeccion", label: "Inyección(es)" },
  { value: "aplicacion", label: "Aplicación(es)" },
  { value: "puff", label: "Puff(s)" },
  { value: "unidad", label: "Unidad(es)" }
];

const duracionOptions = [
  { value: "dias", label: "Día(s)" },
  { value: "semanas", label: "Semana(s)" },
  { value: "meses", label: "Mes(es)" }
];

// --- FUNCIONES AUXILIARES ---

// Convierte 14:00 -> 2:00 PM para mostrar al usuario
const convertirA12Horas = (hora24) => {
  if (!hora24) return "";
  const [hora, minutos] = hora24.split(':');
  let h = parseInt(hora, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; 
  return `${h}:${minutos} ${ampm}`;
};

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

const validarSoloNumeros = (valor) => {
  const soloNumeros = valor.replace(/[^0-9]/g, '');
  return soloNumeros.slice(0, 2);
};

function AgregarReceta() {
  // --- ESTADOS ---
  const [pacientes, setPacientes] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [fecha, setFecha] = useState(getTodayDate());
  const [diagnostico, setDiagnostico] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [doctorId, setDoctorId] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DE MEDICAMENTO ---
  const [listaMedicamentos, setListaMedicamentos] = useState([]);
  
  // CAMBIO AQUÍ: Inicializamos con "08:00" en lugar de ""
  const [tempHora, setTempHora] = useState("08:00"); 
  
  const [horariosList, setHorariosList] = useState([]); 

  const [medActual, setMedActual] = useState({
    nombre: '',
    dosisCantidad: '',
    dosisUnidad: 'Cápsula(s)', 
    duracion: '',
    duracionCantidad: '',
    duracionUnidad: 'Día(s)', 
    instrucciones: ''
  });

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

  const handleMedChange = (e) => {
    setMedActual({ ...medActual, [e.target.name]: e.target.value });
  };

  const handleDosisCantidadChange = (e) => {
    setMedActual({ ...medActual, dosisCantidad: validarSoloNumeros(e.target.value) });
  };

  const handleDuracionCantidadChange = (e) => {
    setMedActual({ ...medActual, duracionCantidad: validarSoloNumeros(e.target.value) });
  };

  const handleDosisUnidadChange = (e) => {
    setMedActual({ ...medActual, dosisUnidad: e.target.value });
  };

  const handleDuracionUnidadChange = (e) => {
    setMedActual({ ...medActual, duracionUnidad: e.target.value });
  };

  // --- LÓGICA DE HORARIOS ---
  const agregarHoraALista = () => {
    if (!tempHora) return; 

    if (horariosList.includes(tempHora)) {
        alert("Esa hora ya está agregada.");
        return;
    }

    // Ordenamos cronológicamente
    const nuevaLista = [...horariosList, tempHora].sort();
    setHorariosList(nuevaLista);
    
    // CAMBIO AQUÍ: Al agregar, reseteamos a "08:00" para mantener la sugerencia
    setTempHora("08:00"); 
  };

  const eliminarHoraDeLista = (horaAEliminar) => {
    setHorariosList(horariosList.filter(h => h !== horaAEliminar));
  };

  // --- AGREGAR MEDICAMENTO ---
  const agregarMedicamentoALista = () => {
    if (!medActual.nombre || !medActual.dosisCantidad || !medActual.dosisUnidad) {
        alert("Nombre y Dosis son obligatorios.");
        return;
    }

    if (horariosList.length === 0) {
        alert("Debes agregar al menos un horario de toma.");
        return;
    }

    const dosisCompleta = `${medActual.dosisCantidad} ${medActual.dosisUnidad}`;
    
    const duracionCompleta = medActual.duracionCantidad && medActual.duracionUnidad 
      ? `${medActual.duracionCantidad} ${medActual.duracionUnidad}`
      : medActual.duracion;

    const nuevoMedicamento = {
        ...medActual,
        dosis: dosisCompleta,
        duracion: duracionCompleta,
        horarios: horariosList, // Se guarda en 24h
        id: Date.now()
    };

    setListaMedicamentos([...listaMedicamentos, nuevoMedicamento]);
    
    // Resetear formulario
    setMedActual({ 
      nombre: '', 
      dosisCantidad: '', 
      dosisUnidad: 'Cápsula(s)', 
      duracion: '', 
      duracionCantidad: '', 
      duracionUnidad: 'Día(s)', 
      instrucciones: '' 
    });
    setHorariosList([]); 
    // CAMBIO AQUÍ: Al terminar un medicamento, el reloj vuelve a sugerir 08:00
    setTempHora("08:00");
  };

  const eliminarMedicamento = (id) => {
    setListaMedicamentos(listaMedicamentos.filter(m => m.id !== id));
  };

  // --- SUBMIT ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrores({});

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

    const medicamentosParaAPI = listaMedicamentos.map(med => {
        const horariosBonitos = med.horarios.map(h => convertirA12Horas(h)).join(', ');

        return {
            nombre: med.nombre,
            dosis: med.dosis,
            horarios: med.horarios, // Array crudo (24h)
            duracion: med.duracion,
            instrucciones: med.instrucciones,
            frecuencia: `Horarios: ${horariosBonitos}`, // Texto legible
            primeraIngesta: med.horarios[0] || '',
            cantidadInicial: 0
        };
    });

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
      setListaMedicamentos([]);
      setSelectedPaciente("");
      setFecha(getTodayDate());
      setDiagnostico("");
      setObservaciones("");
      setHorariosList([]);
      setTempHora("08:00"); // Reset final
      
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
            
            {/* 1. DATOS PACIENTE */}
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

            {/* 2. MEDICAMENTOS */}
            <h3 style={{ color: '#3498db', borderBottom: '1px solid #eee', marginTop: '30px', paddingBottom:'10px' }}>2. Agregar Medicamentos</h3>
            
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Medicamento</label>
                        <input name="nombre" value={medActual.nombre} onChange={handleMedChange} placeholder="Ej. Paracetamol" />
                    </div>
                    
                    <div className="form-group">
                        <label>Dosis *</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            name="dosisCantidad" 
                            value={medActual.dosisCantidad} 
                            onChange={handleDosisCantidadChange} 
                            placeholder="Cant."
                            style={{ flex: 1 }}
                            maxLength={2}
                          />
                          <select 
                            value={medActual.dosisUnidad} 
                            onChange={handleDosisUnidadChange}
                            style={{ flex: 2 }}
                          >
                            {dosisOptions.map(option => (
                              <option key={option.value} value={option.label}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                    </div>
                    
                    {/* SELECCIONADOR DE HORAS */}
                    <div className="form-group full-width" style={{backgroundColor: '#eef6fc', padding: '15px', borderRadius: '6px', border: '1px dashed #3498db'}}>
                        <label style={{color: '#2c3e50', fontWeight:'bold'}}>Horarios de toma *</label>
                        <div style={{display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px'}}>
                            <input 
                                type="time" 
                                value={tempHora}
                                onChange={(e) => setTempHora(e.target.value)}
                                style={{maxWidth: '150px', borderColor: '#3498db', fontSize: '16px'}}
                            />
                            <button 
                                type="button"
                                onClick={agregarHoraALista}
                                style={{
                                    backgroundColor: '#3498db', color: 'white', border: 'none', 
                                    padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >
                                + Agregar Hora
                            </button>
                        </div>

                        {/* Visualización de Etiquetas (Chips) */}
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                            {horariosList.length === 0 && <span style={{color: '#999', fontSize: '14px'}}>Selecciona una hora y pulsa agregar.</span>}
                            
                            {horariosList.map((hora, index) => (
                                <div key={index} style={{
                                    backgroundColor: 'white', border: '1px solid #3498db', color: '#3498db',
                                    padding: '5px 10px', borderRadius: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    {convertirA12Horas(hora)}
                                    <span 
                                        onClick={() => eliminarHoraDeLista(hora)}
                                        style={{cursor: 'pointer', fontWeight: 'bold', color: '#e74c3c'}}
                                        title="Quitar hora"
                                    >×</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Duración</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            name="duracionCantidad" 
                            value={medActual.duracionCantidad} 
                            onChange={handleDuracionCantidadChange} 
                            placeholder="Cant."
                            style={{ flex: 1 }}
                            maxLength={2}
                          />
                          <select 
                            value={medActual.duracionUnidad} 
                            onChange={handleDuracionUnidadChange}
                            style={{ flex: 2 }}
                          >
                            {duracionOptions.map(option => (
                              <option key={option.value} value={option.label}>{option.label}</option>
                            ))}
                          </select>
                        </div>
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
                        + Confirmar Medicamento
                    </button>
                </div>
            </div>

            {/* RESUMEN FINAL */}
            {listaMedicamentos.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h4 style={{color:'#555'}}>Resumen de la Receta:</h4>
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                        {listaMedicamentos.map((med) => (
                            <div key={med.id} style={{
                                backgroundColor: 'white', borderLeft: '4px solid #3498db', 
                                padding: '15px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{fontWeight:'bold', fontSize:'16px', color:'#2c3e50'}}>{med.nombre} <span style={{fontWeight:'normal', color:'#666'}}>({med.dosis})</span></div>
                                    <div style={{fontSize:'14px', marginTop:'5px', display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                                        <span style={{fontWeight:'bold', color:'#3498db'}}>Tomas:</span> 
                                        {med.horarios.map(h => (
                                            <span key={h} style={{background: '#eef6fc', padding: '0 5px', borderRadius: '3px', border:'1px solid #dae1e7'}}>
                                              {convertirA12Horas(h)}
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{fontSize:'13px', color:'#888', marginTop:'2px'}}>{med.duracion} • {med.instrucciones}</div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => eliminarMedicamento(med.id)}
                                    style={{color: '#e74c3c', background:'none', border:'none', cursor:'pointer', fontSize:'20px', fontWeight:'bold'}}
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