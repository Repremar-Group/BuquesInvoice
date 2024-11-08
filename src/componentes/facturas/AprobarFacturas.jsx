import React, { useState, useEffect } from 'react';
import './Facturas.css';

const AprobarFacturas = ({ isLoggedIn }) => {
  const pdfUrl = '/uploads/175853.pdf'; // Ruta del archivo PDF
  //Variables para los filtros
  const [nrofactura, setNroFactura] = useState('');
  const [operador, setOperador] = useState('');
  const [estadofactura, setEstadoFactura] = useState('');

  //Variables para mostrar info de la factura actual
  const [estadofacturaactual, setEstadoFacturaActual] = useState('');
  const [buqueFacturaActual, setBuqueFaturaActual] = useState('');
  const [proveedorFacturaActual, setProveedorFacturaActual] = useState('');
  const [fechaEscalaFacturaActual, setFechaEscalaFacturaActual] = useState('');
  const [fechaFaturaActual, setFechaFacturaActual] = useState('');
  //Lista de servicios para alimentar la tabla
  const [servicios, setServicios] = useState([
    { id: 1, servicio: 'Servicio A', monto: 100, estado: 'Pendiente' },
    { id: 2, servicio: 'Servicio B', monto: 200, estado: 'Aprobado' },
    { id: 3, servicio: 'Servicio C', monto: 300, estado: 'Requiere NC' },
  ]);

  // Función para manejar el cambio en el estado de un servicio
  const handleEstadoChangeServicio = (id, nuevoEstado) => {
    setServicios((prevServicios) =>
      prevServicios.map((servicio) =>
        servicio.id === id ? { ...servicio, estado: nuevoEstado } : servicio
      )
    );
  };
  return (
    <div className="aprobarfacturas">
      <div className="servicios">
        <h3 className='subtitulo-estandaraprobar'>Servicios</h3>
         {/* Tabla */}
      <table className='TablaServiciosAprobarFacturas'>
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Monto</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((servicio) => (
            <tr key={servicio.id}>
              <td>{servicio.servicio}</td>
              <td>{servicio.monto}</td>
              <td>
                <select
                  value={servicio.estado}
                  onChange={(e) => handleEstadoChangeServicio(servicio.id, e.target.value)}
                >
                  <option value="Aprobado">Aprobado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Requiere NC">Requiere NC</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="filtros">
        <h3 className='subtitulo-estandaraprobar'>Filtros</h3>
        <div>
          <label  className='label'htmlFor="operador">Operador:</label>
          <select
            id="fmtipocomprobante"
            value={operador}
            onChange={(e) => setOperador(e.target.value)}
            required
          >
            <option value="">Seleccione Operador</option>
            <option value="fcredito">Gonzalo</option>
            <option value="fcontado">JP</option>
            <option value="etc">Etc</option>
          </select>
        </div>
        <div>
          <label htmlFor="nrofac">Nro. Factura:</label>
          <input
            type="text"
            id="nrofac"
            value={nrofactura}
            onChange={(e) => setNroFactura(e.target.value)}
            placeholder="Buscar Factura"
            required
          />
        </div>
        <div>
          <label htmlFor="estfac">Estado Factura:</label>
          <select
            id="estfac"
            value={estadofactura}
            onChange={(e) => setEstadoFactura(e.target.value)}
            required
          >
            <option value="">Seleccione un estado</option>
            <option value="fcredito">Pendiente</option>
            <option value="fcontado">Aprobado</option>
            <option value="fcontado">Requiere NC</option>
            <option value="etc">Etc</option>
          </select>
        </div>

        <h3 className='subtitulo-estandaraprobar'>Datos Factura</h3>

        <div>
          <label htmlFor="nrofac">Estado de la Factura:</label>
          <input
            type="text"
            id="nrofac"
            value={estadofacturaactual}
            onChange={(e) => setEstadoFacturaActual(e.target.value)}
            readOnly
            placeholder="Pendiente"
            required
          />
        </div>
        <div>
          <label htmlFor="nrofac">Buque:</label>
          <input
            type="text"
            id="nrofac"
            value={buqueFacturaActual}
            onChange={(e) => setBuqueFaturaActual(e.target.value)}
            readOnly
            placeholder="COSTA FASCINOSA"
            required
          />
        </div>
        <div>
          <label htmlFor="nrofac">Proveedor:</label>
          <input
            type="text"
            id="nrofac"
            value={proveedorFacturaActual}
            onChange={(e) => setProveedorFacturaActual(e.target.value)}
            readOnly
            placeholder="Soc. Prac. del Puerto de Montevideo"
            required
          />
        </div>
        <div>
          <label htmlFor="nrofac">Fecha de la Escala:</label>
          <input
            type="text"
            id="nrofac"
            value={fechaEscalaFacturaActual}
            onChange={(e) => setFechaEscalaFacturaActual(e.target.value)}
            readOnly
            placeholder="03/02/2024 06:00:00 AM"
            required
          />
        </div>
        <div>
          <label htmlFor="nrofac">Fecha de la Factura:</label>
          <input
            type="text"
            id="nrofac"
            value={fechaFaturaActual}
            onChange={(e) => setFechaFacturaActual(e.target.value)}
            readOnly
            placeholder="03/07/2024"
            required
          />
        </div>
      </div>
      <div className="pdf-container">
        <h3 className='subtitulo-estandaraprobar'>Factura</h3>
        <embed
          src={pdfUrl}
          type="application/pdf"
          width="100%"
          height="80%"
          style={{ border: 'none' }}
        />
        <div className='BotonesPDFAprobarFacturas'>
          <button className='action-buttonaprobarfac'>⬅️</button>
          <button className='btn-nc'>Ver NC</button>
          <button className='action-buttonaprobarfac'>➡️</button>
        </div>

      </div>
    </div>
  );
}

export default AprobarFacturas;
