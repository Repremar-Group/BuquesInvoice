import React from 'react';
import "./Navbar.css";
import { Link } from "react-router-dom";
import logo from "../../img/LogoRepremar.png";

const NavBar = () => {
    const handleLogout = () => {
        localStorage.removeItem('idOperador');
        localStorage.removeItem('rol');
        localStorage.removeItem('usuario');
    };
    return (
        <header className="navbar">
            <Link to="/home" className="logoPagina">
                <img src={logo} alt="Home" />
            </Link>

            <nav className="botonesNavBar">

                {/* Botón de Facturacion con submenú */}
                <Link to="/previewescalas"><button className="botonNavBar">Escalas</button></Link>

                {/* Botón de Reportes con submenú */}
                <div className="botonConSubmenu">
                    <Link to="/previewfacturas"><button className="botonNavBar">Facturas</button></Link>
                    <div className="submenu">
                        <Link to="/facturas/aprobar" className="submenuItem">Aprobar</Link>
                        <Link to="/facturas/ingresar" className="submenuItem">Ingresar</Link>
                        
                    </div>
                </div>

                <Link to="/estadisticas"><button className="botonNavBar">Estadisticas</button></Link>

                <div className="botonConSubmenu">
                    <Link to="/parametros"><button className="botonNavBar">Parametros</button></Link>
                    <div className="submenu">
                        <Link to="/parametros/servicios" className="submenuItem">Servicios</Link>
                        <Link to="/parametros/puertos" className="submenuItem">Puertos</Link>
                    </div>
                </div>

                <Link to="/login">
                    <button className="botonNavBar" onClick={handleLogout}>
                        Salir
                    </button>
                </Link>
            </nav>
        </header>
    );
};

export default NavBar;
