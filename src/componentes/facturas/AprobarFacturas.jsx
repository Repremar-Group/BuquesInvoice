import React from 'react';
import './Facturas.css'
function AprobarFacturas() {
  const pdfUrl = '/uploads/175853.pdf'; // Ruta del archivo PDF

  return (
    <div>
      <h1>Aprobar Factura</h1>
      <div className='pdf-container'>
      <embed
        src={pdfUrl}
        type="application/pdf"
        width="100%"
        height="600px"
        style={{ border: 'none' }}
      />
      </div>
      

    </div>
  );
}

export default AprobarFacturas;