import React, { useState, useEffect } from 'react';
import './App.css';
import usuariosData from './usuarios.json';
import agregarAzul from './assets/agregar-azul.png';

// Validaciones integradas
const validarPaciente = (pacienteData) => {
    const errores = {};

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
        
        // Resetear horas para comparar solo fecha
        const fechaNacimientoSinHora = new Date(fechaNacimiento.getFullYear(), fechaNacimiento.getMonth(), fechaNacimiento.getDate());
        const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        
        // Verificar que la fecha no sea en el futuro
        if (fechaNacimientoSinHora > hoySinHora) {
            errores.nacimiento = 'La fecha de nacimiento no puede ser en el futuro';
        }
        // Verificar edad mínima y máxima razonable
        else {
            let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
            const mes = hoy.getMonth() - fechaNacimiento.getMonth();
            
            // Ajustar edad si aún no ha pasado el cumpleaños este año
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

// Función para generar clave única
const generarClaveUnica = (nombreCompleto, fechaNacimiento, usuariosExistentes) => {
    if (!nombreCompleto || !fechaNacimiento) return '';

    // Dividir el nombre completo en partes
    const partesNombre = nombreCompleto.trim().split(' ');
    
    // Obtener primera letra del nombre
    const primeraLetraNombre = partesNombre[0] ? partesNombre[0].charAt(0).toUpperCase() : '';
    
    // Obtener primera letra del apellido paterno (segunda palabra)
    const primeraLetraPaterno = partesNombre[1] ? partesNombre[1].charAt(0).toUpperCase() : '';
    
    // Obtener primera letra del apellido materno (tercera palabra si existe)
    const primeraLetraMaterno = partesNombre[2] ? partesNombre[2].charAt(0).toUpperCase() : '';
    
    // Obtener año de nacimiento
    const añoNacimiento = new Date(fechaNacimiento).getFullYear();
    
    // Generar clave base
    let claveBase = primeraLetraNombre + primeraLetraPaterno + primeraLetraMaterno + añoNacimiento;
    
    // Verificar si la clave ya existe y generar variantes si es necesario
    let claveFinal = claveBase;
    let contador = 1;
    
    while (usuariosExistentes.some(usuario => usuario.claveUnica === claveFinal)) {
        claveFinal = claveBase + contador;
        contador++;
    }
    
    return claveFinal;
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
        claveUnica: ''
    });

    const [errores, setErrores] = useState({});
    const [usuariosExistentes, setUsuariosExistentes] = useState([]);

    // Cargar usuarios existentes al montar el componente
    useEffect(() => {
        const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios')) || usuariosData;
        setUsuariosExistentes(usuariosGuardados);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Limpiar errores cuando el usuario escribe
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }

        // Validación en tiempo real para campos específicos
        let valorLimpio = value;
        if (name === 'telefono') {
            // Solo números, máximo 10 dígitos
            valorLimpio = value.replace(/\D/g, '').slice(0, 10);
        } else if (name === 'nombreCompleto') {
            // Solo letras, espacios y acentos
            valorLimpio = value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, '');
        }

        const nuevosDatos = { ...formData, [name]: valorLimpio };
        setFormData(nuevosDatos);

        // Generar clave única cuando cambie el nombre o la fecha de nacimiento
        if (name === 'nombreCompleto' || name === 'nacimiento') {
            if (nuevosDatos.nombreCompleto && nuevosDatos.nacimiento) {
                const claveGenerada = generarClaveUnica(
                    nuevosDatos.nombreCompleto, 
                    nuevosDatos.nacimiento, 
                    usuariosExistentes
                );
                setFormData(prev => ({ ...prev, claveUnica: claveGenerada }));
            } else {
                setFormData(prev => ({ ...prev, claveUnica: '' }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar todos los campos
        const resultadoValidacion = validarPaciente(formData);
        
        if (resultadoValidacion.hayErrores) {
            setErrores(resultadoValidacion.errores);
            alert('Por favor corrige los errores en el formulario');
            return;
        }

        // Validar que se generó una clave única
        if (!formData.claveUnica) {
            alert('Error: No se pudo generar la clave única. Verifique los datos del paciente.');
            return;
        }

        const doctorId = parseInt(localStorage.getItem('userId'));
        if (!doctorId) {
            alert('Error: No se pudo identificar al doctor. Por favor, inicie sesion de nuevo.');
            return;
        }

        const usuariosActuales = JSON.parse(localStorage.getItem('usuarios')) || usuariosData;

        // Verificar que la clave única no exista (doble verificación)
        if (usuariosActuales.some(usuario => usuario.claveUnica === formData.claveUnica)) {
            // Regenerar clave única si ya existe
            const nuevaClave = generarClaveUnica(
                formData.nombreCompleto, 
                formData.nacimiento, 
                usuariosActuales
            );
            setFormData(prev => ({ ...prev, claveUnica: nuevaClave }));
            alert(`La clave única ya existía. Se generó una nueva: ${nuevaClave}`);
            return;
        }

        const nuevoPaciente = {
            id: usuariosActuales.length + 1,
            rol: "Paciente",
            nombreCompleto: formData.nombreCompleto.trim(),
            sexo: formData.sexo,
            telefono: formData.telefono,
            direccion: formData.direccion.trim(),
            nacimiento: formData.nacimiento,
            tipoSangre: formData.tipoSangre,
            alergias: formData.alergias.trim(),
            padecimiento: formData.enfermedadesCronicas.trim(),
            doctorId: doctorId,
            claveUnica: formData.claveUnica // ← Nueva clave única
        };

        const usuariosActualizados = [...usuariosActuales, nuevoPaciente];
        localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));

        alert(Paciente agregado con exito\nClave única: ${formData.claveUnica});

        setFormData({
            nombreCompleto: '',
            sexo: '',
            telefono: '',
            direccion: '',
            nacimiento: '',
            tipoSangre: '',
            alergias: '',
            enfermedadesCronicas: '',
            claveUnica: ''
        });
        setErrores({});
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
                        <small style={{ color: '#666', fontSize: '12px' }}>
                            Formato: Primera letra nombre + apellido paterno + apellido materno + año nacimiento
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Tipo de Sangre</label>
                        <select
                            name="tipoSangre"
                            value={formData.tipoSangre}
                            onChange={handleChange}
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
                        ></textarea>
                        {errores.enfermedadesCronicas && (
                            <span className="error-message">{errores.enfermedadesCronicas}</span>
                        )}
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
