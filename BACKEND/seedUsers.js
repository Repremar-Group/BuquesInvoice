const argon2 = require('argon2');
const mysql2 = require('mysql2/promise');

// Usuarios que tenías en tu frontend
const usuariosValidos = [
    { usuario: "admin", contraseña: "admin" },
    { usuario: "jpgomez", contraseña: "juan", idoperador: 65 },
    { usuario: "gdelossantos", contraseña: "gd3lossant0s41372", idoperador: 4 },
    { usuario: "rbalbuena", contraseña: "rb4lbuen41372", idoperador: 73 },
    { usuario: "lpatetta", contraseña: "lp4tet41372", idoperador: 74 },
    { usuario: "tloustalet", contraseña: "tl0ust4let1372", idoperador: 67 },
    { usuario: "idossantos", contraseña: "id0sant0s1372", idoperador: 66 },
    { usuario: "dremigio", contraseña: "dr3mig1o1372", rol: 'contable' },
    { usuario: "pporra", contraseña: "paola", rol: 'contable' },
    { usuario: "jchaud", contraseña: "jeanette", rol: 'liquidacion' },
    { usuario: "sdacosta", contraseña: "sd4cost41372", rol: 'contable' },
    { usuario: "mjvega", contraseña: "mjv3g41372", rol: 'liquidacion' },
    { usuario: "mberdou", contraseña: "m3rc3d3s", rol: 'liquidacion' }
];

async function seed() {
    const pool = await mysql2.createPool({
        host: 'itinerarios.mysql.database.azure.com',
        user: 'itinerariosdba',
        password: '!Masterkey_22',
        database: 'buquesinvoice'
    });

    for (const u of usuariosValidos) {
        try {
            // 🔐 Hacemos hash de la contraseña
            const hash = await argon2.hash(u.contraseña);

            // 🔄 Insertamos en la tabla users
            await pool.query(
                'INSERT INTO users (usuario, password_hash, idoperador, rol) VALUES (?, ?, ?, ?)',
                [u.usuario, hash, u.idoperador || null, u.rol || null]
            );

            console.log('Usuario insertado:', u.usuario);
        } catch (err) {
            console.log('Error con usuario', u.usuario, err.message);
        }
    }

    console.log('✅ Todos los usuarios cargados con hash en la DB');
    process.exit(0);
}

seed();
