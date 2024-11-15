const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
app.use(cors());
app.use(express.json());  // Debe estar antes de las rutas}
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

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
//---------------------------------------------------------------------------------------------------------------------------------------------
//Endpoint para obtener una sola factura.
// Endpoint para obtener los detalles de una factura
app.get('/api/obtenerfactura/:id', (req, res) => {
  console.log('Solicitud recibida en el endpoint /api/obtenerfactura/:id');
  const { id } = req.params;
  console.log(`ID recibido en el endpoint: ${id}`);
  const query = `
    SELECT idfacturas, numero, DATE(fecha) AS fecha, moneda, monto, escala_asociada, proveedor, 
           url_factura, url_notacredito, estado, gia, pre_aprobado, comentarios
    FROM facturas
    WHERE idfacturas = ?
  `;

  connectionbuquesinvoice.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener los detalles de la factura:', err);
      return res.status(500).json({ error: 'Error al obtener los detalles de la factura' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json({ factura: results[0] });
  });
});
//Consumo de la bd de buquesinvoice
// Endpoint para insertar datos de la factura
app.post('/api/insertardatosfactura', (req, res) => {
  console.log("Datos recibidos:", req.body);  // Verificar los datos que llegan

  const { numero, fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, gia, pre_aprobado, servicios } = req.body;

  // Verificar si se proporcionan servicios
  if (!servicios || !Array.isArray(servicios) || servicios.length === 0) {
    return res.status(400).send("Error: Se deben proporcionar servicios asociados a la factura.");
  }

  // Verificar si al menos una de las URLs (factura o nota de crédito) está presente
  if (!url_factura && !url_notacredito) {
    return res.status(400).send("Error: Se debe proporcionar al menos una URL (factura o nota de crédito).");
  }

  // Iniciar la transacción
  connectionbuquesinvoice.beginTransaction((err) => {
    if (err) {
      console.error("Error al comenzar la transacción:", err);
      return res.status(500).send("Error al comenzar la transacción");
    }

    // Insertar la factura
    const sqlFactura = `
      INSERT INTO facturas 
      (numero, fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, gia, pre_aprobado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valuesFactura = [numero, fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, gia, pre_aprobado];

    connectionbuquesinvoice.query(sqlFactura, valuesFactura, (err, result) => {
      if (err) {
        return connectionbuquesinvoice.rollback(() => {
          console.error("Error al insertar la factura:", err);
          return res.status(500).send("Error al insertar la factura");
        });
      }

      const facturaId = result.insertId;  // Obtener el ID de la factura insertada

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

      connectionbuquesinvoice.query(sqlServicios, [serviciosValues], (err, result) => {
        if (err) {
          return connectionbuquesinvoice.rollback(() => {
            console.error("Error al insertar los servicios asociados:", err);
            return res.status(500).send("Error al insertar los servicios asociados");
          });
        }

        // Commit de la transacción si ambos inserts fueron exitosos
        return connectionbuquesinvoice.commit((err) => {
          if (err) {
            return connectionbuquesinvoice.rollback(() => {
              console.error("Error al hacer commit:", err);
              return res.status(500).send("Error al hacer commit");
            });
          }

          return res.json({ message: "Factura y servicios insertados exitosamente", id: facturaId });
        });
      });
    });
  });
});



//Endpoint para buscar servicios asociados a una escala
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


//Endpoint para obtener el listado de facturas 
app.get('/api/previewfacturas', (req, res) => {
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
    gia 
  FROM facturas
`;

  console.log('Recibiendo solicitud para obtener facturas...');

  // Ejecutar la consulta
  connectionbuquesinvoice.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar los datos de las facturas:', err);
      return res.status(500).json({ error: 'Error al consultar los datos de las facturas' });
    }

    // Enviar los datos de las facturas como respuesta
    res.json(results);
  });
});
//---------------------------------------------------------------------------------------------------------------------------------
//Consumo de la bd itinerarios:


// Endpoint para obtener todas las escalas que coincidan con lo buscado en agragar factura
app.get('/api/buscarescalaasociada', (req, res) => {
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
      AND (itinerarios.id_puerto = 1 OR itinerarios.id_puerto = 4)
      ORDER BY itinerarios.eta DESC
    `;
  console.log('Recibiendo solicitud para obtener itinerarios...');
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
//-------------------------------------------------------------------------------------------------------------------------------------
//Manejo de archivos para facturas
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
app.listen(5000, () => {
  console.log('Servidor corriendo en el puerto 5000');
});

// Endpoint para obtener las facturas y sus URLs
app.get('/api/obtenerfacturas', (req, res) => {
  const idOperador = req.query.id_operador; // Recibe el id del operador desde el frontend
  console.log('Operador recibido:', idOperador); // Aquí es donde se realiza el debug
  // Si se pasa el id_operador, filtrar las facturas basadas en la escala asociada y el operador
  const queryEscalas = `
    SELECT id
    FROM itinerarios 
    WHERE id_operador1 = ?;`;

  // Usamos la conexión para itinerarios (connectionitinerarios) para consultar la tabla itinerarios
  connectionitinerarios.query(queryEscalas, [idOperador], (err, escalas) => {
    if (err) {
      console.error('Error al obtener las escalas:', err);
      return res.status(500).json({ error: 'Error al obtener las escalas' });
    }
    console.log('escalas recibido:', escalas); // Aquí es donde se realiza el debug
    // Si no hay escalas asociadas al operador, devolver un array vacío
    if (escalas.length === 0) {
      return res.json([]); // No hay facturas si no hay escalas
    }

    // Obtener los números de las escalas
    const escalaNumeros = escalas.map(escala => escala.id);

    // Consulta SQL para obtener las facturas basadas en las escalas asociadas al operador
    const queryFacturas = `
      SELECT idfacturas, numero, DATE(fecha) AS fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, comentarios
      FROM facturas
      WHERE escala_asociada IN (?);
      `;

    // Usamos la conexión para buquesinvoice (connectionbuquesinvoice) para obtener las facturas
    connectionbuquesinvoice.query(queryFacturas, [escalaNumeros], (err, results) => {
      if (err) {
        console.error('Error al obtener las facturas:', err);
        return res.status(500).json({ error: 'Error al obtener las facturas' });
      }
      console.log('resultado:', results); // Aquí es donde se realiza el debug
      res.json(results); // Devolver las facturas que coinciden con las escalas del operador
    });
  });
});
//Endpoint para guardar los comentarios de la nc en la base
app.put('/api/facturas/:idfactura/agregarcomentario', async (req, res) => {
  const { idfactura } = req.params;
  const { comentario } = req.body;

  try {
    const query = 'UPDATE facturas SET comentarios = ? WHERE idfacturas = ?';
    await connectionbuquesinvoice.query(query, [comentario, idfactura]);
    res.status(200).json({ message: 'Comentario guardado correctamente.' });
  } catch (error) {
    console.error('Error al guardar el comentario:', error);
    res.status(500).json({ message: 'Error al guardar el comentario.' });
  }
});

//Endpoint para obtener servicios asociados a las facturas
app.get('/api/obtenerservicios/:idfactura', (req, res) => {
  const { idfactura } = req.params;

  const query = `
    SELECT 
      idserviciosfacturas AS id,
      nombre AS servicio,
      estado
    FROM serviciosfacturas
    WHERE idfactura = ?
  `;

  connectionbuquesinvoice.query(query, [idfactura], (err, results) => {
    if (err) {
      console.error('Error al consultar los servicios:', err);
      return res.status(500).json({ error: 'Error al consultar los servicios' });
    }

    res.json(results);
  });
});

// Endpoint para actualizar el estado de un servicio
app.put('/api/actualizarestadoservicios/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const query = `
    UPDATE serviciosfacturas
    SET estado = ?
    WHERE idserviciosfacturas = ?
  `;

  connectionbuquesinvoice.query(query, [estado, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el estado del servicio:', err);
      return res.status(500).json({ error: 'Error al actualizar el estado del servicio' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: 'Estado del servicio actualizado correctamente' });
  });
});

// Endpoint para verificar y actualizar el estado de la factura
app.put('/api/facturas/:id/actualizar-estado', (req, res) => {
  const { id } = req.params;

  const queryServicios = `
    SELECT estado
    FROM serviciosfacturas
    WHERE idfactura = ?
  `;

  connectionbuquesinvoice.query(queryServicios, [id], (err, servicios) => {
    if (err) {
      console.error('Error al obtener los estados de los servicios:', err);
      return res.status(500).json({ error: 'Error al obtener los estados de los servicios' });
    }

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
      SET estado = ?
      WHERE idfacturas = ?
    `;

    connectionbuquesinvoice.query(queryActualizarFactura, [nuevoEstadoFactura, id], (err, results) => {
      if (err) {
        console.error('Error al actualizar el estado de la factura:', err);
        return res.status(500).json({ error: 'Error al actualizar el estado de la factura' });
      }

      res.json({ message: 'Estado de la factura actualizado', estado: nuevoEstadoFactura });
    });
  });
});


// Endpoint para obtener una factura específica con su estado actualizado
app.get('/api/obtenerestadoactualizadofacturas/:idfacturas', (req, res) => {
  const { idfacturas } = req.params;

  // Query para obtener los detalles de la factura con su estado
  const query = 'SELECT idfacturas, numero, DATE(fecha) AS fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, comentarios FROM facturas WHERE idfacturas = ?';

  connectionbuquesinvoice.query(query, [idfacturas], (err, results) => {
    if (err) {
      console.error('Error al obtener la factura:', err);
      return res.status(500).json({ error: 'Error al obtener la factura' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    res.json(results[0]); // Enviar los detalles de la factura encontrada
  });
});

// Endpoint para obtener los operadores
app.get('/api/obteneroperadores', (req, res) => {
  const query = 'SELECT id, nombre FROM operadores WHERE operador COLLATE latin1_swedish_ci = "s" AND activo COLLATE latin1_swedish_ci = "s"'; // Solo traer operadores activos

  connectionitinerarios.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener los operadores:', err);
      return res.status(500).json({ error: 'Error al obtener los operadores' });
    }

    // Enviar la lista de operadores como respuesta
    res.json(results);
  });
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




// Endpoint para eliminar una factura
app.delete('/api/eliminarfactura/:id', (req, res) => {
  const { id } = req.params;  // Obtenemos el idfacturas desde los parámetros de la URL

  // Consulta SQL para eliminar la factura de la base de datos
  const query = 'DELETE FROM facturas WHERE idfacturas = ?';

  connectionbuquesinvoice.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar la factura:', err);
      return res.status(500).json({ error: 'Error al eliminar la factura' });
    }

    if (results.affectedRows === 0) {
      // Si no se eliminó ninguna fila, significa que no se encontró la factura
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Si la eliminación fue exitosa, devolvemos un mensaje de éxito
    res.json({ message: 'Factura eliminada con éxito' });
  });
});


// Endpoint para modificar datos de la factura
app.put('/api/modificarfactura', (req, res) => {
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

  // Iniciar la transacción
  connectionbuquesinvoice.beginTransaction((err) => {
    if (err) {
      console.error("Error al comenzar la transacción:", err);
      return res.status(500).send("Error al comenzar la transacción");
    }

    // Actualizar la factura
    const sqlFactura = `
      UPDATE facturas
      SET numero = ?, fecha = ?, moneda = ?, monto = ?, escala_asociada = ?, proveedor = ?, url_factura = ?, url_notacredito = ?, estado = ?, gia = ?, pre_aprobado = ?
      WHERE idfacturas = ?
    `;
    const valuesFactura = [numero, fecha, moneda, monto, escala_asociada, proveedor, url_factura, url_notacredito, estado, gia, pre_aprobado, idfactura];

    connectionbuquesinvoice.query(sqlFactura, valuesFactura, (err) => {
      if (err) {
        return connectionbuquesinvoice.rollback(() => {
          console.error("Error al actualizar la factura:", err);
          return res.status(500).send("Error al actualizar la factura");
        });
      }

      // Eliminar los servicios existentes para esta factura
      const sqlDeleteServicios = `
        DELETE FROM serviciosfacturas
        WHERE idfactura = ?
      `;

      connectionbuquesinvoice.query(sqlDeleteServicios, [idfactura], (err) => {
        if (err) {
          return connectionbuquesinvoice.rollback(() => {
            console.error("Error al eliminar los servicios existentes:", err);
            return res.status(500).send("Error al eliminar los servicios existentes");
          });
        }

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

        connectionbuquesinvoice.query(sqlInsertServicios, [serviciosValues], (err) => {
          if (err) {
            return connectionbuquesinvoice.rollback(() => {
              console.error("Error al insertar los nuevos servicios:", err);
              return res.status(500).send("Error al insertar los nuevos servicios");
            });
          }

          // Commit de la transacción si todo fue exitoso
          return connectionbuquesinvoice.commit((err) => {
            if (err) {
              return connectionbuquesinvoice.rollback(() => {
                console.error("Error al hacer commit:", err);
                return res.status(500).send("Error al hacer commit");
              });
            }

            return res.json({ message: "Factura y servicios modificados exitosamente" });
          });
        });
      });
    });
  });
});

// Endpoint para eliminar servicio en escala
app.delete('/api/escalas/eliminarservicio/:idservicio', (req, res) => {
  const { idservicio } = req.params;  // Cambiado a req.params

  const query = 'DELETE FROM serviciosescalas WHERE idservicio = ?';

  connectionbuquesinvoice.query(query, [idservicio], (err, results) => {
    if (err) {
      console.error('Error al eliminar el servicio de la escala:', err);
      return res.status(500).json({ error: 'Error al eliminar el servicio' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Enviar una respuesta indicando que la eliminación fue exitosa
    res.json({ message: 'Servicio eliminado con éxito' });
  });
});

// Endpoint para agregar un servicio a una escala
app.post('/api/escalas/agregarservicio', (req, res) => {
  const { id, servicio } = req.body;  // Obtiene id de la escala y el servicio desde el cuerpo de la solicitud

  if (!id || !servicio) {
    return res.status(400).json({ error: 'ID de escala y nombre del servicio son requeridos' });
  }

  const query = 'INSERT INTO serviciosescalas (idescala, nombre) VALUES (?, ?)';

  connectionbuquesinvoice.query(query, [id, servicio], (err, results) => {
    if (err) {
      console.error('Error al agregar el servicio a la escala:', err);
      return res.status(500).json({ error: 'Error al agregar el servicio' });
    }

    // Respuesta indicando éxito en la adición del servicio
    res.json({ message: 'Servicio agregado con éxito', servicioId: results.insertId });
  });
});

app.get('/api/viewescalafacturas/:id', (req, res) => {
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
    gia 
    FROM facturas
    WHERE facturas.escala_asociada = ?;
  `;

  // Log para verificar la consulta antes de ejecutarla
  console.log(`Ejecutando consulta: ${query} con ID: ${escalaId}`);

  connectionbuquesinvoice.query(query, [escalaId], (err, results) => {
    if (err) {
      console.error('Error al consultar las facturas:', err); // Muestra el error específico
      return res.status(500).json({ error: 'Error interno del servidor al consultar las facturas' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron facturas asociadas a la escala proporcionada' });
    }

    console.log('Facturas encontradas:', results); // Muestra los resultados obtenidos
    res.json(results); // Envía todas las facturas en lugar de `results[0]`
  });
});

app.get('/api/obtenerserviciospuertos/:puertos', (req, res) => {
  const puertoId = req.params;
  console.log('Puerto ID recibido:', puertoId); // Asegúrate de que se imprime el valor correcto
  const query = `
    SELECT *
    FROM servicios
    WHERE servicios.puertos = ?;
  `;
  connectionbuquesinvoice.query(query, [puertoId], (err, results) => {
    if (err) {
      console.error('Error al consultar los serviciospuertos:', err);
      return res.status(500).json({ error: 'Error interno del servidor al consultar los servicios puertos' });
    }

    if (results.length === 0) {
      console.log('No se encontraron servicios para este puerto');
      return res.status(404).json({ error: 'No se encontraron servicios puertos' });
    }

    console.log('Servicios Puertos:', results);
    res.json(results);
  });
});


app.post('/api/insertserviciospuertos', (req, res) => {
  console.log('Cuerpo de la solicitud:', req.body);  // Verificar el contenido
  const servicios = req.body.servicios;

  if (!servicios || !Array.isArray(servicios)) {
    return res.status(400).json({ error: 'La lista de servicios es requerida' });
  }

  const query = 'INSERT INTO serviciosescalas (nombre, idescala) VALUES (?, ?)';

  // Utilizar una transacción o Promise.all para manejar múltiples inserciones
  const promises = servicios.map((servicio) => {
    const { idescala, nombre } = servicio;
    return new Promise((resolve, reject) => {
      connectionbuquesinvoice.query(query, [nombre, idescala], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  });

  Promise.all(promises)
    .then((results) => {
      res.json({ message: 'Servicios agregados con éxito', serviciosIds: results.map(r => r.insertId) });
    })
    .catch((err) => {
      console.error('Error al agregar los servicios:', err);
      res.status(500).json({ error: 'Error al agregar los servicios' });
    });
});

app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});