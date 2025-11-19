import React, { useState, useEffect } from 'react';
import './App.css';
import agregarAzul from './assets/agregar-azul.png';

// ASEGÚRATE DE QUE ESTA URL SEA LA DE TU NUEVA LAMBDA LIMPIA
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/"; 

// --- Validaciones ---
const validarPaciente = (pacienteData) => {
    const errores = {};
    
    const regexNombre = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/;
    if (!pacienteData.nombreCompleto || !regexNombre.test(pacienteData.nombreCompleto.trim())) {
        errores.nombreCompleto = 'El nombre debe contener solo letras y espacios (2-50 caracteres)';
    }

    if (!pacienteData.sexo) {
        errores.sexo = 'Debe seleccionar el sexo del paciente';
    }

    const regexTelefono = /^[0-9]{10}$/;
    if (pacienteData.telefono && !regexTelefono.test(pacienteData.telefono)) {
        errores.telefono = 'El telefono debe tener exactamente 10 digitos';
    }

    if (pacienteData.direccion && pacienteData.direccion.length > 200) {
        errores.direccion = 'La direccion no puede exceder 200 caracteres';
    }

    if (!pacienteData.nacimiento) {
        errores.nacimiento = 'La fecha de nacimiento es requerida';
    } else {
        const fechaNacimiento = new Date(pacienteData.nacimiento);
        const hoy = new Date();
        const fechaNacimientoSinHora = new Date(fechaNacimiento.getFullYear(), fechaNacimiento.getMonth(), fechaNacimiento.getDate());
        const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        
        if (fechaNacimientoSinHora > hoySinHora) {
            errores.nacimiento = 'La fecha de nacimiento no puede ser en el futuro';
        } else {
            let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
            const mes = hoy.getMonth() - fechaNacimiento.getMonth();
            if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                edad--;
            }
            if (edad < 0 || edad > 120) {
                errores.nacimiento = 'La edad debe ser entre 0 y 120 años';
            }
        }
    }

    if (pacienteData.alergias && pacienteData.alergias.length > 300) {
        errores.alergias = 'Las alergias no pueden exceder 300 caracteres';
    }

    if (pacienteData.enfermedadesCronicas && pacienteData.enfermedadesCronicas.length > 500) {
        errores.enfermedadesCronicas = 'Las enfermedades cronicas no pueden exceder 500 caracteres';
    }
    
    return {
        hayErrores: Object.keys(errores).length > 0,
        errores: errores
    };
};

// --- Generador de Clave Única ---
const generarClaveUnica = (nombreCompleto, fechaNacimiento) => {
    if (!nombreCompleto || !fechaNacimiento) return '';
    const partesNombre = nombreCompleto.trim().split(' ');
    const primeraLetraNombre = partesNombre[0] ? partesNombre[0].charAt(0).toUpperCase() : '';
    const primeraLetraPaterno = partesNombre[1] ? partesNombre[1].charAt(0).toUpperCase() : '';
    const primeraLetraMaterno = partesNombre[2] ? partesNombre[2].charAt(0).toUpperCase() : '';
    const añoNacimiento = new Date(fechaNacimiento).getFullYear();
    
    // Generar clave base (Ej: RFL1990)
    let claveBase = primeraLetraNombre + primeraLetraPaterno + primeraLetraMaterno + añoNacimiento;
    return claveBase;
};

// --- Generador de Contraseña ---
const generarContraseñaAutomatica = () => {
    const caracteres = '0123456789';
    let contraseña = '';
    const longitud = 6;
    for (let i = 0; i < longitud; i++) {
        contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return contraseña;
};

function AgregarPacientes() {
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        sexo: '',
        telefono: '',
        direccion: '',
        nacimiento: '',
        tipoSangre: '',
        alergias: '',
        enfermedadesCronicas: '',
        claveUnica: '',
        contraseña: ''
    });

    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const contraseñaGenerada = generarContraseñaAutomatica();
        setFormData(prev => ({ ...prev, contraseña: contraseñaGenerada }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }

        let valorLimpio = value;
        if (name === 'telefono') {
            valorLimpio = value.replace(/\D/g, '').slice(0, 10);
        } else if (name === 'nombreCompleto') {
            valorLimpio = value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, '');
        }

        const nuevosDatos = { ...formData, [name]: valorLimpio };
        setFormData(nuevosDatos);

        // Generar clave única automáticamente al cambiar nombre o fecha
        if (name === 'nombreCompleto' || name === 'nacimiento') {
            if (nuevosDatos.nombreCompleto && nuevosDatos.nacimiento) {
                // CORREGIDO: Aquí llamabas a 'generarCorreo', ahora es 'generarClaveUnica'
                const claveGenerada = generarClaveUnica(
                    nuevosDatos.nombreCompleto, 
                    nuevosDatos.nacimiento
                );
                setFormData(prev => ({ ...prev, claveUnica: claveGenerada }));
            } else {
                setFormData(prev => ({ ...prev, claveUnica: '' }));
            }
        }
    };

    const regenerarContraseña = () => {
        const nuevaContraseña = generarContraseñaAutomatica();
        setFormData(prev => ({ ...prev, contraseña: nuevaContraseña }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrores({});

        // Validar
        const resultadoValidacion = validarPaciente(formData);
        if (resultadoValidacion.hayErrores) {
            setErrores(resultadoValidacion.errores);
            setLoading(false);
            alert('Por favor corrige los errores en el formulario');
            return;
        }

        if (!formData.claveUnica) {
            setLoading(false);
            alert('Error: No se pudo generar la clave única. Verifique los datos del paciente.');
            return;
        }

        // Obtener ID del Doctor (Debe haber iniciado sesión previamente)
        const doctorId = localStorage.getItem('userId');
        if (!doctorId) {
            setLoading(false);
            alert('Error: Sesión caducada. Por favor, inicie sesión de nuevo.');
            return;
        }

        // Preparar datos para la Lambda
        const patientData = {
            nombreCompleto: formData.nombreCompleto.trim(),
            sexo: formData.sexo,
            telefono: formData.telefono,
            direccion: formData.direccion.trim(),
            fechaNacimiento: formData.nacimiento,
            tipoSangre: formData.tipoSangre,
            alergias: formData.alergias.trim(),
            enfermedadesCronicas: formData.enfermedadesCronicas.trim(),
            claveUnica: formData.claveUnica,
            password_hash: formData.contraseña,
            id_doctor: doctorId,
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "createPatient",
                    data: patientData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el paciente');
            }

            alert(`Paciente agregado con éxito\nClave única: ${data.paciente.claveUnica}\nContraseña: ${formData.contraseña}`);

            // Limpiar formulario
            setFormData({
                nombreCompleto: '',
                sexo: '',
                telefono: '',
                direccion: '',
                nacimiento: '',
                tipoSangre: '',
                alergias: '',
                enfermedadesCronicas: '',
                claveUnica: '',
                contraseña: generarContraseñaAutomatica()
            });
            setErrores({});

        } catch (err) {
            console.error("Error al guardar paciente:", err);
            setErrores({ general: err.message || 'No se pudo conectar al servidor' });
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-usuario-container">
            <h2 className="page-title">
                <img src={agregarAzul} alt="Agregar Paciente" />
                Agregar pacientes
            </h2>

            <form className="user-form-card" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group full-width">
                        <label>Nombre(s) del paciente *</label>
                        <input 
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            placeholder="Ej. Rafael Flores López"
                            required
                            className={errores.nombreCompleto ? 'input-error' : ''}
                            disabled={loading}
                        />
                        {errores.nombreCompleto && <span className="error-message">{errores.nombreCompleto}</span>}
                    </div>

                    <div className="form-group">
                        <label>Sexo *</label>
                        <select
                            name="sexo"
                            value={formData.sexo}
                            onChange={handleChange}
                            required
                            className={errores.sexo ? 'input-error' : ''}
                            disabled={loading}
                        >
                            <option value="" disabled>Seleccione una opción</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                        {errores.sexo && <span className="error-message">{errores.sexo}</span>}
                    </div>

                    <div className="form-group">
                        <label>Clave Única</label>
                        <input
                            type="text"
                            name="claveUnica"
                            value={formData.claveUnica}
                            readOnly
                            placeholder="Auto-generada"
                            style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                name="contraseña"
                                value={formData.contraseña}
                                readOnly
                                style={{ flex: 1, backgroundColor: '#f5f5f5', color: '#666' }}
                            />
                            <button 
                                type="button" 
                                onClick={regenerarContraseña}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                disabled={loading}
                            >
                                Regenerar
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tipo de Sangre</label>
                        <select
                            name="tipoSangre"
                            value={formData.tipoSangre}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="" disabled>Seleccione tipo</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Número Telefónico</label>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="1234567890"
                            className={errores.telefono ? 'input-error' : ''}
                            disabled={loading}
                        />
                        {errores.telefono && <span className="error-message">{errores.telefono}</span>}
                    </div>

                    <div className="form-group full-width">
                        <label>Dirección</label>
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            placeholder="Ej. Av. Triunfo Maderista"
                            className={errores.direccion ? 'input-error' : ''}
                            disabled={loading}
                        />
                        {errores.direccion && <span className="error-message">{errores.direccion}</span>}
                    </div>

                    <div className="form-group full-width">
                        <label>Fecha de Nacimiento *</label>
                        <input
                            type="date"
                            name="nacimiento"
                            value={formData.nacimiento}
                            onChange={handleChange}
                            required
                            max={new Date().toISOString().split('T')[0]}
                            className={errores.nacimiento ? 'input-error' : ''}
                            disabled={loading}
                        />
                        {errores.nacimiento && <span className="error-message">{errores.nacimiento}</span>}
                    </div>

                    <div className="form-group full-width">
                        <label>Alergias</label>
                        <textarea
                            name="alergias"
                            value={formData.alergias}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Ej. Penicilina..."
                            className={errores.alergias ? 'input-error' : ''}
                            disabled={loading}
                        ></textarea>
                        {errores.alergias && <span className="error-message">{errores.alergias}</span>}
                    </div>

                    <div className="form-group" style={{ gridColumn: '2', gridRow: '2 / span 4' }}>
                        <label>Enfermedades Crónicas</label>
                        <textarea
                            name="enfermedadesCronicas"
                            value={formData.enfermedadesCronicas}
                            onChange={handleChange}
                            rows="10"
                            placeholder="Ej. Asma, Hipertensión..."
                            style={{ height: 'calc(100% - 30px)' }}
                            className={errores.enfermedadesCronicas ? 'input-error' : ''}
                            disabled={loading}
                        ></textarea>
                        {errores.enfermedadesCronicas && <span className="error-message">{errores.enfermedadesCronicas}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Paciente'}
                    </button>
                    {errores.general && (
                        <span className="error-message" style={{textAlign: 'center', width: '100%'}}>
                            {errores.general}
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}

export default AgregarPacientes;