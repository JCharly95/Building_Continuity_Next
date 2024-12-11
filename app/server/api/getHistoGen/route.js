import { pilaConnBD } from "../../bd_conn";
import { NextResponse } from "next/server";

/** Funcion para obtener los 10 primeros registros generales del sistema sin filtrado de busqueda*/
export async function GET(){
    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
    try {
        // Ejecutar la consulta como sentencia preparada (Prepared Statements)
        const [results] = await connBD.execute(
            'SELECT ID,TIMESTAMP,TRENDFLAGS,STATUS,VALUE,HISTORY_ID,TRENDFLAGS_TAG,STATUS_TAG FROM historynumerictrendrecord LIMIT 10'
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
    } catch (errGetHistoGen) {
        let msgError = `Error: No se pudieron obtener los registros generales. Causa: ${errGetHistoGen}`; 
        //console.error(msgError);
        // Establecer el contenido de respuesta en el objeto a regresar con codigo 500 no resuelto
        return NextResponse.json({ msgError }, {
            status: 500,
            headers: {
                'content-type': 'application/json'
            }
        });
    } finally {
        connBD.release();
    }
}