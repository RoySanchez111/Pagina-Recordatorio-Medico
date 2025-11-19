import React, { useState, useEffect } from 'react';
import './App.css';
// import usuariosData from './usuarios.json'; // <-- ELIMINADO
import agregarAzul from './assets/agregar-azul.png';

// <-- AÑADIDO: ¡Esta es tu nueva API! Pega tu URL de Lambda aquí
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/"; // <-- PEGA TU URL

// Validaciones integradas (Sin cambios)
const validarPaciente = (pacienteData) => {
    const errores = {};
    // ... (tu código de validación no cambia) ...
    // Validar nombre completo - solo letras y espacios
    const regexNombre = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/;
    if (!pacienteData.nombreCompleto || !regexNombre.test(pacienteData.nombreCompleto.trim())) {
        errores.nombreCompleto = 'El nombre debe contener solo letras y espacios (2-50 caracteres)';
    }

    // Validar sexo
    if (!pacienteData.sexo) {
        errores.sexo = 'Debe seleccionar el sexo del paciente';
    }

    // Validar teléfono - exactamente 10 dígitos
    const regexTelefono = /^[0-9]{10}$/;
    if (pacienteData.telefono && !regexTelefono.test(pacienteData.telefono)) {
        errores.telefono = 'El telefono debe tener exactamente 10 digitos';
    }

    // Validar dirección - máximo 200 caracteres
    if (pacienteData.direccion && pacienteData.direccion.length > 200) {
        errores.direccion = 'La direccion no puede exceder 200 caracteres';
    }

    // Validar fecha de nacimiento
    if (!pacienteData.nacimiento) {
        errores.nacimiento = 'La fecha de nacimiento es requerida';
    } else {
        const fechaNacimiento = new Date(pacienteData.nacimiento);
        const hoy = new Date();
        
        const fechaNacimientoSinHora = new Date(fechaNacimiento.getFullYear(), fechaNacimiento.getMonth(), fechaNacimiento.getDate());
        const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        
        if (fechaNacimientoSinHora > hoySinHora) {
            errores.nacimiento = 'La fecha de nacimiento no puede ser en el futuro';
        }
        else {
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

    // Validar alergias - máximo 300 caracteres
    if (pacienteData.alergias && pacienteData.alergias.length > 300) {
        errores.alergias = 'Las alergias no pueden exceder 300 caracteres';
    }

    // Validar enfermedades crónicas - máximo 500 caracteres
    if (pacienteData.enfermedadesCronicas && pacienteData.enfermedadesCronicas.length > 500) {
        errores.enfermedadesCronicas = 'Las enfermedades cronicas no pueden exceder 500 caracteres';
    }
    
    return {
        hayErrores: Object.keys(errores).length > 0,
        errores: errores
    };
};

// <-- MODIFICADO: Ya no necesitamos 'usuariosExistentes'
// La verificación de duplicados debería hacerse en la API,
// pero por ahora, solo generamos la clave.



const generarClaveUnica = (nombreCompleto, fechaNacimiento) => {
    if (!nombreCompleto || !fechaNacimiento) return '';
    const partesNombre = nombreCompleto.trim().split(' ');
    const primeraLetraNombre = partesNombre[0] ? partesNombre[0].charAt(0).toUpperCase() : '';
    const primeraLetraPaterno = partesNombre[1] ? partesNombre[1].charAt(0).toUpperCase() : '';
    const primeraLetraMaterno = partesNombre[2] ? partesNombre[2].charAt(0).toUpperCase() : '';
    const añoNacimiento = new Date(fechaNacimiento).getFullYear();
    
    // Generar clave base
    let claveBase = primeraLetraNombre + primeraLetraPaterno + primeraLetraMaterno + añoNacimiento;
    return claveBase; // <-- Eliminamos el bucle 'while'
};


// Generar contraseña de 6 números
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
    const [loading, setLoading] = useState(false); // <-- AÑADIDO
    
    // <-- ELIMINADO: Ya no cargamos usuarios de localStorage
    // const [usuariosExistentes, setUsuariosExistentes] = useState([]);
    // useEffect(() => { ... }, []);

    // Generar contraseña automáticamente (Sin cambios)
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

        // Generar clave única (MODIFICADO)
        if (name === 'nombreCompleto' || name === 'nacimiento') {
            if (nuevosDatos.nombreCompleto && nuevosDatos.nacimiento) {
                // Ya no pasamos 'usuariosExistentes'
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

    // <-- MODIFICADO COMPLETAMENTE: Ahora usa 'fetch' a la API
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // <-- AÑADIDO
        setErrores({}); // Limpiar errores

        // Validar todos los campos (Sin cambios)
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

        // Obtener el ID del doctor logueado desde localStorage
        const doctorId = localStorage.getItem('userId');
        if (!doctorId) {
            setLoading(false);
            alert('Error: No se pudo identificar al doctor. Por favor, inicie sesion de nuevo.');
            return;
        }

        // <-- ELIMINADA la verificación de duplicados de localStorage -->

        // 1. Preparar el 'payload' para la API
        // Nuestra Lambda espera 'password_hash' y 'id_doctor'
        const patientData = {
            nombreCompleto: formData.nombreCompleto.trim(),
            sexo: formData.sexo,
            telefono: formData.telefono,
            direccion: formData.direccion.trim(),
            fechaNacimiento: formData.nacimiento, // La API guardará 'fechaNacimiento'
            tipoSangre: formData.tipoSangre,
            alergias: formData.alergias.trim(),
            enfermedadesCronicas: formData.enfermedadesCronicas.trim(),
            claveUnica: formData.claveUnica,
            password_hash: formData.contraseña, // Renombramos 'contraseña'
            id_doctor: doctorId, // Añadimos el ID del doctor
        };

        const payload = {
            action: "createPatient",
            data: patientData
        };

        // 2. Enviar a la API de Lambda
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                // Si la API devuelve un error (ej. 500)
                throw new Error(data.message || 'Error al crear el paciente');
            }

            // ¡Éxito!
            alert(`Paciente agregado con exito\nClave única: ${data.paciente.claveUnica}\nContraseña: ${formData.contraseña}`);

            // 3. Limpiar formulario
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
            // Capturar errores de 'fetch' o de la API
            setErrores({ general: err.message || 'No se pudo conectar al servidor' });
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false); // <-- AÑADIDO
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
                    {/* ... (El resto de tu JSX no cambia) ... */}
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
                        {errores.nombreCompleto && (
                            <span className="error-message">{errores.nombreCompleto}</span>
                        )}
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
                            <option value="" disabled>Seleccione una opcion</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                        {errores.sexo && (
                            <span className="error-message">{errores.sexo}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Clave Única</label>
                        <input
                            type="text"
                            name="claveUnica"
                            value={formData.claveUnica}
                            readOnly
                            placeholder="Se generará automáticamente"
                            style={{ 
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #ddd',
                                color: '#666'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="text"
                                name="contraseña"
                                value={formData.contraseña}
                                readOnly
                                placeholder="Se generará automáticamente"
                                style={{ 
                                    flex: 1,
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #ddd',
                                    color: '#666'
                                }}
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
                                    cursor: 'pointer',
                                    fontSize: '12px'
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
                        <label>Numero Telefonico</label>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="1234567890"
                            className={errores.telefono ? 'input-error' : ''}
                            disabled={loading}
                        />
                        {errores.telefono && (
                            <span className="error-message">{errores.telefono}</span>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <label>Direccion</label>
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            placeholder="Ej. Av. Triunfo Maderista, Universidad Tecmilenio"
                            className={errores.direccion ? 'input-error' : ''}
                            disabled={loading}
                        />
                        {errores.direccion && (
                            <span className="error-message">{errores.direccion}</span>
                        )}
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
                        {errores.nacimiento && (
                            <span className="error-message">{errores.nacimiento}</span>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <label>Alergias</label>
                        <textarea
                            name="alergias"
                            value={formData.alergias}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Ej. Penicilina, Mariscos, Polvo..."
                            className={errores.alergias ? 'input-error' : ''}
                            disabled={loading}
                        ></textarea>
                        {errores.alergias && (
                            <span className="error-message">{errores.alergias}</span>
                        )}
                    </div>

                    <div className="form-group" style={{ gridColumn: '2', gridRow: '2 / span 4' }}>
                        <label>Enfermedades Cronicas (Padecimiento)</label>
                        <textarea
                            name="enfermedadesCronicas"
                            value={formData.enfermedadesCronicas}
                            onChange={handleChange}
                            rows="10"
                            placeholder="Ej. Asma, Hipertension..."
                            style={{ height: 'calc(100% - 30px)' }}
                            className={errores.enfermedadesCronicas ? 'input-error' : ''}
                            disabled={loading}
                        ></textarea>
                        {errores.enfermedadesCronicas && (
                            <span className="error-message">{errores.enfermedadesCronicas}</span>
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    {/* <-- MODIFICADO: Botón deshabilitado mientras carga --> */}
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
