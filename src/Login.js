import React, { useState } from 'react';
// import './App.css'; // Cambié esto por Login.css, que es más convencional
import './App.css'; // Asegúrate que la ruta a tus estilos sea correcta
import { useNavigate } from 'react-router-dom'; // 1. IMPORTAR NAVIGATE

function Login() {
    // Estados para guardar los valores de los inputs
    const [claveUnica, setClaveUnica] = useState('');
    const [contrasena, setContrasena] = useState('');

    // 2. INICIALIZAR NAVIGATE
    const navigate = useNavigate();

    // Manejador para cuando se envía el formulario
    const handleSubmit = (event) => {
        // Prevenimos que la página se recargue
        event.preventDefault(); 
        
        // 3. NAVEGAR DIRECTAMENTE A LA PÁGINA DE USUARIOS (vía el dashboard)
        // Ya no hay 'if', no hay validación.
        navigate('/dashboard');
    };

    return (
        // Usamos 'className' en lugar de 'class' para los estilos
        <div className="login-container">
            
            {/* === Sección Izquierda (Logo) === */}
            <div className="login-aside">
                <div className="logo-container">
                    <span>[ LOGO ]</span>
                </div>
            </div>
            
            {/* === Sección Derecha (Formulario) === */}
            <div className="login-form-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Ingresar</h2>
                    
                    <div className="form-group">
                        {/* Usamos 'htmlFor' en lugar de 'for' */}
                        <label htmlFor="clave-unica">Clave Única</label>
                        <input 
                            type="password" 
                            id="clave-unica" 
                            name="clave-unica"
                            value={claveUnica} // Conectamos el estado al valor
                            onChange={(e) => setClaveUnica(e.target.value)} // Actualizamos el estado
                            // required // 4. QUITAMOS 'required'
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="contrasena">Contraseña</label>
                        <input 
                            type="password" 
                            id="contrasena" 
                            name="contrasena" 
                            value={contrasena} // Conectamos el estado al valor
                            onChange={(e) => setContrasena(e.target.value)} // Actualizamos el estado
                            // required // 4. QUITAMOS 'required'
                        />
                    </div>
                    
                    <button type="submit">Ingresar</button>
                </form>
            </div>

        </div>
    );
}

export default Login;