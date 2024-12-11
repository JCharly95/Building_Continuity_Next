import { pilaConnBD } from "../../bd_conn";
import { NextResponse } from "next/server";

/** Funcion para obtener los sensores que no tienen una denominacion por parte del usuario */
export async function GET() {
    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
    try {
        // Ejecutar la consulta como sentencia preparada (Prepared Statements)
        const [results] = await connBD.execute(
            'SELECT ID,ID_ FROM history_type_map WHERE ID NOT IN(SELECT Tipo_ID FROM sensor)'
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
    } catch (errGetSensNoRegi) {
        // Establecer el contenido de respuesta en el objeto a regresar con codigo 500 no resuelto
        return NextResponse.json({ msgError: `Error: No se pudieron obtener los sensores no registrados. Causa: ${errGetSensNoRegi}` }, {
            status: 500,
            headers: {
                'content-type': 'application/json'
            }
        });
    } finally {
        connBD.release();
    }
}