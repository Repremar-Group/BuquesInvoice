import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './Facturas.css'
import axios from 'axios';
const IngresarFacturas = ({ isLoggedIn }) => {
  // Estado para los campos del formulario

  const [nrofactura, setNroFactura] = useState('');
  const [fecha, setFecha] = useState('');
  const [tipocomprobante, setTipoComprobante] = useState('');
  const [escalaasociada, setEscalaAsociada] = useState('');
  const [moneda, setMoneda] = useState('');
  const [monto, setMonto] = useState('');
  const [isPreAprobada, setIsPreAprobada] = useState(false);
  const [proveedor, setProveedor] = useState('');
  const [selectedFileFactura, setSelectedFileFactura] = useState(null);
  const [selectedFileNC, setSelectedFileNC] = useState(null);
  const [servicios, setServicios] = useState([]);

  // Estado para manejar los valores del formulario de servicio
  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: '',
    estado: 'Pendiente', // Estado inicial
  });
  //---------------------------------------------------------------------------------------------------------------------------------
  // Función para manejar el cambio en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoServicio({
      ...nuevoServicio,
      [name]: value,
    });
  };

  // Función para agregar un nuevo servicio al array
  const handleAgregarServicio = () => {
    if (nuevoServicio.nombre) {
      setServicios([...servicios, nuevoServicio]);
      setNuevoServicio({ nombre: '', estado: 'Pendiente' }); // Limpiar campos después de agregar
    } else {
      alert('Por favor, ingrese un nombre para el servicio');
    }
  };

  // Función para manejar la eliminación de un servicio
  const handleEliminarServicio = (index) => {
    const nuevosServicios = servicios.filter((_, i) => i !== index);
    setServicios(nuevosServicios);
  };

  // Maneja el cambio de archivo
  const handleFileChangeFactura = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFileFactura(file);
    } else {
      alert("Por favor, selecciona un archivo PDF.");
      event.target.value = null; // Resetea el input si no es PDF
    }
  };

  // Maneja el cambio de archivo
  const handleFileChangeNC = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFileNC(file);
    } else {
      alert("Por favor, selecciona un archivo PDF.");
      event.target.value = null; // Resetea el input si no es PDF
    }
  };

  const handleCheckboxChangePreAprobada = () => {
    setIsPreAprobada(!isPreAprobada);
  };
  useEffect(() => {
    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setFecha(icfechaactual);
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmitAgregarFm = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fileFactura", selectedFileFactura); // 'fileFactura' debe coincidir con el nombre en el backend
    formData.append("fileNC", selectedFileNC); // 'fileNC' debe coincidir con el nombre en el backend
    axios.post('http://localhost:5000/api/Agregarfactura', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        console.log("Factura subida exitosamente", response.data);
      })
      .catch(error => {
        console.error("Error al subir el archivo", error);
      });
  };




  return (
    <div className="EmitirFacturaManual-container">
      <h2 className='titulo-estandar'>Ingreso de Facturas</h2>
      <form method="POST" onSubmit={handleSubmitAgregarFm} className='formulario-estandar'>

        <div className='primerafilaemisiondecomprobantes'>
          <div className='div-datos-comprobante'>
            <h3 className='subtitulo-estandar'>Datos del Comprobante</h3>

            <div className='div-renglon-datos-facturasmanuales'>
              <div>
                <label htmlFor="ecID">Número de Factura:</label>
                <input
                  type="text"
                  id="ecID"
                  value={nrofactura}
                  onChange={(e) => setNroFactura(e.target.value)}
                  required
                />
              </div>
              <div className="fecha-emision-comprobante">
                <label htmlFor="fmfecha">Fecha:</label>
                <input
                  type="date"
                  id="fmfecha"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="fmtipocomprobante">Tipo de Comprobante:</label>
                <select
                  id="fmtipocomprobante"
                  value={tipocomprobante}
                  onChange={(e) => setTipoComprobante(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Tipo</option>
                  <option value="fcredito">Factura de Credito</option>
                  <option value="fcontado">Factura Contado</option>
                  <option value="etc">Etc</option>
                </select>
              </div>
              <div className="factura-pre-aprobada">
                <label htmlFor="preAprobadaCheckbox" className="factura-label">
                  Factura Pre-Aprobada

                  <input
                    type="checkbox"
                    id="preAprobadaCheckbox"
                    checked={isPreAprobada}
                    onChange={handleCheckboxChangePreAprobada}
                  />
                </label>
              </div>

            </div>


            <div className='div-renglon-datos-facturasmanuales'>
              <div>
                <label htmlFor="fmrazonsocial">Escala Asociada:</label>
                <input
                  type="text"
                  id="fmrazonsocial"
                  value={escalaasociada}
                  onChange={(e) => setEscalaAsociada(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="proveedor">Proveedor:</label>
                <input
                  type="text"
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  placeholder="Buscar Proveedor"
                />
              </div>
              <div>
                <label htmlFor="fmmoneda">Moneda:</label>
                <select
                  id="fmmoneda"
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Moneda</option>
                  <option value="dolares">Dolares</option>
                  <option value="pesos">Pesos</option>
                  <option value="Euros">Euros</option>
                </select>
              </div>

              <div>
                <label htmlFor="fmcomprobante">Monto:</label>
                <input
                  type="text"
                  id="fmcomprobante"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='div-renglon-datos-facturasmanuales'>
              <div>
                <label htmlFor="fileInput">PDF Factura:</label>
                <input
                  type="file"
                  id="fileInput"
                  accept="application/pdf"
                  onChange={handleFileChangeFactura}
                />
              </div>
              <div>
                <label htmlFor="fileInputNC">PDF Nota de Credito:</label>
                <input
                  type="file"
                  id="fileInputNC"
                  accept="application/pdf"
                  onChange={handleFileChangeNC}
                />
              </div>
              <div></div>

            </div>
            <h3 className='subtitulo-estandar'>Servicios Asociados</h3>
          <div className='div-renglon-datos-facturasmanuales'>
            <div>
            <label >Servicio:</label>
              <input
                type="text"
                name="nombre"
                value={nuevoServicio.nombre}
                onChange={handleInputChange}
              />
              <label >Estado:</label>
              <select
                name="estado"
                value={nuevoServicio.estado}
                onChange={handleInputChange}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
              </select>
              
              <button className= "btn-estandar"type="button" onClick={handleAgregarServicio}>Agregar Servicio</button>
            </div>
            <div>{/* Tabla de servicios */}
              <table className='tabla-servicios'>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {servicios.map((servicio, index) => (
                    <tr key={index}>
                      <td>{servicio.nombre}</td>
                      <td>{servicio.estado}</td>
                      <td>
                        <button type='button' className='action-button' onClick={() => handleEliminarServicio(index)}>❌</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
          </div>
          </div>

          
        </div>




        <div className='botonesemitircomprobante'>
          <button type="submit" className='btn-estandar'>Confirmar</button>

          <Link to="/home"><button className="btn-estandar">Volver</button></Link>
        </div>


      </form>
    </div>
  );
}

export default IngresarFacturas