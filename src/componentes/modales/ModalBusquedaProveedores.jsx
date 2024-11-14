import React from 'react';
import { Link } from 'react-router-dom';
import './modales.css';

const ModalBusquedaProveedores = ({ isOpen, closeModal, filteredProveedores, handleSelectProveedor }) => {
    if (!isOpen) return null; // Evita renderizar el modal si no está abierto

    return (
        <div className="modalproveedores" onClick={closeModal}>
            <div className="modal-content-proveedores" onClick={(e) => e.stopPropagation()}>
                <h2 className='titulo-estandar'>Resultados de Búsqueda</h2>


                {filteredProveedores.length > 0 ? (
                    <div className="tabla-container">
                        <table className='tabla-proveedores'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Seleccionar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProveedores.map(proveedor => (
                                    <tr key={proveedor.idproveedores}>
                                        <td>{proveedor.idproveedores}</td>
                                        <td>{proveedor.nombre}</td>
                                        <td>
                                            <button className='btn-estandartablas' onClick={() => handleSelectProveedor(proveedor)}>Seleccionar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                        ) : (
                        <div>
                            <p className='p_modaltraerclientes'>No se encontro el Proveedor.</p>
                            <Link to="/clientes/agregar">
                                <button className='btn-estandar'>Crear Proveedor</button>
                            </Link>
                        </div>
                    
        )}
                    </div>
    </div>
            );
};

            export default ModalBusquedaProveedores;
