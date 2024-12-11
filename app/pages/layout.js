"use client";
import { useRouter } from "next/navigation";
import Modal from "../components/ui/modals/modal";
import React, { useState, useEffect } from "react";
import Barra_Navega from "../components/ui/barraNav";
import Dialog from "../components/ui/modals/plantillas/dialog";

export default function PagesLayout({ children }){
    /* Variable de estado para la apertura/cierre del modal
    Variable de estado para el titulo del modal
    Variable de estado para establecer el contenido del modal */
    const [modalOpen, setModalOpen] = useState(false),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState("");
    // Constante del router para el redireccionamiento
    const router = useRouter();

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // UseEffect para monitorear el uso de teclas F12 para consola y menu contextual, asi como el clic derecho, tambien menu contextual
    useEffect(() => {
        const escuFunTecla = (evento) => {
            if(evento.key == "F12"){
                evento.preventDefault();
                // Establecer el titulo del modal, el contenido del mismo y la apertura de este
                setModalTitu("Error");
                setModalConte(<Dialog textMsg="Tecla Invalida."/>);
                setModalOpen(true);
            }
        }
        const escuFunClic = (evento) => {
            evento.preventDefault();
            // Establecer el titulo del modal, el contenido del mismo y la apertura de este
            setModalTitu("Error");
            setModalConte(<Dialog textMsg="Acción Invalida."/>);
            setModalOpen(true);
        }
        // Agregar el listener para evitar las teclas F12 y menu contextual
        window.addEventListener("keydown", escuFunTecla);
        window.addEventListener("contextmenu", escuFunClic);
        // Remover el listener para evitar el ciclado de escucha
        return () => {
            window.removeEventListener("keydown", escuFunTecla);
            window.removeEventListener("contextmenu", escuFunClic);
        };
    }, []);

    /*----------------------------Seccion de Inactividad---------------------------------------------*/
    // Useffect para establecer el contador de inactividad y renovarlo con cada accion de usuario
    useEffect(() => {
        // Establecer el tiempo de inicio
        estaTiempExpira();

        // Establecer los listeners en las acciones en la ventana; clic, presionar tecla, scrolear pantalla, mover el mouse y mover el touchpad
        window.addEventListener("click", estaTiempExpira);
        window.addEventListener("keypress", estaTiempExpira);
        window.addEventListener("scroll", estaTiempExpira);
        window.addEventListener("mousemove", estaTiempExpira);
        window.addEventListener("touchmove", estaTiempExpira);
        
        // Remover los listener, por rendimiento, habiendo evaluado la situacion
        return () => {
            window.removeEventListener("click", estaTiempExpira);
            window.removeEventListener("keypress", estaTiempExpira);
            window.removeEventListener("scroll", estaTiempExpira);
            window.removeEventListener("mousemove", estaTiempExpira);
            window.removeEventListener("touchmove", estaTiempExpira);
        }
    }, []);
    // Useeffect para checar la inactividad cada determinado tiempo
    useEffect(() => {
        // Checar inactividad cada minuto
        const interInacti = setInterval(() => {
            let modalInacti = checarInacti();
            // Caso de 5 minutos, se venció la sesión, se mostrará un modal de aviso por un par de segundos y luego se redigira al login haciendo el mecanismo de cierre de sesion
            if(modalInacti.titulo.includes("Cerrar Sesión")){
                // Establecer el titulo del modal, el contenido del mismo y la apertura de este
                setModalTitu(modalInacti.titulo);
                setModalConte(modalInacti.contenido);
                setModalOpen(modalInacti.abierto);

                // Limpiar la cache local usada para la sesion
                localStorage.clear();
                // Redireccionamiento hacia el login despues de 2 segundos
                setTimeout( () => ( router.push("/") ), 2000);
            }/*else{
                // Caso de cada minuto, solo se mostrará el modal recordando el cierre de sesion automatico
                setModalTitu(modalInacti.titulo);
                setModalConte(modalInacti.contenido);
                setModalOpen(modalInacti.abierto);
            }*/
        }, 60000);

        // Remoer el intervalo, por rendimiento del sitio, después de la evaluacion de eventos
        return () => {
            clearInterval(interInacti);
        }
    },[router]);
    /*-----------------------------------------------------------------------------------------------*/

    return(
        <section className="w-full h-full flex flex-col">
            <Barra_Navega />
            <main>
                { children }
            </main>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}

// Funciones para el mecanismo de inactividad
/** Funcion para establecer el tiempo de inactividad en la sesion */
function estaTiempExpira(){
    // Establecer el tiempo de expiracion ahora (momento evaluacion) + 5 minutos
    const tiempoExpira = Date.now() + 300000;
    // Agregarlo al localstorage para que no se pierda
    localStorage.setItem("tiempoSes", tiempoExpira);
}

/** Funcion para evaluar la inactividad */
function checarInacti(){
    const tiempoEval = localStorage.getItem("tiempoSes");
    let modalResp = {
        titulo: "",
        contenido: <></>,
        abierto: false
    };

    // Si el tiempo de vigencia es menor al actual, se da por sentado que se vencio la sesion
    if(tiempoEval < Date.now()){
        // Establecer el titulo del modal, el contenido del mismo y la apertura de este
        modalResp.titulo = "Cerrar Sesión";
        modalResp.contenido = <Dialog textMsg="El tiempo de su sesión vencio, favor de acceder nuevamente."/>;
        modalResp.abierto = true;
    }else{
        // Establecer el titulo del modal, el contenido del mismo y la apertura de este
        modalResp.titulo = "Recordatorio";
        modalResp.contenido = <Dialog textMsg="Recordandole, que la sesión se cierra automaticamente si se tienen 5 minutos de inactividad"/>;
        modalResp.abierto = true;
    }
    return modalResp;
}