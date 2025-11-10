// En tu Perfil.js, agrega este botón/link:
import { Link } from 'react-router-dom';

function Perfil() {
  const rol = localStorage.getItem('rol');
  
  return (
    <div className="perfil-container">
      {/* ... resto de tu código del perfil ... */}
      
      <div className="password-section">
        <h3>CAMBIAR CONTRASEÑA</h3>
        <Link 
          to={rol === 'Doctor' ? '/doctor/cambiar-contrasena' : '/dashboard/cambiar-contrasena'}
          className="btn btn-primary"
        >
          Cambiar Contraseña
        </Link>
      </div>
    </div>
  );
}
