import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Facturas.css';

const AprobarFacturas = ({ isLoggedIn }) => {
  const [facturas, setFacturas] = useState([]);
  const [facturasOriginales, setFacturasOriginales] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [facturaActual, setFacturaActual] = useState(null);
  const [indiceFacturaActual, setIndiceFacturaActual] = useState(0);
  const [escala, setEscala] = useState(null); // Para almacenar los datos de la escala
  // Estado para almacenar la visibilidad del modal y el elemento seleccionado
  const [isModalOpenNC, setIsModalOpenNC] = useState(false);

  const [isModalOpenComentarios, setIsModalOpenComentarios] = useState(false);  // Controla la visibilidad del modal
  const [comentarios, setComentarios] = useState('');  // Almacena el comentario del usuario
  const [idServicioSeleccionado, setIdServicioSeleccionado] = useState(null);  // Guarda el id del servicio para actualizar la factura
  // Filtros
  const [nrofactura, setNroFactura] = useState('');
  const [operadores, setOperadores] = useState([]);  // Estado para almacenar los operadores
  const [operador, setOperador] = useState('');  // Estado para el operador seleccionado
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [buqueFiltro, setBuqueFiltro] = useState(''); // Estado para el filtro del buque


  // Obtener los operadores desde el backend
  useEffect(() => {
    const obtenerOperadores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/obteneroperadores');
        setOperadores(response.data);  // Almacena los operadores en el estado
      } catch (error) {
        console.error('Error al obtener los operadores:', error);
      }
    };

    obtenerOperadores();
  }, []);


  // Obtener los servicios asociados a la factura actual
  useEffect(() => {
    if (facturaActual) {
      console.log('Factura actual:', facturaActual);

      const obtenerServicios = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/obtenerservicios/${facturaActual.idfacturas}`);
          setServicios(response.data); // Actualiza el estado con los servicios recibidos
          console.log('Servicios asociados:', response.data); // Verifica los servicios obtenidos
        } catch (error) {
          console.error('Error al obtener los servicios:', error);
        }
      };

      obtenerServicios();
    }
  }, [facturaActual]);


  // Obtener la escala asociada a la factura actual
  useEffect(() => {
    if (facturaActual && facturaActual.escala_asociada) {
      console.log('Escala asociada:', facturaActual.escala_asociada); // Verifica que escala_asociada tenga un valor

      const obtenerEscala = async () => {
        try {
          // Hacemos una solicitud a previewescalas para obtener las escalas
          const response = await axios.get('http://localhost:5000/api/previewescalas');
          console.log('Escalas recibidas:', response.data);  // Verifica que los datos están llegando correctamente

          // Filtrar la escala que coincide con el id_escala de la factura
          const escalaEncontrada = response.data.find(escala => Number(escala.id) === Number(facturaActual.escala_asociada));
          console.log('Escala encontrada:', escalaEncontrada); // Verifica si se encuentra la escala correcta

          if (escalaEncontrada) {
            setEscala(escalaEncontrada); // Guardar los datos de la escala
            console.log('Escala guardada:', escalaEncontrada); // Verifica que se guarda correctamente
          } else {
            console.log('No se encontró la escala con el ID:', facturaActual.escala_asociada);  // Si no se encuentra
          }
        } catch (error) {
          console.error('Error al obtener la escala:', error);
        }
      };

      obtenerEscala();
    }
  }, [facturaActual]);

  useEffect(() => {
    if (facturas.length > 0) {
      setFacturaActual(facturas[indiceFacturaActual]);
    }
  }, [indiceFacturaActual, facturas]);


  const facturaAnterior = () => {
    if (indiceFacturaActual > 0) {
      setIndiceFacturaActual((prevIndice) => prevIndice - 1);
    }
  };

  const facturaSiguiente = () => {
    if (indiceFacturaActual < facturas.length - 1) {
      setIndiceFacturaActual((prevIndice) => prevIndice + 1);
    }
  };
  // Actualiza las facturas visibles en base a los filtros activos
  const actualizarFacturasFiltradas = () => {
    const facturasFiltradas = facturasOriginales.filter((factura) => {
      // Filtra por número de factura
      const coincideNumero = nrofactura === "" || factura.numero.toString().startsWith(nrofactura);
      // Filtra por estado
      const coincideEstado = estadoSeleccionado === "" || factura.estado === estadoSeleccionado;

      const coincideBuque = buqueFiltro === "" || factura.buque.toLowerCase().startsWith(buqueFiltro.toLowerCase());


      return coincideNumero && coincideEstado && coincideBuque; // Devuelve true solo si cumple ambos filtros
    });

    setFacturas(facturasFiltradas);
    console.log('listado de facturas filtradas', facturasFiltradas);
  };
  useEffect(() => {
    // Llama a la función cada vez que cambie un filtro o las facturas originales
    actualizarFacturasFiltradas();
  }, [nrofactura, estadoSeleccionado, buqueFiltro, facturasOriginales, escala]);
  // Dependencias

  const handleNroFacturaChange = (e) => {
    setNroFactura(e.target.value); // Actualiza el estado
  };
  const handleEstadoSeleccionado = (e) => {
    setEstadoSeleccionado(e.target.value); // Actualiza el estado
  };

  useEffect(() => {
    // Filtra las facturas en función del estado seleccionado
    const facturasFiltradas = facturasOriginales.filter(factura => {
      if (estadoSeleccionado === "") {
        return true; // Si no hay filtro, mostramos todas las facturas
      }
      return factura.estado === estadoSeleccionado;
    });

    // Actualiza el estado de las facturas filtradas
    setFacturas(facturasFiltradas);

  }, [estadoSeleccionado, facturasOriginales]); // Dependencias: cuando el estado seleccionado o las facturas originales cambien

  //Maneja la factura actual despues de filtrar
  useEffect(() => {
    if (facturas.length > 0) {
      // Verifica si la factura actual sigue estando en el listado filtrado
      const facturaValida = facturas.find(factura => factura.idfacturas === facturaActual?.idfacturas);

      if (!facturaValida) {
        // Si la factura actual no está en el array, asigna la primera factura
        setFacturaActual(facturas[0] || null); // Si no hay facturas, se establece null.
      }
    } else {
      // Si no hay facturas, reseteamos facturaActual.
      setFacturaActual(null);
    }
  }, [facturas, facturaActual]);
  //Manejo de el boton ver nc
  const handleVerNC = () => {
    setIsModalOpenNC(true); // Establecer modal como abierto
  };

  const closeModalVerNC = () => {
    setIsModalOpenNC(false);
  };
  //Funcion para manejar el cambio de operador y obtener las factuars
  const handleOperadorSeleccionado = (operador) => {
    setOperador(operador);
    // Restablecer los estados relacionados con la factura actual y escala
    setFacturaActual(null);
    setEscala(null);  // Limpia los datos de la escala

    axios.get('http://localhost:5000/api/obtenerfacturas', {
      params: { id_operador: operador }
    })
      .then((response) => {
        const facturas = response.data;
        setFacturas(facturas);
        setFacturasOriginales(facturas); // Guardar las facturas originales
      })
      .catch((error) => {
        console.error('Error al obtener las facturas:', error);
      });
  };


  const handleEstadoChangeServicio = async (idServicio, nuevoEstado) => {
    if (nuevoEstado === 'Requiere NC') {
      // Abre el modal para ingresar el comentario si el estado es "Requiere NC"
      setIdServicioSeleccionado(idServicio);
      setIsModalOpenComentarios(true);
    } else {
      // Si el estado no es "Requiere NC", primero actualizamos el estado del servicio
      try {
        await axios.put(`http://localhost:5000/api/actualizarestadoservicios/${idServicio}`, { estado: nuevoEstado });

        setServicios((prevServicios) =>
          prevServicios.map((servicio) =>
            servicio.id === idServicio ? { ...servicio, estado: nuevoEstado } : servicio
          )
        );

        // Actualizamos el estado de la factura
        await axios.put(`http://localhost:5000/api/facturas/${facturaActual.idfacturas}/actualizar-estado`);
        const response = await axios.get(`http://localhost:5000/api/obtenerestadoactualizadofacturas/${facturaActual.idfacturas}`);

        setFacturaActual(response.data);

        // Actualizar el array de facturas con la factura modificada
        setFacturas((prevFacturas) =>
          prevFacturas.map((factura) =>
            factura.idfacturas === response.data.idfacturas ? response.data : factura
          )
        );

        //facturas originales también estén actualizadas
        setFacturasOriginales((prevFacturasOriginales) =>
          prevFacturasOriginales.map((factura) =>
            factura.idfacturas === response.data.idfacturas ? response.data : factura
          )
        );

        alert(`Estado del servicio actualizado a ${nuevoEstado} y factura sincronizada.`);
      } catch (error) {
        console.error('Error al actualizar el estado del servicio:', error);
        alert('Hubo un error al intentar actualizar el estado del servicio.');
      }
    }
  };

  const handleBuqueFiltroChange = (e) => {
    setBuqueFiltro(e.target.value);
  };

  const handleGuardarComentario = async () => {
    if (!comentarios.trim()) {
      alert('El comentario no puede estar vacío.');
      return; // Detiene la ejecución de la función si el comentario está vacío.
    }
    try {
      // Envía los comentarios a la base de datos
      await axios.put(`http://localhost:5000/api/facturas/${facturaActual.idfacturas}/agregarcomentario`, {
        comentario: comentarios,
      });

      await axios.put(`http://localhost:5000/api/actualizarestadoservicios/${idServicioSeleccionado}`, { estado: "Requiere NC" });

      setServicios((prevServicios) =>
        prevServicios.map((servicio) =>
          servicio.id === idServicioSeleccionado ? { ...servicio, estado: "Requiere NC" } : servicio
        )
      );

      // Actualizamos el estado de la factura
      await axios.put(`http://localhost:5000/api/facturas/${facturaActual.idfacturas}/actualizar-estado`);
      const response = await axios.get(`http://localhost:5000/api/obtenerestadoactualizadofacturas/${facturaActual.idfacturas}`);

      // Verifica si la respuesta contiene los datos actualizados correctamente
      if (response.data && response.data.comentarios) {
        // Actualizamos el estado de la factura actual con el nuevo comentario
        setFacturaActual({
          ...response.data,
          comentario: comentarios, // Aseguramos que el comentario reciente esté incluido
        });

        // Actualizamos las facturas en el estado global
        setFacturas((prevFacturas) =>
          prevFacturas.map((factura) =>
            factura.idfacturas === response.data.idfacturas ? response.data : factura
          )
        );

        setFacturasOriginales((prevFacturasOriginales) =>
          prevFacturasOriginales.map((factura) =>
            factura.idfacturas === response.data.idfacturas ? response.data : factura
          )
        );

        alert('Comentario guardado y factura actualizada correctamente.');

        // Cierra el modal
        setIsModalOpenComentarios(false);
      } else {
        alert('No se pudo obtener la factura actualizada.');
      }
    } catch (error) {
      console.error('Error al guardar el comentario:', error);
      alert('Hubo un error al guardar el comentario.');
    }
  };



  return (
    <div className="aprobarfacturas">
      <div className="servicios">
        <h3 className='subtitulo-estandaraprobar'>Servicios</h3>
        <table className='TablaServiciosAprobarFacturas'>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {servicios.length > 0 ? (
              servicios.map((servicio) => (
                <tr key={servicio.id}>
                  <td>{servicio.servicio}</td>
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
              ))
            ) : (
              <tr>
                <td colSpan="3">No hay servicios asociados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="filtros">
        <h3 className='subtitulo-estandaraprobar'>Filtros</h3>
        <div>
          <label className='label' htmlFor="operador">Operador:</label>
          <select
            id="operador"
            value={operador}
            onChange={(e) => handleOperadorSeleccionado(e.target.value)}
          >
            <option value="">Seleccione Operador</option>
            {operadores.map((operador) => (
              <option key={operador.id} value={operador.id}>
                {operador.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="nrofac">Nro. Factura:</label>
          <input
            type="text"
            id="nrofac"
            value={nrofactura}
            onChange={(e) => handleNroFacturaChange(e)}
            placeholder="Buscar Factura"
          />
        </div>

        <div>
          <label htmlFor="estfac">Estado Factura:</label>
          <select
            id="estfac"
            value={estadoSeleccionado}
            onChange={handleEstadoSeleccionado}
          >
            <option value="">Seleccione un estado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Requiere NC">Requiere NC</option>
          </select>
        </div>
        <div>
          <label htmlFor="buqueFiltro">Buque:</label>
          <input
            type="text"
            id="buqueFiltro"
            value={buqueFiltro}
            onChange={handleBuqueFiltroChange}
            placeholder="Buscar por Buque"
          />
        </div>

        <h3 className='subtitulo-estandaraprobar'>Datos Factura</h3>
        <div>
          <label htmlFor="estadofactura">Nro de factura:</label>
          <input
            type="text"
            id="estadofactura"
            value={facturaActual ? facturaActual.numero : ''}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="estadofactura">Estado de la Factura:</label>
          <input
            type="text"
            id="estadofactura"
            value={facturaActual ? facturaActual.estado : ''}
            readOnly
          />
        </div>

        <div>
          <label htmlFor="buque">Buque:</label>
          <input
            type="text"
            id="buque"
            value={facturaActual ? facturaActual.buque : ''}
            readOnly
          />
        </div>

        <div>
          <label htmlFor="proveedor">Proveedor:</label>
          <input
            type="text"
            id="proveedor"
            value={facturaActual ? facturaActual.proveedor : ''}
            readOnly
          />
        </div>

        <div>
          <label htmlFor="fechaEscala">Fecha de la Escala:</label>
          <input
            type="text"
            id="fechaEscala"
            value={facturaActual ? facturaActual.eta : ''}
            readOnly
          />
        </div>

        <div>
          <label htmlFor="fechaFactura">Fecha de la Factura:</label>
          <input
            type="text"
            id="fechaFactura"
            value={facturaActual ? facturaActual.fecha : ''}
            readOnly
          />
        </div>
      </div>

      <div className="pdf-container">
        <h3 className='subtitulo-estandaraprobar'>Factura</h3>
        {facturaActual && (
          <embed
            src={facturaActual.url_factura}
            type="application/pdf"
            width="100%"
            height="80%"
            style={{ border: 'none' }}
          />
        )}
        <div className='BotonesPDFAprobarFacturas'>
          <button className='action-buttonaprobarfac' onClick={facturaAnterior}>⬅️</button>
          <button className='btn-nc' onClick={() => handleVerNC()} disabled={!facturaActual?.url_notacredito} >Ver NC</button>
          <button className='action-buttonaprobarfac' onClick={facturaSiguiente}>➡️</button>
        </div>
      </div>

      {/* Modal Ver Nota de Credito */}
      {isModalOpenNC && (
        <div className="modal-overlay active" onClick={closeModalVerNC}>
          <div
            className="modalVerNc"
            style={{ display: 'flex', padding: '20px' }}
            onClick={(e) => e.stopPropagation()} // Previene que el clic en el contenido cierre el modal
          >
            {/* Columna para el comentario */}
            <div style={{ flex: 1, paddingRight: '20px' }}>
              <h3>Comentarios:</h3>
              <p>{facturaActual.comentarios}</p>
            </div>

            {/* Columna para el PDF */}
            <div style={{ flex: 2 }}>
              <embed
                src={facturaActual.url_notacredito}
                type="application/pdf"
                width="100%"
                height="80%"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Modal Ver Comentarios */}
      {isModalOpenComentarios && (
        <div className="modal-overlay active">
          <div className="modalComentarios">
            <h3 className='subtitulo-estandar'>Comentario para Nota de Crédito</h3>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Ingresa los comentarios aquí..."
            />
            <button className='btn-estandar' onClick={handleGuardarComentario}>Guardar Comentario</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AprobarFacturas;
