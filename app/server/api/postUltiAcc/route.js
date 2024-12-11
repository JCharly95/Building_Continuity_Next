import { pilaConnBD } from "../../bd_conn";
import { NextResponse } from "next/server";

export async function POST(request){
    // Con las peticiones que se envian datos (que no son get) se debe hacer una consulta asincrona para obtener la informacion enviada
    let datos = await request.json();
    let correoUs = datos.correo,
    fechAcc = datos.fechLAcc;

    // Crear una conexion con la BD usando la pila de conexiones
    const connBD = await pilaConnBD().getConnection();
   
    // Actualizar el valor fecha del ultimo acceso basado en el correo ingresado en el form de login
    try {
        // NOTA: Para este punto no se buscara al usuario, puesto que si ocurrio algun error previo no hubiera llegado hasta esta consulta, por lo que se da por hecho que el correo existe en el sistema
        const [results] = await connBD.execute('UPDATE usuarios SET UltimoAcceso = ? where Correo = ?',[fechAcc, correoUs]);
        // Si se detecto una fila afectada, quiere decir que se actualizo el valor satisfactoriamente, por lo que se procede establecer el mensaje de respuesta satisfactoria de la actualizacion del acceso
        if(results.affectedRows == 1){
            return NextResponse.json({ results: "La fecha de acceso fue actualizada" }, {
                status: 200,
                headers: {
                    'content-type': 'application/json'
                }
            });
        }else{
            return NextResponse.json({ msgError: "Error: La fecha de acceso no fue actualizada" }, {
                status: 500,
                headers: {
                    'content-type': 'application/json'
                }
            });
        }
    } catch (errActuFechAcc) {
        return NextResponse.json({ msgError: `Error: La fecha de acceso no pudo ser actualizada. Causa: ${errActuFechAcc}` }, {
            status: 500,
            headers: {
                'content-type': 'application/json'
            }
        });
    } finally {
        connBD.release();
    }
}