import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import './previewfacturas.css';
import { Link } from "react-router-dom";
import ModificarFactura from './ModificarFactura';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PreviewEscalas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [facturas, setFacturas] = useState([]);
  const [error, setError] = useState('');
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
      const response = await axios.get('http://localhost:5000/api/previewfacturas');
      console.log(response.data);
      setFacturas(response.data);
    } catch (err) {
      console.error('Error al obtener facturas:', err);
      setError('No se pudieron cargar las facturas.');
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
      // Realizar la primera solicitud (facturas con notas de crédito)
      const responseWithNC = await axios.get('http://localhost:5000/api/exportarpdf', {
        responseType: 'blob',
      });

      // Descargar el primer archivo
      const urlWithNC = window.URL.createObjectURL(responseWithNC.data);
      const linkWithNC = document.createElement('a');
      linkWithNC.href = urlWithNC;
      linkWithNC.setAttribute('download', 'facturas_con_nc.pdf');
      document.body.appendChild(linkWithNC);
      linkWithNC.click();
      linkWithNC.parentNode.removeChild(linkWithNC);
      window.URL.revokeObjectURL(urlWithNC);

      // Realizar la segunda solicitud (facturas sin notas de crédito)
      const responseWithoutNC = await axios.get('http://localhost:5000/api/exportarpdfsinnotas', {
        responseType: 'blob',
      });

      // Descargar el segundo archivo
      const urlWithoutNC = window.URL.createObjectURL(responseWithoutNC.data);
      const linkWithoutNC = document.createElement('a');
      linkWithoutNC.href = urlWithoutNC;
      linkWithoutNC.setAttribute('download', 'facturas_sin_nc.pdf');
      document.body.appendChild(linkWithoutNC);
      linkWithoutNC.click();
      linkWithoutNC.parentNode.removeChild(linkWithoutNC);
      window.URL.revokeObjectURL(urlWithoutNC);

      //Actualizo la lista de facturas
      fetchFacturas();

    } catch (err) {
      console.error('Error al descargar los archivos:', err);
      setErrorpdf('No existen facturas para imprimir o no se pudo generar el reporte.');
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
      await axios.delete(`http://localhost:5000/api/eliminarfactura/${idaeliminar}`);
      fetchFacturas();
      closeModalEliminar;  // Cerrar el modal después de eliminar
    } catch (err) {
      console.error('Error al eliminar factura:', err);
      setError('No se pudo eliminar la factura.');
    }
  };


  const itemsPerPage = 8;
  const filteredData = Array.isArray(facturas)
    ? facturas.filter((row) =>
      row.numero && row.numero.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="Contenedor_Principal">
      <ToastContainer/>
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
        <table className='tabla-clientes'>
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
            {displayedItems.map((row) => (
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

      {/* Modal para eliminar factura */}
      {idaeliminar && (
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
      )}

      {/* Modal para modificar Cliente */}
      {idamodificar && (
        <>
          <div className="modal-overlay active" onClick={closeModalModificar}></div>
          <div className="modal-container active">
            <ModificarFactura closeModal={closeModalModificar} Id={idamodificar} />
          </div>
        </>
      )}

    </div>
  );
};

export default PreviewEscalas;
