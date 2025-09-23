import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './parametros.css';
import { environment } from '../../environment';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ParametrosTempora = () => {
    const [anio, setAnio] = useState('');
    const [anioActual, setAnioActual] = useState('');
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Cargar el año actual desde la base
    const fetchAnio = async () => {
        try {
            const res = await axios.get(`${environment.API_URL}obteneraniotemporada`);
            if (res.data && res.data.anio) {
                setAnioActual(res.data.anio);
                setAnio(res.data.anio);
            }
        } catch (err) {
            console.error('Error al obtener el año:', err);
            setError('Error al obtener el año actual');
        }
    };

    // Guardar el año nuevo en la base
    const handleGuardarAnio = async (e) => {
        e.preventDefault();
        if (!anio || isNaN(anio) || anio.length !== 4) {
            toast.error('Ingresa un año valido (YYYY)', { position: 'top-right', autoClose: 3000 });
            return;
        }
        try {
            await axios.put(`${environment.API_URL}actualizaraniotemporada`, { anio });
            toast.success('Año actualizado correctamente', { position: 'top-right', autoClose: 3000 });
            fetchAnio();
        } catch (err) {
            console.error('Error al actualizar el año:', err);
            toast.error('Error al actualizar el año', { position: 'top-right', autoClose: 3000 });
        }
    };

    useEffect(() => {
        fetchAnio();
    }, []);

    return (
        <div className="formularioschicos">
            <div className="titulo-estandar">
                <h1>Temporada</h1>
            </div>

            <div className="table-container">
                <form onSubmit={handleGuardarAnio}>
                    <p className="texto-info">
                        Ingrese el año correspondiente a Enero de la temporada actual.
                    </p>
                    <div className="div-parametros">
                        <input
                            className="input_buscar"
                            type="text"
                            placeholder="Ingrese año (YYYY)"
                            value={anio}
                            onChange={(e) => setAnio(e.target.value)}
                        />
                        <button type="submit" className="add-button">✔️</button>
                    </div>
                </form>

                {anioActual && (
                    <p className="info-actual">Año actual: <strong>{anioActual}</strong></p>
                )}

                {error && <p className="error">{error}</p>}
                {mensaje && <p className="mensaje">{mensaje}</p>}
            </div>
            <ToastContainer/>
        </div>
    );
};

export default ParametrosTempora;