import React from 'react';
import "./Navbar.css";
import { Link } from "react-router-dom";
import logo from "../../img/LogoRepremar.png";

const NavBar = () => {
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
                    <button className="botonNavBar">Facturas</button>
                    <div className="submenu">
                        <Link to="/facturas/aprobar" className="submenuItem">Aprobar</Link>
                        <Link to="/facturas/ingresar" className="submenuItem">Ingresar</Link>
                    </div>
                </div>

                <Link to="/estadisticas"><button className="botonNavBar">Estadisticas</button></Link>

                <Link to="/parametros"><button className="botonNavBar">Parametros</button></Link>

                <Link to="/logout"><button className="botonNavBar">Salir</button></Link>
            </nav>
        </header>
    );
};

export default NavBar;
