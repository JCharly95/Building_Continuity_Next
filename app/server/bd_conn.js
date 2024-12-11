import mysql from "mysql2/promise";

/** Funcion para crear la pila de conexiones con la base de datos
 * @returns {mysql.Pool} Objeto de Conexion con la Base de Datos Mysql */
export function pilaConnBD(){
    try {
        // Crear la pila de conexiones con la BD
        const pilaConn = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        //console.log("Pila de conexion creada con exito");
        return pilaConn;
    } catch (errConBD) {
        console.error(`Error: No se pudo crear la conexión con la BD. Causa: ${errConBD}`);
        throw errConBD;
    }
}

/*export default async function conectarBD(){
    try {
        const conexion = await mysql.createConnection({
            host: "localhost",
            user: "buildingcontinui_bms_continuity",
            password: "Control.12345",
            database: "buildingcontinui_db_bms_continuity"
        });
        console.log("Conexion con la BD establecida con exito");
        return conexion;
    } catch (errConBD) {
        console.error(`Error: No se pudo establecer conexión con la BD. Causa: ${errConBD}`);
        throw errConBD;
    }
}*/

/*
// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'test',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
 */