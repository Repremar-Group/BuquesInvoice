import React, { useState, useEffect } from 'react';
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
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [escalaAModificar, setEscalaAModificar] = useState(null); // Buque
  const [idAModificar, setIDAModificar] = useState(null); // ID
  const [escalas, setEscalas] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    const fetchEscalas = async () => {
      try {
        setLoading(true); // Activar indicador de carga
        const response = await axios.get('http://localhost:5000/api/previewescalas');
        setEscalas(response.data); // Guardar los datos en el estado
        console.log(response.data);
      } catch (err) {
        console.error('Error al obtener las escalas:', err);
        setError('Error al obtener las escalas');
      } finally {
        setLoading(false); // Desactivar indicador de carga
      }
    };

    fetchEscalas();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAgregarServiciosEscala = (buque, escalaId, idPuerto) => {
    setIsLoadingModal(true);
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
            console.log('Segundo log', idPuerto);
            const response1 = await axios.get(`http://localhost:5000/api/obtenerserviciospuertos/${idPuerto}`);

            let serviciosTransformados = response1.data.map(servicio => ({
              nombre: servicio.nombre,
              idescala: escalaId
            }));
            console.log('Datos enviados al servidor:', serviciosTransformados);

            const response2 = await axios.post('http://localhost:5000/api/insertserviciospuertos', {
              servicios: serviciosTransformados
            });
            setServicios([]);
          } catch (error) {
            console.error('Error al obtener servicios puertos:', error);
          }
        }
      } catch (error) {
        console.error('Error al obtener servicios:', error);
      } finally {
        setIsLoadingModal(false);
        setIsModalOpen(true);
      }
    };

    fetchServicios();
  };

  const closeModalAgregarServiciosEscala = () => {
    setIsModalOpen(false);
  };

  const filteredData = escalas.filter((row) =>
    row.buque.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (loading) {
    // Mostrar indicador mientras se cargan los datos
    return <div className="loading-spinner"></div>;
  }

  if (error) {
    // Mostrar error si ocurre
    return <div className="error">{error}</div>;
  }

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
        <div className="contenedor-tabla-viewescala">
          <table className='tabla-escalas'>
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
              {filteredData.map((row) => (
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
        </div>
        {isLoadingModal && (
          <div className="modal-overlay-spinner active">
            <div className="loading-spinner"></div>
          </div>
        )}

        {!isLoadingModal && isModalOpen && (
          <div className="modal-overlay active" onClick={closeModalAgregarServiciosEscala}>
            <div className="modal-container active" onClick={(e) => e.stopPropagation()}>
              <EscalaListaServicios id={idAModificar} closeModal={closeModalAgregarServiciosEscala} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewEscalas;
