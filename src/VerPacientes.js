import React, { useState, useEffect } from 'react';
import './App.css';
import usuariosData from './usuarios.json'; 
import usuariosAzul from './assets/usuarios-azul.png'; 

const IconoArrowUp = () => <span style={{ fontSize: '0.8em' }}>&#9650;</span>;
const IconoArrowDown = () => <span style={{ fontSize: '0.8em' }}>&#9660;</span>;

function VerPacientes() {
  const [usuarios, setUsuarios] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('Todos');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem('usuarios'));
    let datosFinales = [];

    if (guardados && guardados.length > 0) { 
      datosFinales = guardados;
    } else {
      datosFinales = usuariosData;
      localStorage.setItem('usuarios', JSON.stringify(usuariosData));
    }

    // 🔹 Asignar IDs automáticos si no existen
    datosFinales = datosFinales.map((u, i) => ({
      id: u.id ?? i + 1,
      ...u
    }));

    setUsuarios(datosFinales);
    setIsLoading(false);
  }, []);

  const pacientes = usuarios.filter(u => u.rol === 'Paciente');

  const sortedPacientes = React.useMemo(() => {
    let sortablePacientes = [...pacientes]; 
    if (sortConfig.key) {
      sortablePacientes.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortablePacientes;
  }, [pacientes, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFiltroClick = (tipo) => {
    setFiltro(tipo);
    if (tipo === 'A-Z') requestSort('nombreCompleto');
    else if (tipo === 'ID') requestSort('id');
    else if (tipo === 'Todos') requestSort('id'); 
  };

  if (isLoading) {
    return (
      <div className="usuarios-container">
        <h2 className="page-title">
          <img src={usuariosAzul} alt="Pacientes" />
          Ver pacientes
        </h2>
        <p style={{ padding: '20px', textAlign: 'center' }}>
          Cargando pacientes...
        </p>
      </div>
    );
  }

  return (
    <div className="usuarios-container">
      <h2 className="page-title">
        <img src={usuariosAzul} alt="Pacientes" />
        Ver pacientes
      </h2>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${filtro === 'Todos' ? 'active' : ''}`}
          onClick={() => handleFiltroClick('Todos')}
        >
          Todos
        </button>
        <button
          className={`filter-btn ${filtro === 'A-Z' ? 'active' : ''}`}
          onClick={() => handleFiltroClick('A-Z')}
        >
          A-Z
        </button>
        <button
          className={`filter-btn ${filtro === 'Fecha' ? 'active' : ''}`}
          onClick={() => handleFiltroClick('Fecha')}
        >
          Fecha
        </button>
        <button
          className={`filter-btn ${filtro === 'ID' ? 'active' : ''}`}
          onClick={() => handleFiltroClick('ID')}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          ID 
          {sortConfig.key === 'id' ? 
            (sortConfig.direction === 'ascending' ? <IconoArrowUp /> : <IconoArrowDown />) : 
            (<><IconoArrowUp /><IconoArrowDown /></>)
          }
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Diagnóstico (Padecimiento)</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {sortedPacientes.length > 0 ? (
              sortedPacientes.map(paciente => {
                // 🔹 Asegurar que se muestre el nombre correcto sin importar el campo
                const nombre = paciente.nombreCompleto || paciente.nombre || paciente.nombrePaciente || 'Sin nombre';
                return (
                  <tr key={paciente.id}>
                    <td>{paciente.id}</td>
                    <td>{nombre}</td>
                    <td>{paciente.padecimiento || 'N/A'}</td>
                    <td>{paciente.rol}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  No hay pacientes registrados.
                </td>
              </tr>
            )}
            {Array.from({ length: Math.max(0, 5 - sortedPacientes.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td colSpan="4" style={{ height: '50px' }}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VerPacientes;
