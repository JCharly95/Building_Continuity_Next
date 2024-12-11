"use client";
import { useEffect } from "react";
import { AlertTriangle, AlertCircle, CheckCircle, FileText, FilePlus, LogOut, Clock, Loader, Mail } from "react-feather";

export default function Modal({ isOpen, titModal, conteModal }){
    // Establecer el icono a colocar en el encabezado del modal
    let icono = <></>;
    switch(titModal){
        case "Aviso":
            icono = (<AlertCircle color="blue" size={25} className="mr-2"/>);
            break;
        case "Error":
            icono = (<AlertTriangle color="red" size={25} className="mr-2"/>);
            break;
        case "Acceso":
        case "Sensor Registrado":
            icono = (<CheckCircle color="green" size={25} className="mr-2"/>);
            break;
        case "Recuperar Contraseña":
            icono = (<FileText color="black" size={25} className="mr-2"/>);
            break;
        case "Agregar Sensor":
            icono = (<FilePlus color="black" size={25} className="mr-2"/>);
            break;
        case "Cerrar Sesión":
            icono = (<LogOut color="black" size={25} className="mr-2"/>);
            break;
        case "Cargando":
            icono = (<Clock color="black" size={25} className="mr-2"/>);
            break;
        case "Correo Enviado":
            icono = (<Mail color="black" size={25} className="mr-2"/>);
            break;
    }

    // Agregar un listener para detectar el presionar la tecla Esc tambien se cierre el modal
    useEffect(() => {
        const cerrarEsc = (evento) => {
            if(evento.key == "Escape"){
                isOpen(false);
            }
        }
        // Agregar el listener a la ventana; Para node window es el equivalente de document
        window.addEventListener("keydown", cerrarEsc);
        // Despues de revisar, es necesario remover el listener para evitar la sobrecarga de eventos
        return () => {
            window.removeEventListener("keydown", cerrarEsc);
        };
    }, [isOpen]);

    return(
        <section className="fixed inset-0 bg-gray-600 bg-opacity-100 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <section className="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <section className="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto">
                    <section className="flex justify-between items-center py-2 px-4 border-b-2">
                        <h3 className="font-bold text-gray-800 inline-flex items-center">
                            { icono } { titModal }
                        </h3>
                        <button type="button" className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-red-500 hover:text-white focus:outline-none disabled:opacity-50 disabled:pointer-events-none" aria-label="Close" onClick={() => (isOpen(false))}>
                            <span className="sr-only">Cerrar Modal</span>
                            <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                            </svg>
                        </button>
                    </section>
                    <section className="p-4 overflow-y-auto inline-flex">
                        { (titModal == "Cargando") ? <Loader size={25} className="mr-2 animate-spin"/> : "" } { conteModal }
                    </section>
                    {/*<section className="flex justify-end items-center gap-x-2 py-3 px-4 border-t-2">
                        <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-md font-medium rounded-lg border border-red-500 bg-white text-black shadow-sm hover:bg-red-600 hover:text-white focus:outline-none disabled:opacity-50 disabled:pointer-events-none" onClick={() => (isOpen(false))}>
                            Cerrar
                        </button>
                    </section>*/}
                </section>
            </section>
        </section>
    );
}