import { NextResponse } from "next/server";
import { pilaConnBD } from "../../bd_conn";

/** Funcion para obtencion de registros especificos, mediante un nombre de sensor y un rango timestamp de fechas */
export async function GET(request) {
    // Obtener los parametros de la consulta
    let senBus = request.nextUrl.searchParams.get("senBus"), 
    fechIni = request.nextUrl.searchParams.get("fechIni"),
    fechFin = request.nextUrl.searchParams.get("fechFin");

    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
    try {
        // Ejecutar la consulta como sentencia preparada (Prepared Statements)
        const [results] = await connBD.execute(
            'SELECT ID,TIMESTAMP,TRENDFLAGS,STATUS,VALUE,HISTORY_ID,TRENDFLAGS_TAG,STATUS_TAG FROM historynumerictrendrecord WHERE FROM_UNIXTIME(TIMESTAMP/1000) BETWEEN FROM_UNIXTIME(?) AND FROM_UNIXTIME(?) AND HISTORY_ID = ?',
            [fechIni, fechFin, senBus]
        );
        // Regresar la informacion si es que se encontraron los registros solicitados
        if(results.length > 0){
            // Establecer el contenido de respuesta en el objeto a regresar con codigo 200 satisfactorio
            return NextResponse.json({ results }, {
                status: 200,
                headers: {
                    'content-type': 'application/json'
                }
            });
        }else{
            // Si no se encontraron los registros, se regresa un error
            return NextResponse.json({ msgError: "Error: No se encontró la información solicitada" }, {
                status: 500,
                headers: {
                    'content-type': 'application/json'
                }
            });
        }
    } catch (errGetHistoEspeci) {
        // Establecer el contenido de respuesta en el objeto a regresar con codigo 500 no resuelto
        return NextResponse.json({ msgError: `Error: No se pudieron obtener los registros especificados. Causa: ${errGetHistoEspeci}` }, {
            status: 500,
            headers: {
                'content-type': 'application/json'
            }
        });
    } finally {
        connBD.release();
    }
}