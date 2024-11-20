import React, { useState } from 'react';
import './LoginForm.css';
import logo from './LogoRepremar.png';
import { useNavigate } from 'react-router-dom';


const LoginForm = ({ onLoginSuccess }) => {
    const [usuario, setUsuario] = useState("");
    const [contraseña, setContraseña] = useState("");
    const navigate = useNavigate();

    // Array de usuarios válidos
    const usuariosValidos = [
        { usuario: "admin", contraseña: "admin" },
        { usuario: "jpgomez", contraseña: "jpg0mez1372" },
        { usuario: "gdelossantos", contraseña: "gd3lossant0s41372" },
        { usuario: "rbalbuena", contraseña: "rb4lbuen41372" },
        { usuario: "lpatetta", contraseña: "lp4tet41372" },
        { usuario: "tloustalet", contraseña: "tl0ust4let1372" },
        { usuario: "idossantos", contraseña: "id0sant0s1372" },
        { usuario: "dremigio", contraseña: "dr3mig1o1372" },
        { usuario: "pporra", contraseña: "pp0rr41372" },
        { usuario: "jchaud", contraseña: "jc4ud1372" },
        { usuario: "sdacosta", contraseña: "sd4cost41372" }
    ];
    // Manejar el evento de submit
    const handleSubmit = (e) => {
        e.preventDefault(); // Evita la recarga de la página

        // Verificar si el usuario existe en el array
        const usuarioEncontrado = usuariosValidos.find(
            (u) => u.usuario === usuario && u.contraseña === contraseña
        );

        if (usuarioEncontrado) {
            onLoginSuccess(); // Llama a la función de login exitoso pasada desde el componente principal
            navigate('/home');


        } else {
            alert("Usuario o contraseña incorrectos");
        }
    };

    return (
        <div className='Login'>
            <form className= 'formularioschicos' onSubmit={handleSubmit}>
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
        </div>
    );
}

export default LoginForm;