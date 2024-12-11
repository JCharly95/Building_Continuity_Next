"use client";
import axios from "axios";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "react-feather";
import { useState, useRef, useEffect } from "react";
import Modal from "@/app/components/ui/modals/modal";
import { getFecha } from "../../components/logic/fecha";
import Dialog from "@/app/components/ui/modals/plantillas/dialog";
import FormRecu from "@/app/components/ui/modals/plantillas/formRecuPass";
import { validarCorreo, validarContrasenia } from "../../components/logic/validaciones";

export default function Login(){
    /* Variables de trabajo:
    Variable de estado para establecer tipo de campo en la contraseña en el login
    Variable de estado para establecer el icono a mostrar en el boton de mostrar contraseña
    Variable de estado para establecer el titulo a mostrar del boton cuando se tenga el puntero encima de este
    Variable de estado para la apertura/cierre del modal
    Variable de estado para el titulo del modal
    Variable de estado para establecer el contenido del modal
    Constantes de referencia para el campo del correo y el campo de la contraseña
    Constante del router para el redireccionamiento */
    const [passCamp, setPassCamp] = useState("password"),
    [iconoPas, setIconoPas] = useState(<Eye id="ojo_abierto" color="black" size={30}/>),
    [btnTitulo, setBtnTitulo] = useState("Mostrar Contraseña"),
    [modalOpen, setModalOpen] = useState(false),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(""),
    userRef = useRef(null),
    passRef = useRef(null),
    router = useRouter();

    //Useffect para limpiar variables del localstorage que podrian haber quedado en la sesion anterior, si es que hubo
    useEffect(() => {
        localStorage.clear();
    }, []);

    /* UseEffect para monitorear el uso de teclas F12 para consola y menu contextual, asi como el clic derecho, tambien menu contextual
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
    }, []); */

    // Mostrar/Ocultar contraseña
    const verPass = () => {
        if(passCamp == "password"){
            setPassCamp("text");
            setBtnTitulo("Ocultar Contraseña")
            setIconoPas(<EyeOff id="ojo_cerrado" color="black" size={30}/>);
        }else {
            setPassCamp("password");
            setBtnTitulo("Mostrar Contraseña")
            setIconoPas(<Eye id="ojo_abierto" color="black" size={30}/>);
        }
    };

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => {
        setModalOpen(estado);
    }

    /** Verificacion de los datos recibidos en el formulario
     * @param {Event} evento Evento de verificacion del formulario previo al acceso del sistema */
    function handleForm(evento){
        // Evitar enviar el formulario por defecto
        evento.preventDefault();
        // Obtener los valores de los campos del formulario
        let valCor = `${userRef.current.value}`,
        valPas = `${passRef.current.value}`;
        // Enviar los datos a validar
        let msgValida = validarCampos(valCor, valPas);
        // Crear y abrir un modal de carga
        setModalTitu("Cargando");
        setModalConte(<Dialog textMsg="Procesando información, espere por favor..."/>);
        setModalOpen(true);

        // Funcion asincrona de busqueda del usuario en la BD
        const petiBusUs = async() => {
            let respBusUs = await buscarUsuario(valCor, valPas);
            // Si la respuesta es un array (objeto), se da por sentado que se encontró, en caso contrario, se regresa un string que trae el mensaje de error
            if(typeof(respBusUs) == "object"){
                // Enviar el objeto de informacion para guardar en sesion local y actualizar la fecha de acceso
                acceder(respBusUs[0]).then((response) => {
                    if(!response.includes("Error")){
                        // Establecer el titulo del modal, el contenido del mismo y la apertura de este
                        setModalTitu("Acceso");
                        setModalConte(<Dialog textMsg="Bienvenid@ a Building Continuity"/>);
                        setModalOpen(true);
                        // Si se accedio satisfactoriamente, se enviará a la interfaz de la grafica
                        router.push("/pages/grafica");
                    }else{
                        // Establecer el titulo del modal, el contenido del mismo y la apertura de este
                        setModalTitu("Error");
                        setModalConte(<Dialog textMsg={response}/>);
                        setModalOpen(true);
                        //console.error(response);
                    }
                }).catch((errProcAcc) => {
                    // Establecer el titulo del modal, el contenido del mismo y la apertura de este
                    console.log(`Problemas en el proceso de acceso. Causa: ${errProcAcc}`);
                    setModalTitu("Error");
                    setModalConte(<Dialog textMsg={`Problemas en el proceso de acceso. Causa: ${errProcAcc}`}/>);
                    setModalOpen(true);
                    // Abrir el modal con el contenido del error
                    //console.error(`Error: Problemas en el proceso de acceso. Causa: ${errProcAcc}`);
                })
            }else{
                // Limpiar la consola por seguridad (porque es una peticion GET)
                console.clear();
                // Establecer el titulo del modal, el contenido del mismo y la apertura de este
                setModalTitu("Error");
                setModalConte(<Dialog textMsg={respBusUs}/>);
                setModalOpen(true);
                //console.error(respBusUs);
            }
        }

        // Verificar la validacion:
        // Si los campos se validaron, se llama a la promesa donde se busca la informacion en la BD, si no, se abrirar un modal con el mensaje de error
        if(msgValida == "Validacion realizada con exito"){
            petiBusUs();
        }else{
            // Establecer el titulo del modal, el contenido del mismo y la apertura de este
            setModalTitu("Error");
            setModalConte(<Dialog textMsg={msgValida}/>);
            setModalOpen(true);
            //console.log(msgValida);
        }
    }

    return(
        <section className="w-screen h-screen flex justify-center items-center">
            <section className="w-full max-w-sm">
                <Form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleForm}>
                    <p className="flex items-center justify-center text-blue-700 text-xl mb-3">Login</p>
                    <section className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Direccion de Correo:</label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="email" placeholder="alguien@ejemplo.com" ref={userRef}/>
                    </section>
                    <section className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Contraseña:</label>
                        <section className="flex justify-normal">
                            <input id="val-contra" type={passCamp} placeholder="******************" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" ref={passRef}/>
                            <button type="button" title={btnTitulo} className="shadow appearance-none border rounded px-1" onClick={verPass}>{iconoPas}</button>
                        </section>
                    </section>
                    {/*<section className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Contraseña</label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type={passCamp} placeholder="******************" ref={passRef}/>
                    </section>
                    <section className="flex items-center justify-center mb-6">
                        <label className="md:w-2/3 text-gray-500 font-bold inline-flex items-center justify-center">
                            <input className="mr-2 leading-tight" type="checkbox" onChange={verPass}/>
                            <span className="text-sm">Mostrar Contraseña</span>
                        </label>
                    </section>*/}
                    <section className="flex items-center justify-between">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Acceder</button>
                        <button type="button" className="inline-block align-baseline font-bold text-sm border border-red-500 p-2 rounded text-orange-500 hover:bg-yellow-500 hover:text-white" onClick={() => {
                            setModalTitu("Recuperar Contraseña");
                            setModalConte(<FormRecu />);
                            setModalOpen(true);
                        }}>¿Olvidó su contraseña?</button>
                    </section>
                </Form>
            </section>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}

/** Funcion para validacion de los campos
 * @param {string} correo Valor del campo de correo ingresado
 * @param {string} contra Valor del campo de la contraseña ingresada
 * @returns {string} Mensaje resultante de la validación */
function validarCampos(correo, contra){
    /* Variables de trabajo:
    Bandera de validacion del correo
    Bandera de validacion de contraseña
    Variable del mensaje a retornar */
    let bandeValiEma = false,
    bandeValiPass = false,
    msgVali = "";

    // Retornar de una si los campos no tienen valores
    if(correo.length == 0 && contra.length == 0){
        return "No se ingresó información, favor de insertar sus datos de acceso.";
    }else{
        /* Variables de trabajo:
        Objeto de respuesta de la validacion del correo
        Objeto de respuesta de la validacion de la contraseña */
        let objRespCor = validarCorreo(correo),
        objRespPas = validarContrasenia(contra);
    
        // Obtener la respuesta de la validacion del correo en base al objeto
        (objRespCor.getCondicion == 0) ? msgVali += `La validación del correo no fue realizada <br/>`
        : (objRespCor.getCondicion == 1) ? bandeValiEma = true
        : (objRespCor.getCondicion == 2) ? msgVali += (`${objRespCor.getMensaje} <br/>`)
        : null;
    
        // Obtener la respuesta de la validacion del correo en base al objeto
        (objRespPas.getCondicion == 0) ? msgVali += `La validación de la contraseña no fue realizada <br/>`
        : (objRespPas.getCondicion == 1) ? bandeValiPass = true
        : (objRespPas.getCondicion == 2) ? msgVali += (`${objRespPas.getMensaje} <br/>`)
        : null;
    
        // Si ambos campos se validaron correctamente se retorna un verdadero, si no, se establece el contenido textual del error obtenido
        return (bandeValiEma && bandeValiPass) ? "Validacion realizada con exito"
        : msgVali;
    }
}

/** Funcion para obtener la informacion del usuario en la base de datos
 * @param {string} direCor Correo ingresado en el login
 * @param {string} valorContra Contraseña ingresada en el login 
 * @returns {Promise<Array | string>} Promesa con arreglo de informacion resultante o mensaje de error en caso de acontecer uno */
async function buscarUsuario(direCor, valorContra){
    try {
        const consulta = await axios.get("/server/api/getBusUs", {
            params: {
                correo: direCor,
                contra: valorContra
            }
        });
        return consulta.data.results;
    } catch (errBusUser) {
        // Si ocurrio un error en la peticion de busqueda se mostrará aqui
        if (errBusUser.response) {
            // Primer caso, el servidor tiró un error 500 programado por no encontrar el usuario con la información del formulario o porque no se pudo hacer la peticion para consultar información (Error contemplado)
            return (typeof(errBusUser.response.data.msgError) == "undefined") ? "Error: Acceso no disponible caso 1, favor de intentar mas tarde." : errBusUser.response.data.msgError;
        } else if (errBusUser.request) {
            // Segundo caso, el cliente lanzó la petición al servidor y este no respondio (Error controlado)
            return("Error: Acceso no disponible caso 2, favor de intentar mas tarde.");
        } else {
            // Tercer caso, ocurrio un error en la petición y por ende en la respuesta del servidor (Error no contemplado y desconocido)
            return("Error: Acceso no disponible caso 3, favor de intentar mas tarde.");
        }
    }
}

/** Funcion para establecer la fecha del ultimo acceso de los usuarios en la BD
 * @param {object} objSesion Objeto que contiene el correo y la fecha del navegador del ultimo intento de acceso realizado
 * @returns {Promise<Array | string>} Promesa con arreglo de informacion resultante o mensaje de error en caso de acontecer uno */
async function setUltiAcc(objSesion){
    try {
        const consulta = await axios.post("/server/api/postUltiAcc", {
            correo: `${objSesion.correo}`,
            fechLAcc: (`${objSesion.fechLAcc}`.includes(";")) ? `${objSesion.fechLAcc}`.replace(";","") : `${objSesion.fechLAcc}`
        },{
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return consulta.data.results;
    } catch (errUltiAcc) {
        // Si ocurrio un error en la peticion de busqueda se mostrará aqui
        if (errUltiAcc.response) {
            // Primer caso, el servidor tiró un error 500 programado por no actualizar la fecha de acceso o porque no se pudo hacer la peticion para actualizar la información (Error contemplado)
            return (typeof(errUltiAcc.response.data.msgError) == "undefined") ? "Error: Servicio de acceso no disponible caso 1, favor de intentar mas tarde." : errUltiAcc.response.data.msgError;
        } else if (errUltiAcc.request) {
            // Segundo caso, el cliente no se pudo contactar con el servidor o este no respondio (Error controlado)
            return("Error: Servicio de acceso no disponible caso 2, favor de intentar mas tarde.");
        } else {
            // Tercer caso, ocurrio un error en la disponibilidad de la respuesta del servidor (Error no contemplado y desconocido)
            return("Error: Servicio de acceso no disponible caso 3, favor de intentar mas tarde.");
        }
    }
}

/** Funcion para establecer el objeto de sesion (localStorage) y la fecha del ultimo acceso en la BD
 * @param {object} objInfo Objeto que contiene el correo a almacenar como "cookie" de sesion
 * @returns {Promise<string>} Mensaje del resultado de la operacion */
async function acceder(objInfo){
    // Crear el objeto de sesion (localStorage)
    const sesion = { correo: objInfo.Correo, fechLAcc: getFecha() } ;
    // Crear la sesion de localStorage para el cliente con la clave usInfo
    localStorage.setItem("usInfo", JSON.stringify(sesion));
    // Establecer la fecha del ultimo acceso del usuario en la BD
    let consulta = await setUltiAcc(sesion);
    // Regresar el mensaje resultante de la operacion
    return consulta;
}