import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './parametros.css';

const ParametrosServicios = ({ isLoggedIn }) => {
    const [servicio, setServicio] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [servicios, setServicios] = useState([]);
    const [error, setError] = useState('');

    const handleEliminar = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/eliminarmoneda/${id}`);
            fetchServicios(); // Actualiza la lista de ciudads después de eliminar
        } catch (error) {
            console.error('Error al eliminar servicio:', error);
            setError('Error al eliminar servicio');
        }
    };

    const fetchServicios = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/previewmonedas'); // Cambia este endpoint según tu backend
            setServicios(response.data); // Asigna los datos de ciudads al estado
        } catch (err) {
            setError('Error fetching flights');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchServicios(); // Llama a la función para obtener los ciudads
    }, []);

    const itemsPerPage = 8;
    const filteredData = servicios.filter((row) =>
        row.servicio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const handleAgregarServicio = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/agregarMoneda', { servicio: servicio });
            setServicio(''); // Resetea el input después de enviar el ciudad
            fetchServicios(); // Actualiza la lista de ciudads
        } catch (error) {
            console.error('Error al agregar servicio:', error);
            setError('Error al agregar servicio');
        }
    };

    return (
        <div className="formularioschicos">
            <div className='titulo-estandar'><h1>Servicios</h1></div>
            <div className='table-container'>
                <form onSubmit={handleAgregarServicio} >
                    <div className='div-parametros'>
                        <input className='input_buscar'
                            type="text"
                            placeholder="Agregar Servicio"
                            value={servicio}
                            onChange={(e) => setServicio(e.target.value)}
                        />
                        <button type='submit' className="add-button">➕</button>
                    </div>
                </form>
                <div className="small-table-container">
                    <table className="small-table">
                        <thead>
                            <tr>
                                <th>Puerto</th>
                                <th>Selección</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>MVD</td>
                                <td>
                                    <input type="checkbox" />
                                </td>
                            </tr>
                            <tr>
                                <td>PDE</td>
                                <td>
                                    <input type="checkbox" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <table className='tabla-parametros'>
                    <thead>
                        <tr>
                            <th>Servicio</th>
                            <th>Puertos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedItems.map((row) => (
                            <tr key={row.idpuertos}>
                                <td>{row.servicio}</td>
                                <td>{row.puertos}</td>
                                <td>
                                    <button className="action-button" onClick={() => handleEliminar(row.idservicios)}>❌</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <ReactPaginate
                    previousLabel={"Anterior"}
                    nextLabel={"Siguiente"}
                    breakLabel={"..."}
                    pageCount={pageCount}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    activeClassName={"active"}
                />
            </div>
        </div>
    );
};

export default ParametrosServicios