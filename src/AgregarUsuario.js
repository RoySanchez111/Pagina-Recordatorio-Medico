import React, { useState } from 'react';
import './App.css';
import agregarAzul from './assets/agregar-azul.png';
import defaultAvatar from './assets/default-profile-image.png';

// TU URL DE LAMBDA
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/";

// --- Generador de Contraseña Alfanumérica (Letras y Números) ---
const generarContraseñaAutomatica = () => {
  const caracteres = '1234567890';
  let contraseña = '';
  const longitud = 10; // Longitud segura de 10 caracteres
  for (let i = 0; i < longitud; i++) {
    contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return contraseña;
};

// --- Validaciones ---
const validarUsuario = (usuarioData, rol) => {
  const errores = {};

  if (!usuarioData.correo) {
    errores.correo = 'El correo electrónico es requerido';
  } else {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(usuarioData.correo)) {
      errores.correo = 'El formato del email no es válido';
    }
  }

  if (!usuarioData.nombreCompleto) {
    errores.nombreCompleto = 'El nombre completo es requerido';
  } else {
    const regexNombre = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/;
    if (!regexNombre.test(usuarioData.nombreCompleto.trim())) {
      errores.nombreCompleto = 'El nombre debe contener solo letras y espacios';
    }
  }

  if (!usuarioData.contraseña) {
    errores.contraseña = 'La contraseña es requerida';
  }

  if (rol === 'doctor') {
    if (usuarioData.telefono && usuarioData.telefono.trim() !== '') {
      const regexTelefono = /^[0-9]{10}$/;
      if (!regexTelefono.test(usuarioData.telefono)) {
        errores.telefono = 'El teléfono debe tener exactamente 10 dígitos';
      }
    }

    if (usuarioData.direccion && usuarioData.direccion.length > 200) {
      errores.direccion = 'La dirección no puede exceder 200 caracteres';
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
  const [cargando, setCargando] = useState(false);

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
    } 

    setFormData({ ...formData, [name]: valorLimpio });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecciona un archivo PDF');
        e.target.value = '';
        return;
      }
      
      // --- CAMBIO IMPORTANTE PARA S3: LÍMITE AUMENTADO A 5MB ---
      if (file.size > 5 * 1024 * 1024) { 
        alert('El archivo es demasiado grande. Máximo 5MB permitido.');
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          cedulaPDF: reader.result, 
          cedulaNombre: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const regenerarContraseña = () => {
    const nuevaPass = generarContraseñaAutomatica();
    setFormData(prev => ({ ...prev, contraseña: nuevaPass }));
  };

  const handleRolChange = (e) => {
    const valor = e.target.value;
    setRol(valor);
    setMostrarCampos(!!valor);
    setErrores({});
    
    if (valor) {
      setFormData({ contraseña: generarContraseñaAutomatica() });
    } else {
      setFormData({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resultadoValidacion = validarUsuario(formData, rol);
    
    if (resultadoValidacion.hayErrores) {
      setErrores(resultadoValidacion.errores);
      alert('Por favor corrige los errores en el formulario');
      return;
    }

    if (rol === 'doctor' && !formData.cedulaPDF) {
      alert('Para registrar un doctor, es necesario subir la cédula profesional en formato PDF');
      return;
    }

    setCargando(true);

    try {
      const datosParaEnviar = {
        ...formData,
        rol: rol,
        password: formData.contraseña, 
        avatar: defaultAvatar
      };

      // Eliminamos la propiedad duplicada
      delete datosParaEnviar.contraseña;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "createUser",
          data: datosParaEnviar
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Usuario agregado con éxito.\n\nCredenciales para entregar:\nCorreo: ${formData.correo}\nContraseña: ${formData.contraseña}`);
        
        setRol('');
        setMostrarCampos(false);
        setFormData({});
        setErrores({});
      } else {
        throw new Error(result.message || "Error al crear usuario");
      }

    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="form-usuario-container">
      <h2 className="page-title">
        <img src={agregarAzul} alt="Agregar" />
        Agregar Usuario
      </h2>

      <form className="user-form-card" onSubmit={handleSubmit}>
        <div className="rol-card">
          <label htmlFor="rol" className="rol-label">
            ¿Qué es?
          </label>
          <select
            id="rol"
            name="rol"
            className="rol-input"
            value={rol}
            onChange={handleRolChange}
            disabled={cargando}
          >
            <option value="">Selecciona una opción</option>
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
                    disabled={cargando}
                  />
                  {errores.nombreCompleto && <span className="error-message">{errores.nombreCompleto}</span>}
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
                    disabled={cargando}
                  />
                  {errores.correo && <span className="error-message">{errores.correo}</span>}
                </div>

                <div className="form-group">
                  <label>Cédula profesional (PDF) *</label>
                  <input
                    type="file"
                    name="cedula"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    required
                    className={errores.cedula ? 'input-error' : ''}
                    disabled={cargando}
                  />
                  {formData.cedulaNombre && (
                    <p className="file-name">Archivo: {formData.cedulaNombre}</p>
                  )}
                  {/* AVISO DE TAMAÑO MÁXIMO ACTUALIZADO */}
                  {!formData.cedulaNombre && (
                    <p className="file-name" style={{color: '#4caf50'}}>* Max 5MB</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Especialidad</label>
                  <input 
                    name="especialidad" 
                    value={formData.especialidad || ''}
                    onChange={handleChange}
                    className={errores.especialidad ? 'input-error' : ''}
                    placeholder="Ej. Cardiología"
                    disabled={cargando}
                  />
                  {errores.especialidad && <span className="error-message">{errores.especialidad}</span>}
                </div>
                
                <div className="form-group">
                  <label>Teléfono de consultorio</label>
                  <input 
                    name="telefono" 
                    value={formData.telefono || ''}
                    onChange={handleChange}
                    className={errores.telefono ? 'input-error' : ''}
                    placeholder="10 dígitos"
                    disabled={cargando}
                  />
                  {errores.telefono && <span className="error-message">{errores.telefono}</span>}
                </div>
                
                <div className="form-group full">
                  <label>Contraseña (Auto-generada) *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        name="contraseña" 
                        value={formData.contraseña || ''}
                        readOnly
                        disabled={cargando}
                        style={{ 
                            flex: 1,
                            backgroundColor: '#f5f5f5',
                            border: errores.contraseña ? '1px solid #dc3545' : '1px solid #ddd',
                            color: '#333',
                            cursor: 'default'
                        }}
                    />
                    <button 
                        type="button"
                        onClick={regenerarContraseña}
                        disabled={cargando}
                        style={{
                            padding: '0 15px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        Regenerar
                    </button>
                  </div>
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    Copie esta contraseña para entregarla al usuario.
                  </small>
                </div>
                
                <div className="form-group full-width">
                  <label>Dirección de consultorio</label>
                  <input 
                    name="direccion" 
                    value={formData.direccion || ''}
                    onChange={handleChange}
                    className={errores.direccion ? 'input-error' : ''}
                    disabled={cargando}
                  />
                  {errores.direccion && <span className="error-message">{errores.direccion}</span>}
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
                    disabled={cargando}
                  />
                  {errores.correo && <span className="error-message">{errores.correo}</span>}
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
                    disabled={cargando}
                  />
                  {errores.nombreCompleto && <span className="error-message">{errores.nombreCompleto}</span>}
                </div>
                
                <div className="form-group full-width">
                  <label>Contraseña (Auto-generada) *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        name="contraseña" 
                        value={formData.contraseña || ''}
                        readOnly
                        disabled={cargando}
                        style={{ 
                            flex: 1,
                            backgroundColor: '#f5f5f5',
                            border: errores.contraseña ? '1px solid #dc3545' : '1px solid #ddd',
                            color: '#333',
                            cursor: 'default'
                        }}
                    />
                    <button 
                        type="button"
                        onClick={regenerarContraseña}
                        disabled={cargando}
                        style={{
                            padding: '0 15px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        Regenerar
                    </button>
                  </div>
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    Copie esta contraseña para entregarla al usuario.
                  </small>
                </div>
              </>
            )}
          </div>
        )}

        {mostrarCampos && (
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={cargando}
              style={{ opacity: cargando ? 0.7 : 1 }}
            >
              {cargando ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default AgregarUsuario;
