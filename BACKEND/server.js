

const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql');
const mysql2 = require('mysql2/promise');
const Busboy = require('busboy');

const multer = require('multer'); // Middleware para manejar la carga de archivos
const { BlobServiceClient } = require('@azure/storage-blob');


//Constantes para manejar las caratulas con pdflib
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());  // Debe estar antes de las rutas}
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});
// Crear un pool para la base de datos `buquesinvoice`
const poolBuquesInvoice = mysql2.createPool({
  host: 'itinerarios.mysql.database.azure.com',
  user: 'itinerariosdba',
  password: '!Masterkey_22',
  database: 'buquesinvoice',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 20, // Número máximo de conexiones en el pool
  queueLimit: 0,       // Sin límite en la cola de espera
  connectTimeout: 60000, // Tiempo máximo para conectar
  idleTimeout: 30000,   // Cerrar conexiones inactivas después de 30 segundos
});

// Crear un pool para la base de datos `itinerarios_prod`
const poolItinerarios = mysql2.createPool({
  host: 'itinerarios.mysql.database.azure.com',
  user: 'itinerariosdba',
  password: '!Masterkey_22',
  database: 'itinerarios_prod',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  connectTimeout: 60000, // Tiempo máximo para conectar
  idleTimeout: 30000,   // Cerrar conexiones inactivas después de 30 segundos
});

// Función para verificar el estado de cada pool
const monitorPool = (pool, name) => {
  setInterval(async () => {
    try {
      // Realiza una consulta simple para mantener la conexión activa
      const [rows] = await pool.query('SELECT 1');
      console.log(`${name} Pool está activo:`, {
        // Aquí podrías agregar detalles del estado según lo que quieras rastrear
        // Ejemplo: cantidad de conexiones activas, si es necesario
        message: 'Conexión activa.',
      });
    } catch (err) {
      console.error(`${name} Pool error:`, err.message);
    }
  }, 900000); // Monitorear cada 10 segundos
};

// Monitorear ambos pools
monitorPool(poolBuquesInvoice, 'BuquesInvoice');
monitorPool(poolItinerarios, 'Itinerarios');
// Monitorear conexiones activas y liberadas
poolBuquesInvoice.on('acquire', (connection) => {
  console.log('Conexión adquirida para BuquesInvoice:', connection.threadId);
});

poolBuquesInvoice.on('release', (connection) => {
  console.log('Conexión liberada de BuquesInvoice:', connection.threadId);
});

poolItinerarios.on('acquire', (connection) => {
  console.log('Conexión adquirida para Itinerarios:', connection.threadId);
});

poolItinerarios.on('release', (connection) => {
  console.log('Conexión liberada de Itinerarios:', connection.threadId);
});

const AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=buquesinvoicestorage;AccountKey=PRS6t7RBIlqdX3IbicTEkX17CfnCkZmvXjrbU6Wv5ZB3TMu0qX0h4p5xhgZVtXsq0LAARFMP54C4+AStORDsuQ==;EndpointSuffix=core.windows.net';
/*const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerFacturaClient = blobServiceClient.getContainerClient('facturas');
const containerNCClient = blobServiceClient.getContainerClient('nc');*/
const upload = multer({ storage: multer.memoryStorage() });

//---------------------------------------------------------------------------------------------------------------------------------------------
//Endpoint para obtener una sola factura.
// Endpoint para obtener los detalles de una factura
app.get('/api/obtenerfactura/:id', async (req, res) => {
  console.log('Solicitud recibida en el endpoint /api/obtenerfactura/:id');
  const { id } = req.params;
  console.log(`ID recibido en el endpoint: ${id}`);
  const query = `
    SELECT idfacturas, numero, DATE(fecha) AS fecha, moneda, monto, escala_asociada, proveedor, 
           url_factura, url_notacredito, estado, gia, pre_aprobado, comentarios
    FROM facturas
    WHERE idfacturas = ?
  `;


  try {
    // Realiza la consulta utilizando el pool
    const [results] = await poolBuquesInvoice.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json({ factura: results[0] });
  } catch (err) {
    console.error('Error al obtener los detalles de la factura:', err);
    return res.status(500).json({ error: 'Error al obtener los detalles de la factura' });
  }
});
//Consumo de la bd de buquesinvoice

// Endpoint para insertar datos de la factura
// Endpoint para insertar datos de la factura
app.post('/api/insertardatosfactura', async (req, res) => {
  console.log("Datos recibidos:", req.body);  // Verificar los datos que llegan

  const { numero, fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, gia, pre_aprobado, servicios } = req.body;

  // Verificar si se proporcionan servicios
  if (!servicios || !Array.isArray(servicios) || servicios.length === 0) {
    return res.status(400).send("Error: Se deben proporcionar servicios asociados a la factura.");
  }

  // Verificar si al menos una de las URLs (factura o nota de crédito) está presente
  if ((!url_factura && !url_notacredito) && url_factura != 'NaN') {
    return res.status(400).send("Error: Se debe proporcionar al menos una URL (factura o nota de crédito).");
  }

  // Obtener la conexión del pool de buquesinvoice
  const connectionBuques = await poolBuquesInvoice.getConnection();

  try {
    // Iniciar la transacción
    await connectionBuques.beginTransaction();

    // Insertar la factura
    const sqlFactura = `
      INSERT INTO facturas 
      (numero, fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, gia, pre_aprobado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valuesFactura = [numero, fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, gia, pre_aprobado];

    const [resultFactura] = await connectionBuques.query(sqlFactura, valuesFactura);
    const facturaId = resultFactura.insertId;  // Obtener el ID de la factura insertada

    // Insertar los servicios asociados
    const sqlServicios = `
      INSERT INTO serviciosfacturas (nombre, estado, idfactura) 
      VALUES ?
    `;
    const serviciosValues = servicios.map(servicio => [
      servicio.nombre,
      servicio.estado,
      facturaId  // Usamos el ID de la factura insertada
    ]);

    await connectionBuques.query(sqlServicios, [serviciosValues]);

    // Commit de la transacción si ambos inserts fueron exitosos
    await connectionBuques.commit();

    return res.json({ message: "Factura y servicios insertados exitosamente", id: facturaId });

  } catch (err) {
    // Si hay algún error, hacer rollback de la transacción
    console.error("Error al insertar los datos:", err);
    await connectionBuques.rollback();
    return res.status(500).send("Error al insertar los datos", err);
  } finally {
    // Liberar la conexión del pool
    connectionBuques.release();
  }
});


//Endpoint para buscar servicios asociados a una escala
app.get('/api/obtenerserviciosescala', async (req, res) => {
  const escalaId = req.query.escalaId; // Obtiene el id de la escala desde los parámetros de la query
  console.log('Received request for /api/obtenerserviciosescala');
  console.log('escalaId recibido:', escalaId); // Asegúrate de que el ID es correcto

  // Verificar si el escalaId es válido
  if (!escalaId) {
    return res.status(400).json({ error: 'El parámetro escalaId es obligatorio.' });
  }

  try {
    // Obtener la conexión del pool de buquesinvoice
    const connectionBuques = await poolBuquesInvoice.getConnection();

    // Realiza la consulta para obtener los servicios asociados a la escala
    const query = 'SELECT * FROM serviciosescalas WHERE idescala = ?';
    const [results] = await connectionBuques.query(query, [escalaId]);

    // Si no se encuentran servicios asociados
    if (results.length === 0) {
      return res.json([]);
    }

    // Devuelve los servicios encontrados
    res.json(results);
    connectionBuques.release();
  } catch (err) {
    console.error('Error en la consulta de servicios:', err);
    return res.status(500).json({ error: 'Error al obtener los servicios asociados a la escala.' });
  }
});

// Endpoint para buscar proveedores
app.get('/api/obtenerproveedor', async (req, res) => {
  const search = req.query.search;

  // Verificar si se ha proporcionado un término de búsqueda
  if (!search) {
    return res.status(400).json({ error: 'El parámetro "search" es obligatorio.' });
  }

  try {
    // Obtener la conexión del pool de buquesinvoice
    const connectionBuques = await poolBuquesInvoice.getConnection();

    // Realiza la consulta para buscar proveedores
    const query = 'SELECT * FROM proveedores WHERE nombre LIKE ?';
    const [results] = await connectionBuques.query(query, [`%${search}%`]);

    // Si no se encuentran proveedores
    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron proveedores.' });
    }

    // Devuelve los proveedores encontrados
    res.json(results);
    connectionBuques.release();
  } catch (err) {
    console.error('Error en la consulta de proveedores:', err);
    return res.status(500).json({ error: 'Error al obtener los proveedores.' });
  }
});


//Endpoint para obtener el listado de facturas 
app.get('/api/previewfacturas', async (req, res) => {
  // Consulta SQL para obtener las facturas y sus datos relacionados
  const query = `
  SELECT 
    idfacturas, 
    numero, 
    DATE_FORMAT(fecha, '%d-%m-%Y') AS fecha, 
    moneda, 
    monto, 
    escala_asociada, 
    proveedor, 
    estado, 
    gia,
    url_factura,
    url_notacredito
  FROM facturas
`;

  try {
    // Ejecutar la consulta usando el pool
    const [results] = await poolBuquesInvoice.query(query);

    // Enviar los datos de las facturas como respuesta
    res.json(results);
  } catch (err) {
    console.error('Error al consultar los datos de las facturas:', err);
    res.status(500).json({ error: 'Error al consultar los datos de las facturas' });
  }
});

// Endpoint para obtener servicios de facturas
app.get('/api/obtenerserviciosfacturas', async (req, res) => {
  try {
    // Obtener la conexión del pool de buquesinvoice
    const connectionBuques = await poolBuquesInvoice.getConnection();

    // Consulta para obtener los servicios de facturas
    const query = `
      SELECT 
        idserviciosfacturas, 
        nombre, 
        estado, 
        idfactura
      FROM serviciosfacturas
    `;

    // Ejecutar la consulta
    const [results] = await connectionBuques.query(query);

    // Devolver los resultados
    res.json(results);
    connectionBuques.release();
  } catch (err) {
    console.error('Error al consultar los datos:', err);
    return res.status(500).json({ error: 'Error al consultar los datos' });
  }
});

//---------------------------------------------------------------------------------------------------------------------------------
//Consumo de la bd itinerarios:


// Endpoint para obtener todas las escalas que coincidan con lo buscado en agragar factura
app.get('/api/buscarescalaasociada', async (req, res) => {
  const searchTerm = req.query.searchTermEscalaAsociada || ''; // Obtenemos el término de búsqueda desde la query string

  // Consulta SQL con JOINs para obtener todos los datos de cada tabla relacionada, filtrado por buque
  const query = `
    SELECT 
  itinerarios.id,
  itinerarios.id_puerto,
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
  AND buques.nombre LIKE ?  -- Filtro por buque usando el término de búsqueda
  AND (itinerarios.id_puerto = 1 OR itinerarios.id_puerto = 4)
ORDER BY itinerarios.eta DESC;
  `;
  // Preparamos el término de búsqueda para el operador LIKE
  const searchTermWithWildcards = `%${searchTerm}%`;

  try {
    // Obtener la conexión del pool de itinerarios
    const connectionItinerarios = await poolItinerarios.getConnection();

    // Ejecutar la consulta con el término de búsqueda como parámetro
    const [results] = await connectionItinerarios.query(query, [searchTermWithWildcards]);

    // Devolver los resultados
    res.json(results);
    connectionItinerarios.release();
  } catch (err) {
    console.error('Error al consultar los datos de los itinerarios:', err);
    return res.status(500).json({ error: 'Error al consultar los datos de los itinerarios' });
  }
});


// Endpoint para obtener todos los itinerarios con sus datos relacionados
app.get('/api/previewescalas', async (req, res) => {
  // Consulta SQL con JOINs para obtener todos los datos de cada tabla relacionada
  const query = `
    SELECT 
      itinerarios.id,
      DATE_FORMAT(itinerarios.eta, '%d-%m-%Y') AS eta,
      lineas.nombre AS linea,
      buques.nombre AS buque,
      puertos.nombre AS puerto,
      operadores.nombre AS operador,
      itinerarios.id_puerto
    FROM itinerarios
    LEFT JOIN lineas ON itinerarios.id_linea = lineas.id
    LEFT JOIN buques ON itinerarios.id_buque = buques.id
    LEFT JOIN puertos ON itinerarios.id_puerto = puertos.id
    LEFT JOIN operadores ON itinerarios.id_operador1 = operadores.id
    WHERE itinerarios.eta <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      AND itinerarios.eta >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
      AND (itinerarios.id_puerto = 1 OR itinerarios.id_puerto = 4)
    ORDER BY itinerarios.eta DESC
  `;
  try {
    const [results] = await poolItinerarios.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error al consultar los datos de los itinerarios:', err);
    res.status(500).json({ error: 'Error al consultar los datos de los itinerarios' });
  }
});
//-------------------------------------------------------------------------------------------------------------------------------------
//Manejo de archivos para facturas
// Middleware para manejar el archivo
app.use(fileUpload());
app.post('/api/Agregarfactura', async (req, res) => {
  // Verificar si se han recibido archivos (puede ser uno o ambos)
  if ((!req.files || (!req.files.fileFactura && !req.files.fileNC) && !req.body.isPreAprobado)) {
    console.log(req.body.isPreAprobado);
    return res.status(400).send('Se requiere al menos un archivo.');
  }
  console.log(req.body.isPreAprobado);
  if (req.body.isPreAprobado) {
    return res.status(200).json({ message: 'Pre aprobado' });
  }

  // Inicializar un objeto para almacenar las rutas de los archivos
  const archivosSubidos = {};

  // Verificar si 'fileFactura' existe y moverlo
  if (req.files.fileFactura) {
    const archivoFactura = req.files.fileFactura;
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerName = 'invoices'; // Replace with your container name
    const blobName = req.files.fileFactura.name; // Use original file name
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const contentType = 'application/pdf'; // Get MIME type from the uploaded file

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    console.log(req.files.fileFactura);


    // Upload file to Azure Blob Storage
    await blockBlobClient.upload(req.files.fileFactura.data, req.files.fileFactura.data.length, {
      blobHTTPHeaders: {
        blobContentType: contentType, // Set Content-Type explicitly
      },
    });
    archivosSubidos.fileFacturaUrl = `https://buquesinvoicestorage.blob.core.windows.net/invoices/${archivoFactura.name}`; // Guardamos la ruta del archivo

  }

  // Verificar si 'fileNC' existe y moverlo
  if (req.files.fileNC) {
    const archivoNC = req.files.fileNC;
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerName = 'notascredito'; // Replace with your container name
    const blobName = req.files.fileNC.name; // Use original file name
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const contentType = 'application/pdf'; // Get MIME type from the uploaded file
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    console.log(req.files.fileNC.name);


    // Upload file to Azure Blob Storage
    await blockBlobClient.upload(req.files.fileNC.data, req.files.fileNC.data.length, {
      blobHTTPHeaders: {
        blobContentType: contentType, // Set Content-Type explicitly
      },
    });
    archivosSubidos.fileNCUrl = `https://buquesinvoicestorage.blob.core.windows.net/notascredito/${archivoNC.name}`; // Guardamos la ruta del archivo


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

// Endpoint para obtener las facturas y sus URLs
app.get('/api/obtenerfacturas', async (req, res) => {
  const idOperador = req.query.id_operador; // Recibimos el id del operador

  if (!idOperador) {
    return res.status(400).json({ error: 'El ID del operador es requerido' });
  }

  // Consulta para obtener las facturas junto con la información de las escalas
  const query = `
    SELECT 
      f.idfacturas,
      f.numero,
      DATE(f.fecha) AS fecha,
      f.moneda,
      f.monto,
      f.escala_asociada,
      f.proveedor,
      f.url_factura,
      f.url_notacredito,
      f.estado,
      f.comentarios,
      e.id AS escala_id,
      DATE_FORMAT(e.eta, '%d-%m-%Y') AS eta,
      l.nombre AS linea,
      b.nombre AS buque,
      p.nombre AS puerto,
      o.nombre AS operador
    FROM buquesinvoice.facturas f
    LEFT JOIN itinerarios_prod.itinerarios e ON f.escala_asociada = e.id
    LEFT JOIN itinerarios_prod.lineas l ON e.id_linea = l.id
    LEFT JOIN itinerarios_prod.buques b ON e.id_buque = b.id
    LEFT JOIN itinerarios_prod.puertos p ON e.id_puerto = p.id
    LEFT JOIN itinerarios_prod.operadores o ON e.id_operador1 = o.id
    WHERE e.id_operador1 = ? AND f.url_factura != "NaN";
  `;

  try {
    // Obtener la conexión del pool de buquesinvoice
    const connection = await poolBuquesInvoice.getConnection();

    // Ejecutar la consulta con el idOperador como parámetro
    const [results] = await connection.query(query, [idOperador]);

    // Devolver los resultados
    res.json(results);

    // Liberar la conexión una vez que hemos terminado
    connection.release();
  } catch (err) {
    console.error('Error al ejecutar la consulta combinada:', err);
    return res.status(500).json({ error: 'Error al obtener las facturas y escalas' });
  }
});
// Endpoint para obtener las facturas y sus URLs
app.get('/api/obtenerfacturas2', async (req, res) => {
  const idOperador = req.query.id_operador; // Recibe el id del operador desde el frontend
  console.log('Operador recibido:', idOperador); // Aquí es donde se realiza el debug

  if (!idOperador) {
    return res.status(400).json({ error: 'El ID del operador es requerido' });
  }

  try {
    // Usamos el pool de itinerarios para obtener las escalas
    const connectionItinerarios = await poolItinerarios.getConnection();
    const [escalas] = await connectionItinerarios.query(`
      SELECT id 
      FROM itinerarios 
      WHERE id_operador1 = ?;
    `, [idOperador]);

    console.log('Escalas recibidas:', escalas); // Aquí es donde se realiza el debug

    // Si no hay escalas asociadas al operador, devolver un array vacío
    if (escalas.length === 0) {
      return res.json([]);
    }

    // Obtener los números de las escalas
    const escalaNumeros = escalas.map(escala => escala.id);
    console.log('Escala números:', escalaNumeros);

    // Usamos el pool de buquesinvoice para obtener las facturas basadas en las escalas
    const connectionBuquesinvoice = await poolBuquesinvoice.getConnection();
    const [facturas] = await connectionBuquesinvoice.query(`
      SELECT idfacturas, numero, DATE(fecha) AS fecha, moneda, monto, escala_asociada, proveedor, 
             url_factura, url_notacredito, estado, comentarios
      FROM facturas
      WHERE escala_asociada IN (?) AND url_factura != "NaN";
    `, [escalaNumeros]);

    console.log('Resultados de facturas:', facturas);

    // Devolver las facturas que coinciden con las escalas del operador
    res.json(facturas);

    // Liberar las conexiones
    connectionItinerarios.release();
    connectionBuquesinvoice.release();
  } catch (err) {
    console.error('Error en la consulta:', err);
    return res.status(500).json({ error: 'Error al obtener las facturas y escalas' });
  }
});

// Endpoint para guardar los comentarios de la nc en la base
app.put('/api/facturas/:idfactura/agregarcomentario', async (req, res) => {
  const { idfactura } = req.params;
  const { comentario } = req.body;

  try {
    const query = 'UPDATE facturas SET comentarios = ? WHERE idfacturas = ?';
    await poolBuquesInvoice.query(query, [comentario, idfactura]);
    res.status(200).json({ message: 'Comentario guardado correctamente.' });
  } catch (error) {
    console.error('Error al guardar el comentario:', error);
    res.status(500).json({ message: 'Error al guardar el comentario.' });
  }
});

//Endpoint para obtener servicios asociados a las facturas
app.get('/api/obtenerservicios/:idfactura', async (req, res) => {
  const { idfactura } = req.params;

  const query = `
    SELECT 
      idserviciosfacturas AS id,
      nombre AS servicio,
      estado
    FROM serviciosfacturas
    WHERE idfactura = ?
  `;
  try {
    // Usamos el pool de conexiones
    const [results] = await poolBuquesInvoice.query(query, [idfactura]);
    res.json(results);
  } catch (err) {
    console.error('Error al consultar los servicios:', err);
    res.status(500).json({ error: 'Error al consultar los servicios' });
  }
});

// Endpoint para actualizar el estado de un servicio
app.put('/api/actualizarestadoservicios/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const query = `
    UPDATE serviciosfacturas
    SET estado = ?
    WHERE idserviciosfacturas = ?
  `;
  try {
    const [results] = await poolBuquesInvoice.query(query, [estado, id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: 'Estado del servicio actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar el estado del servicio:', err);
    res.status(500).json({ error: 'Error al actualizar el estado del servicio' });
  }
});

// Endpoint para verificar y actualizar el estado de la factura
app.put('/api/facturas/:id/actualizar-estado', async (req, res) => {
  const { id } = req.params;
  const { cambioestadouser, fechacambioestado } = req.body;

  // Verifica que los parámetros necesarios estén presentes
  if (!cambioestadouser || !fechacambioestado) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos: cambioestadouser o fechacambioestado' });
  }
  try {
    const queryServicios = `
    SELECT estado
    FROM serviciosfacturas
    WHERE idfactura = ?
  `;

    const [servicios] = await poolBuquesInvoice.query(queryServicios, [id]);

    if (servicios.length === 0) {
      return res.status(404).json({ error: 'No se encontraron servicios para la factura' });
    }

    // Lógica para determinar el estado de la factura
    const estados = servicios.map((servicio) => servicio.estado);
    let nuevoEstadoFactura;

    if (estados.includes('Requiere NC')) {
      nuevoEstadoFactura = 'Requiere NC';
    } else if (estados.every((estado) => estado === 'Aprobado')) {
      nuevoEstadoFactura = 'Aprobado';
    } else {
      nuevoEstadoFactura = 'Pendiente';
    }

    const queryActualizarFactura = `
      UPDATE facturas
      SET estado = ?, cambioestadouser = ?, fechacambioestado = ?
      WHERE idfacturas = ?
    `;

    const [result] = await poolBuquesInvoice.query(queryActualizarFactura, [nuevoEstadoFactura, cambioestadouser, fechacambioestado, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json({ message: 'Estado de la factura actualizado', estado: nuevoEstadoFactura });

  } catch (err) {
    console.error('Error al actualizar el estado de la factura:', err);
    res.status(500).json({ error: 'Error al actualizar el estado de la factura' });
  }
});


// Endpoint para obtener una factura específica con su estado actualizado
app.get('/api/obtenerestadoactualizadofacturas/:idfacturas', async (req, res) => {
  const { idfacturas } = req.params;

  // Query para obtener los detalles de la factura con su estado
  const query = 'SELECT idfacturas, numero, DATE(fecha) AS fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, comentarios FROM facturas WHERE idfacturas = ?';
  try {
    // Ejecutar la consulta usando el pool de conexiones
    const [results] = await poolBuquesInvoice.query(query, [idfacturas]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    // Devolver los detalles de la factura encontrada
    res.json(results[0]);
  } catch (err) {
    console.error('Error al obtener la factura:', err);
    return res.status(500).json({ error: 'Error al obtener la factura' });
  }
});

// Endpoint para obtener los operadores
app.get('/api/obteneroperadores', async (req, res) => {
  const query = 'SELECT id, nombre FROM operadores WHERE operador COLLATE latin1_swedish_ci = "s" AND activo COLLATE latin1_swedish_ci = "s"'; // Solo traer operadores activos

  try {
    const [results] = await poolItinerarios.query(query);

    // Enviar la lista de operadores como respuesta
    res.json(results);
  } catch (err) {
    console.error('Error al obtener los operadores:', err);
    return res.status(500).json({ error: 'Error al obtener los operadores' });
  }
});

// Endpoint para obtener una escala específica por id
app.get('/api/viewescala/:id', async (req, res) => {
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

  try {
    // Ejecutar la consulta con el id de la escala como parámetro usando el pool de itinerarios
    const [results] = await poolItinerarios.query(query, [escalaId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Escala no encontrada' });
    }

    // Enviar los datos de la escala encontrada como respuesta
    res.json(results[0]);
  } catch (err) {
    console.error('Error al consultar los datos de la escala:', err);
    return res.status(500).json({ error: 'Error al consultar los datos de la escala' });
  }
});



// Endpoint para eliminar una factura
app.delete('/api/eliminarfactura/:id', async (req, res) => {
  const { id } = req.params;  // Obtenemos el idfactura desde los parámetros de la URL

  // Consulta SQL para eliminar la factura de la base de datos
  const query = 'DELETE FROM facturas WHERE idfacturas = ?';

  try {
    // Ejecutamos la consulta usando el pool de conexiones
    const [results] = await poolBuquesInvoice.query(query, [id]);

    if (results.affectedRows === 0) {
      // Si no se eliminó ninguna fila, significa que no se encontró la factura
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Si la eliminación fue exitosa, devolvemos un mensaje de éxito
    res.json({ message: 'Factura eliminada con éxito' });
  } catch (err) {
    console.error('Error al eliminar la factura:', err);
    return res.status(500).json({ error: 'Error al eliminar la factura' });
  }
});


// Endpoint para modificar datos de la factura
app.put('/api/modificarfactura', async (req, res) => {
  console.log("Datos recibidos para modificar:", req.body); // Verificar los datos que llegan

  const { idfactura, numero, fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, gia, pre_aprobado, servicios } = req.body;

  // Verificar si el ID de la factura está presente
  if (!idfactura) {
    return res.status(400).send("Error: El ID de la factura es requerido.");
  }

  // Verificar si se proporcionan servicios
  if (!servicios || !Array.isArray(servicios)) {
    return res.status(400).send("Error: Se deben proporcionar servicios asociados a la factura.");
  }

  const connection = await poolBuquesInvoice.getConnection();
  try {
    // Iniciar la transacción
    await connection.beginTransaction();


    // Actualizar la factura
    const sqlFactura = `
      UPDATE facturas
      SET numero = ?, fecha = ?, moneda = ?, monto = ?, escala_asociada = ?, proveedor = ?, url_factura = ?, url_notacredito = ?, estado = ?, gia = ?, pre_aprobado = ?
      WHERE idfacturas = ?
    `;
    const valuesFactura = [numero, fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, gia, pre_aprobado, idfactura];

    await connection.query(sqlFactura, valuesFactura);

    // Eliminar los servicios existentes para esta factura
    const sqlDeleteServicios = `
        DELETE FROM serviciosfacturas
        WHERE idfactura = ?
      `;

    await connection.query(sqlDeleteServicios, [idfactura]);

    // Insertar los nuevos servicios asociados
    const sqlInsertServicios = `
          INSERT INTO serviciosfacturas (nombre, estado, idfactura)
          VALUES ?
        `;
    const serviciosValues = servicios.map(servicio => [
      servicio.servicio,
      servicio.estado,
      idfactura
    ]);

    await connection.query(sqlInsertServicios, [serviciosValues]);
    // Commit de la transacción si todo fue exitoso
    await connection.commit();

    return res.json({ message: "Factura y servicios modificados exitosamente" });
  } catch (err) {
    // En caso de error, hacer rollback de la transacción
    await connection.rollback();
    console.error("Error al modificar la factura o servicios:", err);
    return res.status(500).send("Error al modificar la factura o servicios");
  } finally {
    // Liberar la conexión del pool
    connection.release();
  }
});

// Endpoint para eliminar servicio en escala
app.delete('/api/escalas/eliminarservicio/:idservicio', async (req, res) => {
  const { idservicio } = req.params; // Usando req.params para obtener el parámetro de la ruta

  if (!idservicio) {
    return res.status(400).json({ error: 'El parámetro idservicio es obligatorio' });
  }

  let connection;
  try {
    // Obtener la conexión del pool
    connection = await poolBuquesInvoice.getConnection();

    const query = 'DELETE FROM serviciosescalas WHERE idservicio = ?';
    const [results] = await connection.query(query, [idservicio]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Enviar una respuesta indicando que la eliminación fue exitosa
    res.json({ message: 'Servicio eliminado con éxito' });
  } catch (err) {
    console.error('Error al eliminar el servicio de la escala:', err);
    res.status(500).json({ error: 'Error al eliminar el servicio' });
  } finally {
    // Asegurar que la conexión se libere
    if (connection) connection.release();
  }
});

// Endpoint para eliminar los servicios asociados a una factura
app.delete('/api/eliminarserviciosfactura/:idfactura', async (req, res) => {
  const { idfactura } = req.params;  // Obtenemos el idfactura desde los parámetros de la URL

  // Verificar si se ha recibido el idfactura
  if (!idfactura) {
    return res.status(400).json({ error: 'ID de la factura es requerido' });
  }

  try {
    // Obtener una conexión del pool
    const connection = await poolBuquesInvoice.getConnection();

    // Consulta SQL para eliminar los servicios asociados a la factura
    const query = 'DELETE FROM serviciosfacturas WHERE idfactura = ?';
    const [results] = await connection.query(query, [idfactura]);

    // Verificar si se eliminaron registros
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'No se encontraron servicios para esta factura' });
    }

    // Liberar la conexión del pool
    connection.release();

    // Si la eliminación fue exitosa, devolvemos un mensaje de éxito
    res.json({ message: 'Servicios eliminados con éxito' });
  } catch (err) {
    console.error('Error al eliminar los servicios de la factura:', err);
    return res.status(500).json({ error: 'Error al eliminar los servicios de la factura' });
  }
});

// Endpoint para agregar un servicio a una escala
app.post('/api/escalas/agregarservicio', async (req, res) => {
  const { idEscala, servicio } = req.body;  // Obtiene id de la escala y el servicio desde el cuerpo de la solicitud
  console.log('Datos recibidos en el backend:', req.body); // Inspecciona los datos


  if (!idEscala || !servicio) {
    return res.status(400).json({ error: 'ID de escala y nombre del servicio son requeridos' });
  }
  try {
    // Obtener una conexión del pool
    const connection = await poolBuquesInvoice.getConnection();

    // Consulta SQL para insertar el servicio en la escala
    const query = 'INSERT INTO serviciosescalas (idescala, nombre) VALUES (?, ?)';
    const [results] = await connection.query(query, [idEscala, servicio]);

    // Liberar la conexión del pool
    connection.release();

    // Respuesta indicando éxito en la adición del servicio
    res.status(200).json({
      message: 'Servicio agregado con éxito',
      servicioId: results.insertId,
    });
    console.log({ message: 'Servicio agregado con éxito', servicioId: results.insertId });

  } catch (err) {
    console.error('Error al agregar el servicio a la escala:', err);
    return res.status(500).json({ error: 'Error al agregar el servicio' });
  }
});

// Endpoint para agregar un servicio a una escala
app.post('/api/escalas/agregarservicio2', async (req, res) => {
  const { selectedEscalaId, serviciomodalToUpper } = req.body;  // Obtiene id de la escala y el servicio desde el cuerpo de la solicitud
  console.log('Datos recibidos en el backend:', req.body); // Inspecciona los datos

  if (!selectedEscalaId || !serviciomodalToUpper) {
    return res.status(400).json({ error: 'ID de escala y nombre del servicio son requeridos' });
  }

  try {
    // Obtener una conexión del pool
    const connection = await poolBuquesInvoice.getConnection();

    // Consulta SQL para insertar el servicio en la escala
    const query = 'INSERT INTO serviciosescalas (idescala, nombre) VALUES (?, ?)';
    const [results] = await connection.query(query, [selectedEscalaId, serviciomodalToUpper]);

    // Liberar la conexión del pool
    connection.release();

    // Respuesta indicando éxito en la adición del servicio
    res.status(200).json({
      message: 'Servicio agregado con éxito',
      servicioId: results.insertId,
    });
    console.log({ message: 'Servicio agregado con éxito', servicioId: results.insertId });

  } catch (err) {
    console.error('Error al agregar el servicio a la escala:', err);
    return res.status(500).json({ error: 'Error al agregar el servicio' });
  }
});

app.get('/api/viewescalafacturas/:id', async (req, res) => {
  const escalaId = req.params.id;
  console.log(`Escala ID recibido: ${escalaId}`); // Verifica el ID recibido

  if (!escalaId) {
    return res.status(400).json({ error: 'ID de escala no proporcionado' });
  }

  const query = `
    SELECT
    idfacturas, 
    numero, 
    DATE_FORMAT(fecha, '%d-%m-%Y') AS fecha, 
    moneda, 
    monto, 
    escala_asociada, 
    proveedor, 
    estado, 
    gia,
    url_factura
    FROM facturas
    WHERE facturas.escala_asociada = ?;
  `;

  try {
    // Obtener una conexión del pool
    const connection = await poolBuquesInvoice.getConnection();

    // Ejecutar la consulta
    const [results] = await connection.query(query, [escalaId]);

    // Liberar la conexión del pool
    connection.release();

    if (results.length === 0) {
      return res.json([]);
    }

    console.log('Facturas encontradas:', results); // Muestra los resultados obtenidos
    res.json(results); // Envía las facturas encontradas

  } catch (err) {
    console.error('Error al consultar las facturas:', err); // Muestra el error específico
    return res.status(500).json({ error: 'Error interno del servidor al consultar las facturas' });
  }
});

app.get('/api/obtenerserviciospuertos/:puertos', async (req, res) => {
  const puertoId = req.params.puertos;
  console.log('Puerto ID recibido:', puertoId); // Asegúrate de que se imprime el valor correcto
  const query = `
    SELECT *
    FROM servicios
    WHERE servicios.puertos = ?;
  `;
  try {
    // Obtener una conexión del pool
    const connection = await poolBuquesInvoice.getConnection();

    // Ejecutar la consulta
    const [results] = await connection.query(query, [puertoId]);

    // Liberar la conexión del pool
    connection.release();

    if (results.length === 0) {
      console.log('No se encontraron servicios para este puerto');
      return res.status(404).json({ error: 'No se encontraron servicios para el puerto especificado' });
    }

    console.log('Servicios Puertos:', results);
    res.json(results); // Envía los resultados encontrados

  } catch (err) {
    console.error('Error al consultar los servicios puertos:', err);
    return res.status(500).json({ error: 'Error interno del servidor al consultar los servicios puertos' });
  }
});

app.post('/api/insertserviciospuertos', async (req, res) => {
  console.log('Cuerpo de la solicitud:', req.body);  // Verificar el contenido
  const servicios = req.body.servicios;

  if (!servicios || !Array.isArray(servicios)) {
    return res.status(400).json({ error: 'La lista de servicios es requerida' });
  }

  const query = 'INSERT INTO serviciosescalas (nombre, idescala) VALUES (?, ?)';

  // Usamos una transacción para insertar múltiples servicios de forma atómica
  const connection = await poolBuquesInvoice.getConnection();
  try {
    // Iniciamos la transacción
    await connection.beginTransaction();

    // Insertamos todos los servicios en la base de datos
    const serviciosIds = [];

    for (const servicio of servicios) {
      const { idescala, nombre } = servicio;
      const [result] = await connection.query(query, [nombre, idescala]);
      serviciosIds.push(result.insertId);
    }

    // Confirmamos la transacción
    await connection.commit();

    res.json({ message: 'Servicios agregados con éxito', serviciosIds });

  } catch (err) {
    // Si ocurre un error, deshacemos la transacción
    await connection.rollback();
    console.error('Error al agregar los servicios:', err);
    res.status(500).json({ error: 'Error al agregar los servicios' });
  } finally {
    // Liberamos la conexión del pool
    connection.release();
  }
});

//Obtener todos los datos para listar los servicios en viewescala
app.get('/api/viewescalaservicios/:id', async (req, res) => {
  console.log('Ruta alcanzada');
  console.log('ID Escala recibido:', req.params.id);  // Muestra el parámetro de la URL

  const { id } = req.params;  // Obtiene el parámetro de la URL (id)

  console.log(`ID de escala recibido: ${id}`);

  const query = `
    SELECT 
        sf.nombre AS servicio,
        sf.estado AS estado_servicio,
        f.numero AS factura,
        f.idfacturas AS nro_factura,
        f.estado AS estado_factura,
        f.url_factura AS pdf
    FROM 
        facturas f
    INNER JOIN 
        serviciosfacturas sf ON f.idfacturas = sf.idfactura
    INNER JOIN 
        serviciosescalas se ON se.nombre = sf.nombre AND se.idescala = ?
    WHERE 
        f.escala_asociada = ?
    UNION ALL
    SELECT 
        se.nombre AS servicio,
        'Pendiente' AS estado_servicio,
        NULL AS factura,
        NULL AS nro_factura,
        'Pendiente' AS estado_factura,
        NULL AS pdf
    FROM 
        serviciosescalas se
    WHERE 
        se.idescala = ?
        AND se.nombre NOT IN (
            SELECT sf.nombre
            FROM serviciosfacturas sf
            INNER JOIN facturas f ON sf.idfactura = f.idfacturas
            INNER JOIN serviciosescalas se2 ON se2.nombre = sf.nombre AND se2.idescala = ?
            WHERE f.escala_asociada = ?
        );
  `;
  const connection = await poolBuquesInvoice.getConnection();  // Obtener conexión desde el pool
  try {
    console.log('Conectando a la base de datos...');
    const [results] = await connection.query(query, [id, id, id, id, id]);

    console.log('Resultados obtenidos:', results); // Ver si los resultados se obtienen

    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron servicios asociados a la escala' });
    }

    res.json({ servicios: results });
  } catch (err) {
    console.error('Error al obtener los servicios asociados a la escala:', err);
    return res.status(500).json({ error: 'Error al obtener los servicios asociados a la escala' });
  } finally {
    connection.release();  // Liberamos la conexión del pool
  }
});


// Función que envuelve la consulta en una promesa
const queryPromise = (query, pool) => {
  return pool.execute(query).then(([results]) => results); // Acceder directamente a los resultados
};

app.get('/api/exportarpdfsinnotas', async (req, res) => {
  try {
    //Funcion para descargar pdfs desde azure
    const downloadBlobToBuffer = async (blobName) => {
      const containerName = 'invoices'; // Replace with your container name
      const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      const downloadBlockBlobResponse = await blobClient.download();
      const chunks = [];

      for await (const chunk of downloadBlockBlobResponse.readableStreamBody) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    };

    // Consulta SQL para obtener las facturas que no tienen `gia` marcado y tienen estado aprobado ----Cambie esto ayer
    const queryFacturas = `
      SELECT 
        f.idfacturas, 
        f.numero, 
        DATE_FORMAT(f.fecha, '%d-%m-%Y') AS fecha, 
        f.moneda, 
        f.monto, 
        f.escala_asociada, 
        f.proveedor, 
        f.estado, 
        f.gia,
        f.url_factura,
        f.url_notacredito
      FROM facturas f
      WHERE f.gia = 0 AND f.estado = 'Aprobado' AND f.url_factura != 'NaN'
      ORDER BY f.escala_asociada, f.fecha ASC;
    `;

    // Realizar la consulta a la base de datos de facturas
    const facturas = await queryPromise(queryFacturas, poolBuquesInvoice);
    console.log(facturas);
    if (!Array.isArray(facturas) || facturas.length === 0) {
      return res.status(404).json({ error: 'No hay facturas para exportar.' });
    }

    // Obtener los IDs de las escalas asociadas
    const escalaIds = facturas.map(factura => `'${factura.escala_asociada}'`);
    console.log('escalasIds', escalaIds);
    // Verificar si escalaIds tiene elementos
    if (escalaIds.length === 0) {
      return res.status(404).json({ error: 'No se encontraron escalas asociadas.' });
    }
    // Consulta SQL para obtener los datos de las escalas
    const queryEscalas = `
    SELECT 
      itinerarios.id AS escala_id,
      itinerarios.viaje,
      buques.nombre AS buque,
      DATE_FORMAT(itinerarios.eta, '%d-%m-%Y') AS eta,
      puertos.nombre AS puerto,
      operadores.nombre AS operador
    FROM itinerarios
    LEFT JOIN buques ON itinerarios.id_buque = buques.id
    LEFT JOIN puertos ON itinerarios.id_puerto = puertos.id
    LEFT JOIN operadores ON itinerarios.id_operador1 = operadores.id
    WHERE itinerarios.id IN (${escalaIds.join(',')});
  ` ;



    const escalas = await queryPromise(queryEscalas, poolItinerarios);
    if (escalas.length === 0) {
      return res.status(404).json({ error: 'No se encontraron escalas relacionadas con las facturas.' });
    }
    console.log('escalas', escalas);

    console.log('escalasFlattened', escalas);
    // Crear un mapa para acceder a los datos de las escalas rápidamente
    const escalasMap = escalas.reduce((acc, escala) => {
      acc[escala.escala_id] = escala;
      return acc;
    }, {});
    console.log('escalasMap:', escalasMap);
    // Agrupar las facturas por escala
    const escalasConFacturas = facturas.reduce((acc, factura) => {
      const escalaId = factura.escala_asociada;
      if (!acc[escalaId]) {
        acc[escalaId] = {
          escala: escalasMap[escalaId], // Información de la escala
          facturas: []
        };
      }
      acc[escalaId].facturas.push(factura);
      return acc;
    }, {});

    // Crear un documento PDF (pdf-lib)
    const pdfDocSinNC = await PDFDocument.create();
    const font = pdfDocSinNC.embedStandardFont('Helvetica');

    // Recorrer las escalas y generar las páginas del PDF, (cada iteracion obtiene una escala y sus facturas)
    for (const escalaData of Object.values(escalasConFacturas)) {
      const escala = escalaData.escala;
      const facturas = escalaData.facturas;

      // Agregar una página para la carátula de la escala
      const pageConNC = pdfDocSinNC.addPage();
      const { width, height } = pageConNC.getSize();

      pageConNC.drawText(`${escala.buque} ${escala.eta}`, {
        x: width / 2 - 100, y: height - 50, size: 18, font, color: rgb(0, 0, 0)
      });
      pageConNC.drawText(`Buque: ${escala.buque}`, { x: 50, y: height - 100, size: 14, font });
      pageConNC.drawText(`ETA: ${escala.eta}`, { x: 50, y: height - 120, size: 14, font });
      pageConNC.drawText(`Puerto: ${escala.puerto}`, { x: 50, y: height - 140, size: 14, font });
      pageConNC.drawText(`Operador: ${escala.operador}`, { x: 50, y: height - 160, size: 14, font });
      // Array para guardar los id de las facturas procesadas y poder identificar las que se imprimieron
      const facturasProcesadas = [];
      // Agregar facturas y notas de crédito al PDF (Recorre cada factura y agrega factura y nota de credito)
      // Agregar facturas y notas de crédito al PDF (Recorre cada factura y agrega factura con watermark)
      for (const factura of facturas) {
        if (factura.url_factura) {
          const blobName = factura.url_factura.split('/').pop();
          const facturaPdfBytes = await downloadBlobToBuffer(blobName);
          const facturaPdfDoc = await PDFDocument.load(facturaPdfBytes);

          // Crear una nueva fuente estándar para el watermark
          const fontWatermark = await pdfDocSinNC.embedFont('Helvetica');

          // Obtener las páginas del PDF de factura
          const facturaPages = facturaPdfDoc.getPages();
          const { buque, eta, puerto, operador } = escala; // Datos de la escala

          // Agregar watermark en cada página del PDF de factura
          for (const page of facturaPages) {
            const { width, height } = page.getSize();
            page.drawText(
              `${buque} | ETA: ${eta} | ${puerto} | ${operador}`,
              {
                x: width / 100, // Posición del watermark (ajustable)
                y: height / 600, // Centro de la página
                size: 12, // Tamaño del texto
                font: fontWatermark,
                color: rgb(0, 0, 0), // Color gris
                opacity: 0.5, // Transparencia
                rotate: degrees(0) // Texto en diagonal
              }
            );
          }

          // Copiar las páginas modificadas con el watermark al documento principal
          const facturaPdfPages = await pdfDocSinNC.copyPages(facturaPdfDoc, facturaPdfDoc.getPageIndices());
          facturaPdfPages.forEach(page => pdfDocSinNC.addPage(page));

          // Guardar el ID de la factura para actualizar después
          facturasProcesadas.push(factura.idfacturas);
        }
      }
    }

    // Guardar el archivo PDF
    const pdfBytesConNC = await pdfDocSinNC.save();
    const pdfPathConNC = path.join(__dirname, 'temp', 'reporte_facturas_con_NC.pdf');
    fs.writeFileSync(pdfPathConNC, pdfBytesConNC);

    // Enviar el PDF como respuesta para descarga
    res.download(pdfPathConNC, 'reporte_facturas_con_NC.pdf', (err) => {
      if (err) {
        console.error('Error al descargar el archivo PDF:', err);
      }
      // Eliminar el archivo después de enviarlo
      fs.unlinkSync(pdfPathConNC);
    });

  } catch (error) {
    console.error('Error al generar el archivo PDF:', error);
    res.status(500).json({ error: 'Error al generar el archivo PDF' });
  }
});
//Endpoint que genera el con sin notas de credito
app.get('/api/exportarpdfconnotas', async (req, res) => {
  try {
    const downloadBlobToBuffer = async (blobName, containerNamerecibido) => {
      const containerName = containerNamerecibido; // Replace with your container name
      const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      const downloadBlockBlobResponse = await blobClient.download();
      const chunks = [];

      for await (const chunk of downloadBlockBlobResponse.readableStreamBody) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    };
    // Consulta SQL para obtener las facturas que no tienen `gia` marcado y estado aprobado
    const queryFacturas = `
      SELECT 
        f.idfacturas, 
        f.numero, 
        DATE_FORMAT(f.fecha, '%d-%m-%Y') AS fecha, 
        f.moneda, 
        f.monto, 
        f.escala_asociada, 
        f.proveedor, 
        f.estado, 
        f.gia,
        f.url_factura,
        f.url_notacredito
      FROM facturas f
      WHERE f.gia = 0 AND f.estado IN ('Aprobado', 'Anulado')
      ORDER BY f.escala_asociada, f.fecha ASC;
    `;

    // Realizar la consulta a la base de datos 
    const facturas = await queryPromise(queryFacturas, poolBuquesInvoice);
    if (!Array.isArray(facturas) || facturas.length === 0) {
      return res.status(404).json({ error: 'No hay facturas para exportar.' });
    }

    // Obtener los IDs de las escalas asociadas
    const escalaIds = facturas.map(factura => `'${factura.escala_asociada}'`);
    if (escalaIds.length === 0) {
      return res.status(404).json({ error: 'No se encontraron escalas asociadas.' });
    }
    // Consulta SQL para obtener los datos de las escalas
    const queryEscalas = `
      SELECT 
        itinerarios.id AS escala_id,
        itinerarios.viaje,
        buques.nombre AS buque,
        DATE_FORMAT(itinerarios.eta, '%d-%m-%Y') AS eta,
        puertos.nombre AS puerto,
        operadores.nombre AS operador
      FROM itinerarios
      LEFT JOIN buques ON itinerarios.id_buque = buques.id
      LEFT JOIN puertos ON itinerarios.id_puerto = puertos.id
      LEFT JOIN operadores ON itinerarios.id_operador1 = operadores.id
      WHERE itinerarios.id IN (${escalaIds.join(',')});
    `;

    const escalas = await queryPromise(queryEscalas, poolItinerarios);
    if (escalas.length === 0) {
      return res.status(404).json({ error: 'No se encontraron escalas relacionadas con las facturas.' });
    }


    // Crear un mapa para acceder a los datos de las escalas rápidamente
    const escalasMap = escalas.reduce((acc, escala) => {
      acc[escala.escala_id] = escala;
      return acc;
    }, {});

    // Agrupar las facturas por escala
    const escalasConFacturas = facturas.reduce((acc, factura) => {
      const escalaId = factura.escala_asociada;
      if (!acc[escalaId]) {
        acc[escalaId] = {
          escala: escalasMap[escalaId], // Información de la escala
          facturas: []
        };
      }
      acc[escalaId].facturas.push(factura);
      return acc;
    }, {});

    // Crear el pdf
    const pdfDocConNC = await PDFDocument.create();
    const font = pdfDocConNC.embedStandardFont('Helvetica');

    // Array para guardar los id de las facturas procesadas y poder identificar las que se imprimieron
    const facturasProcesadas = [];

    // Recorrer las escalas y generar las páginas del pdf
    for (const escalaData of Object.values(escalasConFacturas)) {
      const escala = escalaData.escala;
      const facturas = escalaData.facturas;

      // Agregar una página para la carátula de la escala
      const pageSinNC = pdfDocConNC.addPage();
      const { width, height } = pageSinNC.getSize();

      pageSinNC.drawText(`${escala.buque} ${escala.eta}`, {
        x: width / 2 - 100, y: height - 50, size: 18, font, color: rgb(0, 0, 0)
      });
      pageSinNC.drawText(`Buque: ${escala.buque}`, { x: 50, y: height - 100, size: 14, font });
      pageSinNC.drawText(`ETA: ${escala.eta}`, { x: 50, y: height - 120, size: 14, font });
      pageSinNC.drawText(`Puerto: ${escala.puerto}`, { x: 50, y: height - 140, size: 14, font });
      pageSinNC.drawText(`Operador: ${escala.operador}`, { x: 50, y: height - 160, size: 14, font });

      // Agregar únicamente las facturas al PDF
      for (const factura of facturas) {
        if (factura.url_factura) {
          const containerNamefacturas = "invoices";
          const blobName = factura.url_factura.split('/').pop();
          const facturaPdfBytes = await downloadBlobToBuffer(blobName, containerNamefacturas);
          const facturaPdfDoc = await PDFDocument.load(facturaPdfBytes);

          // Crear una nueva fuente estándar para el watermark
          const fontWatermark = await pdfDocConNC.embedFont('Helvetica');

          // Obtener las páginas del PDF de factura
          const facturaPages = facturaPdfDoc.getPages();
          const { buque, eta, puerto, operador } = escala; // Datos de la escala

          // Agregar watermark en cada página del PDF de factura
          for (const page of facturaPages) {
            const { width, height } = page.getSize();
            page.drawText(
              `${buque} | ETA: ${eta} | ${puerto} | ${operador}`,
              {
                x: width / 100, // Posición del watermark (ajustable)
                y: height / 600, // Centro de la página
                size: 12, // Tamaño del texto
                font: fontWatermark,
                color: rgb(0, 0, 0), // Color gris
                opacity: 0.5, // Transparencia
                rotate: degrees(0) // Texto en diagonal
              }
            );
          }

          // Copiar las páginas modificadas con el watermark al documento principal
          const facturaPdfPages = await pdfDocConNC.copyPages(facturaPdfDoc, facturaPdfDoc.getPageIndices());
          facturaPdfPages.forEach(page => pdfDocConNC.addPage(page));
        }

        if (factura.url_notacredito) {
          const containerNamenotas = "notascredito";
          const blobName = factura.url_notacredito.split('/').pop();
          const notaPdfBytes = await downloadBlobToBuffer(blobName, containerNamenotas);
          const notaPdfDoc = await PDFDocument.load(notaPdfBytes);

          // Crear una nueva fuente estándar para el watermark
          const fontWatermark = await pdfDocConNC.embedFont('Helvetica');

          // Obtener las páginas del PDF de factura
          const notaPages = notaPdfDoc.getPages();
          const { buque, eta, puerto, operador } = escala; // Datos de la escala

          // Agregar watermark en cada página del PDF de factura
          for (const page of notaPages) {
            const { width, height } = page.getSize();
            page.drawText(
              `${buque} | ETA: ${eta} | ${puerto} | ${operador}`,
              {
                x: width / 100, // Posición del watermark (ajustable)
                y: height / 600, // Centro de la página
                size: 12, // Tamaño del texto
                font: fontWatermark,
                color: rgb(0, 0, 0), // Color gris
                opacity: 0.5, // Transparencia
                rotate: degrees(0) // Texto en diagonal
              }
            );
          }

          // Copiar todas las páginas del documento de nota de crédito
          const notaPdfPages = await pdfDocConNC.copyPages(notaPdfDoc, notaPdfDoc.getPageIndices());
          notaPdfPages.forEach(page => pdfDocConNC.addPage(page));
        }

        // Guardar el ID de la factura para actualizar después
        facturasProcesadas.push(factura.idfacturas);
      }

    }

    // Guardar el archivo 
    const pdfBytesSinNC = await pdfDocConNC.save();
    const pdfPathSinNC = path.join(__dirname, 'temp', 'reporte_facturas_sin_NC.pdf');
    fs.writeFileSync(pdfPathSinNC, pdfBytesSinNC);

    // Actualizar las facturas en la base de datos para cambiar el valor de gia a 1
    const queryUpdateGia = `
      UPDATE facturas
      SET gia = 1
      WHERE idfacturas IN (${facturasProcesadas.join(',')});
    `;

    await queryPromise(queryUpdateGia, poolBuquesInvoice);

    // Enviar el PDF como respuesta para descarga
    res.download(pdfPathSinNC, 'reporte_facturas_sin_NC.pdf', (err) => {
      if (err) {
        console.error('Error al descargar el archivo PDF:', err);
      }
      // Eliminar el archivo después de enviarlo
      fs.unlinkSync(pdfPathSinNC);
    });

  } catch (error) {
    console.error('Error al generar el archivo PDF:', error);
    res.status(500).json({ error: 'Error al generar el archivo PDF' });
  }
});


// Endpoint para obtener las facturas pendientes
app.get('/api/facturas/pendientes/:idOperador', async (req, res) => {
  const idOperador = req.params.idOperador;

  try {
    // 1. Consultar todas las escalas asociadas al operador en la base de datos de itinerarios
    const queryItinerarios = `
      SELECT id
      FROM itinerarios
      WHERE id_operador1 = ?
    `;

    const connectionItinerarios = await poolItinerarios.getConnection();
    const [itinerariosResults] = await connectionItinerarios.query(queryItinerarios, [idOperador]);
    connectionItinerarios.release();

    // Si no se encuentran escalas asociadas al operador
    if (itinerariosResults.length === 0) {
      return res.status(404).json({ error: 'No se encontraron escalas asociadas al operador' });
    }

    // Obtener los IDs de las escalas asociadas al operador
    const escalas = itinerariosResults.map(result => result.id);
    console.log('escalas:', escalas);

    // 2. Consultar las facturas pendientes que tienen cualquiera de las escalas asociadas al operador
    const queryFacturas = `
      SELECT COUNT(idfacturas) AS pendientes
      FROM facturas
      WHERE escala_asociada IN (?)
      AND estado = 'Pendiente'
    `;

    const connectionFacturas = await poolBuquesInvoice.getConnection();
    const [facturaResults] = await connectionFacturas.query(queryFacturas, [escalas]);
    console.log(facturaResults);
    connectionFacturas.release();

    // Enviar el número de facturas pendientes
    res.json({ pendientes: facturaResults[0].pendientes });
  } catch (err) {
    console.error('Error al obtener las facturas pendientes:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/escalas/pendientes/:idOperador', async (req, res) => {
  const idOperador = req.params.idOperador;

  // 1. Consulta para obtener itinerarios con facturas pendientes en ambas bases de datos
  const query = `
   SELECT 
  itinerarios_prod.itinerarios.id,
  DATE_FORMAT(itinerarios_prod.itinerarios.eta, '%d-%m-%Y') AS eta,
  itinerarios_prod.lineas.nombre AS linea,
  itinerarios_prod.buques.nombre AS buque,
  itinerarios_prod.puertos.nombre AS puerto,
  itinerarios_prod.operadores.nombre AS operador,
  itinerarios_prod.itinerarios.id_linea,
  itinerarios_prod.itinerarios.id_buque,
  itinerarios_prod.itinerarios.id_puerto,
  COUNT(buquesinvoice.facturas.idfacturas) AS facturasPendientes,
  MAX(buquesinvoice.escalasurgentes.esurgente) AS esurgente  -- Usar MAX o MIN
FROM itinerarios_prod.itinerarios
LEFT JOIN itinerarios_prod.lineas ON itinerarios_prod.itinerarios.id_linea = itinerarios_prod.lineas.id
LEFT JOIN itinerarios_prod.buques ON itinerarios_prod.itinerarios.id_buque = itinerarios_prod.buques.id
LEFT JOIN itinerarios_prod.puertos ON itinerarios_prod.itinerarios.id_puerto = itinerarios_prod.puertos.id
LEFT JOIN itinerarios_prod.operadores ON itinerarios_prod.itinerarios.id_operador1 = itinerarios_prod.operadores.id
LEFT JOIN buquesinvoice.facturas ON itinerarios_prod.itinerarios.id = buquesinvoice.facturas.escala_asociada 
  AND buquesinvoice.facturas.estado = 'Pendiente'
LEFT JOIN buquesinvoice.escalasurgentes ON itinerarios_prod.itinerarios.id = buquesinvoice.escalasurgentes.idescala
WHERE itinerarios_prod.itinerarios.id_operador1 = ?
  AND itinerarios_prod.itinerarios.eta <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
GROUP BY itinerarios_prod.itinerarios.id
HAVING facturasPendientes > 0
ORDER BY itinerarios_prod.itinerarios.eta DESC
  `;

  try {
    // Obtener una conexión del pool de `buquesinvoice`
    const connection = await poolBuquesInvoice.getConnection();

    // Realizar la consulta
    const [results] = await connection.query(query, [idOperador]);

    // Liberar la conexión
    connection.release();

    // Si no se encontraron resultados
    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron escalas con facturas pendientes' });
    }

    // Responder con los itinerarios que tienen facturas pendientes
    res.json(results);
  } catch (err) {
    console.error('Error al consultar itinerarios:', err);
    res.status(500).json({ error: 'Error al obtener los itinerarios' });
  }
});
// Endpoint para obtener facturas con estado "Requiere Nc"
app.get('/api/facturas/requierenc', async (req, res) => {
  const query = `
    SELECT 
    idfacturas, 
    numero, 
    DATE_FORMAT(fecha, '%d-%m-%Y') AS fecha, 
    moneda, 
    monto, 
    proveedor, 
    reclamadonc,
    comentarios,
    url_factura
    FROM facturas 
    WHERE estado = 'Requiere Nc' 
    AND DATEDIFF(CURDATE(), fecha) <= 15
  `;

  try {
    // Obtener una conexión del pool de `buquesinvoice`
    const connection = await poolBuquesInvoice.getConnection();

    // Realizar la consulta
    const [results] = await connection.query(query);

    // Liberar la conexión
    connection.release();

    // Responder con los resultados
    res.json(results);
  } catch (err) {
    console.error('Error al consultar facturas:', err);
    res.status(500).json({ error: 'Error al obtener las facturas' });
  }
});
//Endpoint para Actualizar la factura que se le cargo como reclamado en la nc
app.patch('/api/facturas/:idfacturas/reclamadonc', async (req, res) => {
  const { idfacturas } = req.params;
  const { reclamadonc, ultimoreclamadoncuser, fechareclamadonc } = req.body;

  if (typeof reclamadonc === 'undefined' || !ultimoreclamadoncuser || !fechareclamadonc) {
    return res.status(400).json({ error: 'Faltan datos necesarios para actualizar la factura' });
  }

  // Convertir fechareclamadonc al formato 'YYYY-MM-DD'
  const formattedDate = new Date(fechareclamadonc).toISOString().split('T')[0];

  const query = `
    UPDATE facturas
    SET reclamadonc = ?, 
        ultimoreclamadoncuser = ?, 
        fechareclamadonc = ?
    WHERE idfacturas = ?
  `;

  try {
    // Obtener conexión del pool `buquesinvoice`
    const connection = await poolBuquesInvoice.getConnection();

    // Ejecutar consulta
    const [results] = await connection.query(query, [reclamadonc, ultimoreclamadoncuser, formattedDate, idfacturas]);

    // Liberar conexión
    connection.release();

    // Verificar si se actualizó alguna fila
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json({ message: 'Factura actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar la factura:', err);
    res.status(500).json({ error: 'Error al actualizar la factura' });
  }
});

app.get('/api/obtenerprogresoescalas', async (req, res) => {
  // Query para obtener las escalas con los servicios asociados
  const query = `
   SELECT 
  se.idescala AS escala_id, 
  b.nombre AS barco, 
  DATE_FORMAT(i.eta, '%d/%m/%Y') AS eta, 
  COUNT(DISTINCT se.idservicio) AS total_servicios,  -- Contar servicios únicos para evitar duplicados
  COUNT(DISTINCT sf.idserviciosfacturas) AS total_servicios_facturados,  -- Contar facturas únicas asociadas
  COALESCE(SUM(es.esurgente), 0) AS total_urgente -- Sumar el valor de esurgente, usar 0 si no hay coincidencias
FROM 
  buquesinvoice.serviciosescalas se
JOIN itinerarios_prod.itinerarios i ON i.id = se.idescala  -- Relación entre serviciosescalas e itinerarios
JOIN itinerarios_prod.buques b ON b.id = i.id_buque  -- Relación entre itinerarios y buques
LEFT JOIN buquesinvoice.serviciosfacturas sf ON sf.idfactura IN (
  SELECT idfacturas 
  FROM buquesinvoice.facturas f 
  WHERE f.estado = 'Aprobado' AND f.escala_asociada = se.idescala
)
LEFT JOIN buquesinvoice.escalasurgentes es ON es.idescala = se.idescala -- Unión con escalasurgentes
WHERE i.eta >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)  -- Filtro para escalas con eta máximo un año de antigüedad
GROUP BY se.idescala, b.nombre, i.eta;
  `;

  try {
    // Obtener conexión del pool `itinerarios`
    const connection = await poolItinerarios.getConnection();

    // Ejecutar consulta
    const [results] = await connection.query(query);

    // Liberar conexión
    connection.release();

    // Enviar los resultados de la consulta
    res.json(results);
  } catch (err) {
    console.error('Error ejecutando la consulta:', err);
    res.status(500).json({ message: 'Error al obtener los datos de escalas' });
  }
});

// Endpoint para actualizar o insertar escalas urgentes
app.post('/api/actualizarurgencia', async (req, res) => {
  const { idescala, esurgente } = req.body;

  if (!idescala) {
    return res.status(400).json({ error: 'El campo idescala es obligatorio' });
  }

  try {
    // Obtener conexión del pool
    const connection = await poolBuquesInvoice.getConnection();

    try {
      // Verificar si ya existe un registro para esa escala
      const [selectResults] = await connection.query(
        'SELECT * FROM escalasurgentes WHERE idescala = ?',
        [idescala]
      );

      if (selectResults.length > 0) {
        // Si ya existe, actualizar el registro
        await connection.query(
          'UPDATE escalasurgentes SET esurgente = ? WHERE idescala = ?',
          [esurgente, idescala]
        );
        res.status(200).json({ message: 'Escala actualizada correctamente como urgente' });
      } else {
        // Si no existe, insertar un nuevo registro
        await connection.query(
          'INSERT INTO escalasurgentes (idescala, esurgente) VALUES (?, ?)',
          [idescala, esurgente]
        );
        res.status(201).json({ message: 'Escala insertada correctamente como urgente' });
      }
    } finally {
      // Liberar la conexión
      connection.release();
    }
  } catch (err) {
    console.error('Error al procesar escalas urgentes:', err);
    res.status(500).json({ error: 'Error en el servidor al procesar escalas urgentes' });
  }
});

app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});