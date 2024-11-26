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
  const idEscala = id
  const itemsPerPage = 2000;

  useEffect(() => {
      fetchServiciosModal();
  }, []);

  const fetchServiciosModal = async () => {
    try {
      console.log(idEscala);
      const response = await axios.get(`${environment.API_URL}obtenerserviciosescala?escalaId=${idEscala}`);
      console.log('log en modal', response.data);
      setServiciosModal(response.data);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
    }
  }
 

  const handleAgregarServicio = async (e) => {
    e.preventDefault();
    const servicio = serviciomodal;
    try {
        const response = await axios.post(
            `${environment.API_URL}escalas/agregarservicio`,
            { idEscala, servicio }
        );
        console.log('Servicio agregado:', response.data); // Asegúrate de verificar la respuesta
        setServicioModal('');
        await fetchServiciosModal(); // Espera hasta que se obtengan los nuevos servicios
    } catch (error) {
        setError('Error al agregar el servicio');
        console.error(error);
    }
};
  const handleEliminarServicio = async (idServicio) => {
    try {
        const response = await axios.delete(`${environment.API_URL}escalas/eliminarservicio/${idServicio}`);
        console.log(response.data);  // Verifica la respuesta del servidor
        fetchServiciosModal();
    } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        setError('Error al eliminar el servicio');
    }
  };

  const filteredData = serviciosmodal.filter((row) =>
      row.nombre.toLowerCase().includes(nombre.toLowerCase())
  );

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
            {serviciosmodal.map((row) => (
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