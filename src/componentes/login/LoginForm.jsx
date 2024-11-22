import React, { useState } from 'react';
import './LoginForm.css';
import logo from './LogoRepremar.png';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = ({ onLoginSuccess }) => {
    const [usuario, setUsuario] = useState("");
    const [contraseña, setContraseña] = useState("");
    const navigate = useNavigate();

    // Array de usuarios válidos
    const usuariosValidos = [
        { usuario: "admin", contraseña: "admin" },
        { usuario: "jpgomez", contraseña: "juan", idoperador: 65 },
        { usuario: "gdelossantos", contraseña: "gd3lossant0s41372", idoperador: 4 },
        { usuario: "rbalbuena", contraseña: "rb4lbuen41372", idoperador: 73 },
        { usuario: "lpatetta", contraseña: "lp4tet41372", idoperador: 74 },
        { usuario: "tloustalet", contraseña: "tl0ust4let1372", idoperador: 67 },
        { usuario: "idossantos", contraseña: "id0sant0s1372", idoperador: 66 },
        { usuario: "dremigio", contraseña: "dr3mig1o1372", rol:'contable'},
        { usuario: "pporra", contraseña: "paola", rol:'contable' },
        { usuario: "jchaud", contraseña: "jc4ud1372", rol:'contable' },
        { usuario: "sdacosta", contraseña: "sd4cost41372", rol:'contable' }
    ];
    // Manejar el evento de submit
    const handleSubmit = (e) => {
        e.preventDefault(); // Evita la recarga de la página

        // Verificar si el usuario existe en el array
        const usuarioEncontrado = usuariosValidos.find(
            (u) => u.usuario === usuario && u.contraseña === contraseña
        );

        if (usuarioEncontrado) {
            // Solo almacenar idOperador si existe en el objeto del usuario
            if (usuarioEncontrado.idoperador) {
                localStorage.setItem('idOperador', usuarioEncontrado.idoperador);
                localStorage.setItem('usuario', usuarioEncontrado.usuario);
            }if (usuarioEncontrado.rol) {
                localStorage.setItem('rol', usuarioEncontrado.rol);
                localStorage.setItem('usuario', usuarioEncontrado.usuario);
            }

            onLoginSuccess();
            navigate('/home');
        } else {
            toast.error("Usuario o contraseña incorrectos");
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
            <ToastContainer
        />
        </div>
    );
}

export default LoginForm;