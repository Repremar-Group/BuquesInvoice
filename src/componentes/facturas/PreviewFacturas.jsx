import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import './previewfacturas.css';
import { Link } from "react-router-dom";
import ModificarFactura from './ModificarFactura';
import { toast, ToastContainer } from 'react-toastify';
import { environment } from '../../environment';
import 'react-toastify/dist/ReactToastify.css';
import '../../app.css';

const PreviewEscalas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [facturas, setFacturas] = useState([]);
  const [error, setError] = useState('');
  const [loadingtabla, setLoadingTabla] = useState(true);
  //Estados para descargar pdf
  const [loading, setLoading] = useState(false);
  const [errorpdf, setErrorpdf] = useState(null);

  //Estados a Modificar
  const [idamodificar, setIdaModificar] = useState('');

  //Estados a Eliminar
  const [idaeliminar, setIdaEliminar] = useState('');
  const [numeroaeliminar, setNumeroAEliminar] = useState('');
  const [montoaeliminar, setMontoaEliminar] = useState('');

  // Función para obtener las facturas
  const fetchFacturas = async () => {
    try {
      const response = await axios.get(`${environment.API_URL}previewfacturas`);
      console.log(response.data);
      setFacturas(response.data);
    } catch (err) {
      console.error('Error al obtener facturas:', err);
      setError('No se pudieron cargar las facturas.');
    } finally {
      setLoadingTabla(false); // Desactivar indicador de carga
    }
  };

  // Llama a fetchFacturas al cargar el componente
  useEffect(() => {
    fetchFacturas();
  }, []);

  //Handle para descargar el pdf con NC
  const handleDownloadPDF = async () => {
    setLoading(true);
    setErrorpdf(null);

    try {
      let primeraConsultaExitosa = false;

      // Realizar la primera solicitud (facturas con notas de crédito)
      try {
        const responseWithNC = await axios.get(`${environment.API_URL}exportarpdfsinnotas`, {
          responseType: 'blob',
        });

        // Descargar el primer archivo
        const urlWithNC = window.URL.createObjectURL(responseWithNC.data);
        const linkWithNC = document.createElement('a');
        linkWithNC.href = urlWithNC;
        linkWithNC.setAttribute('download', 'facturas_sin_nc.pdf');
        document.body.appendChild(linkWithNC);
        linkWithNC.click();
        linkWithNC.parentNode.removeChild(linkWithNC);
        window.URL.revokeObjectURL(urlWithNC);

        primeraConsultaExitosa = true; // Marcar como exitosa
      } catch (err) {
        console.warn('La primera solicitud falló:', err);
      }

      // Realizar la segunda solicitud (facturas sin notas de crédito)
      try {
        const responseWithoutNC = await axios.get(`${environment.API_URL}exportarpdfconnotas`, {
          responseType: 'blob',
        });

        // Descargar el segundo archivo 1
        const urlWithoutNC = window.URL.createObjectURL(responseWithoutNC.data);
        const linkWithoutNC = document.createElement('a');
        linkWithoutNC.href = urlWithoutNC;
        linkWithoutNC.setAttribute('download', 'facturas_con_nc.pdf');
        document.body.appendChild(linkWithoutNC);
        linkWithoutNC.click();
        linkWithoutNC.parentNode.removeChild(linkWithoutNC);
        window.URL.revokeObjectURL(urlWithoutNC);

        primeraConsultaExitosa = true; // Considerar la operación general exitosa
      } catch (err) {
        console.warn('La segunda solicitud falló:', err);
      }

      if (!primeraConsultaExitosa) {
        // Si ambas consultas fallaron
        setErrorpdf('No existen facturas para imprimir o no se pudo generar el reporte.');
      } else {
        // Actualizar la lista de facturas si alguna consulta tuvo éxito
        fetchFacturas();
      }
    } catch (err) {
      console.error('Error inesperado:', err);
    } finally {
      setLoading(false); // Terminar el proceso de carga
    }
  };

  useEffect(() => {
    if (errorpdf) {
      toast.error('No existen facturas para imprimir o no se pudo generar el reporte.');
    }
  }, [errorpdf]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0);
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };
  const filteredFacturas = Array.isArray(facturas)
    ? facturas.filter((row) =>
      row.numero && row.numero.toLowerCase().includes(searchTerm.toLowerCase()) || row.proveedor && row.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const handleEliminar = (idfacturas, numero, monto) => {
    setIdaEliminar(idfacturas);
    setNumeroAEliminar(numero);
    setMontoaEliminar(monto);
  };

  const handleModificar = (id) => {
    setIdaModificar(id);
  };

  const closeModalEliminar = () => {
    setIdaEliminar(null);
    setNumeroAEliminar(null);
    setMontoaEliminar(null);
  };

  const closeModalModificar = () => {
    setIdaModificar(null);
    fetchFacturas();
  };

  const confirmEliminar = async () => {
    try {
      await axios.delete(`${environment.API_URL}eliminarfactura/${idaeliminar}`);
      fetchFacturas();
      closeModalEliminar;  // Cerrar el modal después de eliminar
    } catch (err) {
      console.error('Error al eliminar factura:', err);
      setError('No se pudo eliminar la factura.');
    }
  };
  if (loadingtabla) {
    // Mostrar indicador mientras se cargan los datos
    return <div className="loading-spinner"></div>;
  }

  if (error) {
    // Mostrar error si ocurre
    return <div className="error">{error}</div>;
  }

  return (
    <div className="Contenedor_Principal">
      <ToastContainer />
      <div className='titulo-estandar'><h1>Facturas</h1></div>
      <div className="table-container">
        <div className="search-bar">
          <div className="search-left">
            <Link to="/facturas/ingresar"><button className="add-button">➕</button></Link>
            <input
              className="input_buscar"
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button
            className="btn-estandartablas"
            onClick={handleDownloadPDF}
            disabled={loading}
          >
            {loading ? 'Generando PDF...' : 'Descargar Reporte PDF'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="contenedor-tabla-app">
          <table className='tabla-app'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Numero</th>
                <th>Fecha</th>
                <th>Moneda</th>
                <th>Monto</th>
                <th>Escala Asociada</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>GIA</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacturas.map((row) => (
                <tr key={row.idfacturas}>
                  <td>{row.idfacturas}</td>
                  <td>{row.numero}</td>
                  <td>{row.fecha}</td>
                  <td>{row.moneda}</td>
                  <td>{row.monto}</td>
                  <td>{row.escala_asociada}</td>
                  <td>{row.proveedor}</td>
                  <td>{row.estado}</td>
                  <td>
                    <input type="checkbox" checked={!!row.gia} disabled />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/ViewFactura/${row.idfacturas}`}><button className="action-button">🔎</button></Link>
                      <button className="action-button" onClick={() => handleModificar(row.idfacturas)}>✏️</button>
                      <button className="action-button" onClick={() => handleEliminar(row.idfacturas, row.numero, row.monto)}>❌</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal para eliminar factura */}
      {
        idaeliminar && (
          <>
            <div className="modal-overlayeliminarfactura active" onClick={closeModalEliminar}>
              <div className="modal-containereliminarfactura active">
                <h2>¿Estás seguro de eliminar esta factura?</h2>
                <p><strong>Factura:</strong> {numeroaeliminar}</p>
                <p><strong>Monto:</strong> {montoaeliminar}</p>
                <div className="modal-buttonseliminarfactura">
                  <button onClick={confirmEliminar}>Sí</button>
                  <button onClick={closeModalEliminar}>No</button>
                </div>
              </div>
            </div>

          </>
        )
      }

      {/* Modal para modificar Cliente */}
      {
        idamodificar && (
          <>
            <div className="modal-overlay active" onClick={closeModalModificar}></div>
            <div className="modal-container active">
              <ModificarFactura closeModal={closeModalModificar} Id={idamodificar} />
            </div>
          </>
        )
      }

    </div >
  );
};

export default PreviewEscalas;
