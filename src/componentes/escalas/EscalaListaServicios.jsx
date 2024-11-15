import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './previewescalas.css';

const EscalaListaServicios = ({ id, closeModal }) => {

  const [servicio, setServicio] = useState('');
  const [nombre, setSNombre] = useState('');
  const [servicios, setServicios] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState('');

  const itemsPerPage = 25;

  useEffect(() => {
      fetchServicios(id);
  }, []);

  const fetchServicios = async () => {
    try {
      console.log(id);
      const response = await axios.get(`http://localhost:5000/api/obtenerserviciosescala?escalaId=${id}`);
      console.log(response.data);
      setServicios(response.data);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
    }
  }
 

  const handleAgregarServicio = async (e) => {
      e.preventDefault();
      try {
        await axios.post('http://localhost:5000/api/escalas/agregarservicio', { id, servicio });
          setServicio('');
          fetchServicios();
      } catch (error) {
          setError('Error al agregar el servicio');
          console.error(error);
      }
  };

  const handleEliminarServicio = async (idServicio) => {
    try {
        const response = await axios.delete(`http://localhost:5000/api/escalas/eliminarservicio/${idServicio}`);
        console.log(response.data);  // Verifica la respuesta del servidor
        fetchServicios();
    } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        setError('Error al eliminar el servicio');
    }
  };

  const filteredData = servicios.filter((row) =>
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
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
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