import React from 'react';
import { Link } from 'react-router-dom';
import './modales.css';

const ModalBusquedaEscalaAsociada = ({ isOpen, closeModal, filteredEscalas, handleSelectEscala }) => {
  if (!isOpen) return null; // Evita renderizar el modal si no está abierto

  return (
    <div className="modalescalaasociada" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="titulo-estandar">Resultados de Búsqueda</h2>
        {filteredEscalas.length > 0 ? (
          <div className="tabla-container">
            <table className="tabla-escalaasociada">
              <thead>
                <tr>
                  <th>Buque</th>
                  <th>Linea</th>
                  <th>Puerto</th>
                  <th>ETA</th>
                  <th>Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {filteredEscalas.map((itinerario) => (
                  <tr key={itinerario.id}>
                    <td>{itinerario.buque}</td>
                    <td>{itinerario.linea}</td>
                    <td>{itinerario.puerto}</td>
                    <td>{itinerario.eta}</td>
                    <td>
                      <button className="btn-estandartablas" onClick={() => handleSelectEscala(itinerario)}>
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <p className="p_modaltraeritinerarios">No se encontraron escalas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalBusquedaEscalaAsociada;
