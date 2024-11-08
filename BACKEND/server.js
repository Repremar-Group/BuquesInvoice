const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
app.use(cors());

// Configura la conexión a tu servidor MySQL flexible de Azure
const connectionitinerarios = mysql.createConnection({
    host: 'itinerarios.mysql.database.azure.com', // Tu servidor MySQL flexible de Azure
    user: 'itinerariosdba', // El usuario que creaste para la base de datos
    password: '!Masterkey_22', // La contraseña del usuario
    database: 'itinerarios_prod', // El nombre de la base de datos
    port: 3306, // Puerto predeterminado de MySQL
    connectTimeout: 60000,
  });
  // Probar la conexión
  connectionitinerarios.connect((err) => {
    if (err) {
      console.error('Error conectando a la base de datos:', err.stack);
      return;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
  });

//---------------------------------------------------------------------------------------------------------------------------------
//Consumo de la bd itinerarios:

// Endpoint para obtener todos los itinerarios con sus datos relacionados
app.get('/api/previewescalas', (req, res) => {
    // Consulta SQL con JOINs para obtener todos los datos de cada tabla relacionada
    const query = `
      SELECT 
        itinerarios.id,
        DATE_FORMAT(itinerarios.eta, '%d-%m-%Y') AS eta,
        lineas.nombre AS linea,
        buques.nombre AS buque,
        puertos.nombre AS puerto,
        operadores.nombre AS operador
      FROM itinerarios
      LEFT JOIN lineas ON itinerarios.id_linea = lineas.id
      LEFT JOIN buques ON itinerarios.id_buque = buques.id
      LEFT JOIN puertos ON itinerarios.id_puerto = puertos.id
      LEFT JOIN operadores ON itinerarios.id_operador1 = operadores.id
      WHERE itinerarios.eta <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY itinerarios.eta DESC
    `;
  
    // Ejecutar la consulta
    connectionitinerarios.query(query, (err, results) => {
      if (err) {
        console.error('Error al consultar los datos de los itinerarios:', err);
        return res.status(500).json({ error: 'Error al consultar los datos de los itinerarios' });
      }
  
      // Enviar todos los datos de los itinerarios y sus relaciones como respuesta
      res.json(results);
    });
  });

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
