'use client';
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useRef } from "react";
import Lista_Sensores from "../sensorList/page";
import { AlertTriangle, AlertCircle } from 'react-feather';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from "reactstrap";

export default function Agregar_Sensor(){
    // Establecer la variable de busqueda del sensor en la base de datos que sera seleccionada en una lista desplegable
    const [sensor, setSensor] = useState("No hay Sensor");
    // Constante de estado para establecer la apertura o cierre del modal
    const [modal, setModal] = useState(false);
    // Variable de estado para la apertura o cierre del modal de avisos
    const [modalAdv, setModalAdv] = useState(false);
    // Variable de estado para el control de los mensajes de errores en el modal de errores
    const [modalMsg, setModalMsg] = useState("Hubo un problema al registrar el sensor");
    // Variable de estado para el modal de errores
    const [modalError, setModalError] = useState(false);
    // Variable de referencia para obtener el campo de texto de creacion de sensor
    const nomRef = useRef(null);

    // Abrir/Cerrar el modal
    function OpenCloseModal() {
        setModal(!modal);
    }
    // Abrir/Cerrar modal de errores
    function OpenCloseError() {
        setModalError(!modalError);
    }
    // Abrir/Cerrar modal de avisos
    function OpenCloseAvisos(){
        setModalAdv(!modalAdv);
    }

    // Funcion para la obtencion del identificador del sensor a registrar
    function nueSensor(senIngre){
        setSensor(senIngre);
    }

    // Funcion para crear agregar sensores al arreglo de valores de seleccion para la grafica
    function crearSensor(evento){
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
                <Button color="dark" onClick={OpenCloseModal}>
                    <span>Agregar Filtro De Busqueda</span>
                </Button>
            </div>
            <Modal isOpen={modal} toggle={OpenCloseModal}>
                <ModalHeader toggle={OpenCloseModal}>
                    Agregar un Sensor a la Lista de Seleccion
                </ModalHeader>
                <ModalBody>
                    <form onSubmit={crearSensor}>
                        <div className="form-group">
                            <label htmlFor="nombre-filtro" className="col-form-label">Nombre:</label>
                            <input type="text" className="form-control" ref={nomRef} id="nombre-filtro" name="nombre" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="sensor-value" className="col-form-label">Sensores en el Sistema:</label>
                            <Lista_Sensores id="sensor-value" name="valor" selSenNRegi={nueSensor} className="form-control" />
                        </div>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button color="success" type="submit" onClick={crearSensor}>Agregar Sensor</Button>
                    <Button color="danger" onClick={OpenCloseModal}>Cancelar</Button>
                </ModalFooter>
            </Modal>
            <Modal isOpen={modalAdv} toggle={OpenCloseAvisos}>
                <ModalHeader toggle={OpenCloseAvisos}>
                    <AlertCircle color="blue" size={30} /> Proceso Finalizado
                </ModalHeader>
                <ModalBody>
                    <Alert color="success">
                        El sensor fue registrado satisfactoriamente
                    </Alert>
                </ModalBody>
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
            const consulta = await axios.post('http://localhost/Proyectos/BuildContiBack/index.php',{
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
                if(error.response.status == 421){
                    // Error: La peticion no fue procesada
                    setModalMsg("La petición no pudo ser procesada, favor de intentarlo después");
                }else if(error.response.status == 401){
                    // Error: El sensor ya cuenta con registro previo
                    setModalMsg("El sensor seleccionado ya fue registrado, favor de seleccionar otro");
                }else if(error.response.status == 410){
                    // Error: El sensor no pudo ser registrado
                    setModalMsg("El sensor seleccionado no pudo ser registrado, favor de intentarlo después");
                }else if(error.response.status == 418){
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