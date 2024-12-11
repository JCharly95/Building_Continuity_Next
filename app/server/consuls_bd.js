import { pilaConnBD } from "./bd_conn.js";

export async function correoRecu(destino, valContra, usernameDesti){

}

/** Funcion para obtener los 10 primeros registros generales del sistema sin filtrado de busqueda*/
export async function getHistoGen(){
    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
    try {
        // Ejecutar la consulta como sentencia preparada (Prepared Statements)
        const [results] = await connBD.execute(
            'SELECT ID,TIMESTAMP,TRENDFLAGS,STATUS,VALUE,HISTORY_ID,TRENDFLAGS_TAG,STATUS_TAG FROM historynumerictrendrecord LIMIT 10'
        );
        // Retornar el arreglo JSON con los registros obtenidos
        return results;
    } catch (errGetHistoGen) {
        let msgError = `Error: No se pudieron obtener los registros generales. Causa: ${errGetHistoGen}`; 
        console.error(msgError);
        return msgError;
    } finally {
        // Segun la documentacion, la conexion se libera habiendo resuelto la consulta pero por si las dudas se confirma la liberacion con esta instruccion
        // Liberar la conexion de la pool habiendo ejecutado la consulta independientemente del resultado
        connBD.release();
    }
}

/** Funcion para obtencion de registros especificos, mediante un nombre de sensor y un rango timestamp de fechas
 * @param {string} senBus Identificador del Sensor a Buscar
 * @param {number} fechIni Valor del Timestamp inicial en el rango de busqueda
 * @param {number} fechFin Valor del Timestamp final en el rango de busqueda */
export async function getHistoEspeci(senBus, fechIni, fechFin){
    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
    try {
        // Ejecutar la consulta como sentencia preparada (Prepared Statements)
        const [results] = await connBD.execute(
            'SELECT ID,TIMESTAMP,TRENDFLAGS,STATUS,VALUE,HISTORY_ID,TRENDFLAGS_TAG,STATUS_TAG FROM historynumerictrendrecord WHERE FROM_UNIXTIME(TIMESTAMP/1000) BETWEEN FROM_UNIXTIME(?) AND FROM_UNIXTIME(?) AND HISTORY_ID = ?',
            [fechIni, fechFin, senBus]
        );
        // Retornar el arreglo JSON con los registros obtenidos
        return results;
    } catch (errGetHistoEspeci) {
        let msgError = `Error: No se pudieron obtener los registros especificados. Causa: ${errGetHistoEspeci}`; 
        console.error(msgError);
        return msgError;
    } finally {
        // Segun la documentacion, la conexion se libera habiendo resuelto la consulta pero por si las dudas se confirma la liberacion con esta instruccion
        // Liberar la conexion de la pool habiendo ejecutado la consulta independientemente del resultado
        connBD.release();
    }
}

/** Funcion para obtener los sensores que no tienen una denominacion por parte del usuario */
export async function getSensNoRegi(){
    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
    try {
        // Ejecutar la consulta como sentencia preparada (Prepared Statements)
        const [results] = await connBD.execute(
            'SELECT ID,ID_,VALUEFACETS FROM history_type_map WHERE ID NOT IN(SELECT ID_Sensor FROM sensor)'
        );
        // Retornar el arreglo JSON con los registros obtenidos
        return results;
    } catch (errGetSensNoRegi) {
        let msgError = `Error: No se pudieron obtener los sensores no registrados. Causa: ${errGetSensNoRegi}`; 
        console.error(msgError);
        return msgError;
    } finally {
        // Segun la documentacion, la conexion se libera habiendo resuelto la consulta pero por si las dudas se confirma la liberacion con esta instruccion
        // Liberar la conexion de la pool habiendo ejecutado la consulta independientemente del resultado
        connBD.release();
    }
}

/** Funcion para obtener los sensores que ya fueron nombrados por parte del usuario */
export async function getSensRegi(){
    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
    try {
        // Ejecutar la consulta como sentencia preparada (Prepared Statements)
        const [results] = await connBD.execute(
            'SELECT sensor.ID_Sensor,sensor.Nombre,history_type_map.ID_,history_type_map.VALUEFACETS FROM sensor INNER JOIN history_type_map ON Tipo_ID = ID'
        );
        // Retornar el arreglo JSON con los registros obtenidos
        return results;
    } catch (errGetSensRegi) {
        let msgError = `Error: No se pudieron obtener los sensores no registrados. Causa: ${errGetSensRegi}`; 
        console.error(msgError);
        return msgError;
    } finally {
        // Segun la documentacion, la conexion se libera habiendo resuelto la consulta pero por si las dudas se confirma la liberacion con esta instruccion
        // Liberar la conexion de la pool habiendo ejecutado la consulta independientemente del resultado
        connBD.release();
    }
}

/** Funcion para buscar el usuario en el login
 * @param {string} correo Direccion de correo ingresada en el login
 * @param {string} contra Contraseña ingresada en el login */
export async function getBusUs(correo, contra){
    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
    try {
        // Ejecutar la consulta como sentencia preparada (Prepared Statements)
        const [results] = await connBD.execute(
            'SELECT Correo,Contra FROM usuarios WHERE Correo = ? AND Contra = ?',
            [correo, contra]
        );
        // Retornar el arreglo JSON con los registros obtenidos
        return results;
    } catch (errGetBusUs) {
        let msgError = `Error: No se pudo obtener la información solicitada. Causa: ${errGetBusUs}`; 
        console.error(msgError);
        return msgError;
    } finally {
        // Segun la documentacion, la conexion se libera habiendo resuelto la consulta pero por si las dudas se confirma la liberacion con esta instruccion
        // Liberar la conexion de la pool habiendo ejecutado la consulta independientemente del resultado
        connBD.release();
    }
}

/** Funcion para registrar los sensores del sistema (nombrarlos para el selector)
 * @param {string} identiNiag Identificador asignado por Niagara para el sensor
 * @param {string} nombre Nombre a poner en el sensor seleccionado
 * @returns {string} Mensaje resultante de la consulta */
export async function postNueSens(identiNiag, nombre){
    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
    try {
        // Paso 1: Verificar que no se tenga registrado el sensor solicitado
        const [results1] = await connBD.execute(
            'SELECT ID_Sensor, Nombre, ID, ID_ FROM sensor INNER JOIN history_type_map ON Tipo_ID = ID AND ID_ = ?',
            [identiNiag]
        );
        // Si ya existe un registro previo del sensor, se le notificará al cliente que no se puede registrar nuevamente el sensor
        if(results1.length > 0){
            return "Error: El sensor a registrar ya existe en el sistema, favor de intentar con otro.";
        }else{
            // Realizar consulta para obtener el ID del sensor no registrado de la tabla del listado de sensores niagara
            try {
                const [results2] = await connBD.execute(
                    'SELECT ID FROM history_type_map WHERE ID_ = ?',
                    [identiNiag]
                );
                let sensorID = results2[0].ID;
                // Registrar el sensor en la tabla de sensores nombrados
                try {
                    const [results3] = await connBD.execute(
                        'INSERT INTO sensor (Nombre, Tipo_ID) VALUES ( ? , ? )',
                        [nombre, sensorID]
                    );
                    // Pendiente evaluacion de registro satisfactorio
                    console.log(results3);
                    return `El sensor ${nombre} fue registrado exitosamente`;
                } catch (errNuenSenso) {
                    return `Error: No se pudo registrar el sensor solicitado. Causa: ${errNuenSenso}`;
                } finally {
                    // Segun la documentacion, la conexion se libera habiendo resuelto la consulta pero por si las dudas se confirma la liberacion con esta instruccion
                    // Liberar la conexion de la pool habiendo ejecutado la consulta independientemente del resultado
                    connBD.release();
                }
            } catch (errBusSen2) {
                return `Error: No se pudo obtener la informacion requerida para el registro del sensor parte 2. Causa: ${errBusSen2}`;
            } finally {
                // Segun la documentacion, la conexion se libera habiendo resuelto la consulta pero por si las dudas se confirma la liberacion con esta instruccion
                // Liberar la conexion de la pool habiendo ejecutado la consulta independientemente del resultado
                connBD.release();
            }
        }
    } catch (errBusSen1) {
        return `Error: No se pudo obtener la informacion requerida para el registro del sensor parte 1. Causa: ${errBusSen1}`;
    } finally {
        // Segun la documentacion, la conexion se libera habiendo resuelto la consulta pero por si las dudas se confirma la liberacion con esta instruccion
        // Liberar la conexion de la pool habiendo ejecutado la consulta independientemente del resultado
        connBD.release();
    }
}

export async function postUltiAcc(correo, fechAcc){
    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
    // Buscar el usuario
    try {
        const [results1] = await connBD.execute(
            'SELECT ID_Usuario FROM usuarios where Correo = ?',
            [correo]
        );
        if(results1.length > 0 ){
            
        }
    } catch (error) {
        
    }

}