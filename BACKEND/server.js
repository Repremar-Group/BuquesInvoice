const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// Middleware para manejar el archivo
app.use(fileUpload());
//Endpoint para cargar pdfs desde ingreso de facturas
app.post('/api/Agregarfactura', (req, res) => {
    // Verificar si se han recibido archivos (puede ser uno o ambos)
    if (!req.files || (!req.files.fileFactura && !req.files.fileNC)) {
        return res.status(400).send('Se requiere al menos un archivo.');
    }

    // Inicializar un objeto para almacenar las rutas de los archivos
    const archivosSubidos = {};

    // Verificar si 'fileFactura' existe y moverlo
    if (req.files.fileFactura) {
        const archivoFactura = req.files.fileFactura;
        const uploadPathFactura = path.join(__dirname, 'uploads', archivoFactura.name);

        archivoFactura.mv(uploadPathFactura, (err) => {
            if (err) {
                return res.status(500).send(err);
            }
            archivosSubidos.fileFacturaUrl = `/uploads/${archivoFactura.name}`; // Guardamos la ruta del archivo
        });
    }

    // Verificar si 'fileNC' existe y moverlo
    if (req.files.fileNC) {
        const archivoNC = req.files.fileNC;
        const uploadPathNC = path.join(__dirname, 'uploads', archivoNC.name);

        archivoNC.mv(uploadPathNC, (err) => {
            if (err) {
                return res.status(500).send(err);
            }
            archivosSubidos.fileNCUrl = `/uploads/${archivoNC.name}`; // Guardamos la ruta del archivo
        });
    }

    // Esperar que se muevan los archivos y luego responder
    setTimeout(() => {
        res.json({
            message: 'Archivos subidos exitosamente',
            files: archivosSubidos, // Incluimos las rutas de los archivos cargados
        });
    }, 1000);  // Esperamos un poco para asegurarnos de que los archivos han sido movidos
});
app.listen(5000, () => {
  console.log('Servidor corriendo en el puerto 5000');
});
