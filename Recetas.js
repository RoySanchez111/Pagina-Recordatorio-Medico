import React, { useState, useEffect } from 'react';
import './App.css';
import agregarAzul from './assets/agregar-azul.png'; // Reutilizamos un icono

function Recetas() {
    const [recetas, setRecetas] = useState([]);
    const [paciente, setPaciente] = useState('');
    const [doctor, setDoctor] = useState('');
    const [medicamento, setMedicamento] = useState('');

    useEffect(() => {
        const guardadas = JSON.parse(localStorage.getItem('recetas')) || [];
        setRecetas(guardadas);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const nuevaReceta = {
            id: Date.now(), 
            paciente,
            doctor,
            medicamento
        };
        
        const actualizadas = [...recetas, nuevaReceta];
        setRecetas(actualizadas);
        localStorage.setItem('recetas', JSON.stringify(actualizadas));

        alert('Receta agregada con éxito');
        setPaciente('');
        setDoctor('');
        setMedicamento('');
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={agregarAzul} alt="Recetas" />
                Agregar Recetas
            </h2>

            <form className="user-form-card" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group full-width">
                        <label>Nombre del Paciente</label>
                        <input value={paciente} onChange={(e) => setPaciente(e.target.value)} required />
                    </div>
                    <div className="form-group full-width">
                        <label>Nombre del Doctor</label>
                        <input value={doctor} onChange={(e) => setDoctor(e.target.value)} required />
                    </div>
                    <div className="form-group full-width">
                        <label>Medicamento y Dosis</label>
                        <input value={medicamento} onChange={(e) => setMedicamento(e.target.value)} required />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        Guardar Receta
                    </button>
                </div>
            </form>

            <div className="lista-items-container">
                <h3>Recetas Guardadas</h3>
                {recetas.map(receta => (
                    <div key={receta.id} className="item-card">
                        <h4>Paciente: {receta.paciente}</h4>
                        <p>Doctor: {receta.doctor}</p>
                        <p><strong>Medicamento: {receta.medicamento}</strong></p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Recetas;