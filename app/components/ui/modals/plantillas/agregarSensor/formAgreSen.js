"use client";
import axios from "axios";
import Form from "next/form";
import React, { useState, useRef } from "react";
import Modal from "@/app/components/ui/modals/modal"
import Dialog from "@/app/components/ui/modals/plantillas/dialog";
import { validarNombreSensores } from "@/app/components/logic/validaciones";
import ListaSenNoRegi from "@/app/components/ui/modals/plantillas/agregarSensor/listaSenNoRegi";

export default function FormAgreSensor({ estModal }){
    /* Variable de estado para la apertura/cierre del modal
    Variable de estado para el titulo del modal
    Variable de estado para establecer el contenido del modal */
    const [modalOpen, setModalOpen] = useState(false),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState("");
    // Variable de estado para obtener el identificador del sensor a registrar y variable de referencia par obtener el nombre del sensor con que se registrará
    const [senProce, setSenProce] = useState("No hay sensor"),
    nomRef = useRef(null);

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => {
         setModalOpen(estado)
    }
    // Obtener la informacion para la apertura del modal, regresada como un objeto para trabajarlo desde un mismo lado
    const handleModalInfo = (infoModal) => {
        // Establecer el titulo del modal, el contenido del mismo y la apertura de este
        setModalTitu(infoModal.titulo);
        setModalConte(infoModal.contenido);
        setModalOpen(infoModal.abierto);
    }

    /** Funcion de obtencion del sensor seleccionado (retorno del componente hijo) */
    const obteSensoSel = (idSenNiag) => ( setSenProce(idSenNiag) );

    /** Funcion para evaluar la informacion recabada en el formulario
     * @param {Event} evento Evento del DOM al enviar el formulario */
    function handleForm(evento){
        // Evitar el envio por defecto del formulario
        evento.preventDefault();
        // Evaluar el valor ingresado en los campos
        let respVali = validarCampos(senProce, `${nomRef.current.value}`);
        // Determinar si el sensor fue validado con exito y ejecutar la consulta de guardado en la BD si fuera el caso positivo
        if(respVali.titulo.includes("Sensor Validado")){
            regiSensor(senProce, `${nomRef.current.value}`).then((respRegiSen) => {
                setModalTitu("Sensor Registrado");
                setModalConte(<Dialog textMsg={respRegiSen}/>);
                setModalOpen(true);
                // Cerrar los modales de aviso y el formulario despues de 2.5 segundos de aviso
                setTimeout(() => {
                    setModalOpen(false);
                    estModal(false);
                }, 2500);
            }).catch((errorRegiSen) => {
                setModalTitu("Error");
                setModalConte(<Dialog textMsg={errorRegiSen}/>);
                setModalOpen(true);
            });
        }else{
            // Si el sensor no se validó, se establecerá el contenido del modal de avisos
            setModalTitu(respVali.titulo);
            setModalConte(respVali.contenido);
            setModalOpen(respVali.estado);
        }
        /* Si no se obtuvieron errores, se procederá con el cierre del modal del registro de sensor
        if(!respVali.titulo.includes("Error")){
            // Cerrar el modal del formulario despues de 2 segundos de haberlo registrado
            setTimeout(() => {
                estModal(false);
            }, 2000);
        }*/
    }

    return(
        <section>
            <Form className="bg-white px-6" onSubmit={handleForm}>
                <section className="md:flex md:items-center mb-3">
                    <section className="md:w-1/3">
                        <label htmlFor="id-usuario" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                            Nombre:
                        </label>
                    </section>
                    <section className="md:w-2/3">
                        <input id="nom-sensor" type="text" placeholder="Linea de Energia 1" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" ref={nomRef}/>
                    </section>
                </section>            
                <section className="md:flex md:items-center mb-3">
                    <section className="md:w-1/3">
                        <label htmlFor="lst-sensores" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                            Sensores del Sistema:
                        </label>
                    </section>
                    <section className="md:w-2/3">
                        <ListaSenNoRegi senNoRegSel={obteSensoSel} modalObjInfo={handleModalInfo}/>
                    </section>
                </section>
                <section className="flex items-center justify-center">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3">Agregar Sensor</button>
                </section>
            </Form>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}

/** Funcion para evaluar los campos del formulario de registro de sensores
 * @param {string} niagSensor ID del sensor dado por niagara
 * @param {string} nomSensor Nombre del sensor designado por el usuario
 * @returns Objeto con la respuesta a mostrar en el modal, siendo error o satisfactorio */
function validarCampos(niagSensor, nomSensor){
    // Objeto de respuesta por la validacion de campos del formulario para registrar sensor
    let respValiAgreSen = { titulo: "", contenido: <></>, estado: false };
    
    // Evaluacion general, revisar que se haya ingresado informacion en el formulario
    if((niagSensor == "Seleccione el sensor..." || niagSensor == "No hay sensor") && nomSensor.length == 0){
        respValiAgreSen.titulo = "Error";
        respValiAgreSen.contenido = <Dialog textMsg="Favor de ingresar la información solicitada"/>;
        respValiAgreSen.estado = true;
    }else{
        // Evaluacion de la seleccion de la lista de sensores
        if(niagSensor == "Seleccione el sensor..." || niagSensor == "No hay sensor"){
            respValiAgreSen.titulo = "Error";
            respValiAgreSen.contenido = <Dialog textMsg="Favor de seleccionar un sensor de la lista"/>;
            respValiAgreSen.estado = true;
        }
        // Objeto de respuesta de la validación del nombre
        let objRespNom = validarNombreSensores(nomSensor);
        // Obtener la respuesta de la validacion del nombre en base al objeto resultante
        switch(objRespNom.getCondicion){
            case 0:
                respValiAgreSen.titulo = "Error";
                respValiAgreSen.contenido = <Dialog textMsg="La validación del nombre no pudo ser realizada"/>;
                respValiAgreSen.estado = true;
                break;
            case 1:
                respValiAgreSen.titulo = "Sensor Validado Satisfactoriamente";
                respValiAgreSen.contenido = <Dialog textMsg="La información obtenida para el registro del sensor fue adecuada."/>;
                respValiAgreSen.estado = false;
                break;
            case 2:
                respValiAgreSen.titulo = "Error";
                respValiAgreSen.contenido = <Dialog textMsg={objRespNom.getMensaje}/>;
                respValiAgreSen.estado = true;
                break;
        }
    }
    // Regresar el objeto con la respuesta obtenida, segun el caso
    return respValiAgreSen;
}

/* Funcion para evaluar los campos del formulario de registro de sensores
 * @param {string} niagSensor ID del sensor dado por niagara
 * @param {string} nomSensor Nombre del sensor designado por el usuario
 * @returns Objeto con la respuesta a mostrar en el modal, siendo error o satisfactorio
function validacionCampos(niagSensor, nomSensor){
    // Objeto de respuesta por la validacion de campos del formulario para registrar sensor
    let respValiAgrSen = { titulo: "", contenido: <></>, estado: false };
    // Evaluacion general, revisar que se haya ingresado informacion en el formulario
    if(niagSensor == "Seleccione el sensor..." || niagSensor == "No hay sensor" || nomSensor.length == 0) {
        if(nomSensor.length == 0){
            respValiAgrSen.titulo = "Error";
            respValiAgrSen.contenido = <Dialog textMsg="Favor de ingresar el nombre del sensor a registrar"/>;
            respValiAgrSen.estado = true;
        }
        if(niagSensor == "Seleccione el sensor..." || niagSensor == "No hay sensor"){
            respValiAgrSen.titulo = "Error";
            respValiAgrSen.contenido = <Dialog textMsg="Favor de seleccionar un sensor de la lista"/>;
            respValiAgrSen.estado = true;
        }
        if((niagSensor == "Seleccione el sensor..." || niagSensor == "No hay sensor") && nomSensor.length == 0){
            respValiAgrSen.titulo = "Error";
            respValiAgrSen.contenido = <Dialog textMsg="Favor de ingresar la información solicitada"/>;
            respValiAgrSen.estado = true;
        }
    }else{
        respValiAgrSen.titulo = "Sensor Validado Satisfactoriamente";
        respValiAgrSen.contenido = <Dialog textMsg="La información obtenida para el registro del sensor fue adecuada."/>;
        respValiAgrSen.estado = false;
    }
    // Regresar el objeto con la respuesta obtenida, segun el caso
    return respValiAgrSen;
}*/

/** Funcion para registrar un sensor "asociar un nombre al sensor" en la BD
 * @param {string} idSenso Identificador del sensor dado por el sistema Niagara
 * @param {string} nomSenBD Nombre del sensor dado por el usuario
 * @returns {Promise<Array | string>} Promesa con arreglo de informacion resultante o mensaje de error en caso de acontecer uno */
async function regiSensor(idSenso, nomSenBD){
    try {
        const consulta = await axios.post("/server/api/postNueSens", {
            idenSenNiag: idSenso,
            nomNueSen: nomSenBD
        },{
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return consulta.data.results;
    } catch (errRegiSensor) {
        // Si ocurrio un error en la peticion de busqueda se mostrará aqui
        if (errRegiSensor.response) {
            // Primer caso, el servidor tiró un error 500 programado por registrar el sensor o porque no se pudo hacer la peticion para registrarlo (Error contemplado)
            return (typeof(errRegiSensor.response.data.msgError) == "undefined") ? "Error: Registro de sensor no realizado caso 1, favor de intentar mas tarde." : errRegiSensor.response.data.msgError;
        } else if (errRegiSensor.request) {
            // Segundo caso, el cliente no se pudo contactar con el servidor o este no respondio (Error controlado)
            return("Error: Registro de sensor no realizado caso 2, favor de intentar mas tarde.");
        } else {
            // Tercer caso, ocurrio un error en la disponibilidad de la respuesta del servidor (Error no contemplado y desconocido)
            return("Error: Registro de sensor no realizado caso 3, favor de intentar mas tarde.");
        }
    }
}