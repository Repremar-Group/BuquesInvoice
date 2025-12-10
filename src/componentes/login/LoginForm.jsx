import React, { useState } from 'react';
import './LoginForm.css';
import logo from './LogoRepremar.png';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { environment } from '../../environment';

const LoginForm = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 👇 usamos la URL desde environment, igual que en otros fetch
      const response = await fetch(`${environment.API_URL}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password: contraseña }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Usuario o contraseña incorrectos');
        return;
      }

      // 💾 Guardar datos del usuario en localStorage
      if (data.user) {
        localStorage.setItem('usuario', data.user.usuario);
        if (data.user.idoperador) localStorage.setItem('idOperador', data.user.idoperador);
        if (data.user.rol) localStorage.setItem('rol', data.user.rol);
      }

      // ✅ Si el backend devuelve un token, lo guardás también
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      toast.success('Inicio de sesión exitoso');
      onLoginSuccess();
      navigate('/home');
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      toast.error('Error de conexión con el servidor');
    }
  };

  return (
    <div className='Login'>
      <form className='formularioschicos' onSubmit={handleSubmit}>
        <img src={logo} alt="Logo Cielosur" />
        <div><br /></div>

        <div className='input-box'>
          <input
            type="text"
            placeholder='Usuario'
            onChange={e => setUsuario(e.target.value)}
            value={usuario}
            required
          />
        </div>

        <div className='input-box'>
          <input
            type="password"
            placeholder='Contraseña'
            onChange={e => setContraseña(e.target.value)}
            value={contraseña}
            required
          />
        </div>

        <button type="submit" className="btn-estandar">Ingresar</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default LoginForm;
