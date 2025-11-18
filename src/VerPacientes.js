import React, { useState, useEffect } from 'react';
import './App.css'; 
import usuariosAzul from './assets/usuarios-azul.png'; 

// <-- AÑADIDO: Tu URL de API
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/";

function VerPacientes() {
  const [pacientes, setPacientes] = useState([]);
  
  // --- ¡MODIFICADO! ---
  // 'recetasMap' guardará las recetas por ID de paciente
  // Ejemplo: { "id-paciente-1": [...recetas...], "id-paciente-2": [...recetas...] }
  const [recetasMap, setRecetasMap] = useState({}); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [pacienteExpandidoId, setPacienteExpandidoId] = useState(null);
  const [error, setError] = useState(null); 
  
  // --- ¡AÑADIDO! ---
  // Para saber qué historial de recetas se está cargando
  const [loadingRecetaId, setLoadingRecetaId] = useState(null); 

  // useEffect para cargar pacientes (Sin cambios)
  useEffect(() => {
    const fetchPacientesDelDoctor = async () => {
      try {
        const loggedInDoctorId = localStorage.getItem('userId');
        if (!loggedInDoctorId) {
          throw new Error("No se pudo encontrar el ID del doctor. Por favor, inicie sesión de nuevo.");
        }
        const payload = {
          action: "getPatientsByDoctor",
          data: { doctorId: loggedInDoctorId }
        };
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "No se pudieron cargar los pacientes.");
        }
        const pacientesDeLaNube = await response.json();
        setPacientes(pacientesDeLaNube);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPacientesDelDoctor();
  }, []); 

  // --- ¡MODIFICADO COMPLETAMENTE! ---
  // Ahora es 'async' y llama a la API cuando es necesario
  const toggleRecetas = async (pacienteId) => {
    // Si estamos cerrando el que ya está abierto
    if (pacienteExpandidoId === pacienteId) {
      setPacienteExpandidoId(null); 
      return; // No hagas nada más
    }

    // Si estamos abriendo uno nuevo
    setPacienteExpandidoId(pacienteId);

    // ¿Ya tenemos las recetas de este paciente? Si sí, no las vuelvas a cargar.
    if (recetasMap[pacienteId]) {
      return; // Ya están cargadas
    }

    // Si no las tenemos, las cargamos:
    setLoadingRecetaId(pacienteId); // Mostrar "cargando..."
    try {
      const payload = {
        action: "getRecipesByPatient",
        data: { pacienteId: pacienteId }
      };
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Error al cargar las recetas");
      }
      const recetasDelPaciente = await response.json();
      
      // Guardamos las recetas en nuestro "mapa"
      setRecetasMap(prevMap => ({
        ...prevMap,
        [pacienteId]: recetasDelPaciente 
      }));

    } catch (err) {
      console.error("Error cargando recetas:", err);
      // Opcional: guardar un error en el mapa
      setRecetasMap(prevMap => ({
        ...prevMap,
        [pacienteId]: { error: err.message } 
      }));
    } finally {
      setLoadingRecetaId(null); // Dejar de cargar
    }
  };
  
  // if (isLoading) ... (Sin cambios)
  if (isLoading) {
    return (
      <div className="usuarios-container">
        <h2 className="page-title">
          <img src={usuariosAzul} alt="Pacientes" />
          Mis pacientes
        </h2>
        <p style={{ padding: '20px', textAlign: 'center' }}>
          Cargando pacientes desde la nube...
        </p>
      </div>
    );
  }

  // if (error) ... (Sin cambios)
  if (error) {
    return (
      <div className="usuarios-container">
        <h2 className="page-title">
          <img src={usuariosAzul} alt="Pacientes" />
          Mis pacientes
        </h2>
        <p style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          Error al cargar: {error}
        </p>
      </div>
    );
  }
  
  // const pacientesOrdenados ... (Sin cambios)
  const pacientesOrdenados = [...pacientes].sort((a, b) => 
      a.nombreCompleto.localeCompare(b.nombreCompleto)
  );

  return (
    <div className="usuarios-container">
      <h2 className="page-title">
        <img src={usuariosAzul} alt="Pacientes" />
        Mis pacientes
      </h2>

      <div className="lista-items-container">

        {pacientesOrdenados.length === 0 && (
            <p style={{ textAlign: 'center' }}>No tienes pacientes registrados en la nube.</p>
        )}

        {pacientesOrdenados.map(paciente => {
          // --- ¡MODIFICADO! ---
          // Leemos las recetas del 'recetasMap'
          const recetasDelPaciente = recetasMap[paciente.id] || [];
          const isExpandido = pacienteExpandidoId === paciente.id;

          // Contamos solo las recetas que no sean un error
          const numRecetas = Array.isArray(recetasDelPaciente) ? recetasDelPaciente.length : 0;

          return (
            <div key={paciente.id} className="item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4>{paciente.nombreCompleto}</h4>
                  <p><strong>Alergias:</strong> {paciente.alergias || 'N/A'}</p>
                  <p style={{fontSize: '0.9rem', color: '#555'}}>
                    ID: {paciente.id} | Tel: {paciente.telefono || 'N/A'}
                  </p>
                </div>
                <button 
                  className={`btn ${isExpandido ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => toggleRecetas(paciente.id)}
                  // Deshabilitar si estamos cargando ESTAS recetas
                  disabled={loadingRecetaId === paciente.id} 
                >
                  {loadingRecetaId === paciente.id ? 'Cargando...' : 
                   (isExpandido ? 'Ocultar' : 'Ver Recetas') + ` (${numRecetas})`}
                </button>
              </div>

              {isExpandido && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <h5>Historial de Recetas:</h5>

                  {/* --- ¡AÑADIDO! --- */}
                  {loadingRecetaId === paciente.id && (
                    <p style={{fontSize: '0.9rem', color: '#777'}}>Cargando historial...</p>
                  )}

                  {/* --- MODIFICADO --- */}
                  {loadingRecetaId === null && Array.isArray(recetasDelPaciente) && recetasDelPaciente.length === 0 && (
                    <p style={{fontSize: '0.9rem', color: '#777'}}>
                      No hay recetas para este paciente.
                    </p>
                  )}
                  
                  {/* --- MODIFICADO --- */}
                  {loadingRecetaId === null && Array.isArray(recetasDelPaciente) && recetasDelPaciente.length > 0 && (
                    [...recetasDelPaciente].reverse().map(receta => (
                      <div key={receta.id} style={{ border: '1px solid #f0f0f0', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>
                          Fecha: {receta.fechaEmision} - Diag: {receta.diagnostico}
                        </p>
                        <div className="medicamentos-list" style={{maxHeight: 'none', padding: '5px 0 0 0'}}>
                          
                          {/* --- ¡MODIFICADO! --- */}
                          {/* Tu Lambda devuelve 'medicamentos' (la lista) */}
                          {/* y cada med tiene 'nombre_medicamento' */}
                          {receta.medicamentos.map((med) => (
                             <div key={med.id} className="medicamento-item" style={{padding: '8px', background: '#f9f9f9'}}>
                               <div className="medicamento-info">
                                 <strong>{med.nombre_medicamento}</strong>
                                 <p>{med.dosis} • {med.frecuencia}h • {med.duracion}</p>
                               </div>
                             </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VerPacientes;