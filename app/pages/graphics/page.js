'use client';
import axios from 'axios';
import Calendario from '@/app/components/calendar/page';
import Grafica from '@/app/components/graphEmpty/page';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import estilosGen from '../../globals.css';
import { useRouter } from 'next/navigation';
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect, useRef } from "react";
import Agregar_Sensor from '@/app/components/sensorAdd/page';
import Lista_Filtros from '@/app/components/filterList/page';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, ModalHeader, ModalBody, Alert } from "reactstrap";
import { AlertTriangle, AlertCircle, Calendar } from 'react-feather';
import ProcesoGrafica from '@/app/components/graphEmpty/page';

export default function Grafica_Page(){
    //----------------------------Estableciendo las variables de trabajo--------------------------------------
    // Constante de historial de navegacion
    const navegar = useRouter();
    // Obteniendo la credencial del usuario logueado; Para nextjs hay que usar una forma diferente para el localstorage
    let usSession;
    try { usSession = localStorage.getItem("user") || ""; } catch(error) { }
    /* Variable de estado para la obtencion de registros
    const [registros, setRegistros] = useState([1]);*/
    // Establecer las variables de las fechas
    const [fechIni, setFechIni] = useState(Date.now());
    const [fechFin, setFechFin] = useState(Date.now());
    // Establecer la variable de busqueda de datos (el filtro que se usara con la lista desplegable)
    const [tipInfoBus, setTipInfoBus] = useState("404");
    // Variable de estado para la apertura o cierre del modal de aviso de errores
    const [modalError, setModalError] = useState(false);
    // Variable de estado para el establecimiento del mensaje contenido en el modal de errores
    const [modalErrMsg, setModalErrMsg] = useState("Ocurrio un error en la accion solicitada");
    // Variable de estado para la apertura o cierre del modal de avisos
    const [modalAvisos, setModalAvisos] = useState(false);
    // Variable de estado para el establecimiento del mensaje contenido en el modal de avisos
    const [modalAviMsg, setModalAviMsg] = useState("Esperando mensaje de advertencia");
    // Mensaje de la seccion de carga, segun la accion solicitada
    const [msgCarga, setMsgCarga] = useState("Preparando información, aguarde...");
    // Estado de visualizacion de la seccion; true para ocultar, false para mostrar la carga
    const [oculCarga, setOculCarga] = useState(false);
    // Variable de animacion de carga
    const iconCh = <div className='col-sm-auto'>
        <div className='row justify-content-center align-items-center'>
            <span>{msgCarga}</span>
        </div>
        <div className='row justify-content-center align-items-center'>
            <FontAwesomeIcon icon={faSpinner} size='2x' spin/>
        </div>
    </div>;
    // Variable de estado con la grafica
    const [grafica, setGrafica] = useState(<ProcesoGrafica sensorInfo={null} area={null} fechIniGraf={null} fechFinGraf={null} />);
    // Banderas de disparo de los seleccionadores
    const [senBande, setSenBande] = useState(false), [fechIniBande, setFechIniBande] = useState(false), [fechFinBande, setFechFinBande] = useState(false);
    //let senBande = false, fechIniBande = false, fechFinBande = false;
    // Arreglo de valores para el promedio y para concatenacion de elementos en la grafica
    const arrVals = [], info = [];
    //--------------------------------------------------------------------------------------------------------
    // Obtencion de la lista de sensores actuales disponibles para la seleccion de busqueda en la lista

    
    // Buscar los elementos por classname para encontrar el texto de carga de informacion de la grafica
    useEffect(() => {
        let elementos = document.getElementsByClassName("apexcharts-text");
        for(const element of elementos){
            if(element.textContent === "Preparando información, aguarde por favor..."){
                // Si se encuentra el mensaje de carga en el virtual DOM se establece el icono de carga como esperando
                setMsgCarga("Esperando...");
                setOculCarga(false);
                break;
            }else{
                // Si no se encuentra el mensaje de carga, procede a borrarse el contenido (es decir, a desaparecer la carga)
                setOculCarga(true);
            }
        }
    }, []);

    //-------------------------Peticiones con Axios para obtener la informacion------------------------------------
    // Peticion para obtener los datos de historicrecord que se usaran en la grafica
    /*useEffect(() => {
        const obteInfo = async(estado) => {
            try{
                const peticion = await axios.get('https://app.buildingcontinuity.com.mx/php/data.php?tipo_consulta=historico');
                estado(peticion.data);
            } catch (error){
            }
        }
        obteInfo(setMetadata);
    }, []);
    //-------------------------------------------------------------------------------------------------------------

    // Agregando un listener para la deteccion de presionar las teclas F12 y ContextMenu
    useEffect(() => {
        document.addEventListener('keydown', (evento) => {
            if(evento.key==="F12" || evento.key==="ContextMenu"){
                // Prevenir la accion por defecto de las teclas
                evento.preventDefault();
                // Setear el mensaje de error y mostrar el modal de errores
                setModalErrMsg("Error: Accion no valida");
                setModalError(!modalError);
            }
        }, true);
    }, [modalError]);

    // Funcion para muestra del menu contextual
    function contextMenu(evento){
        // Prevenir la accion por defecto de las teclas
        evento.preventDefault()
        setModalErrMsg("Error: Accion no valida");
        OpenCloseError();
    }*/

    /* Buscar los elementos por classname para encontrar el texto de carga de informacion de la grafica
    useEffect(() => {
        let elementos = document.getElementsByClassName("apexcharts-text");
        for(const element of elementos){
            if(element.textContent === "Preparando información, aguarde por favor...") {
                setIconCh(
                    <div className='col-sm-auto'>
                        <div className='row justify-content-center align-items-center'>
                            <span>Esperando...</span>
                        </div>
                        <div className='row justify-content-center align-items-center'>
                            <FontAwesomeIcon icon={faSpinner} size='2x' spin/>
                        </div>
                    </div>
                );
                break;
            }else{
                setIconCh();
            }
        }
    }, []); */

    //-----------------------------Codigo para el funcionamiento de Inactividad------------------------------------
    useEffect(() => {
        setModalAviMsg("NOTA: Si la consulta de datos que desea realizar contiene muchos registros, la grafica podria tardar en cargar. Gracias por su comprensión.");
        setModalAvisos(true);
        let contaInacti;
        // Preparacion para el procedimiento de inactividad
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
            contaInacti = setTimeout(() => {    // Temporizador establecido a 5 minutos, en milisegundos
                alert("Aviso: \n- El sistema cerrará la sesion por inactividad. \nNOTA:\n- Este aviso puede salir en multiples ocasiones.");
                navegar.push("/");
            }, 300000);
            // 300000 = 5 minutos, 60000 = 1 minuto, 30000 = 30 segundos
        }
        function reiniciarConteo(){
            // Limpiar/Eliminar valor actual del contador
            clearTimeout(contaInacti);
            // Reiniciar el contador
            iniciarConteo();
        }
        // Arrancar mecanismo de inactividad
        setupInacti();    
    }, [navegar])
    //-------------------------------------------------------------------------------------------------------------
    
    // Abrir/Cerrar modal de errores
    const OpenCloseError = () => setModalError(!modalError);

    // Abrir/Cerrar modal de avisos
    const OpenCloseAvisos = () => setModalAvisos(!modalAvisos);

    // Verificacion del local storage para ver si hay un usuario logueado
    //Si la credencial del usuario no esta almacenada en el localStorage, quiere decir que no ha iniciado sesion, por lo que se le retornara al login
    if(!usSession){
        navegar.push("/");
        return 0;
    }else{
        /* Obtencion de todos los registros que coincidan con el nombre/identificador de busqueda
        const regsBusqueda = [];
        metadata.map(
            (allData) => (
                (tipInfoBus.split(";")[0]!=="404") ?
                    (`${allData.HISTORY_ID}`.includes(tipInfoBus.split(";")[0])) ? 
                        regsBusqueda.push({
                            ID: parseInt(`${allData.ID}`),
                            DATE: (new Date(parseInt(`${allData.TIMESTAMP}`))),
                            VALUE: parseFloat(parseFloat(`${allData.VALUE}`).toFixed(2)),
                            STATUS: (`${allData.STATUS_TAG}`==="{ok}") ? "Activo" : (`${allData.STATUS_TAG}`==="{down}") ? "Inactivo" : "Indefinido"
                        }
                    ) : null
                : null
            )
        );

        // Obteniendo el valor promedio de valores
        regsBusqueda.map((reg) => (arrVals.push(reg.VALUE)));
        if(arrVals.length > 0){
            const promedio = parseFloat((arrVals.reduce((valPrev, valAct) => valAct += valPrev) / arrVals.length).toFixed(2));
            regsBusqueda.map(function(registro){
                const fecha = registro.DATE, valor = registro.VALUE;
                // Si se realizo la limpieza de seleccion de rangos de fechas no se tendran valores, por lo cual solo se retornara la funcion
                if(fechIni === "" || fechFin === "" || (fechIni === "" && fechFin === ""))
                    return null;
                /* Ya que el promedio depende del resultado de la consulta solo en este punto se puede hacer el filtrado de datos junto con el parametro del promedio.
                Entonces si la fecha se comprende entre la inicial y la final, ademas de ser mayor al promedio (para que no haya tantos registros) se incoporara el registro al arreglo de valores para la grafica
                if((fecha > fechIni) && (fecha < fechFin) && (valor > promedio)){
                    info.push([fecha, valor])
                }
                return 0;
            });
        }

        //----------------Preparacion de las opciones de configuracion para la grafica------------------------
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
                                    pdfArchi.save(`BMS Grafica de ${getFecha()}; Registros ${tipInfoBus.split(";")[1]}.pdf`);
                                }
                                else{
                                    let pdfArchi = new jsPDF('p','px', [alto, ancho]);
                                    ancho=pdfArchi.internal.pageSize.getWidth();
                                    alto=pdfArchi.internal.pageSize.getHeight();
                                    anchoEspa=ancho-20;
                                    altoEspa=alto-20;
                                    pdfArchi.addImage(dataInfo, 'PNG', 10, 10, anchoEspa, altoEspa);
                                    pdfArchi.save(`BMS Grafica de ${getFecha()}; Registros ${tipInfoBus.split(";")[1]}.pdf`);
                                }
                            }
                        }]
                    },
                    export: {
                        csv: {
                            headerCategory: "Fecha",
                            filename: `BMS Grafica de ${getFecha()}; Registros ${tipInfoBus.split(";")[1]}`
                        },
                        svg: {
                            filename: `BMS Grafica de ${getFecha()}; Registros ${tipInfoBus.split(";")[1]}`
                        }
                    }
                },
                events: {
                    updated: function (chartContext, config) {
                        setIconCh(
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
                name: `Registro ${tipInfoBus.split(";")[1]}`,
                data: info
            }],
            xaxis: {
                type: 'datetime',
                labels: {
                    datetimeUTC: false,
                }
            },
            yaxis: {
                title: {
                    text: (`${tipInfoBus.split(";")[2]}`==='undefined') ? `Esperando Seleccion` : `Unidad de Medición: ${tipInfoBus.split(";")[2]}`
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
                    for(let cont=0; cont<regsBusqueda.length; cont++){
                        const valor = regsBusqueda[cont].VALUE, status = regsBusqueda[cont].STATUS;
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
        };*/
        //----------------------------------------------------------------------------------------------------
        
        // Funcion para setear el tipo de dato a buscar en la grafica; Este dato es retornado por la lista de seleccion
        const sensorSelec = (sensorBus) => {
            setTipInfoBus(sensorBus);
            console.log("Sensor Buscado: " + sensorBus);
            setSenBande(true);
            //actuGraf(sensorBus, fechIni, fechFin);
            actuGraf();
        };

        // Funcion para la obtencion del valor de la fecha de inicio
        const fechaInicio = (valFechIni) => {
            const fechIniConv = Math.floor(new Date(valFechIni).getTime()/1000.0);
            setFechIni(fechIniConv);
            console.log("Fecha de Inicio: " + valFechIni + "Fecha Epoch: " + fechIni);
            //actuGraf(tipInfoBus, fechIniConv, fechFin);
            setFechIniBande(true);
            actuGraf();
        }

        // Funcion para la obtencion del valor de la fecha de inicio
        const fechaFinal = (valFechFin) => {
            const fechFinConv = Math.floor(new Date(valFechFin).getTime()/1000.0);
            setFechFin(fechFinConv);
            console.log("Fecha de Fin: " + valFechFin + "Fecha Epoch: " + fechFin);
            //actuGraf(tipInfoBus, fechIni, fechFinConv);
            setFechFinBande(true);
            actuGraf();
        }

        // Funcion de actualizacion de la grafica
        const actuGraf = () => {
            // Cambiar el mensaje de carga y mostrar la seccion de carga
            setMsgCarga("Cargando...");
            setOculCarga(false);
            
            // Actualizando la grafica con los valores de estado si alguno de los seleccionadores fue activado
            if(senBande || fechIniBande || fechFinBande){
                console.log("ya entro aqui");
                setGrafica(<ProcesoGrafica sensorInfo={tipInfoBus} area={document.getElementById("areaGraf")} fechIniGraf={fechIni} fechFinGraf={fechFin} />);
                // Ocultar la seccion de carga cuando se haya actualizado la grafica
                setOculCarga(true);
                // Desactivar las banderas de disparo de los seleccionadores
                setSenBande(false);
                setFechIniBande(false);
                setFechFinBande(false);
            }
        }

        // Cargando los valores de la pagina en caso de estar logueado
        //page = <section onContextMenu={contextMenu}>
        /*page = <section>
            <div className='container-fluid border mt-1'>
                <div className='row align-items-center border pt-3 pb-3 text-center'>
                    <div className='col-sm-auto mt-2'>
                        <div className='input-group mb-2'>
                            <Lista_Filtros selSenBus={sensorSelec} />
                        </div>
                    </div>
                    <div className='col-sm-3'>
                        <span>Seleccionar Fecha y Hora de Inicio:</span>
                        <Calendario valorSel={fechaInicio} tipoCal={"Inicio"} />
                    </div>
                    <div className='col-sm-3'>
                        <span>Seleccionar Fecha y Hora de Fin:</span>
                        <Calendario valorSel={fechaFinal} tipoCal={"Final"} />
                    </div>
                    <div className='col-sm-auto'>
                        <div className='row align-items-center'>
                            <div className='col-md-auto'>
                                <div className='input-group mt-4 mb-2'>
                                    <Agregar_Sensor />
                                </div>
                            </div>
                        </div>
                    </div>
                    {iconCh}
                </div>
                <div id='areaGraf' className='row align-items-center border pt-3 pb-5 mb-3'>
                {
                    grafica
                    //<Chart options={options} series={options.series} type="line" width="100%" height="280%" />
                }
                </div>
                <div id="ModalError">
                    <Modal isOpen={modalError} toggle={OpenCloseError}>
                        <ModalHeader toggle={OpenCloseError}>
                            <p>Error <AlertTriangle color="red" size={30} /></p>
                        </ModalHeader>
                        <ModalBody>
                            <Alert color="danger">
                                <p>{modalErrMsg}</p>
                            </Alert>
                        </ModalBody>
                    </Modal>
                </div>
                <div id="ModalAdvice">
                    <Modal isOpen={modalAvisos} toggle={OpenCloseAvisos}>
                        <ModalHeader toggle={OpenCloseAvisos}>
                            <p>Advertencia <AlertCircle color="blue" size={30} /></p>
                        </ModalHeader>
                        <ModalBody>
                            <Alert color="success">
                                <p>{modalAviMsg}</p>
                            </Alert>
                        </ModalBody>
                    </Modal>
                </div>
            </div>
        </section>*/

        return (
            //<section onContextMenu={contextMenu}>
            <section>
                <div className='container-fluid border mt-1'>
                    <div className='row align-items-center border pt-3 pb-3 text-center'>
                        <div className='col-sm-auto mt-2'>
                            <div className='input-group mb-2'>
                                <Lista_Filtros selSenBus={sensorSelec} />
                            </div>
                        </div>
                        <div className='col-sm-3'>
                            <span>Seleccionar Fecha y Hora de Inicio:</span>
                            <Calendario valorSel={fechaInicio} tipoCal={"Inicio"} />
                        </div>
                        <div className='col-sm-3'>
                            <span>Seleccionar Fecha y Hora de Fin:</span>
                            <Calendario valorSel={fechaFinal} tipoCal={"Final"} />
                        </div>
                        <div className='col-sm-auto'>
                            <div className='row align-items-center'>
                                <div className='col-md-auto'>
                                    <div className='input-group mt-4 mb-2'>
                                        <Agregar_Sensor />
                                    </div>
                                </div>
                            </div>
                        </div>
                        { !oculCarga && iconCh }
                    </div>
                    <div id="areaGraf" className="row align-items-center border pt-3 pb-5 mb-3">
                        {
                            grafica
                            //<Chart options={options} series={options.series} type="line" width="100%" height="280%" />
                            //<Grafica
                        }
                    </div>
                    <div id="ModalError">
                        <Modal isOpen={modalError} toggle={OpenCloseError}>
                            <ModalHeader toggle={OpenCloseError}>
                                <p>Error <AlertTriangle color="red" size={30} /></p>
                            </ModalHeader>
                            <ModalBody>
                                <Alert color="danger">
                                    <p>{modalErrMsg}</p>
                                </Alert>
                            </ModalBody>
                        </Modal>
                    </div>
                    <div id="ModalAdvice">
                        <Modal isOpen={modalAvisos} toggle={OpenCloseAvisos}>
                            <ModalHeader toggle={OpenCloseAvisos}>
                                <p>Advertencia <AlertCircle color="blue" size={30} /></p>
                            </ModalHeader>
                            <ModalBody>
                                <Alert color="success">
                                    <p>{modalAviMsg}</p>
                                </Alert>
                            </ModalBody>
                        </Modal>
                    </div>
                </div>
            </section>
        );
    }
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