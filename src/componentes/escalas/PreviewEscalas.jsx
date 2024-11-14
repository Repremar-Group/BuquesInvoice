import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import './previewescalas.css'; // Importa el archivo CSS
import { Link } from "react-router-dom";
import EscalaListaServicios from './EscalaListaServicios';

const PreviewEscalas = ({ isLoggedIn }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Estado para almacenar la visibilidad del modal y el elemento seleccionado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [escalaAModificar, setEscalaAModificar] = useState(null); // Buque

  const [idAModificar, setIDAModificar] = useState(null); // ID

  const [escalas, setEscalas] = useState([]);
  useEffect(() => {
    const lista = [
      { EscalaId: 1, Buque: "Evergreen", Linea: "Evergreen Line", ETA: "2024-11-01", Operador: "Carlos Pérez" },
      { EscalaId: 2, Buque: "MSC Zoe", Linea: "Mediterranean Shipping Company", ETA: "2024-11-03", Operador: "María Gómez" },
      { EscalaId: 3, Buque: "Maersk Triple E", Linea: "Maersk Line", ETA: "2024-11-05", Operador: "Juan Torres" },
      { EscalaId: 4, Buque: "HMM Algeciras", Linea: "HMM", ETA: "2024-11-07", Operador: "Lucía Sánchez" },
      { EscalaId: 5, Buque: "CMA CGM Marco Polo", Linea: "CMA CGM", ETA: "2024-11-09", Operador: "Miguel Fernández" },
      { EscalaId: 6, Buque: "COSCO Shipping Taurus", Linea: "COSCO", ETA: "2024-11-11", Operador: "Laura Martínez" },
      { EscalaId: 7, Buque: "OOCL Hong Kong", Linea: "OOCL", ETA: "2024-11-13", Operador: "Pedro Ruiz" },
      { EscalaId: 8, Buque: "APL Temasek", Linea: "APL", ETA: "2024-11-15", Operador: "Ana López" },
      { EscalaId: 9, Buque: "Yang Ming World", Linea: "Yang Ming", ETA: "2024-11-17", Operador: "Sofía Jiménez" },
      { EscalaId: 10, Buque: "Hanjin Scarlet", Linea: "Hanjin Shipping", ETA: "2024-11-19", Operador: "José Herrera" },
    ];
    setEscalas(lista); // Cargar la lista en el estado
  }, []);
  const [error, setError] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0); // Resetear la página actual al buscar
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleAgregarServiciosEscala = (buque, id) => {
    setIDAModificar(id);
    setEscalaAModificar(buque);
    setIsModalOpen(true); // Establecer modal como abierto
  };

  const closeModalAgregarServiciosEscala = () => {
    setIsModalOpen(false);
  };

  const itemsPerPage = 8; // Cambia este número según tus necesidades
  const filteredData = escalas.filter((row) =>
    row.Buque.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);



  return (
    <div className="Contenedor_Principal">

      <div className='titulo-estandar'><h1>Escalas</h1></div>

      <div className="table-container">
        <div className="search-bar">
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
              <th>Id</th>
              <th>Buque</th>
              <th>Linea</th>
              <th>ETA</th>
              <th>Operador</th>
              <th>Servicios</th>

            </tr>
          </thead>
          <tbody>
            {displayedItems.map((row) => (
              <tr key={row.Id}>
                <td title={row.escalaid}>{row.EscalaId}</td>
                <td title={row.buque}>{row.Buque}</td>
                <td title={row.linea}>{row.Linea}</td>
                <td title={row.eta}>{row.ETA}</td>
                <td title={row.operador}>{row.Operador}</td>
                <td>
                  <div className="action-buttons">
                    <Link to={`/ViewEscala/${row.Id}`}><button className="action-button" title="Ver Escala">🔎</button></Link>
                   <button className="action-button" onClick={() => handleAgregarServiciosEscala(row.buque, row.id)}>📃</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Modal Agregar Servicios */}
        {isModalOpen && (
          <div className="modal-overlay active" onClick={closeModalAgregarServiciosEscala}>
            <div className="modal-container active" onClick={(e) => e.stopPropagation()}>
              <EscalaListaServicios id={idAModificar} closeModal={closeModalAgregarServiciosEscala} />
            </div>
          </div>
        )}

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