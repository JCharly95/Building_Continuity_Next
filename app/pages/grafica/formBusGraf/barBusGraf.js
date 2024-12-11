"use client";
import { useState } from "react";
import Calendario from "./calenSel";
import ListaSelSensor from "./listaSelec";
import Modal from "@/app/components/ui/modals/modal";
import Dialog from "@/app/components/ui/modals/plantillas/dialog";
import FormAgreSensor from "@/app/components/ui/modals/plantillas/agregarSensor/formAgreSen";

export default function BarBusGraf({ infoBus }){
    // Variable de estado para el nombre del sensor para filtrar la busqueda de la grafica
    const [sensorBusc, setSensoBusc] = useState("404");
    // Variables de estado para las fechas del rango de busqueda
    const [fechaInicio, setFechaInicio] = useState(Date.now());
    const [fechaFinal, setFechaFinal] = useState(Date.now());
    // Variable de estado para la visibilidad de la barra del filtro de busqueda
    const [verBarra, setVerBarra] = useState(false);
    /* Variable de estado para la apertura/cierre del modal
    Variable de estado para el titulo del modal
    Variable de estado para establecer el contenido del modal */
    const [modalOpen, setModalOpen] = useState(false),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState("");

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );
    // Obtener la informacion para la apertura del modal, regresada como un objeto para trabajarlo desde un mismo lado
    const handleModalInfo = (infoModal) => {
        // Establecer el titulo del modal, el contenido del mismo y la apertura de este
        setModalTitu(infoModal.titulo);
        setModalConte(infoModal.contenido);
        setModalOpen(infoModal.abierto);
    }

    // Cambiar el estado de visibilidad de la barra de navegacion
    const handleBarra = () => ( setVerBarra(!verBarra) );

    /** Funcion para establecer la informacion obtenida en el componente hijo (barra de busqueda) al componente padre en la pagina */
    function handleSearch(){
        if(sensorBusc === "404" || sensorBusc === "Seleccione el sensor a buscar..."){
            setModalTitu("Error");
            setModalConte(<Dialog textMsg="Favor de seleccionar un sensor de la lista para hacer la busqueda"/>);
            setModalOpen(true);
        }else{
            infoBus({ infoSensor: sensorBusc, fechaIni: fechaInicio, fechaFin: fechaFinal });
        }
    }

    /** Funcion de obtencion del sensor seleccionado (retorno del componente hijo) */
    const obteSensoSel = (infoSenso) => ( setSensoBusc(infoSenso) );

    /** Funcion de obtencion de las fechas seleccionadas en los calendarios: Fecha inicial */
    const obteFechIni = (valFechIni) => {
        let fechaConve = Math.floor(new Date(valFechIni).getTime()/1000.0);
        setFechaInicio(fechaConve);
    }
    
    /** Funcion de obtencion de las fechas seleccionadas en los calendarios: Fecha final */
    const obteFechFin = (valFechFin) => {
        let fechaConve = Math.floor(new Date(valFechFin).getTime()/1000.0);
        setFechaFinal(fechaConve);
    }

    /* Version original del filtro de busqueda sin responsividad
        <section className="w-screen h-full bg-gray-800 py-1">
            <section className="inline-flex gap-4 mx-2">
                <ListaSelSensor sensoSel={obteSensoSel}/>
                <Calendario valorSel={obteFechIni} tipoCalen={"Inicio"} />
                <Calendario valorSel={obteFechFin} tipoCalen={"Final"} />
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" type="button" onClick={handleSearch}>Buscar</button>
            </section>
        </section>
     */

    return(
        <section className="w-full h-full bg-gray-800">
            <section className="flex items-center justify-between flex-wrap w-full h-full bg-gray-800 px-4 py-1">
                <section className="flex items-center justify-between flex-shrink-0 text-white mr-2">
                    <span>Filtro Busqueda</span>
                </section>
                <section className="block lg:hidden">
                    <button type="button" className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white" onClick={handleBarra}>
                        <svg className="fill-current h-3 w-3" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><title>Filtro</title><path d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>
                    </button>
                </section>
                <section className={`w-full flex-grow lg:flex lg:items-center lg:w-auto ${verBarra ? 'block' : 'hidden'}`}>
                    <section className="lg:flex-grow lg:inline-flex lg:gap-1">
                        <section className="block mt-4 lg:inline-block lg:mt-0">
                            <ListaSelSensor sensoSel={obteSensoSel} modalObjInfo={handleModalInfo}/>
                        </section>
                        <section className="block mt-4 lg:inline-block lg:mt-0">
                            <Calendario valorSel={obteFechIni} tipoCalen={"Inicio"}/>
                        </section>
                        <section className="block mt-4 lg:inline-block lg:mt-0">
                            <Calendario valorSel={obteFechFin} tipoCalen={"Final"}/>
                        </section>
                        <section className="block mt-4 lg:inline-block lg:mt-0">
                            <button type="button" onClick={handleSearch} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-0.5 px-2 rounded block lg:inline-block  lg:mt-0">Buscar</button>
                        </section>
                        <section className="block mt-4 lg:mb-0 mb-2 lg:ml-6 lg:inline-block lg:mt-0">
                            <button type="button" className="bg-green-500 hover:bg-green-700 text-white font-bold py-0.5 px-2 rounded block lg:inline-block  lg:mt-0" onClick={() => {
                            setModalTitu("Agregar Sensor");
                            setModalConte(<FormAgreSensor estModal={handleModal} />);
                            setModalOpen(true);
                            }}>Agregar Sensor</button>
                        </section>
                    </section>
                </section>
            </section>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}