"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Dialog from "@/app/components/ui/modals/plantillas/dialog";

export default function ListaSenNoRegi({ senNoRegSel, modalObjInfo }){
    const [listaSenso, setListaSenso] = useState([]);

    useEffect(() => {
        const petiSenso = async() => {
            try {
                const peticion = await axios.get("/server/api/getSensNoRegi");
                const datos = await peticion.data.results;
                setListaSenso(
                    datos.map((sensor) => ({
                        ID: `${sensor.ID}`,
                        ID_Niag: `${sensor.ID_}`
                    }))
                );
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
        <select id="listaSenNoRegi" name="listaSenNoRegi" className="block w-full h-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm/6 lg:text-lg pl-1">
            <option id="0" value="Seleccione el sensor...">Seleccione el sensor...</option>
            {
                listaSenso.map((sensor) => {
                    return(
                        <option key={`SenBDNiag${sensor.ID}`} onClick={() => senNoRegSel(`${sensor.ID_Niag}`)}>
                            {`${sensor.ID_Niag}`}
                        </option>
                    )
                })
            }
        </select>
    );
}