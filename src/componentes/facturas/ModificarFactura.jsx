import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import './Facturas.css'
import axios from 'axios';
import ModalBusquedaEscalaAsociada from '../modales/ModalBusquedaEscalaAsociada';
import ModalBusquedaProveedores from '../modales/ModalBusquedaProveedores';

const ModificarFactura = ({ closeModal, Id }) => {
    const navigate = useNavigate();

    // Estado para los campos del formulario
    const [factura, setFactura] = useState([]);
    const [nrofactura, setNroFactura] = useState('');
    const [facturamodificar, setFacturaModificar] = useState('');
    const [facturaUrlActual, setFacturaUrlActual] = useState('');
    const [ncUrlActual, setNCUrlActual] = useState('');
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

    const fetchfacturaData = async (Id) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/obtenerfactura/${Id}`);
            const facturaData = response.data;
            console.log(facturaData)
            // Establecer los datos en el estado del componente
            setNroFactura(facturaData.factura.numero);
            // Convertir la fecha al formato requerido por el campo de tipo 'date'
            const isoFecha = facturaData.factura.fecha;
            const fechaFormateada = isoFecha.split('T')[0];
            // Establecer la fecha en el estado
            setFecha(fechaFormateada);
            setIsPreAprobada(facturaData.factura.pre_aprobado === 1);
            setSearchTermEscalaAsociada(facturaData.factura.escala_asociada);
            setEscalaAsociadaId(facturaData.factura.escala_asociada);
            setSearchTermProveedor(facturaData.factura.proveedor);
            setMoneda(facturaData.factura.moneda);
            setMonto(facturaData.factura.monto);
            setFacturaModificar(facturaData.factura.idfacturas);
            setFacturaUrlActual(facturaData.factura.url_factura);
            setNCUrlActual(facturaData.factura.url_notacredito);

        } catch (error) {
            console.error('Error fetching client data:', error);
            alert('Error al obtener los datos del cliente');
        }
    };
    const fetchServiciosAsociados = async (Id) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/obtenerservicios/${Id}`);
            const serviciosData = response.data;
            console.log(serviciosData)
            setServicios(serviciosData);  // Guardamos los servicios en el array
            console.log(servicios);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    useEffect(() => {
        // Llamar a la función para obtener los datos del cliente al montar el componente
        if (Id) {
            fetchfacturaData(Id);
            fetchServiciosAsociados(Id);
        }
    }, [Id]); // Dependencia: se vuelve a ejecutar si `clienteId` cambia

    const fetchServicios = async () => {
        try {
            console.log(escalasociadaid);
            const response = await axios.get(`http://localhost:5000/api/obtenerserviciosescala?escalaId=${searchTermEscalaAsociada}`);
            console.log(response.data);
            setServiciosLista(response.data);
            setIsFetchedServicios(true); // Indica que ya se obtuvieron los datos
        } catch (error) {
            console.error('Error al obtener vuelos:', error);
        }
    }
    const handleServicioChange = (e) => {
        setNuevoServicio({ ...nuevoServicio, nombre: e.target.value });
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
                const response = await axios.get(`http://localhost:5000/api/obtenerproveedor?search=${searchTermProveedor}`);
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


    // Estado para la búsqueda de escalas
    const [searchTermEscalaAsociada, setSearchTermEscalaAsociada] = useState('');
    const [filteredEscalas, setFilteredEscalas] = useState([]);
    const [escalasociadaid, setEscalaAsociadaId] = useState('');
    const [selectedEscala, setSelectedEscala] = useState(null);
    const [isModalOpenEscala, setIsModalOpenEscala] = useState(false);

    // Manejo del input de búsqueda
    const handleInputChangeEscalaAsociada = (e) => setSearchTermEscalaAsociada(e.target.value);

    // Búsqueda de escala al presionar Enter
    const handleKeyPressEscalaAsociada = async (e) => {
        if (e.key === 'Enter' && searchTermEscalaAsociada.trim()) {
            e.preventDefault();
            try {
                const response = await axios.get(`http://localhost:5000/api/buscarescalaasociada`, {
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
        setSearchTermEscalaAsociada(escala.buque + ", ETA: " + escala.eta); // Muestra el nombre seleccionado en el input
        setEscalaAsociadaId(escala.id);
        setIsModalOpenEscala(false); // Cierra el modal

        // Agregar console.log para ver el id de la escala seleccionada
        console.log('ID de la escala seleccionada:', escala.id);
    };

    // Cerrar modal
    const closeModalEscala = () => setIsModalOpenEscala(false);


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
    const handleSubmitModificarFactura = async (e) => {
        e.preventDefault();
        try {
            // Primer paso: Subir los archivos solo si se seleccionan nuevos archivos
            let facturaUrl = '';
            let ncUrl = '';

            if (selectedFileFactura) {
                const formData = new FormData();
                formData.append("fileFactura", selectedFileFactura); // 'fileFactura' debe coincidir con el backend

                const fileResponse = await axios.post('http://localhost:5000/api/Agregarfactura', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log("Factura subida exitosamente:", fileResponse.data);
                facturaUrl = fileResponse.data.files?.fileFacturaUrl || '';
            }

            if (selectedFileNC) {
                const formDataNC = new FormData();
                formDataNC.append("fileNC", selectedFileNC); // 'fileNC' debe coincidir con el backend

                const fileResponseNC = await axios.post('http://localhost:5000/api/Agregarfactura', formDataNC, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log("Nota de Crédito subida exitosamente:", fileResponseNC.data);
                ncUrl = fileResponseNC.data.files?.fileNCUrl || '';
            }

            // Segundo paso: Modificar los datos de la factura
            const facturaData = {
                idfactura: facturamodificar, // ID de la factura a modificar
                numero: nrofactura,
                fecha: fecha,
                moneda: moneda,
                monto: monto,
                escala_asociada: escalasociadaid,
                proveedor: searchTermProveedor,
                url_factura: facturaUrl || facturaUrlActual, // Usa la URL existente si no se sube un nuevo archivo
                url_notacredito: ncUrl || ncUrlActual, // Lo mismo con la nota de crédito
                estado: "Pendiente", // O el estado que corresponda
                gia: 0,
                pre_aprobado: isPreAprobada ? 1 : 0,
                servicios: servicios,
            };

            // Enviar la solicitud para actualizar la factura
            const facturaResponse = await axios.put('http://localhost:5000/api/modificarfactura', facturaData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            alert("Factura modificada exitosamente");
            closeModal();

        } catch (error) {
            console.error("Error durante el proceso:", error);
            alert("Error al modificar la factura");
        }
    };




    return (
        <div className="EmitirFacturaManual-container">
            <h2 className='titulo-estandar'>Modificar factura</h2>
            <form method="POST" onSubmit={handleSubmitModificarFactura} className='formulario-estandar'>

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
                                        onClick={() => {
                                            if (!isFetchedServicios) fetchServicios();
                                        }}

                                    >
                                        <option value="">Selecciona un servicio</option>
                                        {servicioslista.map((servicio, index) => (
                                            <option key={index} value={servicio.nombre}>{servicio.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <label >Estado:</label>
                                <select
                                    name="estado"
                                    value={nuevoServicio.estado}
                                    onChange={handleInputChange}
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
                                                <td>{servicio.servicio}</td>
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

                    <button onClick={closeModal} className="btn-estandar">Volver</button>
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
        </div>
    );
}


export default ModificarFactura