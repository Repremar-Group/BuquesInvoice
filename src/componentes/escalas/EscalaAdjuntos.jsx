import React, { useState } from 'react';
import axios from 'axios';
import './previewescalas.css';
import { environment } from '../../environment';
import '../facturas/Facturas.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EscalaAdjuntos = ({ id, closeModal, fetchAdjuntos }) => {
  const [file, setFile] = useState(null);
  const [tipo, setTipo] = useState('');
  const [notas, setNotas] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTipoChange = (e) => {
    setTipo(e.target.value);
  };

  const handleNotasChange = (e) => {
    setNotas(e.target.value);
  };

  const handleUpload = async () => {
    if (!file || !tipo) {
      toast.error('Debe seleccionar un "Tipo" y un Archivo', { position: 'top-right', autoClose: 3000 });
      return;
    }
    const usuario = localStorage.getItem('usuario');
    const fecha = new Date().toISOString().split('T')[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipoarchivo', tipo);
    formData.append('notasarchivo', notas);
    formData.append('escalaarchivo', id);
    formData.append('usuarioarchivo', usuario);
    formData.append('fechaarchivo', fecha);

    try {
      await axios.post(`${environment.API_URL}uploadescalaarchivo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Archivo subido correctamente', { position: 'top-right', autoClose: 3000 });
      // Refrescar la lista de adjuntos en el componente padre

      await fetchAdjuntos();


      closeModal();
    } catch (err) {
      console.error('Error al subir el archivo:', err);
      toast.error('Error al subir el archivo', { position: 'top-right', autoClose: 3000 });
    }
  };

  const inputStyle = {
    border: '2px solid #0d2d5e',
    padding: '0.5rem',
    borderRadius: '6px',
    fontSize: '1rem',
    width: '100%',
    marginBottom: '1rem',
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem',
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: '#0d2d5e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginRight: '0.5rem',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
  };

  return (
    <div className="modal-servicios">
      <div className="titulo-estandar">
        <h1>Adjuntos</h1>
      </div>

      <div style={containerStyle}>
        <div>
          <label style={labelStyle}>Tipo:</label>
          <select value={tipo} onChange={handleTipoChange} style={inputStyle}>
            <option value="">Seleccionar tipo</option>
            <option value="Mail">Mail</option>
            <option value="Cumplido">Cumplido</option>
            <option value="Traslado">Traslado</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Archivo:</label>
          <input type="file" onChange={handleFileChange} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Notas:</label>
          <textarea
            placeholder="Notas"
            value={notas}
            onChange={handleNotasChange}
            style={textareaStyle}
          />
        </div>
      </div>

      <div>
        <button style={buttonStyle} onClick={handleUpload}>Confirmar</button>
        <button style={buttonStyle} onClick={closeModal}>Cancelar</button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EscalaAdjuntos;