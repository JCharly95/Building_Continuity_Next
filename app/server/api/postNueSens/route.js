import { pilaConnBD } from "../../bd_conn";
import { NextResponse } from "next/server";

export async function POST(request) {
    // Con las peticiones que se envian datos (que no son get) se debe hacer una consulta asincrona para obtener la informacion enviada
    let datos = await request.json();
    let identiNiag = datos.idenSenNiag,
    nombre = datos.nomNueSen;

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
            return NextResponse.json({ msgError: "Error: El sensor a registrar ya existe en el sistema, favor de intentar con otro." }, {
                status: 500,
                headers: {
                    'content-type': 'application/json'
                }
            });
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
                    if(results3.affectedRows == 1){
                        // Establecer el contenido de respuesta en el objeto a regresar con codigo 200 satisfactorio
                        return NextResponse.json({ results: `El sensor ${nombre} fue registrado exitosamente` }, {
                            status: 200,
                            headers: {
                                'content-type': 'application/json'
                            }
                        });
                    }else{
                        return NextResponse.json({ msgError: `El sensor ${nombre} no pudo ser registrado` }, {
                            status: 500,
                            headers: {
                                'content-type': 'application/json'
                            }
                        });
                    }
                } catch (errNuenSenso) {
                    return NextResponse.json({ msgError: `Error: No se pudo registrar el sensor solicitado. Causa: ${errNuenSenso}` }, {
                        status: 500,
                        headers: {
                            'content-type': 'application/json'
                        }
                    });
                } finally {
                    connBD.release();
                }
            } catch (errBusSen2) {
                return NextResponse.json({ msgError: `Error: No se pudo obtener la informacion requerida para el registro del sensor parte 2. Causa: ${errBusSen2}` }, {
                    status: 500,
                    headers: {
                        'content-type': 'application/json'
                    }
                });
            } finally {
                connBD.release();
            }
        }
    } catch (errBusSen1) {
        return NextResponse.json({ msgError: `Error: No se pudo obtener la informacion requerida para el registro del sensor parte 1. Causa: ${errBusSen1}` }, {
            status: 500,
            headers: {
                'content-type': 'application/json'
            }
        });
    } finally {
        connBD.release();
    }
}