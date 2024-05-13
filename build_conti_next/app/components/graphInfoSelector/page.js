"use client";
import axios from "axios";
import React, { useState } from "react";
import Calendario from "../calendar/page";
import "bootstrap/dist/css/bootstrap.min.css";
import { AlertTriangle } from "react-feather";
import Lista_Filtros from "../filterList/page";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from "reactstrap";

export default function Menu_Selector_Grafica({ infoSensor, fechaIniSel, fechaFinSel }){
    // Constante de estado para establecer la apertura o cierre del modal
    const [modal, setModal] = useState(false);
    // Variable de estado para el modal de errores
    const [modalError, setModalError] = useState(false);
    // Variable de estado para el control de los mensajes de errores en el modal de errores
    const [modalMsg, setModalMsg] = useState("Favor de revisar la información seleccionada");
    // Establecer las variables de las fechas
    const [fechIni, setFechIni] = useState(Date.now());
    const [fechFin, setFechFin] = useState(Date.now());
    // Establecer la variable de busqueda de datos (el filtro que se usara con la lista desplegable)
    const [sensoSel, setSensoSel] = useState("404");

    // Abrir/Cerrar el modal
    const OpenCloseModal = () => setModal(!modal);
    // Abrir/Cerrar modal de errores
    const OpenCloseError = () => setModalError(!modalError);
    // Abrir/Cerrar modal de avisos
    const OpenCloseAvisos = () => setModalAdv(!modalAdv);
    
    // Funcion para setear el tipo de dato a buscar en la grafica; Este dato es retornado por la lista de seleccion
    const sensorSelec = (sensorBus) => {
        setTipInfoBus(sensorBus);
    };

    // Funcion para la obtencion del valor de la fecha de inicio
    const fechaInicio = (valFechIni) => {
        const fechIniConv = Math.floor(new Date(valFechIni).getTime()/1000.0);
        setFechIni(fechIniConv);
    }

    // Funcion para la obtencion del valor de la fecha de inicio
    const fechaFinal = (valFechFin) => {
        const fechFinConv = Math.floor(new Date(valFechFin).getTime()/1000.0);
        setFechFin(fechFinConv);
    }

    // Funcion para crear agregar sensores al arreglo de valores de seleccion para la grafica
    function estableBusq(evento){
        // Evitar el envio por defecto del formulario
        evento.preventDefault();
        // Evaluacion de campos del formulario
        if(`${sensor}` === "No hay Sensor" || !`${nomRef.current.value}`) {
            if(!`${nomRef.current.value}`)
                setModalMsg("Error: No detecto el nombre del sensor");
            if(`${sensor}` === "No hay Sensor")
                setModalMsg("Error: No fue seleccionado un sensor");
            if(!`${nomRef.current.value}` && `${sensor}` === "No hay Sensor")
                setModalMsg("Error: No se detectaron valores para registrar un sensor");
            OpenCloseError();
        }else{
            // Mandar la peticion a la funcion asincrona de registro; con los parametros de nombre ingresado y sensor seleccionado
            regiSensor(`${nomRef.current.value}`,`${sensor}`);
        }
    }

    return(
        <section>
            <div className="text-center">
                <Button color="green btn-outline-success" onClick={OpenCloseModal}>
                    <span>Configurar Información Grafica</span>
                </Button>
            </div>
            <Modal isOpen={modal} toggle={OpenCloseModal}>
                <ModalHeader toggle={OpenCloseModal}>
                    Seleccione los parametros de busqueda para la grafica
                </ModalHeader>
                <ModalBody>
                    <form onSubmit={crearSensor}>
                        <div className="form-group">
                            <Lista_Filtros selSenBus={sensorSelec} />
                        </div>
                        <div className="form-group">
                            <span>Seleccionar Fecha y Hora de Inicio:</span>
                            <Calendario valorSel={fechaInicio} tipoCal={"Inicio"} />
                        </div>
                        <div className="form-group">
                            <span>Seleccionar Fecha y Hora de Fin:</span>
                            <Calendario valorSel={fechaFinal} tipoCal={"Final"} />
                        </div>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button color="success" type="submit" onClick={estableBusq}>Confirmar Selección</Button>
                    <Button color="danger" onClick={OpenCloseModal}>Cancelar</Button>
                </ModalFooter>
            </Modal>
            <Modal isOpen={modalError} toggle={OpenCloseError}>
                <ModalHeader toggle={OpenCloseError}>
                    Error <AlertTriangle color="red" size={30} />
                </ModalHeader>
                <ModalBody>
                    <Alert color="danger">
                        {modalMsg}
                    </Alert>
                </ModalBody>
            </Modal>
        </section>
    );

    // Funcion asincrona de registro de valores
    async function regiSensor(nomSenso, idSensor){
        try {
            const consulta = await axios.post('http://localhost/Proyectos_Propios/BuildContiBack/index.php',{
                tipo_consulta: 'agreNueSen',
                nombre: nomSenso,
                valor: idSensor
            },{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Si el servidor registro el sensor con exito se interpreta que no hubo problemas, se muestra un mensaje de registro satisfactorio y se cierra el modal
            if(consulta.data == "Sensor agregado con exito"){
                OpenCloseAvisos();
                OpenCloseModal();
            }
        } catch (error) {
            // Primer caso, posibles resultados erroneos de la actualizacion del acceso
            if(error.response){
                if(codigo == 421){
                    // Error: La peticion no fue procesada
                    setModalMsg("La petición no pudo ser procesada, favor de intentarlo después");
                }else if(codigo == 401){
                    // Error: El sensor ya cuenta con registro previo
                    setModalMsg("El sensor seleccionado ya fue registrado, favor de seleccionar otro");
                }else if(codigo == 410){
                    // Error: El sensor no pudo ser registrado
                    setModalMsg("El sensor seleccionado no pudo ser registrado, favor de intentarlo después");
                }else if(codigo == 418){
                    // Error: La peticion no fue encontrada (default del switch en el server)
                    setModalMsg("La petición no fue procesada, favor de intentarlo después");
                }
            }else if(error.request){
                // Segundo caso, el cliente no se pudo contactar con el servidor o este no respondio (Error controlado)
                setModalMsg("Error de Registro: Servicio no disponible, favor de intentar mas tarde");
            }else{
                // Tercer caso, ocurrio un error en la disponibilidad de la respuesta del servidor (Error no contemplado y desconocido)
                setModalMsg("Error: Ocurrio un error durante su petición, favor de intentar mas tarde");
            }
            // Mostrar el modal de errores
            OpenCloseError();
        }
    }
}