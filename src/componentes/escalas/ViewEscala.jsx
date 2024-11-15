import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './viewescala.css';
import { Link } from "react-router-dom";
import axios from 'axios'; // Importa axios para hacer la solicitud HTTP
import './previewescalas.css';


// Componente para mostrar detalles generales de la escala
const General = ({ escala }) => (
  <div className="view-escala-general">
    <p><strong>Buque:</strong> {escala.buque}</p>
    <p><strong>Linea:</strong> {escala.linea}</p>
    <p><strong>ETA:</strong> {escala.eta}</p>
    <p><strong>Operador:</strong> {escala.operador}</p>
    <Link to="/previewescalas"><button className="btn-estandar">Volver</button></Link>
  </div>
);



// Componente para mostrar Facturas
const Facturas = ({ facturas, searchTerm, handleSearch }) => {
  // Filtrar las facturas que coincidan con el searchTerm
  const filteredFacturas = facturas.filter((factura) => {
    return (
      factura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="view-escala-facturas">
      <h3>Facturas</h3>

      <div className="search-bar">
        <input 
          className='input_buscar'
          type="text"
          placeholder="Buscar"
          value={searchTerm}  // Usa el searchTerm pasado como prop
          onChange={handleSearch}  // Usa el handleSearch pasado como prop
        />
      </div>

      {filteredFacturas && filteredFacturas.length > 0 ? (
        <table className="tabla-clientes">
          <thead>
            <tr>
              <th>Numero</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Proveedor</th>
            </tr>
          </thead>
          <tbody>
            {filteredFacturas.map((factura) => (
              <tr key={factura.idfacturas}>
                <td>{factura.numero}</td>
                <td>{factura.fecha}</td>
                <td>{factura.moneda} {factura.monto}</td>
                <td>{factura.proveedor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No se encontraron facturas para esta escala.</p>
      )}
      <Link to="/previewescalas"><button className="btn-estandar">Volver</button></Link>
    </div>
  );
};

const ViewEscala = () => {
  const { id } = useParams();
  const [escala, setEscala] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [error, setError] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const fetchEscala = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/viewescala/${id}`);
        setEscala(response.data);
      } catch (err) {
        console.error('Error al obtener la escala:', err);
        setError('Error al obtener los detalles de la escala');
      }
    };

    const fetchFacturas = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/viewescalafacturas/${id}`);
        setFacturas(response.data);
      } catch (err) {
        console.error('Error al obtener las facturas:', err);
        setError('Error al obtener las facturas');
      }
    };

    fetchEscala();
    fetchFacturas();

  }, [id]);

  if (!escala) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="view-escala-container">
      <h3 className="titulo-estandar">Detalles de la Escala {escala.buque} {escala.eta}</h3>
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
              className={activeTab === 'facturas' ? 'view-escala-nav-button active' : 'view-escala-nav-button'}
              onClick={() => setActiveTab('facturas')}
            >
              Facturas
            </button>
          </li>
        </ul>
      </nav>

      {/* Contenido según la pestaña seleccionada */}
      <div className="view-escala-tab-content">
        {activeTab === 'general' && <General escala={escala} />}
        {activeTab === 'facturas' && <Facturas facturas={facturas} searchTerm={searchTerm} handleSearch={handleSearch} />}
      </div>
    </div>
  );
};

export default ViewEscala;