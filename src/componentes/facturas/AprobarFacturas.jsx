



function AprobarFacturas() {
  const pdfUrl = '/uploads/Historial.pdf'; // Ruta relativa desde la raíz pública

  return (
    <div>
      <h1>Aprobar Factura</h1>

      <Document file={pdfUrl}>
        <Page pageNumber={1} />
      </Document>
    </div>
  );
}

export default AprobarFacturas;