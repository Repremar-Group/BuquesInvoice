// src/components/Modal.js
import React from 'react';


const ModalVerEscala = ({ isOpen, escala, closeModal }) => {
  if (!isOpen) return null; // Si el modal no está abierto, no se renderiza nada

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Detalles de la Escala</h2>
        {escala && (
          <div>
            <p><strong>Id:</strong> {escala.EscalaId}</p>
            <p><strong>Buque:</strong> {escala.Buque}</p>
            <p><strong>Línea:</strong> {escala.Linea}</p>
            <p><strong>ETA:</strong> {escala.ETA}</p>
            <p><strong>Operador:</strong> {escala.Operador}</p>
          </div>
        )}
        <button onClick={closeModal}>Cerrar</button>
      </div>
    </div>
  );
};

export default ModalVerEscala;
