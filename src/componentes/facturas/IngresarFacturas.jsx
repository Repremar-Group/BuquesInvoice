import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import './Facturas.css'
import axios from 'axios';
import ModalBusquedaEscalaAsociada from '../modales/ModalBusquedaEscalaAsociada';
import ModalBusquedaProveedores from '../modales/ModalBusquedaProveedores';
import { toast, ToastContainer } from 'react-toastify';
import { environment } from '../../environment';
import 'react-toastify/dist/ReactToastify.css';

const IngresarFacturas = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // Estado para los campos del formulario

  const [nrofactura, setNroFactura] = useState('');
  const [fecha, setFecha] = useState('');
  const [facturaUrl, setFacturaUrl] = useState('');
  const [ncUrl, setNCUrl] = useState('');

  const [moneda, setMoneda] = useState('');
  const [monto, setMonto] = useState('');
  const [isPreAprobada, setIsPreAprobada] = useState(false);

  const [selectedFileFactura, setSelectedFileFactura] = useState(null);
  const [selectedFileNC, setSelectedFileNC] = useState(null);
  const [servicios, setServicios] = useState([]); // Estado para almacenar los servicios Asociados
  //Estados para manejar los servicios
  const [servicioslista, setServiciosLista] = useState([]); // Estado para almacenar los servicios
  const [isFetchedServicios, setIsFetchedServicios] = useState(false); // Para evitar múltiples llamadas

  const [serviciomodal, setServicioModal] = useState('');
  const [isServiciosVisible, setIsServiciosVisible] = useState(false);
  const [controlServicios, setControlServicios] = useState(false);
  const fetchServicios = async () => {
    
    if (!controlServicios) {
      setControlServicios(true);
    try {
      console.log(escalasociadaid);
      const response = await axios.get(`${environment.API_URL}obtenerserviciosescala?escalaId=${escalasociadaid}`);
      console.log('Tamaño de datos: ', response.data.length);
      let booleanoServicios;
      console.log(response.data);
      if (response.data.length === 0) {
        console.log("La lista de servicios está vacía.");
        booleanoServicios = false;
        
      } else {
        console.log("La lista de servicios contiene datos.");
        setServiciosLista(response.data);
        booleanoServicios = true;
      }
      // Se chequea que la escala tenga o no tenga servicios para agregarlos todos
      console.log('ID de la escala seleccionada:', escalasociadaid);
      console.log('isFetchedSvicios: ', booleanoServicios);
      if (!booleanoServicios) {

        const fetchServiciosPuerto = async () => {
          try {
            console.log('Puerto (1-MVD, 4-PDE):', selectedEscalaPuerto); // Verificar el puerto
            const response = await axios.get(`${environment.API_URL}obtenerserviciospuertos/${selectedEscalaPuerto}`);

            // Transformar el listado para solo tener 'nombre' y 'idescala'
            const serviciosTransformados = response.data.map(servicio => ({
              nombre: servicio.nombre,
              idescala: escalasociadaid  // idescala es igual a escala.id
            }));
            console.log('lista modificada', serviciosTransformados);  // Ver el listado transformado
            console.log('lista sin modificar', response.data); // Ver los datos originales que trae la API

            console.log('Datos enviados al servidor:', serviciosTransformados);
            // Cambiar el formato enviado al servidor
            const response2 = await axios.post(`${environment.API_URL}insertserviciospuertos`, {
              servicios: serviciosTransformados
            })
            console.log('servicios cargados');
            setServiciosLista(serviciosTransformados);

          } catch (error) {
            console.error('Error al obtener servicios puertos:', error);
          }
        };
        fetchServiciosPuerto();
      };
    } catch (error) {
      console.error('Error al obtener vuelos:', error);
    }
  } else return;
  };


  const handleOpenSelect = async () => {
    
    await fetchServicios(); // Espera que se complete la carga de servicios
  };

  const handleServicioChange = (e) => {
    setNuevoServicio({ ...nuevoServicio, nombre: e.target.value });
    console.log('este es el nuevo servicio', nuevoServicio)
  };

  //Estados para la busqeuda de proveedores
  const [searchTermProveedor, setSearchTermProveedor] = useState('');
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [isModalOpenProveedor, setIsModalOpenProveedor] = useState(false);
  // Manejo del input de búsqueda
  const handleInputChangeProveedor = (e) => setSearchTermProveedor(e.target.value);

  // Búsqueda de proveedor al presionar Enter
  const handleKeyPressProveedor = async (e) => {
    if (e.key === 'Enter' && searchTermProveedor.trim()) {
      e.preventDefault();
      try {
        const response = await axios.get(`${environment.API_URL}obtenerproveedor?search=${searchTermProveedor}`);
        setFilteredProveedores(response.data);
        setIsModalOpenProveedor(true); // Abre el modal con los resultados
      } catch (error) {
        console.error('Error al buscar proveedor:', error);
      }
    }
  };


  const handleSelectProveedor = (proveedor) => {
    setSelectedProveedor(proveedor.nombre);
    setSearchTermProveedor(proveedor.nombre); // Muestra el nombre seleccionado en el input
    setIsModalOpenProveedor(false); // Cierra el modal
  };

  // Cerrar modal
  const closeModalProveedor = () => setIsModalOpenProveedor(false);

  //prueba 1
  // Estado para la búsqueda de escalas
  const [searchTermEscalaAsociada, setSearchTermEscalaAsociada] = useState('');
  const [filteredEscalas, setFilteredEscalas] = useState([]);
  const [escalasociadaid, setEscalaAsociadaId] = useState('');
  const [selectedEscala, setSelectedEscala] = useState(null);
  const [selectedEscalaPuerto, setSelectedEscalaPuerto] = useState('');
  const [isModalOpenEscala, setIsModalOpenEscala] = useState(false);

  // Manejo del input de búsqueda
  const handleInputChangeEscalaAsociada = (e) => setSearchTermEscalaAsociada(e.target.value);

  // Búsqueda de escala al presionar Enter
  const handleKeyPressEscalaAsociada = async (e) => {
    if (e.key === 'Enter' && searchTermEscalaAsociada.trim()) {
      e.preventDefault();
      try {
        const response = await axios.get(`${environment.API_URL}buscarescalaasociada`, {
          params: { searchTermEscalaAsociada },
        });
        setFilteredEscalas(response.data);
        setIsModalOpenEscala(true); // Abre el modal con los resultados
        setIsFetchedServicios(false);
      } catch (error) {
        console.error('Error al buscar escala:', error);
      }
    }
  };

  const handleSelectEscala = (escala) => {
    setSelectedEscala(escala);
    setSelectedEscalaPuerto(escala.id_puerto);
    setSearchTermEscalaAsociada(escala.buque + ", ETA: " + escala.eta); // Muestra el nombre seleccionado en el input
    setEscalaAsociadaId(escala.id);
    setIsModalOpenEscala(false); // Cierra el modal
    setControlServicios(false);
    setServiciosLista([]);
  };


  // Cerrar modal
  const closeModalEscala = () => setIsModalOpenEscala(false);


  // Estado para manejar los valores del formulario de servicio
  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: '',
    estado: 'Pendiente', // Estado inicial
  });

  const [serviciospuertos, setServiciosPuertos] = useState([]);

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
      toast.error('Por favor, Seleccione un servicio');
    }
  };

  // Declarar el estado fuera de la función
  const [nuevoServicioAgregado, setNuevoServicioAgregado] = useState({
    nombre: '',
    estado: '',
  });

  const handleAgregarServicioEscala = async (e) => {
    e.preventDefault();
    try {
      const serviciomodalToUpper = serviciomodal.toUpperCase();
      const selectedEscalaId = selectedEscala.id;
      console.log('Escala Id agregar servicio: ', selectedEscalaId);
      console.log('Nombre servicio agregar servicio: ', serviciomodalToUpper);

      // Configurar el nuevo servicio y agregarlo a la lista
      const servicio = { nombre: serviciomodal.toUpperCase(), estado: 'Pendiente' };
      setNuevoServicioAgregado(servicio);
      setServicios([...servicios, servicio]);
      console.log('Nuevo Servicio Agregado: ', servicio);
      console.log('Servicios lista: ', servicios);

      // Realizar la solicitud al backend
      await axios.post(`${environment.API_URL}escalas/agregarservicio2`, { selectedEscalaId, serviciomodalToUpper });
    } catch (error) {
      console.error(error);
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
      toast.error("Por favor, selecciona un archivo PDF.");
      event.target.value = null; // Resetea el input si no es PDF
    }
  };

  // Maneja el cambio de archivo
  const handleFileChangeNC = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFileNC(file);
    } else {
      toast.error("Por favor, selecciona un archivo PDF.");
      event.target.value = null; // Resetea el input si no es PDF
    }
  };

  const handleCheckboxChangePreAprobada = () => {
    setIsPreAprobada(!isPreAprobada);
    console.log(isPreAprobada);
  };
  useEffect(() => {
    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setFecha(icfechaactual);
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmitAgregarFactura = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Primer paso: Subir los archivos
      const formData = new FormData();
      formData.append("fileFactura", selectedFileFactura); // 'fileFactura' debe coincidir con el backend
      formData.append("fileNC", selectedFileNC); // 'fileNC' debe coincidir con el backend
      console.log(isPreAprobada);
      console.log('File Factura: ', selectedFileFactura, ' FileNC: ', selectedFileNC);
      const fileResponse = await axios.post(`${environment.API_URL}Agregarfactura`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Factura subida exitosamente:", fileResponse.data);

      const facturaUrl = fileResponse.data.files?.fileFacturaUrl || '';
      const ncUrl = fileResponse.data.files?.fileNCUrl || '';

      // Segundo paso: Guardar datos de la factura
      const facturaData = {
        numero: nrofactura,
        fecha: fecha,
        moneda: moneda,
        monto: monto,
        escala_asociada: escalasociadaid,
        proveedor: selectedProveedor,
        url_factura: facturaUrl,
        url_notacredito: ncUrl,
        gia: 0,
        servicios: servicios,
      };

      if (isPreAprobada) {
        // Si está pre-aprobada, agregamos "Aprobado" y "pre_aprobado: 1"
        facturaData.estado = "Aprobado";
        facturaData.pre_aprobado = 1;
        if (selectedFileFactura == null && selectedFileNC == null) {
          facturaData.url_factura = "NaN";
          facturaData.url_notacredito = "NaN";
          facturaData.gia = 1;
        }
        //aca recorro servicios y les cambio el estado a aprobado


        // Recorrer los servicios y cambiar su estado a "Aprobado"
        const serviciosAprobados = servicios.map(servicio => ({
          ...servicio,
          estado: 'Aprobado'  // Cambiar el estado a "Aprobado"
        }));

        // Actualizar el array de servicios con los nuevos estados
        facturaData.servicios = serviciosAprobados;
      } else {
        // Si no está pre-aprobada, agregamos "Pendiente" y "pre_aprobado: 0"
        facturaData.estado = "Pendiente";
        facturaData.pre_aprobado = 0;
      };
      console.log(facturaData);
      const facturaResponse = await axios.post(`${environment.API_URL}insertardatosfactura`, facturaData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success("Factura ingresada exitosamente");
    } catch (error) {
      toast.error("Error durante el proceso");

    } finally {
      setNroFactura('');
      setFecha('');
      setMoneda('');
      setMonto('');
      setSearchTermProveedor('');
      setServicios([]);
      setSelectedFileFactura(null);
      setSelectedFileNC(null);
      setServiciosLista([]);
      setControlServicios(false);
      setLoading(false); // Ocultar spinner cuando termine el proceso
    }
  };




  return (
    <div className="EmitirFacturaManual-container">
      {loading && (
        <div className="loading-spinner-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <h2 className='titulo-estandar'>Ingreso de Facturas</h2>

      <form method="POST" onSubmit={handleSubmitAgregarFactura} className='formulario-estandar'>

        <div className='primerafilaemisiondecomprobasntes'>
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
                <label htmlFor="escalaasociada">Escala Asociada:</label>
                <input
                  type="text"
                  id="escalaasociada"
                  value={searchTermEscalaAsociada}
                  onChange={handleInputChangeEscalaAsociada}
                  onKeyPress={handleKeyPressEscalaAsociada}
                  placeholder="Buscar escala"
                  required
                  autoComplete='off'
                />
              </div>
              <div>
                <label htmlFor="proveedor">Proveedor:</label>
                <input
                  type="text"
                  value={searchTermProveedor}
                  onChange={handleInputChangeProveedor}
                  onKeyPress={handleKeyPressProveedor}
                  placeholder="Buscar Proveedor"
                  autoComplete='off'
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
                  <option value="USD">Dolares</option>
                  <option value="UY">Pesos</option>
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
                <div>
                  <label>Servicio:</label>
                  <select
                    id="servicio"
                    name="servicio"
                    value={nuevoServicio.nombre}
                    onChange={handleServicioChange}
                    onClick={handleOpenSelect}

                  >
                    <option value="">Selecciona un servicio</option>
                    {servicioslista.map((servicio, index) => (
                      <option key={index} value={servicio.nombre}>{servicio.nombre}</option>
                    ))}
                  </select>
                  <p></p>
                  <div className='div-parametros'>
                    <input className='input_buscar'
                      type="text"
                      placeholder="Agregar Servicio"
                      value={serviciomodal}
                      onChange={(e) => setServicioModal(e.target.value)}
                    />
                    <button className="add-button" onClick={handleAgregarServicioEscala}>➕</button>
                  </div>

                </div>

                <label >Estado:</label>
                <select
                  name="estado"
                  value={nuevoServicio.estado}
                  onChange={handleInputChange}
                  disabled //solo lectura
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobado">Aprobado</option>
                </select>

                <button className="btn-estandar" type="button" onClick={handleAgregarServicio}>Agregar Servicio</button>
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

      <ModalBusquedaEscalaAsociada
        isOpen={isModalOpenEscala}
        closeModal={closeModalEscala}
        filteredEscalas={filteredEscalas}
        handleSelectEscala={handleSelectEscala}
      />

      <ModalBusquedaProveedores
        isOpen={isModalOpenProveedor}
        closeModal={closeModalProveedor}
        filteredProveedores={filteredProveedores}
        handleSelectProveedor={handleSelectProveedor}
      />
      <ToastContainer
      />
    </div>
  );
}

export default IngresarFacturas