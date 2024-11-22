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


  const openModal = (comentarios) => {
    setComentarios(comentarios);
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

      // Actualizar el estado local de las facturas
      setFacturasRequiereNC((prevFacturas) =>
        prevFacturas.map((factura) =>
          factura.idfacturas === idfacturas
            ? {
              ...factura,
              reclamadonc: checked ? 1 : 0,
              ultimoreclamadoncuser,
              fechareclamadonc,
            }
            : factura
        )
      );

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
          <div className="table-container">
            <table className="home-table">
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
                  <tr key={escala.id}>
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
                  <th>Reclamado NC</th>
                </tr>
              </thead>
              <tbody>
                {facturasRequiereNC.map((factura) => (
                  <tr key={factura.idfacturas}>
                    <td>{factura.numero}</td>
                    <td>{factura.fecha}</td>
                    <td>{factura.moneda}</td>
                    <td>{factura.monto}</td>
                    <td>{factura.proveedor}</td>
                    <td><button
                      className="action-button"
                      onClick={() => openModal(factura.comentarios)}
                    >
                      📃
                    </button></td>
                    <td>
                      <input
                        type="checkbox"
                        checked={factura.reclamadonc === 1}
                        disabled={factura.reclamadonc === 1}
                        onChange={(e) =>
                          handleCheckboxChange(factura.idfacturas, e.target.checked)
                        }
                      />
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
            <h2>Comentarios</h2>
            <p>{comentarios}</p>
          </div>
        </div>
      )}
        <ToastContainer
        />
      </div>
      
    );
    
  }

  return null;
};

export default Home;