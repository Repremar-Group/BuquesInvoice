import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import './previewfacturas.css'; // Importa el archivo CSS
import { Link } from "react-router-dom";

const PreviewEscalas = ({ isLoggedIn }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const [facturas, setFacturas] = useState([]);
  useEffect(() => {
    const lista = [
      { Ingreso: "2024-10-01", Numero: "FAC001", Fecha: "2024-09-25", Moneda: "USD", Monto: 1500, Proveedor: "Proveedor A", Estado: "Pagado", GIA: true },
      { Ingreso: "2024-10-02", Numero: "FAC002", Fecha: "2024-09-26", Moneda: "EUR", Monto: 2300, Proveedor: "Proveedor B", Estado: "Pendiente", GIA: false },
      { Ingreso: "2024-10-03", Numero: "FAC003", Fecha: "2024-09-27", Moneda: "USD", Monto: 1200, Proveedor: "Proveedor C", Estado: "Anulado", GIA: true },
      { Ingreso: "2024-10-04", Numero: "FAC004", Fecha: "2024-09-28", Moneda: "MXN", Monto: 3000, Proveedor: "Proveedor D", Estado: "Pagado", GIA: false },
      { Ingreso: "2024-10-05", Numero: "FAC005", Fecha: "2024-09-29", Moneda: "USD", Monto: 1800, Proveedor: "Proveedor E", Estado: "Pendiente", GIA: true },
      { Ingreso: "2024-10-06", Numero: "FAC006", Fecha: "2024-09-30", Moneda: "EUR", Monto: 1400, Proveedor: "Proveedor F", Estado: "Pagado", GIA: false },
      { Ingreso: "2024-10-07", Numero: "FAC007", Fecha: "2024-10-01", Moneda: "USD", Monto: 2100, Proveedor: "Proveedor G", Estado: "Anulado", GIA: true },
      { Ingreso: "2024-10-08", Numero: "FAC008", Fecha: "2024-10-02", Moneda: "MXN", Monto: 2500, Proveedor: "Proveedor H", Estado: "Pagado", GIA: false },
      { Ingreso: "2024-10-09", Numero: "FAC009", Fecha: "2024-10-03", Moneda: "USD", Monto: 1900, Proveedor: "Proveedor I", Estado: "Pendiente", GIA: true },
      { Ingreso: "2024-10-10", Numero: "FAC010", Fecha: "2024-10-04", Moneda: "EUR", Monto: 2200, Proveedor: "Proveedor J", Estado: "Pagado", GIA: false },
    ];
    setFacturas(lista); // Cargar la lista en el estado
  }, []);

  const [error, setError] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0); // Resetear la página actual al buscar
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const [idAModificar, setIDAModificar] = useState(null); // ID

  const itemsPerPage = 8; // Cambia este número según tus necesidades
  const filteredData = facturas.filter((row) =>
    row.Numero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);



  return (
    <div className="Contenedor_Principal">

      <div className='titulo-estandar'><h1>Facturas</h1></div>

      <div className="table-container">
        <div className="search-bar">
        <Link to="/ingresarfacturas"><button className="add-button">➕</button></Link>
          <input className='input_buscar'
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <table className='tabla-clientes'>
          <thead>
            <tr>
              <th>Ingreso</th>
              <th>Numero</th>
              <th>Fecha</th>
              <th>Moneda</th>
              <th>Monto</th>
              <th>Proveedor</th>
              <th>Estado</th>
              <th>GIA</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((row) => (
              <tr key={row.Id}>
                <td title={row.ingreso}>{row.Ingreso}</td>
                <td title={row.numero}>{row.Numero}</td>
                <td title={row.fecha}>{row.Fecha}</td>
                <td title={row.moneda}>{row.Moneda}</td>
                <td title={row.monto}>{row.Monto}</td>
                <td title={row.proveedor}>{row.Proveedor}</td>
                <td title={row.estado}>{row.Estado}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={row.GIA}
                    disabled // Hace que el checkbox sea solo lectura
                  />
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button" onClick={() => handleModificar(row.Numero, row.FacturaId)}>✏️</button>
                    <button className="action-button" onClick={() => handleEliminar(row.Numero, row.FacturaId)}>❌</button>
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
  )
}

export default PreviewEscalas