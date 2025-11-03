import React, { useState } from 'react';
import './App.css';
import usuariosData from './usuarios.json';
import agregarAzul from './assets/agregar-azul.png';

function AgregarPacientes() {
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        sexo: '',
        telefono: '',
        direccion: '',
        nacimiento: '',
        enfermedadesCronicas: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const usuariosActuales = JSON.parse(localStorage.getItem('usuarios')) || usuariosData;

        const nuevoPaciente = {
            id: usuariosActuales.length + 1,
            rol: "Paciente",
            nombreCompleto: formData.nombreCompleto,
            sexo: formData.sexo,
            telefono: formData.telefono,
            direccion: formData.direccion,
            nacimiento: formData.nacimiento,
            padecimiento: formData.enfermedadesCronicas
        };

        const usuariosActualizados = [...usuariosActuales, nuevoPaciente];
        localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));

        alert('✅ Paciente agregado con éxito');

        setFormData({
            nombreCompleto: '',
            sexo: '',
            telefono: '',
            direccion: '',
            nacimiento: '',
            enfermedadesCronicas: ''
        });
    };

    return (
        <div className="form-usuario-container">
            {/* --- TÍTULO (Estilo Admin) --- */}
            <h2 className="page-title">
                <img src={agregarAzul} alt="Agregar Paciente" />
                Agregar pacientes
            </h2>

            <form className="user-form-card" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group full-width">
                        <label>Nombre(s) del paciente</label>
                        <input 
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            placeholder="Ej. Leonel Salvador Lugo Escobar"
                        />
                    </div>

                    <div className="form-group">
                        <label>Sexo</label>
                        <input
                            type="text"
                            name="sexo"
                            value={formData.sexo}
                            onChange={handleChange}
                            placeholder="Masculino"
                        />
                    </div>

                    <div className="form-group">
                        <label>Número Telefónico</label>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="12-34-56-78-90"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Dirección</label>
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            placeholder="Ej. Av. Triunfo Maderista, Universidad Tecmilenio"
                        />
                    </div>

                    <div className="form-group">
                        <label>Fecha de Nacimiento</label>
                        <input
                            type="date"
                            name="nacimiento"
                            value={formData.nacimiento}
                            onChange={handleChange}
                            placeholder="dd/mm/aaaa"
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: '2', gridRow: '2 / span 3' }}>
                        <label>Enfermedades Crónicas (Padecimiento)</label>
                        <textarea
                            name="enfermedadesCronicas"
                            value={formData.enfermedadesCronicas}
                            onChange={handleChange}
                            rows="10"
                            placeholder="Ej. Asma, Hipertensión..."
                            style={{ height: 'calc(100% - 30px)' }}
                        ></textarea>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        Guardar Paciente
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AgregarPacientes;
