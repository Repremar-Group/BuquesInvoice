import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import './previewescalas.css'; // Importa el archivo CSS
import { Link } from "react-router-dom";
import axios from 'axios'; // Importa axios para hacer la solicitud HTTP
import EscalaListaServicios from './EscalaListaServicios';

const PreviewEscalas = ({ isLoggedIn }) => {
  // Estado para el modal
  const [isModalOpenVerEscala, setIsModalOpenVerEscala] = useState(false);
  const [selectedEscala, setSelectedEscala] = useState(null);

  const handleOpenModal = (escala) => {
    setSelectedEscala(escala);
    setIsModalOpenVerEscala(true);
  };

  const handleCloseModal = () => {
    setIsModalOpenVerEscala(false);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Estado para almacenar la visibilidad del modal y el elemento seleccionado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [escalaAModificar, setEscalaAModificar] = useState(null); // Buque

  const [idAModificar, setIDAModificar] = useState(null); // ID

  const [escalas, setEscalas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEscalas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/previewescalas'); // Solicitar datos al backend
        setEscalas(response.data); // Guardar los datos en el estado
        console.log(response.data);
      } catch (err) {
        console.error('Error al obtener los itinerarios:', err);
        setError('Error al obtener los itinerarios'); // Manejar el error
      }
    };
    fetchEscalas();
  }, []); // El useEffect se ejecuta solo una vez cuando el componente se monta



  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0); // Resetear la página actual al buscar
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };
  const [servicios, setServicios] = useState([]);
  const handleAgregarServiciosEscala = (buque, escalaId, idPuerto) => {
    setIDAModificar(escalaId);

    setEscalaAModificar(buque);
    const fetchServicios = async () => {
      try {
        console.log(escalaId);
        const response = await axios.get(`http://localhost:5000/api/obtenerserviciosescala?escalaId=${escalaId}`);
        console.log('resultado obtener servicios de la escala', response.data);
        setServicios(response.data);

        if (response.data.length === 0) {
          console.log("La variable 'servicios' está vacía.");
          try {
            console.log('Segundo log', idPuerto); // Verificar el puerto
            const response1 = await axios.get(`http://localhost:5000/api/obtenerserviciospuertos/${idPuerto}`);

            // Transformar el listado para solo tener 'nombre' y 'idescala'
            let serviciosTransformados = response1.data.map(servicio => ({
              nombre: servicio.nombre,
              idescala: escalaId  // idescala es igual a escala.id
            }));
            console.log('lista modificada', serviciosTransformados);  // Ver el listado transformado
            console.log('lista sin modificar', response1.data); // Ver los datos originales que trae la API

            console.log('Datos enviados al servidor:', serviciosTransformados);
            // Cambiar el formato enviado al servidor
            const response2 = await axios.post('http://localhost:5000/api/insertserviciospuertos', {
              servicios: serviciosTransformados
            })
            serviciosTransformados = [];
            console.log('serviciosTransformados después de resetear:', serviciosTransformados);
            setServicios([]);
            console.log('servicios después de resetear:', servicios);

          } catch (error) {
            console.error('Error al obtener servicios puertos:', error);
          }

        } else {
          console.log("La variable 'servicios' tiene datos.");
        }
      } catch (error) {
        console.error('Error al obtener servicios:', error);
      }
    }
    fetchServicios();
    setIsModalOpen(true); // Establecer modal como abierto
  };

  const closeModalAgregarServiciosEscala = () => {
    setIsModalOpen(false);
  };

  const itemsPerPage = 8; // Cambia este número según tus necesidades
  const filteredData = escalas.filter((row) =>
    row.buque.toLowerCase().includes(searchTerm.toLowerCase())
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
              <th>Puerto</th>
              <th>Operador</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((row) => (
              <tr key={row.id}>
                <td title={row.EscalaId}>{row.id}</td>
                <td title={row.Buque} >{row.buque}</td>
                <td title={row.Linea} >{row.linea}</td>
                <td title={row.ETA} >{row.eta}</td>
                <td title={row.Puerto} >{row.puerto}</td>
                <td title={row.Operador} >{row.operador}</td>
                <td>
                  <div className="action-buttons">
                    <Link to={`/ViewEscala/${row.id}`}><button className="action-button" title="Ver Escala">🔎</button></Link>
                    <button className="action-button" onClick={() => handleAgregarServiciosEscala(row.buque, row.id, row.id_puerto)}>📃</button>
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
  );
}

export default PreviewEscalas;
