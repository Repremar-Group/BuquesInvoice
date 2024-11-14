import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios'; // Asegúrate de instalar axios
import './previewfacturas.css';
import { Link } from "react-router-dom";

const PreviewEscalas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [facturas, setFacturas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Llama al backend para obtener las facturas
    const fetchFacturas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/previewfacturas'); // Cambia la URL si es necesario
        setFacturas(response.data);
      } catch (err) {
        console.error('Error al obtener facturas:', err);
        setError('No se pudieron cargar las facturas.');
      }
    };

    fetchFacturas();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0);
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const itemsPerPage = 8;
  const filteredData = Array.isArray(facturas)
  ? facturas.filter((row) =>
      row.numero && row.numero.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="Contenedor_Principal">
      <div className='titulo-estandar'><h1>Facturas</h1></div>
      <div className="table-container">
        <div className="search-bar">
          <Link to="/facturas/ingresar"><button className="add-button">➕</button></Link>
          <input
            className='input_buscar'
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <table className='tabla-clientes'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Numero</th>
              <th>Fecha</th>
              <th>Moneda</th>
              <th>Monto</th>
              <th>Escala Asociada</th>
              <th>Proveedor</th>
              <th>Estado</th>
              <th>GIA</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((row) => (
              <tr key={row.idfacturas}>
                <td>{row.idfacturas}</td>
                <td>{row.numero}</td>
                <td>{row.fecha}</td>
                <td>{row.moneda}</td>
                <td>{row.monto}</td>
                <td>{row.escala_asociada}</td>
                <td>{row.proveedor}</td>
                <td>{row.estado}</td>
                <td>
                  <input type="checkbox" checked={!!row.gia} disabled />
                </td>
                <td>
                  <div className="action-buttons">
                    <Link to={`/ViewFactura/${row.numero}`}><button className="action-button">🔎</button></Link>
                    <button className="action-button" onClick={() => handleModificar(row.numero)}>✏️</button>
                    <button className="action-button" onClick={() => handleEliminar(row.numero)}>❌</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ReactPaginate
          previousLabel={"Anterior"}
          nextLabel={"Siguiente"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
        />
      </div>
    </div>
  );
};

export default PreviewEscalas;
