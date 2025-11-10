import React, { useState } from 'react';
import './App.css';
import agregarAzul from './assets/agregar-azul.png';
import defaultAvatar from './assets/default-profile-image.png';
import usuariosData from './usuarios.json';

// Validaciones integradas
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
  const [usuarios, setUsuarios] = useState(
    JSON.parse(localStorage.getItem('usuarios')) || usuariosData
  );

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
      
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Maximo 5MB permitido.');
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ 
          ...formData, 
          cedulaPDF: reader.result,
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const resultadoValidacion = validarUsuario(formData, rol);
    
    if (resultadoValidacion.hayErrores) {
      setErrores(resultadoValidacion.errores);
      alert('Por favor corrige los errores en el formulario');
      return;
    }

    // Validacion especifica para doctores: deben tener cedula profesional subida
    if (rol === 'doctor' && !formData.cedulaPDF) {
      alert('Para registrar un doctor, es necesario subir la cedula profesional en formato PDF');
      return;
    }

    const nuevo = {
      id: usuarios.length + 1,
      rol: rol.charAt(0).toUpperCase() + rol.slice(1),
      avatar: defaultAvatar,
      ...formData,
    };

    const actualizados = [...usuarios, nuevo];
    setUsuarios(actualizados);
    localStorage.setItem('usuarios', JSON.stringify(actualizados));

    alert(`Usuario agregado con exito\nContraseña: ${formData.contraseña}\n\n¡No olvides compartir esta contraseña con el usuario!`);
    
    setFormData({});
    setRol('');
    setMostrarCampos(false);
    setErrores({});
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
                  <label>Cedula profesional (PDF) *</label>
                  <input
                    type="file"
                    name="cedula"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    required
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
                  <label>Contraseña *</label>
                  <input 
                    type="text" 
                    name="contraseña" 
                    value={formData.contraseña || ''}
                    onChange={handleChange}
                    placeholder="Letras y numeros (max 20 caracteres, sin espacios)"
                    required
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
                
                <div className="form-group full-width">
                  <label>Contraseña *</label>
                  <input 
                    type="text" 
                    name="contraseña" 
                    value={formData.contraseña || ''}
                    onChange={handleChange}
                    placeholder="Letras y numeros (max 20 caracteres, sin espacios)"
                    required
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
            <button type="submit" className="btn btn-primary">
              Guardar Usuario
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default AgregarUsuario;