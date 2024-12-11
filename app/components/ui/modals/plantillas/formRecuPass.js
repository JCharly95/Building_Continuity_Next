"use client";
import axios from "axios";
import Form from "next/form";
import Modal from "../modal";
import Dialog from "./dialog";
//import { Eye, EyeOff } from "react-feather";
import React, { useState, useRef } from "react";
import { validarCamposPerso, validarCodigoUsuario, /*validarContrasenia,*/ validarCorreo } from "@/app/components/logic/validaciones";

export default function FormRecu(){
    /* Variables de trabajo:
    Variable de estado para establecer tipo de campo en la contraseña
    Variable de estado para establecer el icono a mostrar en el boton de mostrar contraseña
    Variable de estado para la apertura/cierre del modal
    Variable de estado para el titulo del modal
    Variable de estado para establecer el contenido del modal
    Constantes de referencia para los campos: codigo de usuario, nombre, apellido paterno y materno, correo y la contraseña */
    const /*[passCamp, setPassCamp] = useState("password"),
    [iconoPas, setIconoPas] = useState(<Eye id="ojo_abierto" color="black" size={30}/>),*/
    [modalOpen, setModalOpen] = useState(false),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(""),
    codUserRef = useRef(null),
    nomRef = useRef(null),
    apePatRef = useRef(null),
    apeMatRef = useRef(null),
    correoRef = useRef(null)/*,
    contraRef = useRef(null)*/;

    /* Mostrar/Ocultar contraseña
    const verPass = () => {
        if(passCamp == "password"){
            setPassCamp("text");
            setIconoPas(<EyeOff id="ojo_abierto" color="black" size={30}/>);
        }else {
            setPassCamp("password");
            setIconoPas(<Eye id="ojo_abierto" color="black" size={30}/>);
        }
    }; */

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => {
        setModalOpen(estado);
    }

    /** Funcion para evaluar la informacion recabada en el formulario
     * @param {Event} evento Evento del DOM al enviar el formulario */
    function handleForm(evento){
        // Evitar el envio por defecto del formulario
        evento.preventDefault();
        // Establecer el valor de los campos del formulario
        let codForm = `${codUserRef.current.value}`,
        nomForm = `${nomRef.current.value}`,
        apePatForm = `${apePatRef.current.value}`,
        apeMatForm = `${apeMatRef.current.value}`,
        corForm = `${correoRef.current.value}`;
        // Validar la informacion de los campos
        let respVali = validarCampos(codForm, nomForm, apePatForm, apeMatForm, corForm/*, `${contraRef.current.value}`*/);
        // Crear y abrir un modal de carga
        setModalTitu("Cargando");
        setModalConte(<Dialog textMsg="Procesando información, espere por favor..."/>);
        setModalOpen(true);

        // Limpiar los campos del formulario despues de mandar revisar el formulario
        codUserRef.current.value = "";
        nomRef.current.value = "";
        apePatRef.current.value = "";
        apeMatRef.current.value = "";
        correoRef.current.value = "";

        // Con base al resultado de la validacion de datos, se procederá con la busqueda del usuario en BD para verificar la existencia del mismo, en caso de validacion incorrecta, se abrira el modal de errores mostrando el mismo
        if(respVali.titulo.includes("Datos de Recuperacion")){
            // Peticion de busqueda en la BD usando una funcion con retorno de promesa
            busUserRecu(codForm, nomForm, apePatForm, apeMatForm, corForm).then((respBusUser) => {
                let datos = respBusUser[0];
                // Revisar si la informacion coincide
                if(datos.Cod_User == codForm && datos.Correo == corForm){
                    // Lanzar la peticion del envio del correo con base a la informacion obtenida en la busqueda
                    recuContra(nomForm, apePatForm, corForm, datos.Contra).then((respEnviarCor) => {
                        setModalTitu("Correo Enviado");
                        setModalConte(<Dialog textMsg={respEnviarCor}/>);
                        setModalOpen(true);
                        // Cerrar el modal de aviso despues de 2.5 segundos de aviso
                        setTimeout(() => {
                            setModalOpen(false);
                        }, 2500);
                    }).catch((errorEnviCor) => {
                        setModalTitu("Error");
                        setModalConte(<Dialog textMsg={errorEnviCor}/>);
                        setModalOpen(true);
                    });
                }else{
                    setModalTitu("Error");
                    setModalConte(<Dialog textMsg="Favor de revisar la información ingresada"/>);
                    setModalOpen(true);
                }
            }).catch((errBusUser) => {
                setModalTitu("Error");
                setModalConte(<Dialog textMsg={errBusUser}/>);
                setModalOpen(true);
            });
        }else{
            setModalTitu(respVali.titulo);
            setModalConte(respVali.contenido);
            setModalOpen(respVali.estado);
        }
        // Si no se obtuvieron errores, se procederá con el cierre del modal del registro de sensor
        /*if(!respVali.titulo.includes("Error")){
            // Cerrar el modal del formulario despues de 2 segundos de haberlo registrado
            setTimeout(() => {
                estModal(false);
            }, 2000);
        }*/
    }

    return(
        <section>
            <Form className="bg-white px-6">
                <section className="flex flex-col items-center text-justify text-blue-700 text-sm mb-2">
                    <label className="text-xl text-yellow-700">Disclaimer:</label>
                    <label>Con el propósito de asegurar que es realmente el usuario en cuestión quien quiere recuperar su contraseña se solicitarán datos personales <label className="text-red-600">(Se recomienda discreción)</label>.</label>
                </section>
                <section className="md:flex md:items-center mb-2">
                    <section className="md:w-1/3">
                        <label htmlFor="id-usuario" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                            Codigo Usuario:
                        </label>
                    </section>
                    <section className="md:w-2/3">
                        <input id="id-usuario" type="text" placeholder="MXN-dddd" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" ref={codUserRef}/>
                    </section>
                </section>            
                <section className="md:flex md:items-center mb-2">
                    <section className="md:w-1/3">
                        <label htmlFor="nombre-usuario" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                            Nombre(s):
                        </label>
                    </section>
                    <section className="md:w-2/3">
                        <input id="nombre-usuario" type="text" placeholder="Jose" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" ref={nomRef}/>
                    </section>
                </section>
                <section className="md:flex md:items-center mb-2">
                    <section className="md:w-1/3">
                        <label htmlFor="ape-pate" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-3">
                            Apellido Paterno:
                        </label>
                    </section>
                    <section className="md:w-2/3">
                        <input id="ape-pate" type="text" placeholder="Ortega" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" ref={apePatRef}/>
                    </section>
                </section>
                <section className="md:flex md:items-center mb-2">
                    <section className="md:w-1/3">
                        <label htmlFor="ape-mate" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-2">
                            Apellido Materno:
                        </label>
                    </section>
                    <section className="md:w-2/3">
                        <input id="ape-mate" type="text" placeholder="Rodriguez" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                        ref={apeMatRef}/>
                    </section>
                </section>
                <section className="md:flex md:items-center mb-2">
                    <section className="md:w-1/3">
                        <label htmlFor="dir-correo" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                            Correo:
                        </label>
                    </section>
                    <section className="md:w-2/3">
                        <input id="dir-correo" type="email" placeholder="alguien@ejemplo.com" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" ref={correoRef}/>
                    </section>
                </section>
                {/*<section className="md:flex md:items-center mb-2">
                    <section className="md:w-1/3">
                        <label htmlFor="val-contra" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                            Contraseña:
                        </label>
                    </section>
                    <section className="md:w-2/3 flex justify-normal">
                        <input id="val-contra" type={passCamp} placeholder="******************" className="shadow shadow-emerald-300 appearance-none border rounded w-11/12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" ref={contraRef}/>
                        <button type="button" className="shadow shadow-emerald-300 appearance-none border rounded px-1" onClick={verPass}>{iconoPas}</button>
                    </section>
                </section>*/}
                <section className="flex items-center justify-center pt-1">
                    <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3" onClick={handleForm}>Enviar</button>
                </section>
            </Form>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}

/** Funcion para validar los datos ingresados en el formulario
 * @param {string} codUser Cadena de texto con el codigo del usuario
 * @param {string} nomUser Cadena de texto con el nombre de la persona
 * @param {string} apePaUser Cadena de texto con el apellido paterno de la persona
 * @param {string} apeMaUser Cadena de texto con el apellido materno de la persona
 * @param {string} dirCor Cadena de texto con el correo ingresado en el formulario
 * @returns Objeto con la respuesta a mostrar en el modal, siendo error o satisfactorio */
function validarCampos(codUser, nomUser, apePaUser, apeMaUser, dirCor){
    /* Variables de trabajo:
    Objeto de respuesta a retornar por la validacion de campos del formulario para recuperacion de contraseña
    Banderas de validacion del codigo, nombre, apellidos, correo y contraseña
    Variable del mensaje a retornar */
    let respValiRecuPass = { titulo: "", contenido: <></>, estado: false },
    bandeValiCod = false, bandeValiNom = false,
    bandeValiApPa = false, bandeValiApMa = false,
    bandeValiCor = false, /*bandeValiPas = false,*/
    msgVali = "";
    
    // Evaluacion general, revisar que se haya ingresado informacion en el formulario
    if(codUser.length == 0 && nomUser.length == 0 && apePaUser.length == 0 && apeMaUser.length == 0 && dirCor.length == 0 /*&& valContra.length == 0*/){
        respValiRecuPass.titulo = "Error";
        respValiRecuPass.contenido = <Dialog textMsg="Favor de ingresar la información solicitada"/>;
        respValiRecuPass.estado = true;
    }else{
        /* Variables de trabajo:
        Objetos de respuesta de la validación del codigo, nombre, apellidos, correo y contraseña */
        let objRespCod = validarCodigoUsuario(codUser),
        objRespNom = validarCamposPerso(nomUser, "Nombre"),
        objRespApePat = validarCamposPerso(apePaUser, "Apellido"),
        objRespApeMat = validarCamposPerso(apeMaUser, "Apellido"),
        objRespDirCor = validarCorreo(dirCor)/*,
        objRespContra = validarContrasenia(valContra)*/;

        // Respuesta de validación del codigo de usuario
        (objRespCod.getCondicion == 0) ? msgVali += `La validación del codigo de usuario no fue realizada. `
        : (objRespCod.getCondicion == 1) ? bandeValiCod = true
        : (objRespCod.getCondicion == 2) ? msgVali += (`${objRespCod.getMensaje}. `)
        : null;

        // Respuesta de validación del nombre
        (objRespNom.getCondicion == 0) ? msgVali += `La validación del nombre no fue realizada. `
        : (objRespNom.getCondicion == 1) ? bandeValiNom = true
        : (objRespNom.getCondicion == 2) ? msgVali += (`${objRespNom.getMensaje}. `)
        : null;

        // Respuesta de validación del apellido paterno
        (objRespApePat.getCondicion == 0) ? msgVali += `La validación del apellido paterno no fue realizada. `
        : (objRespApePat.getCondicion == 1) ? bandeValiApPa = true
        : (objRespApePat.getCondicion == 2) ? msgVali += (`${objRespApePat.getMensaje}. `)
        : null;
        
        // Respuesta de validación del apellido materno
        (objRespApeMat.getCondicion == 0) ? msgVali += `La validación del apellido materno no fue realizada. `
        : (objRespApeMat.getCondicion == 1) ? bandeValiApMa = true
        : (objRespApeMat.getCondicion == 2) ? msgVali += (`${objRespApeMat.getMensaje}. `)
        : null;
        
        // Respuesta de validación de la dirección del correo
        (objRespDirCor.getCondicion == 0) ? msgVali += `La validación de la dirección de correo no fue realizada. `
        : (objRespDirCor.getCondicion == 1) ? bandeValiCor = true
        : (objRespDirCor.getCondicion == 2) ? msgVali += (`${objRespDirCor.getMensaje}. `)
        : null;
        
        /* Respuesta de validación de la contraseña
        (objRespContra.getCondicion == 0) ? msgVali += `La validación de la contraseña no fue realizada. `
        : (objRespContra.getCondicion == 1) ? bandeValiPas = true
        : (objRespContra.getCondicion == 2) ? msgVali += (`${objRespContra.getMensaje}. `)
        : null;*/

        // Establecer los valores de retorno para el modal segun la validacion obtenida de los campos
        if(bandeValiCod && bandeValiNom && bandeValiApPa && bandeValiApMa && bandeValiCor/* && bandeValiPas */){
            respValiRecuPass.titulo = "Datos de Recuperacion Validados Satisfactoriamente";
            respValiRecuPass.contenido = <Dialog textMsg="La información obtenida para la recuperación fue adecuada."/>;
            respValiRecuPass.estado = false;
        }else{
            respValiRecuPass.titulo = "Error";
            respValiRecuPass.contenido = <Dialog textMsg={msgVali}/>;
            respValiRecuPass.estado = true;
        }
    }
    // Regresar el objeto con la respuesta obtenida, segun el caso
    return respValiRecuPass;
}


/** Funcion para buscar al usuario en la base de datos con la informacion ingresada en el formulario
 * @param {string} valCodForm Cadena de texto con el codigo del usuario
 * @param {string} valNomForm Cadena de texto con el nombre de la persona
 * @param {string} valApePatForm Cadena de texto con el apellido paterno de la persona
 * @param {string} valApeMatForm Cadena de texto con el apellido materno de la persona
 * @param {string} valDirCorForm Cadena de texto con el correo ingresado en el formulario
 * @returns {Promise<Array | string>} Promesa con arreglo de informacion resultante o mensaje de error en caso de acontecer uno */
async function busUserRecu(valCodForm, valNomForm, valApePatForm, valApeMatForm, valDirCorForm){
    try {
        const consulta = await axios.get("/server/api/getBusUsRecuPass", {
            params: {
                codBusq: valCodForm,
                nomBusq: valNomForm,
                apePatBusq: valApePatForm,
                apeMatBusq: valApeMatForm,
                valCorBus: valDirCorForm
            }
        });
        return consulta.data.results;
    } catch (errBusUser) {
        // Si ocurrio un error en la peticion de busqueda se mostrará aqui
        if (errBusUser.response) {
            // Primer caso, el servidor tiró un error 500 programado por no encontrar el usuario con la información del formulario o porque no se pudo hacer la peticion para consultar información (Error contemplado)
            return (typeof(errBusUser.response.data.msgError) == "undefined") ? "Error: Información no disponible caso 1, favor de intentar mas tarde." : errBusUser.response.data.msgError;
        } else if (errBusUser.request) {
            // Segundo caso, el cliente lanzó la petición al servidor y este no respondio (Error controlado)
            return("Error: Información no disponible caso 2, favor de intentar mas tarde.");
        } else {
            // Tercer caso, ocurrio un error en la petición y por ende en la respuesta del servidor (Error no contemplado y desconocido)
            return("Error: Información no disponible caso 3, favor de intentar mas tarde.");
        }
    }
}

/** Funcion para enviar el correo con la informacion de recuperacion de contraseña
 * @param {string} nombre Nombre o nombres de la persona (usuario) a mandar el correo
 * @param {string} apePater Apellido paterno dado por el usuario
 * @param {string} correo Dirección de correo del usuario dado y a donde se enviará el correo con la información
 * @param {string} contra Contraseña obtenida de la BD para la recuperación
 * @returns {Promise<Array | string>} Promesa con arreglo de informacion resultante o mensaje de error en caso de acontecer uno */
async function recuContra(nombre, apePater, correo, contra){
    try {
        const consulta = await axios.post("/server/api/postCorreoRecu", {
            nomPerso: nombre,
            apelliPater: apePater,
            direCorreo: correo,
            valContra: contra
        },{
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return consulta.data.results;
    } catch (errRecuContra) {
        // Si ocurrio un error en la peticion de busqueda se mostrará aqui
        if (errRecuContra.response) {
            // Primer caso, el servidor tiró un error 500 programado por recuperar la contraseña o porque no se pudo hacer la peticion para recuperarla (Error contemplado)
            return (typeof(errRecuContra.response.data.msgError) == "undefined") ? "Error: Recuperación de contraseña no realizada caso 1, favor de intentar mas tarde." : errRecuContra.response.data.msgError;
        } else if (errRecuContra.request) {
            // Segundo caso, el cliente no se pudo contactar con el servidor o este no respondio (Error controlado)
            return("Error: Recuperación de contraseña no realizada caso 2, favor de intentar mas tarde.");
        } else {
            // Tercer caso, ocurrio un error en la disponibilidad de la respuesta del servidor (Error no contemplado y desconocido)
            return("Error: Recuperación de contraseña no realizada caso 3, favor de intentar mas tarde.");
        }
    }
}