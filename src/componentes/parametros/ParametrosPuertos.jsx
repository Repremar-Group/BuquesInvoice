import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import'./parametros.css';

const ParametrosPuertos = ({ isLoggedIn }) => {
    const [puerto, setpuerto] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [puertos, setPuertos] = useState([]);
    const [error, setError] = useState('');

    const handleEliminar = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/eliminarmoneda/${id}`);
            fetchPuertos(); // Actualiza la lista de ciudads después de eliminar
        } catch (error) {
            console.error('Error al eliminar puerto:', error);
            setError('Error al eliminar puerto');
        }
    };

    const fetchPuertos = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/previewmonedas'); // Cambia este endpoint según tu backend
            setPuertos(response.data); // Asigna los datos de ciudads al estado
        } catch (err) {
            setError('Error fetching flights');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPuertos(); // Llama a la función para obtener los ciudads
    }, []);

    const itemsPerPage = 8;
    const filteredData = puertos.filter((row) =>
        row.puerto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const handleAgregarPuerto = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/agregarMoneda', { puerto: puerto });
            setPuerto(''); // Resetea el input después de enviar el ciudad
            fetchPuertos(); // Actualiza la lista de ciudads
        } catch (error) {
            console.error('Error al agregar puerto:', error);
            setError('Error al agregar puerto');
        }
    };

    return (
        <div className="formularioschicos">
            <div className='titulo-estandar'><h1>Puertos</h1></div>

            <div className='table-container'>
                <form onSubmit={handleAgregarPuerto} >
                    <div className='div-parametros'>
                        <input className='input_buscar'
                            type="text"
                            placeholder="Agregar Puerto"
                            value={puerto}
                            onChange={(e) => setPuerto(e.target.value)}
                        />
                        <button type='submit' className="add-button">➕</button>
                    </div>
                </form>

                <table className='tabla-parametros'>
                    <thead>
                        <tr>
                            <th>Puerto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedItems.map((row) => (
                            <tr key={row.idpuertos}>
                                <td>{row.puerto}</td>
                                <td>
                                    <button className="action-button" onClick={() => handleEliminar(row.idpuertos)}>❌</button>
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

export default ParametrosPuertos;
