import React, { useState } from 'react';
import './App.css';
import agregarAzul from './assets/agregar-azul.png';
import defaultAvatar from './assets/default-profile-image.png';
// import usuariosData from './usuarios.json'; // <-- ELIMINADO

// <-- AÑADIDO: Tu URL de API
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/"; // <-- PEGA TU URL

// Validaciones integradas (Sin cambios)
const validarUsuario = (usuarioData, rol) => {
  const errores = {};

  if (!usuarioData.correo) {
    errores.correo = 'El correo electronico es requerido';
  } else {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(usuarioData.correo)) {
      errores.correo = 'El formato del email no es valido';
    }
  }

  if (!usuarioData.nombreCompleto) {
    errores.nombreCompleto = 'El nombre completo es requerido';
  } else {
    const regexNombre = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/;
    if (!regexNombre.test(usuarioData.nombreCompleto.trim())) {
      errores.nombreCompleto = 'El nombre debe contener solo letras y espacios (2-50 caracteres)';
    }
  }

  // Renombramos 'contraseña' a 'password' para la validación
  if (!usuarioData.password) {
    errores.password = 'La contraseña es requerida';
  } else {
    const regexPassword = /^[A-Za-z0-9]{1,20}$/;
    if (!regexPassword.test(usuarioData.password)) {
      errores.password = 'La contraseña debe contener solo letras y numeros (maximo 20 caracteres, sin espacios)';
    }
  }

  if (rol === 'doctor') {
    if (usuarioData.telefono && usuarioData.telefono.trim() !== '') {
      const regexTelefono = /^[0-9]{10}$/;
      if (!regexTelefono.test(usuarioData.telefono)) {
        errores.telefono = 'El telefono debe tener exactamente 10 digitos';
      }
    }

    if (usuarioData.direccion && usuarioData.direccion.length > 200) {
      errores.direccion = 'La direccion no puede exceder 200 caracteres';
    }
  }

  return {
    hayErrores: Object.keys(errores).length > 0,
    errores: errores
  };
};

function AgregarUsuario() {
  const [rol, setRol] = useState('');
  const [mostrarCampos, setMostrarCampos] = useState(false);
  const [formData, setFormData] = useState({});
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false); // <-- AÑADIDO
  
  // <-- ELIMINADO: Ya no usamos el estado 'usuarios'
  // const [usuarios, setUsuarios] = useState(
  //   JSON.parse(localStorage.getItem('usuarios')) || usuariosData
  // );

  const handleChange = (e) => {
    
    const { name, value } = e.target;
    
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }

    let valorLimpio = value;
    
    if (name === 'nombreCompleto') {
      valorLimpio = value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, '');
    } else if (name === 'telefono') {
      valorLimpio = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'especialidad') {
      valorLimpio = value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, '');
    } else if (name === 'contraseña') { // El campo del form se sigue llamando 'contraseña'
      valorLimpio = value.replace(/[^A-Za-z0-9]/g, '').slice(0, 20);
    }

    setFormData({ ...formData, [name]: valorLimpio });
  };

  const handleFileChange = (e) => {
    // (Esta función se mantiene igual, pero el PDF es un tema aparte)
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecciona un archivo PDF');
        e.target.value = '';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Maximo 5MB permitido.');
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ 
          ...formData, 
          cedulaPDF: reader.result, // Esto es un string base64
          cedulaNombre: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };
    const regenerarContraseña = () => {
      const nuevaContraseña = generarContraseñaAutomatica();
      setFormData(prev => ({ ...prev, contraseña: nuevaContraseña }));
    };

  // Genera automáticamente una contraseña de 6 dígitos
  const generarContraseñaAutomatica = () => {
    const caracteres = '0123456789';
    let contraseña = '';
    const longitud = 6;

    for (let i = 0; i < longitud; i++) {
        contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    return contraseña;
  };

  const handleRolChange = (e) => {
    const valor = e.target.value;
    setRol(valor);
    setMostrarCampos(!!valor);
    setErrores({});

    // --- AGREGADO: Generar contraseña automática ---
    const nuevaContraseña = generarContraseñaAutomatica();
    setFormData(prev => ({
      ...prev,
      contraseña: nuevaContraseña
    }));
  };

  // <-- MODIFICADO COMPLETAMENTE: Ahora llama a la API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrores({});

    // Preparamos los datos para la validación (mapeando 'contraseña' a 'password')
    const datosParaValidar = {
      ...formData,
      password: formData.contraseña 
    };
    
    const resultadoValidacion = validarUsuario(datosParaValidar, rol);
    
    if (resultadoValidacion.hayErrores) {
      // Mapeamos el error de 'password' de vuelta a 'contraseña' para la UI
      if(resultadoValidacion.errores.password) {
        resultadoValidacion.errores.contraseña = resultadoValidacion.errores.password;
        delete resultadoValidacion.errores.password;
      }
      setErrores(resultadoValidacion.errores);
      alert('Por favor corrige los errores en el formulario');
      setLoading(false);
      return;
    }

    // --- ¡MODIFICADO! ---
    // Esta validación la comentamos. Lo ideal sería subir a S3,
    // pero por ahora, permitiremos crear el doctor sin ella.
    /*
    if (rol === 'doctor' && !formData.cedulaPDF) {
      alert('Para registrar un doctor, es necesario subir la cedula profesional en formato PDF');
      setLoading(false);
      return;
    }
    */

    // 1. Preparamos el 'payload' para la API
    const payload = {
      action: "createUser",
      data: {
        ...formData,
        rol: rol.charAt(0).toUpperCase() + rol.slice(1),
        avatar: defaultAvatar,
        password: formData.contraseña // La API espera 'password'
      }
    };
    delete payload.data.contraseña; // Limpiamos el payload

    // 2. Llamamos a la API
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al crear el usuario');
        }

        // ¡Éxito!
        alert(`Usuario agregado con exito\nContraseña: ${formData.contraseña}\n\n¡No olvides compartir esta contraseña con el usuario!`);
        
        // Limpiamos el formulario
        setFormData({});
        setRol('');
        setMostrarCampos(false);
        setErrores({});

    } catch (err) {
        alert(`Error: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="form-usuario-container">
      <h2 className="page-title">
        <img src={agregarAzul} alt="Agregar" />
        Agregar Usuario
      </h2>

      <form className="user-form-card" onSubmit={handleSubmit}>
        {/* Añadimos 'disabled' a todos los campos */}
        <fieldset disabled={loading}>
          <div className="rol-card">
            <label htmlFor="rol" className="rol-label">
              ¿Que es?
            </label>
            <select
              id="rol"
              name="rol"
              className="rol-input"
              value={rol}
              onChange={handleRolChange}
            >
              <option value="">Selecciona una opcion</option>
              <option value="doctor">Doctor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          {mostrarCampos && (
            <div className="form-grid">
              {rol === 'doctor' && (
                <>
                  <div className="form-group full-width">
                    <label>Nombre completo *</label>
                    <input 
                      name="nombreCompleto" 
                      value={formData.nombreCompleto || ''}
                      onChange={handleChange} 
                      required
                      className={errores.nombreCompleto ? 'input-error' : ''}
                      placeholder="Solo letras y espacios"
                    />
                    {errores.nombreCompleto && (
                      <span className="error-message">{errores.nombreCompleto}</span>
                    )}
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Correo *</label>
                    <input 
                      type="email" 
                      name="correo" 
                      value={formData.correo || ''}
                      onChange={handleChange} 
                      required
                      className={errores.correo ? 'input-error' : ''}
                    />
                    {errores.correo && (
                      <span className="error-message">{errores.correo}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Cedula profesional (PDF)</label> {/* Quitamos el '*' */}
                    <input
                      type="file"
                      name="cedula"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      // required // <-- ¡MODIFICADO! Ya no es requerido
                      className={errores.cedula ? 'input-error' : ''}
                    />
                    {formData.cedulaNombre && (
                      <p className="file-name">Archivo seleccionado: {formData.cedulaNombre}</p>
                    )}
                    {!formData.cedulaNombre && (
                      <p className="file-name" style={{color: '#ff4444'}}>
                        * Campo obligatorio para doctores
                      </p>
                  )}
                  </div>

                  <div className="form-group">
                    <label>Especialidad</label>
                    <input 
                      name="especialidad" 
                      value={formData.especialidad || ''}
                      onChange={handleChange}
                      className={errores.especialidad ? 'input-error' : ''}
                      placeholder="Ej. Cardiologia"
                    />
                    {errores.especialidad && (
                      <span className="error-message">{errores.especialidad}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Telefono de consultorio</label>
                    <input 
                      name="telefono" 
                      value={formData.telefono || ''}
                      onChange={handleChange}
                      className={errores.telefono ? 'input-error' : ''}
                      placeholder="10 digitos"
                    />
                    {errores.telefono && (
                      <span className="error-message">{errores.telefono}</span>
                    )}
                  </div>
                  
                  <div className="form-group full">
                    {/* 1. Etiqueta separada para que quede arriba */}
                    <label style={{
                      display: 'block', // Asegura que ocupe su propia línea
                      marginBottom: '5px', // Agrega un espacio pequeño debajo de la etiqueta
                      fontWeight: 'bold' // Opcional: para que se vea como un título de campo
                    }}>
                      Contraseña
                    </label>

                    {/* 2. Nuevo contenedor Flex para alinear solo el Input y el Botón */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="text"
                        name="contraseña"
                        value={formData.contraseña || ''}
                        readOnly
                        style={{
                          flex: '1',
                          backgroundColor: '#f2f2f2',
                          cursor: 'not-allowed',
                          border: errores.contraseña ? '1px solid #dc3545' : '1px solid #ddd',
                          height: '42px',
                          paddingLeft: '10px',
                          fontSize: '16px'
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const nueva = generarContraseñaAutomatica();
                          setFormData(prev => ({ ...prev, contraseña: nueva }));
                        }}
                        className="btn btn-primary"
                        style={{
                          height: '42px',
                          padding: '0 16px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Regenerar
                      </button>
                    </div>
                  </div>

                  
                  <div className="form-group full-width">
                    <label>Direccion de consultorio</label>
                    <input 
                      name="direccion" 
                      value={formData.direccion || ''}
                      onChange={handleChange}
                      className={errores.direccion ? 'input-error' : ''}
                    />
                    {errores.direccion && (
                      <span className="error-message">{errores.direccion}</span>
                    )}
                  </div>
                </>
              )}

              {rol === 'administrador' && (
                <>
                  <div className="form-group full-width">
                    <label>Correo *</label>
                    <input 
                      type="email" 
                      name="correo" 
                      value={formData.correo || ''}
                      onChange={handleChange} 
                      required
                      className={errores.correo ? 'input-error' : ''}
                    />
                    {errores.correo && (
                      <span className="error-message">{errores.correo}</span>
                    )}
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Nombre completo *</label>
                    <input 
                      name="nombreCompleto" 
                      value={formData.nombreCompleto || ''}
                      onChange={handleChange} 
                      required
                      className={errores.nombreCompleto ? 'input-error' : ''}
                      placeholder="Solo letras y espacios"
                    />
                    {errores.nombreCompleto && (
                      <span className="error-message">{errores.nombreCompleto}</span>
                    )}
                  </div>
                  
                  <div className="form-group full">
                    {/* 1. Etiqueta separada para que quede arriba */}
                    <label style={{
                      display: 'block', // Asegura que ocupe su propia línea
                      marginBottom: '5px', // Agrega un espacio pequeño debajo de la etiqueta
                      fontWeight: 'bold' // Opcional: para que se vea como un título de campo
                    }}>
                      Contraseña
                    </label>

                    {/* 2. Nuevo contenedor Flex para alinear solo el Input y el Botón */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="text"
                        name="contraseña"
                        value={formData.contraseña || ''}
                        readOnly
                        style={{
                          flex: '1',
                          backgroundColor: '#f2f2f2',
                          cursor: 'not-allowed',
                          border: errores.contraseña ? '1px solid #dc3545' : '1px solid #ddd',
                          height: '42px',
                          paddingLeft: '10px',
                          fontSize: '16px'
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const nueva = generarContraseñaAutomatica();
                          setFormData(prev => ({ ...prev, contraseña: nueva }));
                        }}
                        className="btn btn-primary"
                        style={{
                          height: '42px',
                          padding: '0 16px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Regenerar
                      </button>
                    </div>
                  </div>

                </>
              )}
            </div>
          )}

          {mostrarCampos && (
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Usuario'}
              </button>
            </div>
          )}
        </fieldset>
      </form>
    </div>
  );
}

export default AgregarUsuario;