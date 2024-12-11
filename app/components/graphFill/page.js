'use client';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React, { useEffect, useState } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Grafica({ sensorInfo, fechIniGraf, fechFinGraf, iconCarga }){
    // Valores del sensor desglosados
    const sensorNom = sensorInfo.split(";")[0];
    const sensorID = sensorInfo.split(";")[1];
    const sensorUni = sensorInfo.split(";")[2];
    // Variable de estado con los registros del sensor en la BD
    const [regsBD, setRegsBD] = useState([]);
    let regsGraf = [];

    useEffect(() => {
        const consulVals = async() => {
            try {
                console.log("Datos de la peticion; Sensor: " + sensorInfo +"; Fecha Inicio: "+ fechIniGraf +"; Fecha Final: "+ fechFinGraf)
                const peticion = await axios.get(`http://localhost/Proyectos/BuildContiBack/index.php?tipo_consulta=historicoEspeci&sen_name=${sensorID}&fechaIni=${fechIniGraf}&fechaFin=${fechFinGraf}`);
                // Si la peticion de busqueda se hizo correctamente, aqui se obtendra la informacion resultante
                const datos = peticion.data;
                setRegsBD(
                    datos.map((registro) => ({
                        ID: parseInt(`${registro.ID}`),
                        DATE: (new Date(parseInt(`${registro.TIMESTAMP}`))),
                        VALUE: parseFloat(parseFloat(`${registro.VALUE}`).toFixed(2)),
                        STATUS: (`${registro.STATUS_TAG}`==="{ok}") ? "Activo" : (`${registro.STATUS_TAG}`==="{down}") ? "Inactivo" : "Indefinido"
                    }))
                );
            }catch(error){
                // Si ocurrio un error en la peticion de busqueda se mostrará aqui
                if(error.response){
                    // Primer caso, el servidor no encontro la informacion de los sensores (Error contemplado)
                    alert("Datos Grafica, Información No Procesada");
                }else if (error.request){
                    // Segundo caso, el cliente no se pudo contactar con el servidor o este no respondio (Error controlado)
                    alert("Datos Grafica, Información Inaccesible");
                }else{
                    // Tercer caso, ocurrio un error en la disponibilidad de la respuesta del servidor (Error no contemplado y desconocido)
                    alert("Datos Grafica, Favor de Intentar Después");
                }
            }
        }
        consulVals();
    }, []);

    // Obteniendo los valores para enviar a la grafica
    const arrValsProm = regsBD.map((registro) => (
        (fechIniGraf <= registro.DATE <= fechFinGraf) ? (registro.VALUE) : null
    ));

    if(arrValsProm.length > 0){
        const promedio = parseFloat((arrValsProm.reduce((valPrev, valAct) => valAct += valPrev) / arrValsProm.length).toFixed(2));
        regsBD.map((registro) => {
            const fecha = registro.DATE, valor = registro.VALUE;
            
            if(valor > promedio)
                regsGraf.push([fecha, valor]);
            return 0;
        })
    }

    const options = {
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
                            const areaExportar = document.getElementById("areaGraf");
                            const contePDF = await html2canvas(areaExportar);
                            const dataInfo = contePDF.toDataURL("image/png");
                            let ancho = areaExportar.clientWidth, alto = areaExportar.clientHeight, altoEspa, anchoEspa;
                            if(ancho > alto){
                                let pdfArchi = new jsPDF('l', 'px', [ancho, alto]);
                                ancho=pdfArchi.internal.pageSize.getWidth();
                                alto=pdfArchi.internal.pageSize.getHeight();
                                anchoEspa=ancho-20;
                                altoEspa=alto-20;
                                pdfArchi.addImage(dataInfo, 'PNG', 10, 10, anchoEspa, altoEspa);
                                pdfArchi.save(`BMS Grafica de ${getFecha()}; Registros ${sensorNom}.pdf`);
                            }
                            else{
                                let pdfArchi = new jsPDF('p','px', [alto, ancho]);
                                ancho=pdfArchi.internal.pageSize.getWidth();
                                alto=pdfArchi.internal.pageSize.getHeight();
                                anchoEspa=ancho-20;
                                altoEspa=alto-20;
                                pdfArchi.addImage(dataInfo, 'PNG', 10, 10, anchoEspa, altoEspa);
                                pdfArchi.save(`BMS Grafica de ${getFecha()}; Registros ${sensorNom}.pdf`);
                            }
                        }
                    }]
                },
                export: {
                    csv: {
                        headerCategory: "Fecha",
                        filename: `BMS Grafica de ${getFecha()}; Registros ${sensorNom}`
                    },
                    svg: {
                        filename: `BMS Grafica de ${getFecha()}; Registros ${sensorNom}`
                    }
                }
            },
            events: {
                updated: function (chartContext, config) {
                    iconCarga = (
                        <div className='col-sm-auto'>
                            <div className='row justify-content-center align-items-center'>
                                <span>Cargando...</span>
                            </div>
                            <div className='row justify-content-center align-items-center'>
                                <FontAwesomeIcon icon={faSpinner} size='2x' spin/>
                            </div>
                        </div>
                    );
                }
            }
        },
        series: [{
            name: `Registro ${sensorNom}`,
            data: regsGraf
        }],
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false,
            }
        },
        yaxis: {
            title: {
                text: (`${sensorUni}`==='undefined') ? `Esperando Seleccion` : `Unidad de Medición: ${sensorUni}`
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
                for(let cont=0; cont<regsBD.length; cont++){
                    const valor = regsBD[cont].VALUE, status = regsBD[cont].STATUS;
                    if(valor === series[seriesIndex][dataPointIndex]){
                        if(status === "Activo"){
                            return '<div class="arrow_box"><strong><span>' +
                                w.config.series[seriesIndex].name + ':<br> Valor: ' + series[seriesIndex][dataPointIndex] +
                                '; <br>Estado: <span class="text-success">Activo</span></span></strong></div>'
                        }else if(status === "Inactivo"){
                            return '<div class="arrow_box"><strong><span>' +
                                w.config.series[seriesIndex].name + ':<br> Valor: ' + series[seriesIndex][dataPointIndex] +
                                '; <br>Estado: <span class="text-danger">Inactivo</span></span></strong></div>'
                        }else{
                            return '<div class="arrow_box"><strong><span>' +
                                w.config.series[seriesIndex].name + ':<br> Valor: ' + series[seriesIndex][dataPointIndex] +
                                '; <br>Estado: <span class="text-secondary">Indefinido</span></span></strong></div>'
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
    };

    return(
        <Chart options={options} series={options.series} type="line" width="100%" height="280%" />
    );
}

/**
 * @returns {string} Fecha Formateada en estilo YYYY-MM-DD_hh.mm
 */
function getFecha() {
    let fecha, dia = "", mes = "", hora = "", min = "";
    fecha = new Date();
    // Agregar un cero por si el dia tiene solo un digito
    if(fecha.getDate().toString().length === 1)
        dia = "0" + fecha.getDate().toString();
    else
        dia = fecha.getDate();
    // Agregar un cero por si el mes tiene un solo digito
    if(fecha.getMonth().toString().length === 1)
        mes = "0" + fecha.getMonth().toString();
    else
        mes = fecha.getMonth();
    // Agregar un cero por si la hora solo tiene un digito
    if(fecha.getHours().toString().length === 1)
        hora = "0" + fecha.getHours().toString();
    else    
        hora = fecha.getHours();
    // Agregar un cero por si el minuto tiene un solo digito
    if(fecha.getMinutes().toString().length === 1)
        min = "0"+fecha.getMinutes().toString();
    else
        min = fecha.getMinutes();

    return(`${fecha.getFullYear()}-${mes}-${dia}_${hora}.${min}`);
}