import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './viewfactura.css';
import { Link } from "react-router-dom";

// Componente para mostrar detalles generales de la escala
const General = ({ escala }) => (
  <div className="view-escala-general">
    <p><strong>Buque:</strong> {escala.Buque}</p>
    <p><strong>Linea:</strong> {escala.Linea}</p>
    <p><strong>ETA:</strong> {escala.ETA}</p>
    <p><strong>Operador:</strong> {escala.Operador}</p>
    <Link to="/previewescalas"><button className="btn-estandar">Volver</button></Link>
  </div>
);

// Componente para mostrar Proforma
const Proforma = () =>
  <div className="view-escala-proforma">
    <h3>Proforma</h3>
    <p>Contenido de la proforma...</p>
    <Link to="/previewescalas"><button className="btn-estandar">Volver</button></Link>
  </div>;

// Componente para mostrar Facturas
const Facturas = () =>
  <div className="view-escala-facturas">
    <h3>Facturas</h3>
    <p>Contenido de las facturas...</p>
    <Link to="/previewescalas"><button className="btn-estandar">Volver</button></Link>
  </div>;

// Componente para mostrar Saldos
const Saldos = () =>
  <div className="view-escala-saldos">
    <h3>Saldos</h3>
    <p>Contenido de los saldos...</p>
    <Link to="/previewescalas"><button className="btn-estandar">Volver</button></Link>
  </div>;

// Componente para mostrar Itinerario PDF
const ItinerarioPDF = () =>
  <div className="view-escala-itinerario">
    <h3>Itinerario PDF</h3>
    <p>Contenido del itinerario PDF...</p>
    <Link to="/previewescalas"><button className="btn-estandar">Volver</button></Link>
  </div>;

const ViewFactura = () => {
  const { id } = useParams(); // Obtener el ID de la URL
  const [escala, setEscala] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // Estado para la pestaña activa

  useEffect(() => {
    // Aquí puedes hacer una solicitud para obtener los detalles de la escala
    const escalaEncontrada = {
      EscalaId: id,
      Buque: "Evergreen",
      Linea: "Evergreen Line",
      ETA: "2024-11-01",
      Operador: "Carlos Pérez"
    };

    setEscala(escalaEncontrada);
  }, [id]);

  if (!escala) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="view-escala-container">
      <h3 className='titulo-estandar'>Detalles de la Escala {escala.EscalaId}</h3>
      {/* Navbar */}
      <nav className="view-escala-navbar">
        <ul>
          <li>
            <button
              className={activeTab === 'general' ? 'view-escala-nav-button active' : 'view-escala-nav-button'}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
          </li>
          <li>
            <button
              className={activeTab === 'proforma' ? 'view-escala-nav-button active' : 'view-escala-nav-button'}
              onClick={() => setActiveTab('proforma')}
            >
              Proforma
            </button>
          </li>
          <li>
            <button
              className={activeTab === 'facturas' ? 'view-escala-nav-button active' : 'view-escala-nav-button'}
              onClick={() => setActiveTab('facturas')}
            >
              Facturas
            </button>
          </li>
          <li>
            <button
              className={activeTab === 'saldos' ? 'view-escala-nav-button active' : 'view-escala-nav-button'}
              onClick={() => setActiveTab('saldos')}
            >
              Saldos
            </button>
          </li>
          <li>
            <button
              className={activeTab === 'itinerario' ? 'view-escala-nav-button active' : 'view-escala-nav-button'}
              onClick={() => setActiveTab('itinerario')}
            >
              Itinerario PDF
            </button>
          </li>
        </ul>
      </nav>

      {/* Contenido según la pestaña seleccionada */}
      <div className="view-escala-tab-content">
        {activeTab === 'general' && <General escala={escala} />}
        {activeTab === 'proforma' && <Proforma />}
        {activeTab === 'facturas' && <Facturas />}
        {activeTab === 'saldos' && <Saldos />}
        {activeTab === 'itinerario' && <ItinerarioPDF />}
      </div>
    </div>
  );
};

export default ViewFactura;