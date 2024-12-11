"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Dialog from "@/app/components/ui/modals/plantillas/dialog";

export default function ListaSelSensor({ sensoSel, modalObjInfo }){
    const [listaSenso, setListaSenso] = useState([]);

    useEffect(() => {
        const petiSenso = async() => {
            try {
                const peticion = await axios.get("/server/api/getSensRegi");
                const datos = await peticion.data.results;
                setListaSenso(ordeDatos(datos));
            } catch (errListSen) {
                let msgError = "";
                // Si ocurrio un error en la peticion de busqueda se mostrará aqui
                if(errListSen.response){
                    // Primer caso, el servidor no encontro la informacion de los sensores (Error contemplado)
                    msgError = "Error: Selección Bloqueada, Información No Procesada";
                    //console.error("Error: Selección Bloqueada, Información No Procesada");
                }else if (errListSen.request){
                    // Segundo caso, el cliente no se pudo contactar con el servidor o este no respondio (Error controlado)
                    msgError = "Error: Servicio No Disponible, Información Inaccesible";
                    //console.error("Error: Servicio No Disponible, Información Inaccesible");
                }else{
                    // Tercer caso, ocurrio un error en la disponibilidad de la respuesta del servidor (Error no contemplado y desconocido)
                    msgError = "Error: Servicio No Disponible, Favor de Intentar Después";
                    //console.error("Error: Servicio No Disponible, Favor de Intentar Después");
                }
                // Establecer el titulo del modal, el contenido del mismo y la apertura de este; (Para este caso sera un objeto para trabajar la informacion desde un mismo sitio)
                modalObjInfo({
                    titulo: "Error",
                    contenido: <Dialog textMsg={msgError} />,
                    abierto: true
                });
            }
        };
        petiSenso();
    }, [modalObjInfo]);

    return(
        <select id="filtroBusGraf" name="filtro" className="block w-full h-5/6 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm/6 pl-1">
            <option id="0" value="Seleccione el sensor a buscar...">Seleccione el sensor a buscar...</option>
            {
                listaSenso.map((sensor) => {
                    return(
                        <option key={`TipoSen${sensor.id}`} onClick={() => sensoSel(`${sensor.valor};${sensor.nombre};${sensor.unidad}`)}>
                            {`${sensor.nombre} (${sensor.unidad})`}
                        </option>
                    )
                })
            }
        </select>
    );
}

/** Funcion para ordenar el arreglo de informacion a mostrar en la lista de seleccion
 * @param {Array} arrInfo Arreglo resultante de la consulta a BD */
function ordeDatos(arrInfo){
    let arrOrdeInfo = arrInfo.map((sensor) => {
        if(`${sensor.VALUEFACETS}`.split(";")[1]!=='') {
            if(`${sensor.VALUEFACETS}`.split(";")[1]==='V' || `${sensor.VALUEFACETS}`.split(";")[1]==='v') {
                return {
                    id: sensor.ID_Sensor,
                    nombre: `${sensor.Nombre}`, 
                    valor: `${sensor.ID_}`, 
                    unidad: 'Volts'
                }
            }else if(`${sensor.VALUEFACETS}`.split(";")[1]==='%') {
                return {
                    id: sensor.ID_Sensor,
                    nombre: `${sensor.Nombre}`, 
                    valor: `${sensor.ID_}`, 
                    unidad: '% de Combustible'
                }
            }else{
                return {
                    id: sensor.ID_Sensor,
                    nombre: `${sensor.Nombre}`, 
                    valor: `${sensor.ID_}`, 
                    unidad: `${sensor.VALUEFACETS}`.split(";")[1]
                }
            }
        }else{
            if(`${sensor.ID_}`.includes("Incendio")) {
                return {
                    id: sensor.ID_Sensor,
                    nombre: `${sensor.Nombre}`, 
                    valor: `${sensor.ID_}`, 
                    unidad: 'Detecciones de Humo'
                }
            }else if(`${sensor.ID_}`.includes("Potable")) {
                return {
                    id: sensor.ID_Sensor,
                    nombre: `${sensor.Nombre}`, 
                    valor: `${sensor.ID_}`, 
                    unidad: 'Litros'
                }
            }else if(`${sensor.ID_}`.includes("Pluvial")) {
                return {
                    id: sensor.ID_Sensor,
                    nombre: `${sensor.Nombre}`, 
                    valor: `${sensor.ID_}`,
                    unidad: 'Cantidad de Lluvia'
                }
            }else if(`${sensor.ID_}`.includes("Starts")) {
                return {
                    id: sensor.ID_Sensor,
                    nombre: `${sensor.Nombre}`, 
                    valor: `${sensor.ID_}`, 
                    unidad: 'Cantidad de Inicios'
                }
            }else{
                return {
                    id: sensor.ID_Sensor,
                    nombre: `${sensor.Nombre}`, 
                    valor: `${sensor.ID_}`, 
                    unidad: 'Unidad no Detectada'
                }
            }
        }
    });
    return arrOrdeInfo;
}