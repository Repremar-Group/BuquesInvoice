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
import ViewEscala from '../escalas/ViewEscala';
import ViewFactura from '../facturas/ViewFactura';
import ParametrosServicios from '../parametros/ParametrosServicios';
import ParametrosPuertos from '../parametros/ParametrosPuertos';
import RutaNoEncontrada from '../modales/RutaNoEncontrada';

function Layout({ isLoggedIn, handleLogin }) {
    const location = useLocation();

    // Verifica la ruta actual para depuración
    console.log('Current Path:', location.pathname);

    // Lógica para no mostrar NavBar en login, rutas no encontradas o rutas de archivos estáticos (como PDF)
    const shouldHideNavBar =
        location.pathname === '/login' ||
        location.pathname === '/' ||
        location.pathname.includes('.pdf'); // Para rutas relacionadas con facturas (ajusta según sea necesario)

    return (
        <>
            {/* Mostrar NavBar solo si no estamos en login ni en una ruta no válida */}
            {!shouldHideNavBar && <NavBar />}

            <Routes>
                {/* Ruta raíz que redirige al login */}
                <Route path="/" element={<Navigate to="/login" />} />
                {/* Ruta de inicio de sesión */}
                <Route path="/login" element={<LoginForm onLoginSuccess={handleLogin} />} />

                {/* Ruta home: Solo accesible si el usuario está logueado */}
                <Route
                    path="/home"
                    element={
                        isLoggedIn ? (
                            <Home isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                {/* Ruta preview escalas */}
                <Route
                    path="/previewescalas"
                    element={
                        isLoggedIn ? (
                            <PreviewEscalas isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                {/* Ruta ViewEscala */}
                <Route
                    path="/ViewEscala/:id"
                    element={
                        isLoggedIn ? (
                            <ViewEscala isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                {/* Ruta ViewFactura */}
                <Route
                    path="/ViewFactura/:id"
                    element={
                        isLoggedIn ? (
                            <ViewFactura isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                {/* Ruta preview facturas */}
                <Route
                    path="/previewfacturas"
                    element={
                        isLoggedIn ? (
                            <PreviewFacturas isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                {/* Otras rutas */}
                <Route
                    path="/facturas/aprobar"
                    element={
                        isLoggedIn ? (
                            <AprobarFacturas isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/facturas/ingresar"
                    element={
                        isLoggedIn ? (
                            <IngresarFacturas isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/estadisticas"
                    element={
                        isLoggedIn ? (
                            <Estadisticas isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/parametros"
                    element={
                        isLoggedIn ? (
                            <Parametros isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/parametros/servicios"
                    element={
                        isLoggedIn ? (
                            <ParametrosServicios isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/parametros/puertos"
                    element={
                        isLoggedIn ? (
                            <ParametrosPuertos isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />

                {/* Ruta por defecto: Redirige a un componente que muestra un mensaje de error */}
                <Route path="*" element={<RutaNoEncontrada />} />
            </Routes>
        </>
    );
}

export default Layout;
