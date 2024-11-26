import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './previewescalas.css';
import { environment } from '../../environment';

const EscalaListaServicios = ({ id, closeModal }) => {

  const [serviciomodal, setServicioModal] = useState('');
  const [nombre, setSNombre] = useState('');
  const [serviciosmodal, setServiciosModal] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState('');

  const itemsPerPage = 500;

  useEffect(() => {
      fetchServiciosModal(id);
  }, []);

  const fetchServiciosModal = async () => {
    try {
      console.log(id);
      const response = await axios.get(`${environment.API_URL}obtenerserviciosescala?escalaId=${id}`);
      console.log('log en modal', response.data);
      setServiciosModal(response.data);
      console.log('serviciomodal', serviciosmodal);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
    }
  }
 

  const handleAgregarServicio = async (e) => {
      e.preventDefault();
      try {
        const idescala = id;
        const nombre = serviciomodal;
        await axios.post(`${environment.API_URL}escalas/agregarservicio`, { idescala, nombre });
          setServicioModal('');
      } catch (error) {
          setError('Error al agregar el servicio');
          console.error(error);
      } finally {
        fetchServiciosModal(idescala);
        console.log('finally lpm que ande')
      }
  };

  const handleEliminarServicio = async (idServicio) => {
    try {
        const response = await axios.delete(`${environment.API_URL}escalas/eliminarservicio/${idServicio}`);
        console.log(response.data);  // Verifica la respuesta del servidor
    } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        setError('Error al eliminar el servicio');
    }
  };

  const filteredData = serviciosmodal;


  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handlePageClick = (event) => {
      setCurrentPage(event.selected);
  };

  return (
    <div className="modal-servicios">
      <div className='titulo-estandar'><h1>Servicios</h1></div>

      <div className='table-container'>
        <form onSubmit={handleAgregarServicio} >
          <div className='div-parametros'>
            <input className='input_buscar'
              type="text"
              placeholder="Agregar Servicio"
              value={serviciomodal}
              onChange={(e) => setServicioModal(e.target.value)}
            />
            <button type='submit' className="add-button">➕</button>
          </div>
        </form>

        <table className='tabla-parametros'>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((row) => (
              <tr key={row.idservicio}>
                <td>{row.nombre}</td>
                <td>
                  <button className="action-button" onClick={() => handleEliminarServicio(row.idservicio)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};
export default EscalaListaServicios