import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './viewfactura.css';
import axios from 'axios';
import { Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import { environment } from '../../environment';
import 'react-toastify/dist/ReactToastify.css';

// Componente para mostrar detalles generales de la escala
const General = ({ factura, escala }) => {
  const [isModalOpenNC, setIsModalOpenNC] = useState(false);
  const closeModalVerNC = () => {
    setIsModalOpenNC(false);
  };
  //Manejo de el boton ver nc
  const handleVerNC = () => {
    setIsModalOpenNC(true); // Establecer modal como abierto
  };
  return (
  <div className="view-escala-general">
    <div className="contenedor-columns">
      {/* Columna izquierda: Datos de la factura */}
      <div className="datosfactura">
        <h3 className="subtitulo-estandaraprobar">Datos Factura</h3>
        <div>
          <label htmlFor="estadofactura">Nro de factura:</label>
          <input
            type="text"
            id="estadofactura"
            value={factura ? factura.numero : ''}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="estadofactura">Estado de la Factura:</label>
          <input
            type="text"
            id="estadofactura"
            value={factura ? factura.estado : ''}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="buque">Buque:</label>
          <input
            type="text"
            id="buque"
            value={escala ? escala.buque : ''}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="proveedor">Proveedor:</label>
          <input
            type="text"
            id="proveedor"
            value={factura ? factura.proveedor : ''}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="fechaEscala">Fecha de la Escala:</label>
          <input
            type="text"
            id="fechaEscala"
            value={escala ? escala.eta : ''}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="fechaFactura">Fecha de la Factura:</label>
          <input
            type="text"
            id="fechaFactura"
            value={factura ? factura.fecha : ''}
            readOnly
          />
        </div>
        <button className='btn-nc' onClick={() => handleVerNC()} disabled={!factura?.url_notacredito} >Ver NC</button>
      </div>

      {/* Columna derecha: PDF */}
      <div className="pdf-containerviewfactura">
        <h3 className="subtitulo-estandaraprobar">Factura</h3>
        {factura && (
          <embed
            src={factura.url_factura}
            type="application/pdf"
            width="80%"
            height="550px"
            style={{ border: 'none', display: 'block', margin: '0 auto', }}
          />
        )}
      </div>
    </div>

    <Link to="/previewfacturas">
      <button className="btn-estandar">Volver</button>
    </Link>

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
              <p>{factura.comentarios}</p>
            </div>

            {/* Columna para el PDF */}
            <div style={{ flex: 2 }}>
              <embed
                src={factura.url_notacredito}
                type="application/pdf"
                width="100%"
                height="80%"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
  </div>
  );
};
  


// Componente para mostrar la escala
const Escala = ({ escalamostrar }) => {
  console.log('Datos recibidos en Escala:', escalamostrar);
  return (
    <div className="view-escala-general">
      <h3 className="subtitulo-estandaraprobar">Datos escala</h3>
      <div className='datosescala'>
        <div>
          <label htmlFor="estadofactura">Linea:</label>
          <input
            type="text"
            id="estadofactura"
            value={escalamostrar ? escalamostrar.linea : ''}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="buque">Buque:</label>
          <input
            type="text"
            id="buque"
            value={escalamostrar ? escalamostrar.buque : ''}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="proveedor">ETA:</label>
          <input
            type="text"
            id="proveedor"
            value={escalamostrar ? escalamostrar.eta : ''}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="fechaEscala">Puerto:</label>
          <input
            type="text"
            id="fechaEscala"
            value={escalamostrar ? escalamostrar.puerto : ''}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="fechaFactura">Operador:</label>
          <input
            type="text"
            id="fechaFactura"
            value={escalamostrar ? escalamostrar.operador : ''}
            readOnly
          />
        </div>
      </div>
      <Link to="/previewfacturas"><button className="btn-estandar">Volver</button></Link>
    </div>
  );
};




const ViewFactura = () => {
  const { id } = useParams(); // Obtener el ID de la URL
  const [factura, setFactura] = useState(null);
  const [escala, setEscala] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // Estado para la pestaña activa
  const [loading, setLoading] = useState(true);

  //Fetch para traer la factura
  useEffect(() => {
    const fetchFactura = async () => {
      try {
        const response = await axios.get(`${environment.API_URL}obtenerfactura/${id}`);
        const facturaData = response.data.factura;

        // Verificar si la fecha existe y formatearla a DD-MM-YYYY
        if (facturaData.fecha) {
          const date = new Date(facturaData.fecha); // Convertir a objeto Date
          const day = String(date.getDate()).padStart(2, '0'); // Asegurar dos dígitos
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes (0-indexed)
          const year = date.getFullYear(); // Año completo

          facturaData.fecha = `${day}-${month}-${year}`; // Formatear como DD-MM-YYYY
        }

        setFactura(facturaData);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los detalles de la factura:', error);
        toast.error('No se pudieron cargar los datos de la factura');
        setLoading(false);
      }
    };

    fetchFactura();
  }, [id]);

  // Obtener la escala asociada a la factura actual
  useEffect(() => {
    if (factura && factura.escala_asociada) {
      console.log('Escala asociada:', factura.escala_asociada); // Verifica que escala_asociada tenga un valor

      const obtenerEscala = async () => {
        try {
          // Hacemos una solicitud a previewescalas para obtener las escalas
          const response = await axios.get(`${environment.API_URL}previewescalas`);
          console.log('Escalas recibidas:', response.data);  // Verifica que los datos están llegando correctamente

          // Filtrar la escala que coincide con el id_escala de la factura
          const escalaEncontrada = response.data.find(escala => Number(escala.id) === Number(factura.escala_asociada));
          console.log('Escala encontrada:', escalaEncontrada); // Verifica si se encuentra la escala correcta

          if (escalaEncontrada) {
            setEscala(escalaEncontrada); // Guardar los datos de la escala
            console.log('Escala guardada:', escalaEncontrada); // Verifica que se guarda correctamente
          } else {
            console.log('No se encontró la escala con el ID:', factura.escala_asociada);  // Si no se encuentra
          }
        } catch (error) {
          console.error('Error al obtener la escala:', error);
        }
      };

      obtenerEscala();
    }
  }, [factura]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!factura) {
    return <div>No se encontró la factura.</div>;
  }

  return (
    <div className="view-factura-container">
      <h3 className='titulo-estandar'>Detalles de la Factura {factura.numero}</h3>
      {/* Navbar */}
      <nav className="view-escala-navbar">
        <ul>
          <li>
            <button
              className={activeTab === 'general' ? 'view-escala-nav-button active' : 'view-escala-nav-button'}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
          </li>
          <li>
            <button
              className={activeTab === 'escala' ? 'view-escala-nav-button active' : 'view-escala-nav-button'}
              onClick={() => setActiveTab('escala')}
            >
              Escala
            </button>
          </li>
        </ul>
      </nav>

      {/* Contenido según la pestaña seleccionada */}
      <div className="view-factura-tab-content">
        {activeTab === 'general' && <General factura={factura} escala={escala} />}
        {activeTab === 'escala' && <Escala escalamostrar={escala} />}
      </div>
      <ToastContainer
        />
    </div>
  );
};

export default ViewFactura;