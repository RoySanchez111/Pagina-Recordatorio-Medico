import React, { useState } from 'react';
import './App.css'; 
import { useNavigate } from 'react-router-dom';

// Pega tu URL de Lambda aquí
const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/";

function Login() {
    const [claveUnica, setClaveUnica] = useState(''); 
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true); 

        // 1. Preparamos el 'body'
        const payload = {
            action: "login",
            data: {
                correo: claveUnica, 
                // --- ¡CAMBIO AQUÍ! ---
                // Dejamos de usar la 'ñ'. Ahora la clave es 'password'.
                password: contrasena 
            }
        };

        try {
            // 2. Usamos 'fetch' para llamar a nuestra API de Lambda
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json(); 

            // 3. Verificamos si la API nos dio un error
            if (!response.ok) {
                throw new Error(data.message || 'Error en el login');
            }

            // 4. ¡Login Exitoso!
            const { user } = data; 
            localStorage.setItem('userId', user.id);
            localStorage.setItem('rol', user.rol);
            localStorage.setItem('nombre', user.nombreCompleto);
            
            setLoading(false); 

            // 6. Navegamos al dashboard correcto
            switch (user.rol) {
                case 'Administrador':
                    navigate('/dashboard/usuarios'); 
                    break;
                case 'Doctor':
                    navigate('/doctor/ver-pacientes');
                    break;
                default:
                    navigate('/login'); 
            }

        } catch (err) {
            // 7. Capturamos cualquier error
            setLoading(false); 
            setError(err.message || 'No se pudo conectar al servidor.');
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
                            disabled={loading} 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contrasena">Contraseña</label>
                        <input
                            type="password"
                            id="contrasena"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            disabled={loading} 
                        />
                    </div>

                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;