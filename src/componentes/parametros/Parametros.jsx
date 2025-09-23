import React from 'react';
import { useNavigate } from 'react-router-dom';
import './parametros.css';

const Parametros = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="formularioschicos">
      <div className="titulo-estandar">
        <h1>Parámetros</h1>
      </div>

      <div className="botones-parametros">
        <button
          className="btn-estandar"
          onClick={() => navigate('/parametros/servicios')}
        >
          Servicios
        </button>

        <button
          className="btn-estandar"
          onClick={() => navigate('/parametros/puertos')}
        >
          Puertos
        </button>

        <button
          className="btn-estandar"
          onClick={() => navigate('/parametros/temporada')}
        >
          Temporada
        </button>
      </div>
    </div>
  );
};

export default Parametros;