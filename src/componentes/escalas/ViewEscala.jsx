import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './viewescala.css';
import { Link } from "react-router-dom";
import axios from 'axios';
import './previewescalas.css';

// Componente para mostrar detalles generales de la escala
const Facturas =({ facturas, searchTerm, handleSearch }) => {
    // Filtrar las facturas que coincidan con el searchTerm
    const filteredFacturas = facturas.filter((factura) => {
      return (
        factura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factura.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
   
    return (
      <div className="view-escala-facturas">
   
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
          <table className="tabla-viewescala">
            <thead>
              <tr>
                <th>Numero</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Proveedor</th>
                <th>Gia</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacturas.map((factura) => (
                <tr key={factura.idfacturas}>
                  <td>{factura.numero}</td>
                  <td>{factura.fecha}</td>
                  <td>{factura.moneda} {factura.monto}</td>
                  <td>{factura.proveedor}</td>
                  <td>
                  <input type="checkbox" checked={!!factura.gia} disabled />
                </td>
                  <td>{factura.url_factura ? <a href={factura.url_factura} target="_blank" >📄</a> : '❌'}</td>
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
   

// Componente para mostrar los servicios y facturas
const Liquidacion = ({ servicios, searchTerm, handleSearch, escala }) => {
  const [estadoFiltro, setEstadoFiltro] = useState('');

  // Filtrar los servicios que coincidan con el estado seleccionado y el término de búsqueda
  const filteredServicios = servicios.filter((servicio) => {
    const matchesEstado = estadoFiltro ? servicio.estado_servicio.toLowerCase() === estadoFiltro.toLowerCase() : true;
    const matchesBusqueda =
      servicio.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (servicio.factura && servicio.factura.toString().includes(searchTerm.toLowerCase()));

    return matchesEstado && matchesBusqueda;
  });
  // Manejar el cambio del select para el filtro de estado
  const handleEstadoChange = (e) => {
    setEstadoFiltro(e.target.value);
  };
  return (
    <div className="view-escala-servicios-facturas">
      <div className='filtros-viewescala'>
        <div className="search-bar">
          <input
            className='input_buscar'
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {/* Filtro por estado de servicio */}
        <div >
          <select className="estado-filtro-viewescala" onChange={handleEstadoChange} value={estadoFiltro}>
            <option value="">Todos</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Requiere NC">Requiere NC</option>
          </select>
        </div>
        <p><strong>Buque:</strong> {escala.buque}</p>
        <p><strong>Linea:</strong> {escala.linea}</p>
        <p><strong>ETA:</strong> {escala.eta}</p>
        <p><strong>Operador:</strong> {escala.operador}</p>
      </div>

      {filteredServicios && filteredServicios.length > 0 ? (
        <table className="tabla-viewescala">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Estado Servicio</th>
              <th>Factura</th>
              <th>NroFactura</th>
              <th>Estado Factura</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {filteredServicios.map((servicio, index) => (
              <tr key={`${servicio.servicio}-${servicio.nro_factura || index}`}>
                <td>{servicio.servicio}</td>
                <td>{servicio.estado_servicio}</td>
                <td>
                  {servicio.pdf ? (
                    <span style={{ color: 'green' }}>✅</span> // Tic verde si el PDF está disponible
                  ) : (
                    <span style={{ color: 'red' }}>❌</span> // Cruz roja si no hay PDF
                  )}
                </td>
                <td>{servicio.factura}</td>
                <td>{servicio.estado_factura}</td>
                <td>{servicio.pdf ? <a href={servicio.pdf} target="_blank" >📄</a> : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No se encontraron servicios asociados a esta escala.</p>
      )}

      <Link to="/previewescalas"><button className="btn-estandar">Volver</button></Link>
    </div>
  );
};

const ViewEscala = () => {
  const { id } = useParams();
  const [escala, setEscala] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [activeTab, setActiveTab] = useState('Liquidacion');
  const [error, setError] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    // Obtener los detalles de la escala
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
        console.log(response.data);
      } catch (err) {
        console.error('Error al obtener las facturas:', err);
        setError('Error al obtener las facturas');
      }
    };
    

    // Obtener los servicios y facturas
    const fetchServiciosYFacturas = async () => {
      const idStr = String(id); // Convierte a string si es necesario
      try {
        const response = await axios.get(`http://localhost:5000/api/viewescalaservicios/${idStr}`);
        console.log('Respuesta del servidor:', response.data);
        setServicios(response.data.servicios); // Actualizar el estado con los servicios obtenidos
      } catch (err) {
        console.error('Error al obtener los servicios y facturas:', err);
        setError('Error al obtener los servicios y facturas');
      }
    };

    fetchEscala();
    fetchFacturas();
    fetchServiciosYFacturas();
  }, [id]);

  if (!escala) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="view-escala-container">
      <h3 className="titulo-estandar">Detalles de la Escala {escala.buque} {escala.eta}</h3>
      <nav className="view-escala-navbar">
        <ul>
        <li>
            <button
              className={activeTab === 'Liquidacion' ? 'view-escala-nav-button active' : 'view-escala-nav-button'}
              onClick={() => setActiveTab('Liquidacion')}
            >
              Liquidación
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
        {activeTab === 'facturas' && <Facturas facturas={facturas} searchTerm={searchTerm} handleSearch={handleSearch} />}
        {activeTab === 'Liquidacion' && <Liquidacion servicios={servicios} searchTerm={searchTerm} handleSearch={handleSearch} escala = {escala} />}
      </div>
    </div>
  );
};

export default ViewEscala;
