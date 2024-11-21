import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';  // Importar useNavigate
import 'react-toastify/dist/ReactToastify.css';  // Importar los estilos de toastify

const Home = () => {
  const [escalas, setEscalas] = useState([]);
  const effectoperador = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (effectoperador.current) return; // Si ya se ejecutó el efecto, salimos

    // Marcar que el efecto ya se ejecutó
    effectoperador.current = true;

    // Obtener el idOperador desde el localStorage
    const idOperador = localStorage.getItem('idOperador');

    if (idOperador) {
      // Hacer la solicitud al backend para obtener las facturas pendientes
      axios.get(`http://localhost:5000/api/facturas/pendientes/${idOperador}`)
        .then(response => {
          const pendientes = response.data.pendientes;

          // Mostrar la tostada si hay facturas pendientes
          if (pendientes > 0) {
            toast.error(`Tienes ${pendientes} facturas pendientes.`, {
              autoClose: false, // Desactivar el cierre automático
              onClick: () => navigate('/facturas/aprobar') // Redirigir cuando la tostada se haga clic
            });
          } else {
            toast.success("No tienes facturas pendientes.", {
              autoClose: false, // Desactivar el cierre automático
            });
          }
        })
        .catch(error => {
          toast.error("Error al obtener las facturas pendientes.", {
            autoClose: false, // Desactivar el cierre automático
          });
          console.error('Error al consultar las facturas pendientes:', error);
        });
      // Hacer la solicitud para obtener las escalas pendientes
      axios.get(`http://localhost:5000/api/escalas/pendientes/${idOperador}`)
        .then(response => {
          const escalasData = response.data;

          // Almacenar las escalas en el estado
          setEscalas(escalasData);
        })
        .catch(error => {
          console.error('Error al obtener las escalas pendientes:', error);
        });
    }
  }, []);

  return (
    <div>
      <h1>Bienvenido a Buques Invoice</h1>

      {/* Mostrar la tabla de escalas pendientes si existen */}
      {escalas.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>ETA</th>
              <th>Línea</th>
              <th>Buque</th>
              <th>Puerto</th>
              <th>Operador</th>
              <th>Facturas Pendientes</th>
            </tr>
          </thead>
          <tbody>
            {escalas.map(escala => (
              <tr key={escala.id}>
                <td>{escala.id}</td>
                <td>{escala.eta}</td>
                <td>{escala.linea}</td>
                <td>{escala.buque}</td>
                <td>{escala.puerto}</td>
                <td>{escala.operador}</td>
                <td>{escala.facturasPendientes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay escalas pendientes para el operador.</p>
      )}

      {/* Este debe ir fuera del useEffect, solo una vez en el JSX */}
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

export default Home;