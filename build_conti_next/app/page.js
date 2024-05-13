'use client';
import axios from 'axios';
import estilosEspe from './page.module.css';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import RecuperContra from './components/recoverPass/page';
import React, { useEffect, useRef, useState } from 'react';
import { validarCorreo } from './components/validations/valiEmail';
import { validarPassword } from './components/validations/valiPass';
import { AlertTriangle, AlertCircle, Eye, EyeOff } from 'react-feather';
import { Button, Modal, ModalHeader, ModalBody, Alert } from 'reactstrap';

export default function LoginPage(){
    // Variable de estado para la obtencion de la navegacion y redireccionamiento usando el react-router
    const navegar = useRouter();
    // Variable de estado para mostrar el campo de la contraseña
    const [viewPass, setViewPas] = useState("password");
    // Variable de estado para la apertura o cierre del modal de aviso de errores
    const [modalError, setModalError] = useState(false);
    // Variable de estado para la apertura o cierre del modal de avisos
    const [modalAdv, setModalAdv] = useState(false);
    // Variable de estado para el establecimiento del mensaje contenido en el modal de errores
    const [modalMsg, setModalMsg] = useState("Hubo un problema al intentar acceder");
    // Variables de referencia para la obtencion de valores de los campos del login
    const userRef = useRef(null);
    const passRef = useRef(null);

    // Agregar un listener para la deteccion de las teclas F12 y ContextMenu
    useEffect(() => {
        document.addEventListener('keydown', (event) => {
            if(event.key==="F12" || event.key==="ContextMenu"){
                event.preventDefault()
                setModalMsg("Error: Accion no valida");
                setModalError(!modalError);
            }
        }, true)
    }, [modalError])

    // Abrir/Cerrar modal de errores
    function OpenCloseError(){
        setModalError(!modalError);
    }

    // Abrir/Cerrar modal de avisos
    function OpenCloseAvisos(){
        setModalAdv(!modalAdv);
    }

    /** Funcion para validacion de los campos
     * @param {string} correo Direccion de Correo Ingresada
     * @param {string} contra Contraseña Ingresada
     * @returns boolean */
    function valiCampos(correo, contra){
        // Banderas de validaciones; validacion general, validacion de correo y validacion de contraseña
        let bandeVali = false, bandeValiEma = false, bandeValiPass = false, msgVali = "";
        // Obtener los objetos de respuesta de las validaciones de los campos realizadas de forma externa
        const valiCorreo = validarCorreo(correo);
        const valiContra = validarPassword(contra);
        // Validacion de correo
        switch(valiCorreo.getCondicion){
            case 0:
                msgVali += "La validacion del correo no fue realizada \n";
                break;
            case 1:
                bandeValiEma = true;
                break;
            case 2:
                msgVali += (valiCorreo.getMensaje + " \n");
                break;
        }
        // Validacion de la contraseña
        switch(valiContra.getCondicion){
            case 0:
                msgVali += "La validacion de la contraseña no fue realizada \n";
                break;
            case 1:
                bandeValiPass = true;
                break;
            case 2:
                msgVali += (valiContra.getMensaje + " \n");
                break;
        }
        // Si ambos campos se validaron correctamente se establece la bandera como verdadero, si no, se establece el contenido textual del error obtenido
        if(bandeValiEma && bandeValiPass){
            bandeVali = true;
        }else{
            setModalMsg(msgVali);
        }
        return bandeVali;
    }

    /** Verificacion de envio del formulario de acceso
     * @param {Event} evento Evento de verificacion del formulario previo al acceso del sistema */
    function veriForm(evento){
        // Evitar lanzar el formulario por defecto
        evento.preventDefault();
        // Establecer los datos de entrada en constantes para mejorar el trabajo de codigo
        const dirEmaUs = `${userRef.current.value}`;
        const valPassUs = `${passRef.current.value}`;
        // Obteniendo la respuesta de la validacion de los campos
        const valiCamposResp = valiCampos(dirEmaUs, valPassUs);
        // Si se validaron los campos correctamente se procedera con la preparacion de acceso
        if(valiCamposResp){
            // Primero se enviará a la funcion asincrona para la busqueda del usuario en la base de datos
            buscarUsuario(dirEmaUs, valPassUs);
        }else{
            // Si no, se abrira el modal de avisos con los errores contenidos
            setModalError("Error: Datos No Validados, Favor de Revisar Su Información")
            OpenCloseError();
        }
    }

    /** Funcion de Acceso al Sistema (Login)
     * @param {string} clave Identificador de Cookie o Session
     * @param {string} emaUser Valor Direccion de Correo de Acceso
     * @param {number} passLongi Longitud de la Contraseña */
    function acceder(clave, emaUser, passLongi){
        // Creando el objeto de sesion
        const session = {
            info: emaUser,
            passLen: passLongi,
            acceso : getFecha()
        }
        try {
            // Crear la sesion de acceso para el cliente
            localStorage.setItem(clave, JSON.stringify(session)) || "";
            // Establecer el acceso del usuario en la base de datos
            setAcceso(session.info, session.acceso);
        } catch (error) {
            setModalMsg("Error en el acceso del sistema, favor de intentarlo mas tarde");
            OpenCloseError();
        }
    }

    // Mostrar/Ocultar contraseña
    function verPass(){
        switch(viewPass){
            case "password":
                setViewPas("text");
                break;
            case "text":
                setViewPas("password");
                break;
        }
    }

    // Funcion para evitar la muestra del menu contextual presionando el clic derecho
    function contextMenu(evento){
        evento.preventDefault()
        setModalMsg("Error: Accion no valida");
        OpenCloseError();
    }

    return(
        <div className={estilosEspe.Auth_form_container} onContextMenu={contextMenu}>
            <form className={estilosEspe.Auth_form} onSubmit={veriForm}>
                <div className={estilosEspe.Auth_form_content}>
                    <h3 className={estilosEspe.Auth_form_title}> Acceder </h3>
                    <div className="form-group mt-3">
                        <label className={estilosEspe.label_titulo}> Direccion de Correo: </label>
                        <input type="email" name="correo" className="form-control mt-1" placeholder="Ingrese su Correo..." ref={userRef} />
                    </div>
                    <div className="form-group mt-3">
                        <label className={estilosEspe.label_titulo}> Contraseña: </label>
                        <div className="input-group mb-3">
                            <input type={viewPass} name="contra" className="form-control" placeholder="Ingrese su Contraseña..." ref={passRef} />
                            <div className="input-group-append">
                                <span className="input-group-text" onClick={verPass}>
                                    {(viewPass === "password")? <Eye id="ojo_abierto" /> : <EyeOff id="ojo_cerrado" />}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="form-group d-grid gap-2 mt-3">
                        <Button color="primary" onClick={veriForm} type="submit">
                            <span>Acceder</span>
                        </Button>
                    </div>
                    <div className="form-group mt-2">
                        <RecuperContra/>
                    </div>
                </div>
            </form>
            <div id="ModalError">
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
            </div>
            <div id="ModalAdvice">
                <Modal isOpen={modalAdv} toggle={OpenCloseAvisos}>
                    <ModalHeader toggle={OpenCloseAvisos}>
                        Bienvenido <AlertCircle color="blue" size={30} />
                    </ModalHeader>
                    <ModalBody>
                        <Alert color="success">
                            {modalMsg}
                        </Alert>
                    </ModalBody>
                </Modal>
            </div>
        </div>
    );

    // Seccion de funciones asincronas
    /** Funcion de busqueda de usuario en la base de datos
     * @param {string} dirEma Direccion de Correo del Usuario
     * @param {string} usPass Contraseña del Usuario */
    async function buscarUsuario(dirEma, usPass){
        try {
            const consulta = await axios.post('http://localhost/Proyectos_Propios/BuildContiBack/index.php',{
                tipo_consulta: 'buscarUsuario',
                correo: dirEma,
                contra: usPass
            },{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Una vez que el usuario fue encontrado en la base de datos se procedera con el acceso
            if(consulta.data == "Usuario Encontrado")
                acceder("user", dirEma, usPass.length)
        } catch (error) {
            // Si ocurrio un error en la peticion de busqueda se mostrará aqui
            if (error.response) {
                // Primer caso, el servidor no encontro el usuario con los datos ingresados (Error contemplado)
                setModalMsg("Error: Acceso Denegado, revise su información");
            } else if (error.request) {
                // Segundo caso, el cliente no se pudo contactar con el servidor o este no respondio (Error controlado)
                setModalMsg("Error: Servicio no disponible Caso 1, favor de intentar mas tarde");
            } else {
                // Tercer caso, ocurrio un error en la disponibilidad de la respuesta del servidor (Error no contemplado y desconocido)
                setModalMsg("Error: Servicio no disponible Caso 2, favor de intentar mas tarde");
            }
            OpenCloseError();
        }
    }

    /** Funcion para actualizar el ultimo acceso del usuario en la BD y darle paso al sistema o rechazarlo si no funciono
     * @param {string} email Direccion de correo para establecer el acceso
     * @param {string} fechAcc Fecha del cliente en su ultimo acceso */
    async function setAcceso(email, fechAcc){
        try {
            const consulta = await axios.post('http://localhost/Proyectos_Propios/BuildContiBack/index.php',{
                tipo_consulta: 'addLastAccess',
                emaUser: email,
                ultimoAcceso: fechAcc
            },{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Si el servidor actualizo con exito el ultimo acceso, se interpreta que no hubo problemas y se le da paso al sistema al usuario
            if(consulta.data == "Ultimo acceso actualizado con exito"){
                setModalMsg('Bienvenid@ a Building Continuity');
                OpenCloseAvisos();
                setTimeout(() => (navegar.push('/pages/graphics')), 2000);
            }
        } catch (error) {
            // Primer caso, posibles resultados erroneos de la actualizacion del acceso
            if(error.response){
                if(codigo == 421){
                    // Error: La peticion no fue procesada
                    setModalMsg("Ocurrio un error al acceder al sistema, favor de intentarlo después");
                }else if(codigo == 402){
                    // Error: El usuario no fue encontrado
                    setModalMsg("Ocurrio un error al acceder al sistema, favor de intentarlo después");
                }else if(codigo == 408){
                    // Error: El acceso no fue actualizado
                    setModalMsg("Ocurrio un error al acceder al sistema, favor de intentarlo después");
                }else if(codigo == 418){
                    // Error: La peticion no fue encontrada (default del switch en el server)
                    setModalMsg("Ocurrio un error al acceder al sistema, favor de intentarlo después");
                }
            }else if(error.request){
                // Segundo caso, el cliente no se pudo contactar con el servidor o este no respondio (Error controlado)
                setModalMsg("Error de Acceso: Servicio no disponible, favor de intentar mas tarde");
            }else{
                // Tercer caso, ocurrio un error en la disponibilidad de la respuesta del servidor (Error no contemplado y desconocido)
                setModalMsg("Error: Ocurrio un error durante su petición, favor de intentar mas tarde");
            }
            // Mostrar el modal de errores
            OpenCloseError();
        }
    }
}

/**Funcion para formatear las fechas
 * @returns {string} Fecha Formateada en cadena de texto a YYYY-MM-DD hh:mm:ss */
function getFecha(){
    const fecha = new Date();
    let dia="", mes="", hora="", min="", seg="";
    
    // Agregar un cero por si el dia tiene solo un digito
    if(fecha.getDate().toString().length === 1)
        dia = "0" + fecha.getDate().toString();
    else
        dia = fecha.getDate();
    // Agregar un cero por si el mes tiene un solo digito
    if((fecha.getMonth() + 1).toString().length === 1)
        mes = "0" + (fecha.getMonth() + 1).toString();
    else
        mes = fecha.getMonth() + 1;
    // Agregar un cero por si la hora solo tiene un digito
    if(fecha.getHours().toString().length === 1)
        hora = "0" + fecha.getHours().toString();
    else    
        hora = fecha.getHours();
    // Agregar un cero por si el minuto tiene un solo digito
    if(fecha.getMinutes().toString().length === 1)
        min = "0" + fecha.getMinutes().toString();
    else
        min = fecha.getMinutes();
    // Agregar un cero por si el segundo tiene un solo digito
    if(fecha.getSeconds().toString().length === 1)
        seg = "0" + fecha.getSeconds().toString();
    else
        seg = fecha.getSeconds();
    // Formato de retorno: YYYY-MM-DD hh:mm:ss
    return(`${fecha.getFullYear()}-${mes}-${dia} ${hora}:${min}:${seg}`);
}