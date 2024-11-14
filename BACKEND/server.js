const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

<<<<<<< Updated upstream
=======
const connectionbuquesinvoice = mysql.createConnection({
  host: 'itinerarios.mysql.database.azure.com', // Tu servidor MySQL flexible de Azure
  user: 'itinerariosdba', // El usuario que creaste para la base de datos
  password: '!Masterkey_22', // La contraseña del usuario
  database: 'buquesinvoice', // El nombre de la base de datos
  port: 3306, // Puerto predeterminado de MySQL
  connectTimeout: 60000,
});
// Probar la conexión
connectionbuquesinvoice.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.stack);
    return;
  }
  console.log('Conexión exitosa a la base de datos MySQL');
});

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
// Endpoint para buscar proveedores
app.get('/api/obtenerproveedor', (req, res) => {
  const search = req.query.search;
  const query = 'SELECT * FROM proveedores WHERE nombre LIKE ?';
  connectionbuquesinvoice.query(query, [`%${search}%`], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la consulta' });
    }
    res.json(results);
  });
});

// Endpoint para obtener todas las escalas que coincidan con lo buscado en agragar factura
app.get('/api/buscarescalaasociada', (req, res) => {
  const searchTerm = req.query.searchTermEscalaAsociada || ''; // Obtenemos el término de búsqueda desde la query string

  // Consulta SQL con JOINs para obtener todos los datos de cada tabla relacionada, filtrado por buque
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
      AND buques.nombre LIKE ? -- Filtro por buque usando el término de búsqueda
    ORDER BY itinerarios.eta DESC
  `;

  // Preparamos el término de búsqueda para el operador LIKE
  const searchTermWithWildcards = `%${searchTerm}%`;

  // Ejecutar la consulta con el término de búsqueda como parámetro
  connectionitinerarios.query(query, [searchTermWithWildcards], (err, results) => {
    if (err) {
      console.error('Error al consultar los datos de los itinerarios:', err);
      return res.status(500).json({ error: 'Error al consultar los datos de los itinerarios' });
    }

    // Enviar todos los datos de los itinerarios y sus relaciones como respuesta
    res.json(results);
  });
});


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

app.get('/api/obtenerserviciosescala', (req, res) => {
  const escalaId = req.query.escalaId; // Obtiene el id de la escala desde los parámetros de la query
  console.log('Received request for /api/servicios-escala');
  console.log('escalaId recibido:', escalaId); // Asegúrate de que el ID es correcto

  // Realiza la consulta para obtener los servicios asociados a la escala
  const query = 'SELECT * FROM serviciosescalas WHERE idescala = ?';

  connectionbuquesinvoice.query(query, [escalaId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la consulta de servicios' });
    }
    res.json(results); // Devuelve los servicios encontrados
  });
});
//-------------------------------------------------------------------------------------------------------------------------------------
//Manejo de archivos para facturas
>>>>>>> Stashed changes
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
    const uploadPathFactura = path.join(__dirname, '..', 'public', 'Facturas', archivoFactura.name);

    archivoFactura.mv(uploadPathFactura, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      archivosSubidos.fileFacturaUrl = `/Facturas/${archivoFactura.name}`; // Guardamos la ruta del archivo
    });
  }

  // Verificar si 'fileNC' existe y moverlo
  if (req.files.fileNC) {
    const archivoNC = req.files.fileNC;
    const uploadPathNC = path.join(__dirname, '..', 'public', 'Nc', archivoNC.name);

    archivoNC.mv(uploadPathNC, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      archivosSubidos.fileNCUrl = `/Nc/${archivoNC.name}`; // Guardamos la ruta del archivo
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
app.listen(5001, () => {
  console.log('Servidor corriendo en el puerto 5000');
});


// Endpoint para agregar un servicio a una escala
app.post('/api/agregarServicio', async (req, res) => {
  const { servicio, id } = req.body;

  if (!servicio || !id) {
    return res.status(400).json({ error: 'Faltan datos necesarios para agregar el servicio' });
  }

  try {
    const query = 'INSERT INTO servicios (nombre, id_escala) VALUES ($1, $2) RETURNING *';
    const values = [servicio, id];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Devuelve el servicio agregado
  } catch (error) {
    console.error('Error al agregar el servicio:', error);
    res.status(500).json({ error: 'Hubo un error al agregar el servicio' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Endpoint para obtener una escala específica por id
app.get('/api/viewescala/:id', (req, res) => {
  const escalaId = req.params.id; // Obtenemos el id de la URL

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
    WHERE itinerarios.id = ?;
  `;

  // Ejecutar la consulta con el id de la escala como parámetro
  connectionitinerarios.query(query, [escalaId], (err, results) => {
    if (err) {
      console.error('Error al consultar los datos de la escala:', err);
      return res.status(500).json({ error: 'Error al consultar los datos de la escala' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Escala no encontrada' });
    }

    // Enviar los datos de la escala encontrada como respuesta
    res.json(results[0]);
  });
});
