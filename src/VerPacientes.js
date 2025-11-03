import React, { useState, useEffect } from 'react';
import './App.css';
import usuariosData from './usuarios.json'; 
import usuariosAzul from './assets/usuarios-azul.png'; 

function VerPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pacienteExpandidoId, setPacienteExpandidoId] = useState(null);

  useEffect(() => {
    const loggedInDoctorId = parseInt(localStorage.getItem('userId'));

    const guardados = JSON.parse(localStorage.getItem('usuarios')) || usuariosData;

    const pacientesDelDoctor = guardados.filter(u => 
        u.rol === 'Paciente' && u.doctorId === loggedInDoctorId
    ).map((u, i) => ({ 
      ...u,
      id: u.id ?? `temp-${i}`,
      nombreCompleto: u.nombreCompleto || u.nombre || 'Sin nombre'
    }));
    
    setPacientes(pacientesDelDoctor);
    
    const recetasGuardadas = JSON.parse(localStorage.getItem('recetasGuardadas')) || [];
    setRecetas(recetasGuardadas);
    
    setIsLoading(false);
  }, []);

  const toggleRecetas = (pacienteId) => {
    if (pacienteExpandidoId === pacienteId) {
      setPacienteExpandidoId(null); 
    } else {
      setPacienteExpandidoId(pacienteId); 
    }
  };
  
  if (isLoading) {
    return (
      <div className="usuarios-container">
        <h2 className="page-title">
          <img src={usuariosAzul} alt="Pacientes" />
          Mis pacientes
        </h2>
        <p style={{ padding: '20px', textAlign: 'center' }}>
          Cargando pacientes...
        </p>
      </div>
    );
  }
  
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
            <p style={{ textAlign: 'center' }}>No tienes pacientes registrados.</p>
        )}

        {pacientesOrdenados.map(paciente => {
          const recetasDelPaciente = recetas.filter(r => r.pacienteId === paciente.id);
          const isExpandido = pacienteExpandidoId === paciente.id;

          return (
            <div key={paciente.id} className="item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4>{paciente.nombreCompleto}</h4>
                  <p><strong>Padecimiento:</strong> {paciente.padecimiento || 'N/A'}</p>
                  <p style={{fontSize: '0.9rem', color: '#555'}}>
                    ID: {paciente.id} | Tel: {paciente.telefono || 'N/A'}
                  </p>
                </div>
                <button 
                  className={`btn ${isExpandido ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => toggleRecetas(paciente.id)}
                >
                  {isExpandido ? 'Ocultar' : 'Ver Recetas'} ({recetasDelPaciente.length})
                </button>
              </div>

              {isExpandido && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <h5>Historial de Recetas:</h5>
                  {recetasDelPaciente.length === 0 ? (
                    <p style={{fontSize: '0.9rem', color: '#777'}}>No hay recetas para este paciente.</p>
                  ) : (
                    [...recetasDelPaciente].reverse().map(receta => (
                      <div key={receta.id} style={{ border: '1px solid #f0f0f0', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>
                          Fecha: {receta.fecha} - Diag: {receta.diagnostico}
                        </p>
                        <div className="medicamentos-list" style={{maxHeight: 'none', padding: '5px 0 0 0'}}>
                          {receta.medicamentos.map((med, i) => (
                             <div key={i} className="medicamento-item" style={{padding: '8px', background: '#f9f9f9'}}>
                               <div className="medicamento-info">
                                 <strong>{med.nombre}</strong>
                                 <p>{med.dosis} • {med.frecuencia} • {med.duracion}</p>
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