"use client";
import axios from "axios";
import jsPDF from "jspdf";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { getFecha } from "@/app/components/logic/fecha";
import React, { useEffect, useRef, useState } from "react";
import useVentaDimen from "@/app/components/hooks/tamVentaHook";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
import Modal from "@/app/components/ui/modals/modal";
import Dialog from "@/app/components/ui/modals/plantillas/dialog";

export default function GraficaCompo({ infoIntro }){
    // Variable de estado (hook personalizado) que trae un objeto con las dimensiones de pantalla
    let ventaDimen = useVentaDimen();
    // Variable de estado con la configuracion de la grafica
    const [optsGraf, setOptsGraf] = useState(opcsGrafDef);
    // Variable de estado con el arreglo de valores para la grafica
    const [seriesGraf, setSeriesGraf] = useState([]);
    // Referencia de la seccion que contendra a la grafica para la impresion
    const areaGrafRef = useRef(null);
    /*Variable de estado para la apertura/cierre del modal
    Variable de estado para el titulo del modal
    Variable de estado para establecer el contenido del modal */
    const [modalOpen, setModalOpen] = useState(false),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState("");

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => {
        setModalOpen(estado);
    }

    useEffect(() => {
        const procSetGraf = async() => {
            try {
                const peticion = await obteInfoBD(infoIntro);
                // Revisar si el resultado de la consulta es el arreglo
                if(typeof(peticion) != "string"){
                    let arrDatosGraf = [], labelsGraf = [];
                    peticion.map((registro) => {
                        // Establecer el arreglo "series" que usa la grafica para mostrar los valores, donde cada elemento es un par ordenado de tipo [fecha, valor]
                        arrDatosGraf.push([
                            new Date(parseInt(`${registro.TIMESTAMP}`)),
                            parseFloat(parseFloat(`${registro.VALUE}`).toFixed(2))
                        ]);
                        // Establecer el arreglo de etiquetas que utilizara la grafica para mostrar etiquetas
                        labelsGraf.push({
                            valor: parseFloat(parseFloat(`${registro.VALUE}`).toFixed(2)),
                            estatus: (`${registro.STATUS_TAG}` === "{ok}") ? "Activo" : (`${registro.STATUS_TAG}` === "{down}") ? "Inactivo" : "Indefinido"
                        });
                    });
                    // Actualizar la variable de estado del arreglo de valores
                    setSeriesGraf([{
                        name: `Registro ${infoIntro.infoSensor.split(";")[1]}`,
                        data: arrDatosGraf
                    }]);
                    // Obtener las dimensiones del area del componente de la grafica
                    let grafDimen = { width: areaGrafRef.current.offsetWidth, height: areaGrafRef.current.offsetHeight};
                    // Establecer la nuevas propiedades de la grafica
                    let nGrafOpts = nueOpcsGraf(areaGrafRef, grafDimen, infoIntro.infoSensor, labelsGraf);
                    setOptsGraf(nGrafOpts);
                }else{
                    // Establecer el titulo del modal, el contenido del mismo y la apertura de este
                    setModalTitu("Error");
                    setModalConte(<Dialog textMsg={peticion}/>);
                    setModalOpen(true);
                    //console.log(peticion);
                }
            } catch (errProcSetGraf) {
                // Establecer el titulo del modal, el contenido del mismo y la apertura de este
                setModalTitu("Error");
                setModalConte(<Dialog textMsg={`Error: Proceso de seteado de grafica no completado. Causa: ${errProcSetGraf}`}/>);
                setModalOpen(true);
                //console.log(`Error: Proceso de seteado de grafica no completado. Causa: ${errProcSetGraf}`);
            }
        }
        // Para el renderizado inicial, se debera omitir la primer busqueda para evitar generar errores de consulta
        //procSetGraf();
        (Object.keys(infoIntro).length != 0) ? procSetGraf() : "";
    }, [infoIntro]);

    return(
        <section>
            <section ref={areaGrafRef} className="z-0">
                <ApexChart type="line" options={optsGraf} series={seriesGraf} width={(ventaDimen.width) / 1.5} height={(ventaDimen.height) / 1.5}/>
            </section>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}

/** Funcion para obtener los registros especificados por el filtrado de sensor y fechas
 * @param {object} infoBus Objeto con el identificador del sensor y las fechas del rango de busqueda
 * @returns {Promise<Array | string>} Promesa con arreglo de informacion resultante o mensaje de error en caso de acontecer uno */
async function obteInfoBD(infoBus){
    try {
        const consulta = await axios.get("/server/api/getHistoEspeci", {
            params: {
                senBus: `${infoBus.infoSensor.split(";")[0]}`,
                fechIni: infoBus.fechaIni,
                fechFin: infoBus.fechaFin
            }
        });
        return consulta.data.results;
    } catch (errObteRegSenso) {
        // Si ocurrio un error en la peticion de busqueda se mostrará aqui
        if (errObteRegSenso.response) {
            // Primer caso, el servidor tiró un error 500 programado por no encontrar el usuario con la información del formulario o porque no se pudo hacer la peticion para consultar información (Error contemplado)
            return (typeof(errObteRegSenso.response.data.msgError) == "undefined") ? "Error: Registros de sensor no disponible caso 1, favor de intentar mas tarde." : errObteRegSenso.response.data.msgError;
        } else if (errObteRegSenso.request) {
            // Segundo caso, el cliente lanzó la petición al servidor y este no respondio (Error controlado)
            return("Error: Registros de sensor no disponible caso 2, favor de intentar mas tarde.");
        } else {
            // Tercer caso, ocurrio un error en la petición y por ende en la respuesta del servidor (Error no contemplado y desconocido)
            return("Error: Registros de sensor no disponible caso 3, favor de intentar mas tarde.");
        }
    }
}

/** Funcion para establecer las opciones de la grafica inicial
 * @returns Objeto de configuracion inicial Apexchart para renderizar una grafica vacia*/
function opcsGrafDef(){
    return {
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false,
            }
        },
        yaxis: {
            title: {
                text: "Esperando Seleccion"
            },
            labels: {
                offsetX: 0,
                offsetY: 0
            }
        }
    }
}

/** Funcion para establecer la configuracion de la grafica cuando se hayan selecccionado valores en la barra de busqueda
 * @param {React.MutableRefObject} areaGrafRef Referencia del area de la grafica (el equivalente a getElementById)
 * @param {object} areaGrafDim Objeto que contiene las dimensiones de la grafica; Props: width y height
 * @param {string} infoSen Cadena de texto que contiene el identificador niagara, el nombre del sensor y la unidad de medicion
 * @param {Array} etiquetas Arreglo de objetos pares ordenados (valor, estatus) para mostrar el estado del registro
 * @returns Objeto de configuración Apexcharts para renderizar graficas con valores */
function nueOpcsGraf(areaGrafRef, areaGrafDim, infoSen, etiquetas){
    return {
        title: {
            text: `Registros ${infoSen.split(";")[1]}`
        },
        chart: {
            animations: {
                initialAnimation: {
                    enabled: false
                }
            },
            toolbar: {
                tools: {
                    customIcons: [{
                        icon: 'PDF',
                        title: 'Exportar a PDF',
                        class: 'custom-icon',
                        click: async function exportPDF(){
                            const contePDF = await html2canvas(areaGrafRef);
                            const dataInfo = contePDF.toDataURL("image/png");
                            let ancho = areaGrafDim.width, alto = areaGrafDim.height,
                            altoEspa, anchoEspa;
                            if(ancho > alto){
                                let pdfArchi = new jsPDF('l', 'px', [ancho, alto]);
                                ancho = pdfArchi.internal.pageSize.getWidth();
                                alto = pdfArchi.internal.pageSize.getHeight();
                                anchoEspa = ancho-20;
                                altoEspa = alto-20;
                                pdfArchi.addImage(dataInfo, 'PNG', 10, 10, anchoEspa, altoEspa);
                                pdfArchi.save(`BMS Grafica de ${getFecha()}; Registros ${infoSen.split(";")[1]}.pdf`);
                            }
                            else{
                                let pdfArchi = new jsPDF('p','px', [alto, ancho]);
                                ancho = pdfArchi.internal.pageSize.getWidth();
                                alto = pdfArchi.internal.pageSize.getHeight();
                                anchoEspa = ancho-20;
                                altoEspa = alto-20;
                                pdfArchi.addImage(dataInfo, 'PNG', 10, 10, anchoEspa, altoEspa);
                                pdfArchi.save(`BMS Grafica de ${getFecha()}; Registros ${infoSen.split(";")[1]}.pdf`);
                            }
                        }
                    }]
                },
                export: {
                    csv: {
                        headerCategory: "Fecha",
                        filename: `BMS Grafica de ${getFecha()}; Registros ${infoSen.split(";")[1]}`
                    },
                    svg: {
                        filename: `BMS Grafica de ${getFecha()}; Registros ${infoSen.split(";")[1]}`
                    },
                    png: {
                        filename: `BMS Grafica de ${getFecha()}; Registros ${infoSen.split(";")[1]}`
                    }
                }
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false,
            }
        },
        yaxis: {
            title: {
                text: `Unidad de Medición: ${infoSen.split(";")[2]}`
            },
            labels: {
                offsetX: 0,
                offsetY: 0
            }
        },
        tooltip: {
            x: {
                format: "dd MMM yyyy; HH:mm:ss"
            },
            custom: function({series, seriesIndex, dataPointIndex, w}){
                for(let cont = 0; cont < etiquetas.length; cont++){
                    let valor = etiquetas[cont].valor, status = etiquetas[cont].estatus;
                    if(valor === series[seriesIndex][dataPointIndex]){
                        switch(status){
                            case "Activo":
                                return `<section style="width: 100%;font-weight: 700;">
                                    <section style="border-width: 1px;border-radius: 0.25rem;--tw-border-opacity: 1;border-color: rgb(156 163 175 / var(--tw-border-opacity));--tw-bg-opacity: 1;background-color: rgb(255 255 255 / var(--tw-bg-opacity));justify-content: space-between;">
                                        <section style="--tw-bg-opacity: 1;background-color: rgb(55 65 81 / var(--tw-bg-opacity));border-top-left-radius: 0.375rem;border-top-right-radius: 0.375rem;padding: 0.25rem">
                                            <span style="--tw-text-opacity: 1;color: rgb(255 255 255 / var(--tw-text-opacity));">${w.config.series[seriesIndex].name}: </span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Valor: ${series[seriesIndex][dataPointIndex]}</span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Estado: </span><span style="--tw-text-opacity: 1;color: rgb(22 163 74 / var(--tw-text-opacity));">Activo</span>
                                        </section>
                                    </section>
                                </section>`;
                            case "Inactivo":
                                return `<section style="width: 100%;font-weight: 700;">
                                    <section style="border-width: 1px;border-radius: 0.25rem;--tw-border-opacity: 1;border-color: rgb(156 163 175 / var(--tw-border-opacity));--tw-bg-opacity: 1;background-color: rgb(255 255 255 / var(--tw-bg-opacity));justify-content: space-between;">
                                        <section style="--tw-bg-opacity: 1;background-color: rgb(55 65 81 / var(--tw-bg-opacity));border-top-left-radius: 0.375rem;border-top-right-radius: 0.375rem;padding: 0.25rem">
                                            <span style="--tw-text-opacity: 1;color: rgb(255 255 255 / var(--tw-text-opacity));">${w.config.series[seriesIndex].name}: </span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Valor: ${series[seriesIndex][dataPointIndex]}</span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Estado: </span><span style="--tw-text-opacity: 1;color: rgb(220 38 38 / var(--tw-text-opacity));">Inactivo</span>
                                        </section>
                                    </section>
                                </section>`;
                            default:
                                return `<section style="width: 100%;font-weight: 700;">
                                    <section style="border-width: 1px;border-radius: 0.25rem;--tw-border-opacity: 1;border-color: rgb(156 163 175 / var(--tw-border-opacity));--tw-bg-opacity: 1;background-color: rgb(255 255 255 / var(--tw-bg-opacity));justify-content: space-between;">
                                        <section style="--tw-bg-opacity: 1;background-color: rgb(55 65 81 / var(--tw-bg-opacity));border-top-left-radius: 0.375rem;border-top-right-radius: 0.375rem;padding: 0.25rem">
                                            <span style="--tw-text-opacity: 1;color: rgb(255 255 255 / var(--tw-text-opacity));">${w.config.series[seriesIndex].name}: </span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Valor: ${series[seriesIndex][dataPointIndex]}</span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Estado: </span><span style="--tw-text-opacity: 1;color: rgb(75 85 99 / var(--tw-text-opacity));">Indefinido</span>
                                        </section>
                                    </section>
                                </section>`;
                        }
                    }
                }
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        noData: {
            text: 'Preparando información, aguarde por favor...'
        }
    }
}