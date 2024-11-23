import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import 'react-toastify/dist/ReactToastify.css'; // Importar los estilos de toastify
import './home.css';

const Home = () => {
  const [escalas, setEscalas] = useState([]);
  const [facturasRequiereNC, setFacturasRequiereNC] = useState([]);
  const effectodashboard = useRef(false);
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [comentarios, setComentarios] = useState('');
  const [urlfactura, setUrlFactura] = useState('');


  const openModal = (comentarios, factura) => {
    setComentarios(comentarios);
    setUrlFactura(factura);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    if (effectodashboard.current) return; // Si ya se ejecutó el efecto, salimos

    // Marcar que el efecto ya se ejecutó
    effectodashboard.current = true;

    // Obtener el idOperador desde el localStorage
    const idOperador = localStorage.getItem('idOperador');

    if (idOperador) {
      // Obtener facturas pendientes
      axios
        .get(`http://localhost:5000/api/facturas/pendientes/${idOperador}`)
        .then((response) => {
          const pendientes = response.data.pendientes;

          if (pendientes > 0) {
            toast.error(`Tienes ${pendientes} facturas pendientes.`, {
              autoClose: false,
              onClick: () => navigate('/facturas/aprobar'),
            });
          } else {
            toast.success('No tienes facturas pendientes.', {
              autoClose: false,
            });
          }
        })
        .catch((error) => {
          toast.error('Error al obtener las facturas pendientes.', {
            autoClose: false,
          });
          console.error('Error al consultar las facturas pendientes:', error);
        });

      // Obtener escalas pendientes
      axios
        .get(`http://localhost:5000/api/escalas/pendientes/${idOperador}`)
        .then((response) => {
          setEscalas(response.data);
          console.log(response.data);
        })
        .catch((error) => {
          console.error('Error al obtener las escalas pendientes:', error);
        });
    }

    // Obtener facturas con estado "Requiere Nc" solo si el rol es contable
    const rol = localStorage.getItem('rol');
    if (rol === 'contable') {
      axios
        .get('http://localhost:5000/api/facturas/requierenc')
        .then((response) => {
          setFacturasRequiereNC(response.data);
          console.log(response.data);
        })
        .catch((error) => {
          console.error('Error al obtener las facturas requiere NC:', error);
        });
    }
  }, []);

  // Manejar cambio de checkbox para marcar como reclamadsso
  const handleCheckboxChange = async (idfacturas, checked) => {
    try {
      // Obtener el usuario desde el localStorage
      const ultimoreclamadoncuser = localStorage.getItem('usuario');

      // Obtener la fecha actual en formato ISO
      const fechareclamadonc = new Date().toISOString();

      // Hacer la solicitud PATCH al servidor
      await axios.patch(`http://localhost:5000/api/facturas/${idfacturas}/reclamadonc`, {
        reclamadonc: checked ? 1 : 0,
        ultimoreclamadoncuser,
        fechareclamadonc,
      });

      axios
        .get('http://localhost:5000/api/facturas/requierenc')
        .then((response) => {
          setFacturasRequiereNC(response.data);
          console.log(response.data);
        })
        .catch((error) => {
          console.error('Error al obtener las facturas requiere NC:', error);
        });

      // Notificar al usuario
      toast.success('Factura actualizada correctamente.', {
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Error al actualizar la factura.', {
        autoClose: 3000,
      });
      console.error(error);
    }
  };

  const idOperador = localStorage.getItem('idOperador');
  const rol = localStorage.getItem('rol');

  // Renderizar el dashboard si hay un idOperador
  if (idOperador) {
    return (
      <div className="home-container">
        <div className="home-header">
          <h3>Escalas Pendientes de Aprobación</h3>
        </div>

        {/* Tabla de escalas pendientes */}
        {escalas.length > 0 ? (
          <div className="table-container-ops">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Buque</th>
                  <th>ETA</th>
                  <th>Puerto</th>
                  <th>Facturas Pendientes</th>
                </tr>
              </thead>
              <tbody>
                {escalas.map((escala) => (
                  <tr
                    key={escala.id}
                    className={escala.esurgente !== null ? "urgente" : ""}
                  >
                    <td>{escala.buque}</td>
                    <td>{escala.eta}</td>
                    <td>{escala.puerto}</td>
                    <td>{escala.facturasPendientes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="home-empty-message">No hay escalas pendientes para el operador.</p>
        )}

        <ToastContainer
          position="top-right"
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition="bounce"
        />
      </div>
    );
  }

  // Renderizar las facturas si el rol es contable
  if (rol === 'contable') {


    return (
      <div className="home-container">
        <div className="home-header">
          <h3>Facturas Requieren Nota de Crédito</h3>
        </div>

        {facturasRequiereNC.length > 0 ? (
          <div className="table-container">
            <table className="home-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Moneda</th>
                  <th>Monto</th>
                  <th>Proveedor</th>
                  <th>Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {facturasRequiereNC
                  .sort((a, b) => {
                    // Ordenar primero por reclamadonc (0 arriba, 1 abajo)
                    if (a.reclamadonc !== b.reclamadonc) {
                      return a.reclamadonc - b.reclamadonc;
                    }
                    // Si reclamadonc es igual, ordenar por fecha (descendente)
                    return new Date(a.fecha) - new Date(b.fecha);
                  })
                  .map((factura) => (
                    <tr key={factura.idfacturas}>
                      <td>{factura.numero}</td>
                      <td>{factura.fecha}</td>
                      <td>{factura.moneda}</td>
                      <td>{factura.monto}</td>
                      <td>{factura.proveedor}</td>
                      <td>
                        <button
                          className="action-button"
                          onClick={() => openModal(factura.comentarios, factura.url_factura)}
                        >
                          📃
                        </button>
                      </td>

                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="home-empty-message">
            No hay facturas que requieran Nota de Crédito.
          </p>
        )}
        {modalVisible && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <strong>Comentarios:</strong> {comentarios}
              <h2>Factura</h2>
              <embed
                src={urlfactura}
                type="application/pdf"
                width="100%"
                height="750px"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        )}
        <ToastContainer
        />
      </div>

    );

  }
  if (rol === 'liquidacion') {
    const [escalas, setEscalas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // Hacer la solicitud al endpoint para obtener los datos
    const fetchEscalas = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/obtenerprogresoescalas');
        setEscalas(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error al obtener los datos de escalas:', error);
      }finally {
        setIsLoading(false); // Desactivar spinner cuando la solicitud finalice
      }
    };

    useEffect(() => {
      fetchEscalas(); // Obtener las escalas cuando el componente se monta
    }, []);

    const calcularProgreso = (totalServicios, serviciosFacturados) => {
      if (totalServicios === 0) return 0;
      return (serviciosFacturados / totalServicios) * 100;
    };

    // Función para convertir fecha DD/MM/YYYY a YYYY-MM-DD
    const convertirFecha = (fecha) => {
      const [dia, mes, anio] = fecha.split('/');
      return `${anio}-${mes}-${dia}`;
    };

    // Ordenar las escalas por la fecha ETA antes de mostrarlas
    const escalasOrdenadas = escalas.sort((a, b) => {
      const fechaA = new Date(convertirFecha(a.eta));
      const fechaB = new Date(convertirFecha(b.eta));
      return fechaB - fechaA;
    });

    const handleUrgenteChange = async (escalaId, esUrgente) => {
      try {
        // Hacer una solicitud POST o PUT al backend para actualizar el estado de urgencia
        await axios.post('http://localhost:5000/api/actualizarurgencia', {
          idescala: escalaId,
          esurgente: esUrgente ? 1 : 0, // 1 para urgente, 0 para no urgente
        });

        // Actualizar la lista de escalas después de cambiar el estado de urgencia
        fetchEscalas();

        // Confirmación visual o mensaje de éxito (opcional)
        toast.success(`El estado de urgencia para la escala ${escalaId} se actualizó a ${esUrgente ? 'Urgente' : 'No Urgente'}`);

      } catch (error) {
        console.error('Error al actualizar el estado de urgencia:', error);
        toast.error('Hubo un problema al actualizar el estado de urgencia.');
      }
    };
    return (
      <div>
        {isLoading ? (
          <div className="loading-spinner">
            
          </div>
        ) : (
          <div className="contenedortablaescalaliquidacion">
            <h2>Liquidación de Escalas</h2>
            <table className="escala-table-liquidacion">
              <thead>
                <tr>
                  <th>Buque</th>
                  <th>ETA</th>
                  <th>Progreso</th>
                  <th>Urgente</th>
                </tr>
              </thead>
              <tbody>
                {escalasOrdenadas.map((escala) => (
                  <tr key={escala.escala_id}>
                    <td>{escala.barco}</td>
                    <td>{escala.eta}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '100px', backgroundColor: '#f3f3f3', borderRadius: '10px' }}>
                          <div
                            style={{
                              width: `${calcularProgreso(escala.total_servicios, escala.total_servicios_facturados)}%`,
                              height: '20px',
                              backgroundColor: '#4caf50',
                              borderRadius: '10px',
                            }}
                          />
                        </div>
                        <p style={{ margin: '0', whiteSpace: 'nowrap' }}>
                          {escala.total_servicios_facturados}/{escala.total_servicios}
                        </p>
                      </div>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={escala.total_urgente === 1}
                        onChange={(e) => handleUrgenteChange(escala.escala_id, e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ToastContainer />
      </div>
    );
  }

  return null;
};

export default Home;