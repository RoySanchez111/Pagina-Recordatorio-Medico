import React, { useState } from 'react';
import './App.css';
import agregarAzul from './assets/usuarios-azul.png';

// Validaciones integradas
const validarConsulta = (consultaData) => {
    const errores = {};

    // Validar nombre del paciente
    const regexNombre = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/;
    if (!consultaData.paciente || !regexNombre.test(consultaData.paciente.trim())) {
        errores.paciente = 'El nombre debe contener solo letras y espacios (2-50 caracteres)';
    }

    // Validar fecha
    if (!consultaData.fecha) {
        errores.fecha = 'La fecha es requerida';
    } else {
        const fechaConsulta = new Date(consultaData.fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaConsulta < hoy) {
            errores.fecha = 'No se pueden agendar citas en fechas pasadas';
        }
        
        const maxFecha = new Date();
        maxFecha.setFullYear(hoy.getFullYear() + 1);
        if (fechaConsulta > maxFecha) {
            errores.fecha = 'No se pueden agendar citas con mas de 1 año de anticipacion';
        }
    }

    // Validar doctor (opcional)
    if (consultaData.doctor && consultaData.doctor.trim() !== '') {
        const regexDoctor = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/;
        if (!regexDoctor.test(consultaData.doctor.trim())) {
            errores.doctor = 'El nombre del doctor debe contener solo letras y espacios';
        }
    }

    // Validar motivo
    if (!consultaData.motivo || consultaData.motivo.trim().length === 0) {
        errores.motivo = 'El motivo de la consulta es requerido';
    } else if (consultaData.motivo.length > 500) {
        errores.motivo = 'El motivo no puede exceder 500 caracteres';
    } else if (consultaData.motivo.length < 10) {
        errores.motivo = 'El motivo debe tener al menos 10 caracteres';
    }

    return {
        hayErrores: Object.keys(errores).length > 0,
        errores: errores
    };
};

function SolicitarConsulta() {
    const [formData, setFormData] = useState({
        paciente: '',
        doctor: '',
        fecha: '',
        motivo: ''
    });
    const [errores, setErrores] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }

        let valorLimpio = value;
        if (name === 'paciente') {
            valorLimpio = value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, '');
        }

        setFormData(prev => ({ ...prev, [name]: valorLimpio }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const resultadoValidacion = validarConsulta(formData);
        
        if (resultadoValidacion.hayErrores) {
            setErrores(resultadoValidacion.errores);
            alert('Por favor corrige los errores en el formulario');
            return;
        }
        
        const guardadas = JSON.parse(localStorage.getItem('consultas')) || [];
        
        const nuevaConsulta = {
            id: Date.now(),
            paciente: formData.paciente.trim(),
            doctor: formData.doctor.trim(),
            fecha: formData.fecha,
            motivo: formData.motivo.trim(),
            status: 'pendiente'
        };
        
        const actualizadas = [...guardadas, nuevaConsulta];
        localStorage.setItem('consultas', JSON.stringify(actualizadas));

        alert('Consulta solicitada con exito. Un doctor la revisara.');
        
        setFormData({
            paciente: '',
            doctor: '',
            fecha: '',
            motivo: ''
        });
        setErrores({});
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={agregarAzul} alt="Solicitar" />
                Solicitar Consulta Medica
            </h2>

            <form className="user-form-card" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Tu Nombre Completo *</label>
                        <input 
                            name="paciente"
                            value={formData.paciente} 
                            onChange={handleChange} 
                            required
                            className={errores.paciente ? 'input-error' : ''}
                            placeholder="Solo letras y espacios"
                        />
                        {errores.paciente && (
                            <span className="error-message">{errores.paciente}</span>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label>Fecha Deseada *</label>
                        <input 
                            type="date" 
                            name="fecha"
                            value={formData.fecha} 
                            onChange={handleChange} 
                            required
                            className={errores.fecha ? 'input-error' : ''}
                        />
                        {errores.fecha && (
                            <span className="error-message">{errores.fecha}</span>
                        )}
                    </div>
                    
                    <div className="form-group full-width">
                        <label>Doctor (Opcional)</label>
                        <input 
                            name="doctor"
                            value={formData.doctor} 
                            onChange={handleChange}
                            className={errores.doctor ? 'input-error' : ''}
                            placeholder="Nombre del doctor preferido"
                        />
                        {errores.doctor && (
                            <span className="error-message">{errores.doctor}</span>
                        )}
                    </div>
                    
                    <div className="form-group full-width">
                        <label>Motivo de la consulta *</label>
                        <input 
                            name="motivo"
                            value={formData.motivo} 
                            onChange={handleChange} 
                            required
                            className={errores.motivo ? 'input-error' : ''}
                            placeholder="Describa el motivo de su consulta"
                        />
                        {errores.motivo && (
                            <span className="error-message">{errores.motivo}</span>
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        Enviar Solicitud
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SolicitarConsulta;