import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from '../navbar/Navbar';
import LoginForm from '../login/LoginForm';
import Home from '../home/Home';
import PreviewEscalas from '../escalas/PreviewEscalas';
import AprobarFacturas from '../facturas/AprobarFacturas';
import IngresarFacturas from '../facturas/IngresarFacturas';
import Estadisticas from '../estadisticas/Estadisticas';
import Parametros from '../parametros/Parametros';
import PreviewFacturas from '../facturas/PreviewFacturas';


function Layout({ isLoggedIn, handleLogin }) {
    const location = useLocation();

    return (
        <>
            {/* Mostrar NavBar solo si no estamos en la página de login */}
            {location.pathname !== '/' && <NavBar />}

            <Routes>
                {/* Ruta de inicio de sesión */}
                <Route path="/" element={<LoginForm onLoginSuccess={handleLogin} />} />

                {/* Ruta home: Solo accesible si el usuario está logueado */}
                <Route
                    path="/home"
                    element={
                        isLoggedIn ? (
                            <Home isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />
                {/* Ruta preview escalas: Solo accesible si el usuario está logueado */}
                <Route
                    path="/previewescalas"
                    element={
                        isLoggedIn ? (
                            <PreviewEscalas isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />
                {/* Ruta preview facturas: Solo accesible si el usuario está logueado */}
                <Route
                    path="/previewfacturas"
                    element={
                        isLoggedIn ? (
                            <PreviewFacturas isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />
                <Route
                    path="/facturas/aprobar"
                    element={
                        isLoggedIn ? (
                            <AprobarFacturas isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />
                <Route
                    path="/facturas/ingresar"
                    element={
                        isLoggedIn ? (
                            <IngresarFacturas isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />
                <Route
                    path="/estadisticas"
                    element={
                        isLoggedIn ? (
                            <Estadisticas isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />
                <Route
                    path="/parametros"
                    element={
                        isLoggedIn ? (
                            <Parametros isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />



                {/* Ruta por defecto: Redirige al login si no se encuentra la ruta */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
}

export default Layout;
