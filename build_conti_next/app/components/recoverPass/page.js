'use client';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AlertTriangle } from 'react-feather';
import { validarCorreo } from '../validations/valiEmail';
import { validarPassword } from '../validations/valiPass';
import React, { useState, useRef } from 'react';
import { validarCodigoUsuario } from '../validations/valiCod';
import { validarCampoNomApe } from '../validations/valiNomApe';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';

export default function RecuPassPage(){
    // Constante de estado para establecer la apertura o cierre del modal
    const [modal, setModal] = useState(false);
    const [modalError, setModalError] = useState(false);
    const [modalErrMsg, setModalErrMsg] = useState("");
    // Variables de referencia para obtener los campos de informacion: IDUser, Nombre, ApePat, ApeMat, Correo
    const idRef = useRef(null);
    const nomRef = useRef(null);
    const apePRef = useRef(null);
    const apeMRef = useRef(null);
    const emaRef = useRef(null);
    const passRef = useRef(null);
    
    // Abrir/Cerrar el modal
    function OpenCloseModal() {
        setModal(!modal);
    }

    // Abrir/Cerrar modal de errores
    function OpenCloseError() {
        setModalError(!modalError);
    }

    /** Funcion para validacion de los campos
     * @param {string} codigo Codigo de Usuario Ingresado
     * @param {string} nombre Nombre de la Persona
     * @param {string} apePaterno Apellido Paterno de la Persona
     * @param {string} apeMaterno Apellido Materno de la Persona
     * @param {string} correo Direccion de Correo
     * @param {string} contra Valor de la Contraseña
     * @returns boolean */
    function valiCampos(codigo, nombre, apePaterno, apeMaterno, correo, contra){
        // Banderas de validaciones; validacion general, validacion de codigo, validacion del nombre, validacion del apellido paterno, validacion del apellido materno, validacion del correo y validacion de la contraseña
        let bandeVali = false, bandeValiCod = false, bandeValiNom = false, bandeValiApeP = false, bandeValiApeM = false, bandeValiEma = false, bandeValiPass = false, msgVali = "";
        // Obtener los objetos de respuesta de las validaciones de los campos realizadas de forma externa
        const valiCodigo = validarCodigoUsuario(codigo);
        const valiNombre = validarCampoNomApe(nombre);
        const valiApePat = validarCampoNomApe(apePaterno);
        const valiApeMat = validarCampoNomApe(apeMaterno);
        const valiCorreo = validarCorreo(correo);
        const valiContra = validarPassword(contra);
        // Validacion de codigo
        switch(valiCodigo.getCondicion){
            case 0:
                msgVali += "La validacion del codigo no fue realizada \n";
                break;
            case 1:
                bandeValiCod = true;
                break;
            case 2:
                msgVali += (valiCodigo.getMensaje + " \n");
                break;
        }
        // Validacion de nombre
        switch(valiNombre.getCondicion){
            case 0:
                msgVali += "La validacion del nombre no fue realizada \n";
                break;
            case 1:
                bandeValiNom = true;
                break;
            case 2:
                msgVali += (valiNombre.getMensaje + " \n");
                break;
        }
        // Validacion de apellido paterno
        switch(valiApePat.getCondicion){
            case 0:
                msgVali += "La validacion del apellido paterno no fue realizada \n";
                break;
            case 1:
                bandeValiApeP = true;
                break;
            case 2:
                msgVali += (valiApePat.getMensaje + " \n");
                break;
        }
        // Validacion de apellido materno
        switch(valiApeMat.getCondicion){
            case 0:
                msgVali += "La validacion del apellido materno no fue realizada \n";
                break;
            case 1:
                bandeValiApeM = true;
                break;
            case 2:
                msgVali += (valiApeMat.getMensaje + " \n");
                break;
        }
        // Validacion de correo
        switch(valiCorreo.getCondicion){
            case 0:
                msgVali += "La validacion del correo no fue realizada \n";
                break;
            case 1:
                bandeValiEma = true;
                break;
            case 2:
                msgVali += (valiCorreo.getMensaje + " \n");
                break;
        }
        // Validacion de la contraseña
        switch(valiContra.getCondicion){
            case 0:
                msgVali += "La validacion de la contraseña no fue realizada \n";
                break;
            case 1:
                bandeValiPass = true;
                break;
            case 2:
                msgVali += (valiContra.getMensaje + " \n");
                break;
        }
        // Si todos los campos se validaron correctamente se establece la bandera como verdadero, si no, se establece el contenido textual del error obtenido
        if(bandeValiCod && bandeValiNom && bandeValiApeP && bandeValiApeM && bandeValiEma && bandeValiPass){
            bandeVali = true;
        }else{
            setModalErrMsg(msgVali);
        }
        return bandeVali;
    }

    /** Verificacion de envio del formulario de acceso
     * @param {Event} evento Evento de verificacion del formulario previo al acceso del sistema */
    function valiForm(evento) {
        // Evitar lanzar el formulario por defecto
        evento.preventDefault();
        // Establecer los datos de entrada en constantes para mejorar el trabajo de codigo
        const codUs = `${idRef.current.value}`;
        const nomUs = `${nomRef.current.value}`;
        const apePUs = `${apePRef.current.value}`;
        const apeMUs = `${apeMRef.current.value}`;
        const emaUs = `${emaRef.current.value}`;
        const passUs = `${passRef.current.value}`;
        // Obteniendo la respuesta de la validacion de los campos
        const valiCamposResp = valiCampos(codUs, nomUs, apePUs, apeMUs, emaUs, passUs);
        // Si se validaron los campos correctamente se procedera con la recuperacion
        if(valiCamposResp){
            // En este caso la busqueda del usuario exacta se hace en el servidor por lo que directamente se mandara la informacion
            recuperarContra(codUs, nomUs, apePUs, apeMUs, emaUs, passUs);
        }else{
            // Si no, se abrira el modal de avisos con los errores contenidos
            setModalError("Error: Datos No Validados, Favor de Revisar Su Información")
            OpenCloseError();
        }
    }

    return(
        <div className="container-fluid">
            <div className="text-center">
                <Button color="secondary" onClick={OpenCloseModal} type="button">
                    <span>Recuperar Contraseña</span>
                </Button>
            </div>
            <Modal isOpen={modal} toggle={OpenCloseModal}>
                <ModalHeader toggle={OpenCloseModal}>
                    Recuperación de Contraseña
                </ModalHeader>
                <ModalBody>
                <form onSubmit={valiForm}>
                    <div className='col-md-12'>
                        <div className="row justify-content-center">
                            <div className='col-md-12'>
                                <div id="txtAdvice" className="form-control" name="areaAviso" style={{resize: "none", border: "none", textAlign:"justify"}}>
                                <label className="col-form-label">Disclaimer:</label><br/>
                                    Con el propósito de asegurar que es el usuario en cuestión quien realmente quiere recuperar su 
                                    contraseña.<br/>Serán solicitados sus datos personales. (Se recomienda discreción)
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center">
                            <div className='col-md-10 offset-md-1'>
                                <label htmlFor="id-usuario" className="col-form-label">Codigo de Usuario:</label>
                                <input type="text" className="form-control" ref={idRef} id="id-usuario" name="idUser" />
                            </div>
                            <div className='col-md-1' />
                        </div>
                        <div className="row justify-content-center">
                            <div className='col-md-10 offset-md-1'>
                                <label htmlFor="nombre-usuario" className="col-form-label">Nombre:</label>
                                <input type="text" className="form-control" ref={nomRef} id="nombre-usuario" name="nombre" />
                            </div>
                            <div className='col-md-1' />
                        </div>
                        <div className="row justify-content-center">
                            <div className='col-md-10 offset-md-1'>
                                <label htmlFor="ape-paterno" className="col-form-label">Apellido Paterno:</label>
                                <input type="text" className="form-control" ref={apePRef} id="ape-paterno" name="apePat" />
                            </div>
                            <div className='col-md-1' />
                        </div>
                        <div className="row justify-content-center">
                            <div className='col-md-10 offset-md-1'>
                                <label htmlFor="ape-materno" className="col-form-label">Apellido Materno:</label>
                                <input type="text" className="form-control" ref={apeMRef} id="ape-materno" name="apeMat" />
                            </div>
                            <div className='col-md-1' />
                        </div>
                        <div className="row justify-content-center">
                            <div className='col-md-10 offset-md-1'>
                                <label htmlFor="dir-correo" className="col-form-label">Correo:</label>
                                <input type="text" className="form-control" ref={emaRef} id="dir-correo" name="correo" />
                            </div>
                            <div className='col-md-1' />
                        </div>
                        <div className="row justify-content-center">
                            <div className='col-md-10 offset-md-1'>
                                <label htmlFor="val-pass" className="col-form-label">Contraseña:</label>
                                <input type="text" className="form-control" ref={passRef} id="val-pass" name="pass" />
                            </div>
                            <div className='col-md-1' />
                        </div>
                    </div>
                </form>
                </ModalBody>
                <ModalFooter>
                    <div className='col-md-12'>
                        <div className="row justify-content-center">
                            <div className='col-md-4 offset-md-1'>
                                <Button color="success" className="form-control" type="submit" onClick={valiForm}>Enviar Correo</Button>
                            </div>
                            <div className='col-md-4 offset-md-1'>
                                <Button color="danger" className="form-control" onClick={OpenCloseModal}>Cancelar</Button>
                            </div>
                            <div className='col-md-1' />
                        </div>
                    </div>
                </ModalFooter>
                <div id="ModalError">
                    <Modal isOpen={modalError} toggle={OpenCloseError}>
                        <ModalHeader toggle={OpenCloseError}>
                            Error <AlertTriangle color="red" size={30} />
                        </ModalHeader>
                        <ModalBody>
                            <Alert color="danger">
                                {modalErrMsg}
                            </Alert>
                        </ModalBody>
                    </Modal>
                </div>
            </Modal>
        </div>
    );

    /** Funcion de Recuperacion de Contraseña desde el Servidor 
     * @param {string} codigo Codigo del Usuario Ingresado
     * @param {string} nombre Nombre de la Persona Ingresado
     * @param {string} apePat Primer Apellido Ingresado
     * @param {string} apeMat Segundo Apellidos Ingresado
     * @param {string} correo Dirección de Correo Ingresada
     * @param {string} contra Contraseña Ingresada */
    async function recuperarContra(codigo, nombre, apePat, apeMat, correo, contra){
        try {
            const consulta = await axios.post('http://localhost/Proyectos_Propios/BuildContiBack/index.php',{
                tipo_consulta: 'recuContra',
                codigoUser: codigo,
                nombrePer: nombre,
                apePaterno: apePat,
                apeMaterno: apeMat,
                dirCorreo: correo,
                valContra: contra
            },{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Si el usuario fue encontrado y se envio con exito su corre
            if(consulta.data == "Peticion enviada con exito")
                alert("Aviso: El correo fue enviado satisfactoriamente");
        }catch (error){
            // Si ocurrio un error en la peticion de recuperacion se mostrará aqui
            if(error.response){
                // Casos de error de envio del servidor (Errores contemplados)
                const respMsg = error.response.data;
                switch (respMsg) {
                    case "Error: La peticion no fue procesada":
                        setModalErrMsg("Error: Recuperación Incompleta, Favor de Intentar mas Tarde");
                        break;
                    case "Error: El elemento no fue encontrado":
                        setModalErrMsg("Error: Recuperación Denegada, Revise su Información");
                        break;
                    case "Error: Información no encontrada":
                        setModalErrMsg("Error: Recuperación Denegada, Revise su Información");
                        break;
                    case "Error: Correo no enviado":
                        setModalErrMsg("Error: Recuperación No Completada, Favor de Intentar mas Tarde");
                        break;
                    default:
                        setModalErrMsg("Error Desconocido: Recuperación Erronea, Favor de Intentar mas Tarde");
                        break;
                }
            }else if (error.request){
                // Segundo caso, el cliente no se pudo contactar con el servidor o este no respondio (Error controlado)
                setModalErrMsg("Error: Servicio no disponible, favor de intentar mas tarde");
            }else{
                // Tercer caso, ocurrio un error en la disponibilidad de la respuesta del servidor (Error no contemplado y desconocido)
                setModalErrMsg("Error: Servicio no disponible, favor de intentar mas tarde");
            }
            OpenCloseError();
        }
    }
}