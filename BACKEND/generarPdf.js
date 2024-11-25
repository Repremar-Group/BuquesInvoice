const PDFDocument = require('pdfkit');
const fs = require('fs');

const generarPDF = () => {
    const doc = new PDFDocument();
    const ruta = './prueba.pdf';

    doc.fontSize(18).text('¡Hola, Vamo los Pibe!', { align: 'center' });
    doc.fontSize(12).text('Este pdf se genero desde el backend.');

    doc.pipe(fs.createWriteStream(ruta));
    doc.end();

    console.log(`PDF generado en: ${ruta}`);
};

generarPDF();