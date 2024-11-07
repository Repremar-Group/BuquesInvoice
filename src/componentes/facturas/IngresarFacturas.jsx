import React from 'react'

const IngresarFacturas = ({isLoggedIn}) => {
  return (
    <div className="AgregarCliente-container">
            <form onSubmit={handleSubmitAgregarUsuario} className='formulario-agregar-cliente'>
                <h2 className='titulo-estandar'>Agregar Cliente</h2>
                <div className='div_primerrenglon-agregarusuario'>
                    <div>
                        <label htmlFor="nombre">Nombre:</label>
                        <input
                            type="text"
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="razonsocial">Razon Social:</label>
                        <input
                            type="text"
                            id="razonsocial"
                            value={razonSocial}
                            onChange={(e) => setRazonSocial(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className='div_segundorenglon-agregarusuario'>
                    <div>
                        <label htmlFor="direccion">Direccion:</label>
                        <input
                            type="text"
                            id="direccion"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="Zona">Zona:</label>
                        <input
                            type="text"
                            id="zona"
                            value={zona}
                            onChange={(e) => setZona(e.target.value)}
                        />

                    </div>
                </div>

                <div className='div_tercerrenglon-agregarusuario'>
                    <div>
                        <label htmlFor="Ciudad">Ciudad:</label>
                        <input
                            type="text"
                            id="ciudad"
                            value={ciudad}
                            onChange={(e) => setCiudad(e.target.value)}
                            required
                        />
                    </div>



                    <div>
                        <label htmlFor="codigo-postal">Codigo Postal:</label>
                        <input
                            type="text"
                            id="codigo-postal"
                            value={codigopostal}
                            onChange={(e) => setCodigoPostal(e.target.value)}
                        />
                    </div>
                </div>



                <div className='div_cuartorenglon-agregarusuario'>
                    <div>
                        <label htmlFor="rut">Rut:</label>
                        <input
                            type="number"
                            id="rut"
                            value={rut}
                            onChange={(e) => setRut(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="iata">IATA:</label>
                        <input
                            type="number"
                            id="iata"
                            value={iata}
                            onChange={(e) => setIata(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="cass">Cass:</label>
                        <select
                            id="cass"
                            value={cass}
                            onChange={(e) => setCass(e.target.value)}

                        >
                            <option value="">Selecciona el Cass</option>
                            <option value="false">No</option>
                            <option value="true">Si</option>
                        </select>
                    </div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                </div>


                <div className='div_quintorenglon-agregarusuario'>
                    <div>
                        <label htmlFor="pais">País:</label>
                        <input
                            type="text"
                            id="pais"
                            value={pais}
                            onChange={(e) => setPais(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="mail"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="tel">Tel:</label>
                        <input
                            type="text"
                            id="tel"
                            value={tel}
                            onChange={(e) => setTel(e.target.value)}
                            required
                        />
                    </div>
                </div>


                <div className='div_septimorenglon-agregarusuario'>
                    <div>
                        <label htmlFor="tipoComprobante">Tipo de Comprobante:</label>
                        <select
                            id="tipoComprobante"
                            value={tipoComprobante}
                            onChange={(e) => setTipoComprobante(e.target.value)}
                            required
                        >
                            <option value="">Selecciona un tipo de Comprobante</option>
                            <option value="efactura">E-Factura</option>
                            <option value="eticket">E-Ticket</option>
                            <option value="efacturaca">E-Factura Cuenta Ajena</option>
                            <option value="eticketca">E-Ticket Cuenta Ajena</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="tipoMoneda">Moneda:</label>
                        <select
                            id="tipoMoneda"
                            value={tipoMoneda}
                            onChange={(e) => setTipoMoneda(e.target.value)}
                            required
                        >
                            <option value="">Selecciona una Moneda</option>
                            <option value="dolares">Dolares</option>
                            <option value="pesos">Pesos</option>
                            <option value="euros">Euros</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="tipoIVA">Tipo de IVA:</label>
                        <select
                            id="tipoIVA"
                            value={tipoIVA}
                            onChange={(e) => setTipoIVA(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un tipo de IVA</option>
                            <option value="iva22">IVA 22%</option>
                            <option value="excento">Exento</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="saldo">Saldo:</label>
                        <input
                            type="number"
                            id="saldo"
                            value={saldo}
                            onChange={(e) => setSaldo(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className='botonesagregarusuario'>
                    <button type="submit" className='btn-agregar-cliente'>Agregar Cliente</button>

                    <Link to="/clientes"><button className="btn-Salir-Agregar-Cliente">Volver</button></Link>
                </div>


            </form>
        </div>
    );
}


export default IngresarFacturas