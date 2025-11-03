import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import usuariosData from './usuarios.json'; 

function Login() {
    const [claveUnica, setClaveUnica] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        const storedUsers = JSON.parse(localStorage.getItem('usuarios'));
        const allUsers = (storedUsers && storedUsers.length > 0) ? storedUsers : usuariosData;

        const usuarioEncontrado = allUsers.find(
            (u) => 
                (u.correo === claveUnica || u.nombreCompleto === claveUnica) && 
                u.contraseña === contrasena &&
                (u.rol === 'Administrador' || u.rol === 'Doctor') 
        );

        if (usuarioEncontrado) {
            localStorage.setItem('userId', usuarioEncontrado.id);
            localStorage.setItem('rol', usuarioEncontrado.rol);
            localStorage.setItem('nombre', usuarioEncontrado.nombreCompleto);

            switch (usuarioEncontrado.rol) {
                case 'Administrador':
                    navigate('/dashboard/usuarios'); 
                    break;
                case 'Doctor':
                    navigate('/doctor/ver-pacientes');
                    break;
                default:
                    navigate('/login'); 
            }
        } else {
            setError('Credenciales incorrectas o rol no autorizado.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-aside">
                <div className="logo-container">
                    <span>[ LOGO ]</span>
                </div>
            </div>

            <div className="login-form-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Ingresar</h2>

                    <div className="form-group">
                        <label htmlFor="clave-unica">Usuario o correo</label>
                        <input
                            type="text"
                            id="clave-unica"
                            value={claveUnica}
                            onChange={(e) => setClaveUnica(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contrasena">Contraseña</label>
                        <input
                            type="password"
                            id="contrasena"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                        />
                    </div>

                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <button type="submit">Ingresar</button>
                </form>
            </div>
        </div>
    );
}

export default Login;