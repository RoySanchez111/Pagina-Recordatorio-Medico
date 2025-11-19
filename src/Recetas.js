import React, { useState, useEffect } from 'react';
import './App.css';
import agregarAzul from './assets/agregar-azul.png'; 

// TU URL DE LAMBDA
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/";

function AgregarReceta() {
    // Estado para la receta general
    const [pacientes, setPacientes] = useState([]); // Lista de pacientes reales (ID y Nombre)
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
    const [diagnostico, setDiagnostico] = useState('');
    const [observaciones, setObservaciones] = useState('');
    
    // Estado para el medicamento actual que se está escribiendo
    const [medActual, setMedActual] = useState({
        nombre: '',
        dosis: '',
        frecuencia: '',
        duracion: '',
        instrucciones: ''
    });

    // Lista de medicamentos agregados a la tabla (antes de guardar)
    const [listaMedicamentos, setListaMedicamentos] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. CARGAR PACIENTES AL INICIAR
    useEffect(() => {
        const cargarPacientes = async () => {
            const doctorId = localStorage.getItem('userId');
            if (!doctorId) return;

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'getPatientsByDoctor',
                        data: { doctorId: doctorId }
                    })
                });
                const result = await response.json();
                if (response.ok) {
                    setPacientes(result); // Guardamos los pacientes reales de la BD
                }
            } catch (error) {
                console.error("Error cargando pacientes:", error);
            }
        };
        cargarPacientes();
    }, []);

    // Manejar cambios en los inputs del medicamento
    const handleMedChange = (e) => {
        setMedActual({ ...medActual, [e.target.name]: e.target.value });
    };

    // Agregar medicamento a la lista visual (local)
    const agregarMedicamento = () => {
        if (!medActual.nombre || !medActual.dosis) {
            alert("El nombre del medicamento y la dosis son obligatorios.");
            return;
        }
        setListaMedicamentos([...listaMedicamentos, { ...medActual, id: Date.now() }]);
        // Limpiar campos del medicamento
        setMedActual({ nombre: '', dosis: '', frecuencia: '', duracion: '', instrucciones: '' });
    };

    // Eliminar medicamento de la lista visual
    const eliminarMedicamento = (id) => {
        setListaMedicamentos(listaMedicamentos.filter(med => med.id !== id));
    };

    // 2. GUARDAR RECETA EN AWS (LAMBDA)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!pacienteSeleccionado) {
            alert("Selecciona un paciente.");
            return;
        }
        if (listaMedicamentos.length === 0) {
            alert("Debes agregar al menos un medicamento a la receta.");
            return;
        }

        setLoading(true);
        const doctorId = localStorage.getItem('userId');
        
        // Buscamos el nombre del paciente seleccionado para guardarlo también
        const pacienteObj = pacientes.find(p => p.id === pacienteSeleccionado);

        const payload = {
            id_doctor: doctorId,
            id_paciente: pacienteSeleccionado,
            pacienteNombre: pacienteObj ? pacienteObj.nombreCompleto : 'Desconocido',
            fechaEmision: new Date().toISOString(),
            diagnostico: diagnostico,
            observaciones: observaciones,
            medicamentos: listaMedicamentos // Enviamos el array completo
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'createRecipe',
                    data: payload
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("¡Receta creada y guardada en la nube exitosamente!");
                // Resetear formulario
                setPacienteSeleccionado('');
                setDiagnostico('');
                setObservaciones('');
                setListaMedicamentos([]);
            } else {
                throw new Error(result.message || "Error al guardar receta");
            }
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={agregarAzul} alt="Recetas" />
                Nueva Receta Médica
            </h2>

            <form className="user-form-card" onSubmit={handleSubmit}>
                {/* SECCIÓN 1: DATOS GENERALES */}
                <h3 style={{ color: '#3498db', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>1. Datos del Paciente</h3>
                <div className="form-grid">
                    <div className="form-group full-width">
                        <label>Seleccionar Paciente *</label>
                        <select 
                            value={pacienteSeleccionado} 
                            onChange={(e) => setPacienteSeleccionado(e.target.value)}
                            required
                            disabled={loading}
                        >
                            <option value="">-- Seleccione un paciente --</option>
                            {pacientes.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nombreCompleto} (Clave: {p.claveUnica})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group full-width">
                        <label>Diagnóstico *</label>
                        <input 
                            value={diagnostico} 
                            onChange={(e) => setDiagnostico(e.target.value)} 
                            placeholder="Ej. Infección respiratoria aguda"
                            required 
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* SECCIÓN 2: AGREGAR MEDICAMENTOS */}
                <h3 style={{ color: '#3498db', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '20px' }}>2. Agregar Medicamentos</h3>
                <div className="form-grid" style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                    <div className="form-group">
                        <label>Nombre Medicamento</label>
                        <input name="nombre" value={medActual.nombre} onChange={handleMedChange} placeholder="Ej. Paracetamol" />
                    </div>
                    <div className="form-group">
                        <label>Dosis</label>
                        <input name="dosis" value={medActual.dosis} onChange={handleMedChange} placeholder="Ej. 500mg" />
                    </div>
                    <div className="form-group">
                        <label>Frecuencia</label>
                        <input name="frecuencia" value={medActual.frecuencia} onChange={handleMedChange} placeholder="Ej. Cada 8 horas" />
                    </div>
                    <div className="form-group">
                        <label>Duración</label>
                        <input name="duracion" value={medActual.duracion} onChange={handleMedChange} placeholder="Ej. 5 días" />
                    </div>
                    <div className="form-group full-width">
                        <label>Instrucciones Adicionales</label>
                        <input name="instrucciones" value={medActual.instrucciones} onChange={handleMedChange} placeholder="Ej. Tomar después de los alimentos" />
                    </div>
                    <div className="form-actions" style={{ justifyContent: 'flex-end', width: '100%' }}>
                        <button type="button" onClick={agregarMedicamento} className="btn-secondary" style={{ backgroundColor: '#28a745', color: 'white' }}>
                            + Agregar a la lista
                        </button>
                    </div>
                </div>

                {/* LISTA VISUAL DE MEDICAMENTOS AGREGADOS */}
                {listaMedicamentos.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <h4>Medicamentos en esta receta:</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#eee', textAlign: 'left' }}>
                                    <th style={{ padding: '8px' }}>Nombre</th>
                                    <th style={{ padding: '8px' }}>Dosis</th>
                                    <th style={{ padding: '8px' }}>Indicaciones</th>
                                    <th style={{ padding: '8px' }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listaMedicamentos.map((med) => (
                                    <tr key={med.id} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '8px' }}>{med.nombre}</td>
                                        <td style={{ padding: '8px' }}>{med.dosis}</td>
                                        <td style={{ padding: '8px' }}>{med.frecuencia} durante {med.duracion}</td>
                                        <td style={{ padding: '8px' }}>
                                            <button 
                                                type="button" 
                                                onClick={() => eliminarMedicamento(med.id)}
                                                style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                X
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="form-group full-width" style={{ marginTop: '20px' }}>
                    <label>Observaciones Generales (Opcional)</label>
                    <textarea 
                        rows="2"
                        value={observaciones} 
                        onChange={(e) => setObservaciones(e.target.value)} 
                        placeholder="Recomendaciones generales para el paciente..."
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading || listaMedicamentos.length === 0}>
                        {loading ? 'Guardando...' : 'Generar Receta'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AgregarReceta;