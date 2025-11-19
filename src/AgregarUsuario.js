import React, { useState } from 'react';
import './App.css';
import agregarAzul from './assets/agregar-azul.png';
import defaultAvatar from './assets/default-profile-image.png';


const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/";

// Validaciones integradas (Mantenemos tu lógica original)
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

  if (!usuarioData.contraseña) {
    errores.contraseña = 'La contraseña es requerida';
  } else {
    const regexPassword = /^[A-Za-z0-9]{1,20}$/;
    if (!regexPassword.test(usuarioData.contraseña)) {
      errores.contraseña = 'La contraseña debe contener solo letras y numeros (maximo 20 caracteres, sin espacios)';
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
  const [cargando, setCargando] = useState(false); // Nuevo estado para feedback visual

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
    } else if (name === 'contraseña') {
      valorLimpio = value.replace(/[^A-Za-z0-9]/g, '').slice(0, 20);
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
      
      // ⚠️ CAMBIO CRÍTICO: DynamoDB solo acepta items < 400KB
      // Bajamos el límite a 300KB para dejar espacio a los datos de texto.
      if (file.size > 300 * 1024) { 
        alert('El archivo es demasiado grande para la base de datos. Máximo 300KB permitido.');
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ 
          ...formData, 
          cedulaPDF: reader.result, // Base64 string
          cedulaNombre: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRolChange = (e) => {
    const valor = e.target.value;
    setRol(valor);
    setMostrarCampos(!!valor);
    setErrores({});
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
      alert('Para registrar un doctor, es necesario subir la cedula profesional en formato PDF');
      return;
    }

    setCargando(true);

    try {
      // 1. Preparamos los datos para la API
      const datosParaEnviar = {
        ...formData,
        rol: rol,
        password: formData.contraseña, // Mapeamos contraseña a password para la API
        avatar: defaultAvatar
      };

      // Eliminamos la propiedad 'contraseña' redundante (la API usa 'password')
      delete datosParaEnviar.contraseña;

      // 2. Llamada a la API (Action: createUser)
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
        alert(`Usuario agregado con éxito en la Nube\nID: ${result.user.id}\nContraseña: ${formData.contraseña}`);
        
        // Limpiar formulario
        setFormData({});
        setRol('');
        setMostrarCampos(false);
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
            ¿Que es?
          </label>
          <select
            id="rol"
            name="rol"
            className="rol-input"
            value={rol}
            onChange={handleRolChange}
            disabled={cargando}
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
                    disabled={cargando}
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
                    disabled={cargando}
                  />
                  {errores.correo && (
                    <span className="error-message">{errores.correo}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Cedula profesional (PDF) *</label>
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
                    <p className="file-name">Archivo seleccionado: {formData.cedulaNombre}</p>
                  )}
                  {!formData.cedulaNombre && (
                    <p className="file-name" style={{color: '#ff4444'}}>
                      * Max 300KB
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
                    disabled={cargando}
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
                    disabled={cargando}
                  />
                  {errores.telefono && (
                    <span className="error-message">{errores.telefono}</span>
                  )}
                </div>
                
                <div className="form-group full">
                  <label>Contraseña *</label>
                  <input 
                    type="text" 
                    name="contraseña" 
                    value={formData.contraseña || ''}
                    onChange={handleChange}
                    placeholder="Letras y numeros (max 20 caracteres, sin espacios)"
                    required
                    disabled={cargando}
                    style={{ 
                      width: '100%',
                      backgroundColor: 'white',
                      border: errores.contraseña ? '1px solid #dc3545' : '1px solid #ddd'
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    La contraseña debe contener solo letras y numeros (maximo 20 caracteres, sin espacios)
                  </small>
                  {errores.contraseña && (
                    <span className="error-message">{errores.contraseña}</span>
                  )}
                </div>
                
                <div className="form-group full-width">
                  <label>Direccion de consultorio</label>
                  <input 
                    name="direccion" 
                    value={formData.direccion || ''}
                    onChange={handleChange}
                    className={errores.direccion ? 'input-error' : ''}
                    disabled={cargando}
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
                    disabled={cargando}
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
                    disabled={cargando}
                  />
                  {errores.nombreCompleto && (
                    <span className="error-message">{errores.nombreCompleto}</span>
                  )}
                </div>
                
                <div className="form-group full-width">
                  <label>Contraseña *</label>
                  <input 
                    type="text" 
                    name="contraseña" 
                    value={formData.contraseña || ''}
                    onChange={handleChange}
                    placeholder="Letras y numeros (max 20 caracteres, sin espacios)"
                    required
                    disabled={cargando}
                    style={{ 
                      width: '100%',
                      backgroundColor: 'white',
                      border: errores.contraseña ? '1px solid #dc3545' : '1px solid #ddd'
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    La contraseña debe contener solo letras y numeros (maximo 20 caracteres, sin espacios)
                  </small>
                  {errores.contraseña && (
                    <span className="error-message">{errores.contraseña}</span>
                  )}
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
