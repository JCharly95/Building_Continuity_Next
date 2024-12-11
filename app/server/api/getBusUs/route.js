import { pilaConnBD } from "../../bd_conn";
import { NextResponse } from "next/server";

/** Funcion para buscar el usuario en el login */
export async function GET(request){
    // Obtener los parametros de consulta del formulario
    let correo = request.nextUrl.searchParams.get("correo"), 
    contra = request.nextUrl.searchParams.get("contra");

    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
    try {
        // Ejecutar la consulta como sentencia preparada (Prepared Statements)
        const [results] = await connBD.execute(
            'SELECT Correo FROM usuarios WHERE Correo = ? AND Contra = ?',
            [correo, contra]
        );
        // Regresar la informacion si es que se encontro el usuario en la BD
        if(results.length > 0){
            // Establecer el contenido de respuesta en el objeto a regresar con codigo 200 satisfactorio
            return NextResponse.json({ results }, {
                status: 200,
                headers: {
                    'content-type': 'application/json'
                }
            });
        }else{
            // Si no se encontro el usuario, se regresa un error
            return NextResponse.json({ msgError: "Error: Favor de revisar la información ingresada" }, {
                status: 500,
                headers: {
                    'content-type': 'application/json'
                }
            });
        }
    } catch (errGetBusUs) {
        // Establecer el contenido de respuesta en el objeto a regresar con codigo 500 no resuelto
        return NextResponse.json({ msgError: `Error: No se pudo obtener la información solicitada. Causa: ${errGetBusUs}` }, {
            status: 500,
            headers: {
                'content-type': 'application/json'
            }
        });
    } finally {
        connBD.release();
    }
}