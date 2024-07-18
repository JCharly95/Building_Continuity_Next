'use client';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React, { useEffect, useState } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ProcesoGrafica({ sensorInfo, area, fechIniGraf, fechFinGraf }){
    // Valores del sensor desglosados
    //const sensorNom = sensorInfo.split(";")[0];
    const sensorID = (sensorInfo == null) ? "" : sensorInfo.split(";")[1];
    //const sensorUni = sensorInfo.split(";")[2];
    // Variable de estado con los registros del sensor en la BD
    const [regsBD, setRegsBD] = useState([]);
    const [grafica, setGrafica] = useState(objGrafica(" ; ; ", area, []));
    let regsGraf = [];

    useEffect(() => {
        async function getRegistros(){
            try {
                const peticion = await axios.get(`http://localhost/Proyectos_Propios/BuildContiBack/index.php?tipo_consulta=historicoEspeci&sen_name=${sensorID}&fechaIni=${fechIniGraf}&fechaFin=${fechFinGraf}`);
                // Si la peticion de busqueda se hizo correctamente, aqui se obtendra la informacion resultante
                const datos = await peticion.data;
                setRegsBD(
                    datos.map((registro) => ({
                        ID: parseInt(`${registro.ID}`),
                        DATE: (new Date(parseInt(`${registro.TIMESTAMP}`))),
                        VALUE: parseFloat(parseFloat(`${registro.VALUE}`).toFixed(2)),
                        STATUS: (`${registro.STATUS_TAG}`==="{ok}") ? "Activo" : (`${registro.STATUS_TAG}`==="{down}") ? "Inactivo" : "Indefinido"
                    }))
                );
                console.log(regsBD);
            } catch (error) {
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
        
        function filtrarDatos(){
            // Obteniendo solo los valores de lo registros para enviar a la grafica
            const arrRegsVals = regsBD.map(registro => (registro.VALUE));
        
            // Filtrado de valores; Obtencion de las cantidades a evaluar
            let promedio = arrRegsVals.reduce((suma, valActu) => suma + valActu, 0) / arrRegsVals.length;
            // Valor porcentual establecido para contemplar diferencia
            const porcenDif = 0.25;
            // Valores maximo y minimo de diferencia para el filtrado
            let difInfe = promedio - (promedio * porcenDif), difSupe = promedio + (promedio * porcenDif);
            // Buscando los registros que sean mayores, menores o iguales a las diferencias contempladas para el muestreo
            regsBD.map((registro) => {
                const fecha = registro.DATE, valor = registro.VALUE;
    
                if(valor <= difInfe || valor >= difSupe){
                    regsGraf.push([fecha, valor]);
                }
            });
        }
    
        // Caso posterior al inicial, puesto que al entrar no se ha seleccionado nada, se mandan como nulls las props
        if((sensorInfo != null) && (fechIniGraf != null) && (fechFinGraf != null)){
            // Obtener y establecer los registros dentro de rango temporal de la grafica (filtrado de servidor)
            getRegistros();
            // Filtrar los datos de muestreo para la grafica
            filtrarDatos();
            // Retorno de grafica llena de informacion
            setGrafica(sensorInfo, area, regsGraf);
        }/*else{
            // Retorno de grafica vacia
            return objGrafica(" ; ; ", area, []);
        }*/

    },[]);

    /*console.log("Datos de la peticion; Sensor: " + sensorInfo +"; Fecha Inicio: "+ fechIniGraf +"; Fecha Final: "+ fechFinGraf)

    

    useEffect(() => {
        
    },[])*/
}

function objGrafica({ sensorInfo, areaGrafica, registros }){
    // Valores del sensor desglosados
    const sensorNom = (typeof(sensorInfo) == "undefined") ? "" : sensorInfo.split(";")[0];
    //const sensorID = sensorInfo.split(";")[1];
    const sensorUni = (typeof(sensorInfo) == "undefined") ? "" : sensorInfo.split(";")[2];

    const options = {
        series: [{
            name: `Registro ${sensorNom}`,
            data: registros
        }],
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
                            const contePDF = await html2canvas(areaGrafica);
                            const dataInfo = contePDF.toDataURL("image/png");
                            let ancho = areaGrafica.clientWidth, alto = areaGrafica.clientHeight, altoEspa, anchoEspa;
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
        <Chart options={options} series={options.series} type="line" width="100%" height="100%" />
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