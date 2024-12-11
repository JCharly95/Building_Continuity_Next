'use client';
import estilosGen from '../../globals.css';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'react-feather';
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardBody, CardTitle, CardSubtitle, CardText, CardImg, Modal, ModalHeader, ModalBody, Alert } from "reactstrap";

export default function PerfilPage() {
    // Variable de retorno del contenido de la pagina
    let page = <></>;
    // Constante de historial de navegacion
    const navegar = useRouter();
    // Obteniendo la credencial del usuario logueado
    let usSession;
    try {
        usSession = localStorage.getItem("user") || "";
    } catch (error) {}
    // Variable de estado para la apertura o cierre del modal de aviso de errores
    const [modalError, setModalError] = useState(false);
    // Variable de estado para el establecimiento del mensaje contenido en el modal de errores
    const [modalMsg, setModalMsg] = useState("Ocurrio un error en la accion solicitada");
    // Datos del usuario para la credencial del perfil
    let session, userVal, nomVal, contraVal ="", fechAcc = "";

    // Agregando un listener para la deteccion de teclas al presionarse
    useEffect(() => {
        document.addEventListener('keydown', (event) => {
            if(event.key==="F12" || event.key==="ContextMenu"){
                event.preventDefault()
                setModalMsg("Error: Accion no valida");
                setModalError(!modalError);
            }
        }, true)
    }, [modalError])

    //-----------------------------Codigo para el funcionamiento de Inactividad------------------------------------
    useEffect(() => {
        // Preparacion para el procedimiento de inactividad; Contador temporal
        let contaInacti;
        function setupInacti(){
            // Agregando los listener de los eventos en pantalla
            document.addEventListener('wheel', reiniciarConteo, false);
            document.addEventListener('scroll', reiniciarConteo, false);
            document.addEventListener('keydown', reiniciarConteo, false);
            document.addEventListener('mousemove', reiniciarConteo, false);
            document.addEventListener('mousedown', reiniciarConteo, false);
            document.addEventListener('touchmove', reiniciarConteo, false);
            document.addEventListener('touchstart', reiniciarConteo, false);
            document.addEventListener('pointermove', reiniciarConteo, false);
            document.addEventListener('pointerdown', reiniciarConteo, false);
            document.addEventListener('pointerenter', reiniciarConteo, false);
            iniciarConteo();
        }
        // Funciones de inactividad
        function iniciarConteo(){
            contaInacti = setTimeout(() => {
                // Temporizador establecido a 5 minutos, en milisegundos
                alert("Aviso: \n- El sistema cerrará la sesion por inactividad. \nNOTA:\n- Este aviso puede salir en multiples ocasiones.");
                navegar.push("/");
            }, 300000);
            // 300000 = 5 minutos, 60000 = 1 minuto, 30000 = 30 segundos
        }
        function reiniciarConteo(){
            clearTimeout(contaInacti);  // Limpiar/Eliminar valor actual del contador
            iniciarConteo();    // Reiniciar el contador
        }
        setupInacti();  // Arrancar mecanismo de inactividad
    }, [navegar])
    //-------------------------------------------------------------------------------------------------------------

    // Abrir/Cerrar modal de errores
    function OpenCloseError() {
        setModalError(!modalError);
    }

    // Funcion para muestra del menu contextual
    function contextMenu(evento){
        evento.preventDefault()
        setModalMsg("Error: Accion no valida");
        OpenCloseError();
    }

    /* Verificacion del local storage para ver si hay un usuario logueado
    Si la credencial del usuario no esta almacenada en el localStorage, quiere decir que no ha iniciado sesion, por lo que se le retornara al login*/
    if(!usSession){
        navegar.push("/");
    }else{
        // Pasar hacia un objeto JSON los elementos del localStorage
        session = JSON.parse(usSession);    
        // Obteniendo los valores del localStorage del usuario para mostrar en la credencial
        nomVal = session.nameUs;
        userVal = session.info;
        contraVal = contraVal.padEnd(session.passLen, "*");
        fechAcc = getFecha(session.acceso);

        // Cargando los valores de la pagina en caso de estar logueado
        page = <section className={estilosGen.pageSchema} onContextMenu={contextMenu}>
            <div className='container' style={{ padding: 50 }}>
                <Card className="mb-3" style={{ backgroundColor: '#F8F8F8' }}>
                    <div className="row g-0 align-items-center">
                        <div className="col-md-4">
                            <CardImg alt="PicProfile" src="https://picsum.photos/300"/>
                        </div>
                        <div className="col-md-8">
                            <CardBody>
                                <CardTitle className="card-title" tag={"h5"}>
                                    <div className='row justify-content-md-center align-items-center'>
                                        <div className='col-md-auto'>
                                            <FontAwesomeIcon icon={faCircleUser} style={{color: "#00304E"}} size='2x' />
                                        </div>
                                        <div className='col-md-auto'>
                                            <p>¿Que desea realizar el dia de hoy, {nomVal}?</p>
                                        </div>
                                    </div>
                                </CardTitle>
                                <CardSubtitle className=" align-items-center" tag="h5" >
                                    <div className='row justify-content-md-center align-items-center text-muted'>
                                        <div className='col-md-offset-2 col-md-auto'>
                                            <p>La fecha actual es:</p>
                                        </div>
                                        <div className='col-md-auto'>
                                            <p>{getFecha("")}</p>
                                        </div>
                                    </div>
                                </CardSubtitle>
                                <CardText>
                                    <div className='row mb-2'>
                                        <div className='col-md-5 offset-md-1'>
                                            <span>Direccion de correo:</span>
                                        </div>
                                        <div className='col-md-6'>
                                            <span>{userVal}</span>
                                        </div>
                                    </div>
                                    <div className='row mb-2'>
                                        <div className='col-md-5 offset-md-1'>
                                            <span>Contraseña:</span>
                                        </div>
                                        <div className='col-md-6'>
                                            <span>{contraVal}</span>
                                        </div>
                                    </div>
                                    <div className='row mb-2'>
                                        <div className='col-md-5 offset-md-1'>
                                            <span>Ultima fecha de acceso:</span>
                                        </div>
                                        <div className='col-md-6'>
                                            <span>{fechAcc}</span>
                                        </div>
                                    </div>
                                </CardText>
                            </CardBody>
                        </div>
                    </div>
                </Card>
            </div>
            <div id="ModalError">
                <Modal isOpen={modalError} toggle={OpenCloseError}>
                    <ModalHeader toggle={OpenCloseError}>
                        <p>Error <AlertTriangle color="red" size={30} /></p>
                    </ModalHeader>
                    <ModalBody>
                        <Alert color="danger">
                            <p>{modalMsg}</p>
                        </Alert>
                    </ModalBody>
                </Modal>
            </div>
        </section>
    }

    return page;
}

function getFecha(fechTransform){
    let fecha;

    if(fechTransform === ""){
        fecha = new Date()
        const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
        let dia = "";
    
        // Agregar un cero por si es antes del dia 10
        if(fecha.getDate().toString().length === 1)
            dia = "0" + fecha.getDate().toString()
        else
            dia = fecha.getDate()
            
        return(`${dia} / ${meses[fecha.getMonth()]} / ${fecha.getFullYear()}`);
    }else{
        fecha = new Date(fechTransform)
        const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
        let dia = "", hora = "", minuto = "";

        // Agregar un cero por si es antes del dia 10
        if(fecha.getDate().toString().length === 1)
            dia = "0" + fecha.getDate().toString()
        else
            dia = fecha.getDate()
        
        // Agregar un cero por si es antes de las 10 en horas
        if(fecha.getHours().toString().length === 1)
            hora = "0" + fecha.getHours().toString()
        else
            hora = fecha.getHours()

        // Agregar un cero por si es antes del dia 10
        if(fecha.getMinutes().toString().length === 1)
            minuto = "0" + fecha.getMinutes().toString()
        else
            minuto = fecha.getMinutes()

        return(`${dia}-${meses[fecha.getMonth()]}-${fecha.getFullYear()}; ${hora}:${minuto} hrs`);
    }
}