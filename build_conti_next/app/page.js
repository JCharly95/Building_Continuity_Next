'use client';
import axios from 'axios';
import estilosGen from './page.module.css';
import estilosEspe from './page.module.css';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import RecuperContra from './components/recoverPass/page';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, ModalHeader, ModalBody, Alert } from 'reactstrap';
import { AlertTriangle, AlertCircle, Eye, EyeOff } from 'react-feather';

export default function LoginPage(){
    // Banderas de verificacion de los campos
    let busUserBD= false, busContraBD= false, namUser="";
    // Variable de estado para la obtencion de la navegacion y redireccionamiento usando el react-router
    const navegar = useRouter();
    // Variable de estado para mostrar el campo de la contraseña
    const [viewPass, setViewPas] = useState("password")
    // Variable de estado para la obtencion de los usuarios en la BD con axios
    const [usersBD, setUsersBD] = useState([1]);
    // Variable de estado para la apertura o cierre del modal de aviso de errores
    const [modalError, setModalError] = useState(false);
    // Variable de estado para la apertura o cierre del modal de avisos
    const [modalAdv, setModalAdv] = useState(false);
    // Variable de estado para el establecimiento del mensaje contenido en el modal de errores
    const [modalMsg, setModalMsg] = useState("Hubo un problema al intentar acceder");
    // Variables de referencia para la obtencion de valores de los campos del login
    const userRef = useRef(null);
    const passRef = useRef(null);
    // Arreglo que almacenara los valores ordenados de la consulta obtenida por axios
    const usersArr = [];

    // Obtener a los usuarios de la BD usando una consulta get con axios
    useEffect(() => {
        const obteInfoUser = async (estado) => {
            try {
                const peticion = await axios.get('https://app.buildingcontinuity.com.mx/php/data.php?tipo_consulta=usuarios');
                estado(peticion.data);
            } catch (error) {
                console.log("Ocurrio un error en la información");
            }
        }
        obteInfoUser(setUsersBD);
    }, []);

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
    function OpenCloseError() {
        setModalError(!modalError);
    }

    // Abrir/Cerrar modal de avisos
    function OpenCloseAvisos() {
        setModalAdv(!modalAdv);
    }

    // Pasar el resultado de la consulta axios a un arreglo para operar con la informacion
    usersBD.map((usuario) => (
        usersArr.push({
            user: `${usuario.Correo}`,
            contra: `${usuario.Contra}`,
            nombre: `${usuario.Nombre}`
        })
    ));

    // Verificacion de envio del formulario de acceso
    function veriForm(evento) {
        // Evitar lanzar el formulario por defecto
        evento.preventDefault();
        // Obteniendo la respuesta de la validacion de los campos
        let valiCamposResp = valiCampos(`${userRef.current.value}`,`${passRef.current.value}`);
        // Posicion 0: objeto de respuesta del correo, posicion 1: objeto de respuesta de la contraseña
        // Solo si la condicion fue evaluada, se retorno como 1 y se obtuvo un mensaje de aviso satisfactorio se procedera como un aviso regular
        if(((valiCamposResp[0].condicion == 1) && (valiCamposResp[0].mensaje.includes("Direccion Aceptada"))) && ((valiCamposResp[1].condicion == 1) && (valiCamposResp[1].mensaje.includes("Contraseña Aceptada")))){
            // Si se validaron de manera efectiva los datos, se busca el usuario en el arreglo de valores de la BD
            usersArr.map((userBus) => {
                if((userBus.user === `${userRef.current.value}`) && (userBus.contra === `${passRef.current.value}`)){
                    busUserBD = true;
                    namUser = userBus.nombre;
                    busContraBD = true;
                }
                return 0;
            });
            redireccionar();
        }else{
            // Si ambos campos arrojaron un error se concateneran los avisos retornados
            if((valiCamposResp[0].condicion == 2) && (valiCamposResp[1].condicion == 2)){
                setModalError(valiCamposResp[0].mensaje+"\n"+valiCamposResp[1].mensaje);
            }
            // Si no, se cargara el resultado de los mismos de forma independiente
            if(valiCamposResp[0].condicion == 2){
                setModalError(valiCamposResp[0].mensaje);
            }
            if(valiCamposResp[1].condicion == 2){
                setModalError(valiCamposResp[1].mensaje);
            }
            // Y se abrira el modal de errores
            OpenCloseError();
        }
    }

    // Funcion de redireccionamiento acorde a la validacion de campos del formulario
    function redireccionar() {
        if(busUserBD && busContraBD){
            acceder("user", `${userRef.current.value}`);
            setModalMsg(`Bienvenido ${namUser}`);
            OpenCloseAvisos();
            setTimeout(() => (navegar.push('/pages/graphics')), 2000);
        }
        else{
            // Caso: Usuario no encontrado
            if(!busUserBD){
                setModalMsg("Error: Usuario no encontrado");
                AbrCerrError();
            }
            // Caso: Usuario encontrado pero contraseña invalida
            if(busUserBD && !busContraBD){
                setModalMsg("Error: La contraseña es incorrecta");
                AbrCerrError();
            }
        }
    }

    // Si el usuario se logueo de manera satisfactoria se crea un elemento de localStorage para su navegacion
    function acceder(clave, user) {
        const fechLastAcc = new Date();
        const session = {
            info: user,
            nameUs: namUser,
            passLen: `${passRef.current.value}`.length,
            acceso : fechLastAcc
        }
        localStorage.setItem(clave, JSON.stringify(session))
        // Agregar el acceso a la base de datos; Preparar el paquete de informacion de XMLRequest
        let infoCaptu = new FormData();
        infoCaptu.append('emaUser', user);
        infoCaptu.append('ultimoAcceso', getFecha(fechLastAcc));
        // Este sera el formato a usar de axios para todas las consultas que alteren la base de datos
        axios({
            method: 'post',
            url: 'https://app.buildingcontinuity.com.mx/php/data.php?tipo_consulta=addLastAccess',
            data: infoCaptu,
            config: { headers: {'Content-Type': 'multipart/form-data' }}
        });
    }

    // Mostrar/Ocultar contraseña
    function verPass(){
        if(viewPass === "password"){
            setViewPas("text")
        }

        if(viewPass === "text"){
            setViewPas("password")
        }
    }

    // Funcion para evitar la muestra del menu contextual presionando el clic derecho
    function contextMenu(evento){
        evento.preventDefault()
        setModalMsg("Error: Accion no valida");
        AbrCerrError();
    }

    return(
        <div className={estilosEspe.Auth_form_container} onContextMenu={contextMenu}>
            <form className={estilosGen.Auth_form} onSubmit={veriForm}>
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
                        <button type="submit" className="btn btn-primary" onClick={veriForm}> Acceder </button>
                    </div>
                    <div className="form-group mt-2">
                        <RecuperContra/>
                    </div>
                </div>
            </form>
            <div id="ModalError">
                <Modal isOpen={modalError} toggle={AbrCerrError}>
                    <ModalHeader toggle={AbrCerrError}>
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
                <Modal isOpen={modalAdv} toggle={AbrCerAdv}>
                    <ModalHeader toggle={AbrCerAdv}>
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
}

/** Funcion para validacion de los campos
 * @param {string} correo 
 * @param {string} contra 
 * @returns {[object]} */
function valiCampos(correo, contra){
    /*Posibles condiciones de respuesta:
    0: Retorno indefinido: la condicion no fue evaluada, por lo que es un error
    1: Retorno satisfactorio: condicion evaluada y retorna como aviso
    2: Retorno erroneo: condicion evaluada y se retorna como error*/
    // Objetos de respuesta
    let respCorreo = {
        'condicion': 0,
        'mensaje': ""
    }
    let respContra = {
        'condicion': 0,
        'mensaje': ""
    }
    // Expresion regular para correo
    const expreCorr = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/
    // Expresion regular para buscar espacios
    const expreEspa = /\s+/g
    // Expresiones regulares para la filtracion de inyecciones SQL
    // Buscar/remover comillas o punto y coma
    const exprePuntu = /(')|(;)|(';)/g
    // Buscar numero=numero o 1=1
    const expreIgual = /(\d=\d)|(=)/g
    // Expresion regular para remover consultas tipicas implementadas en SQL para inyecciones
    const expreQueSQL = /(SELECT)|(Select)|(select)|(UNION)|(Union)|(union)|(FROM)|(From)|(from)|(JOIN)|(Join)|(join)|(PASSWORD)|(Password)|(password)|(PASS)|(Pass)|(pass)|(PASSWD)|(Passwd)|(passwd)|(DROP)|(Drop)|(drop)|(TABLE)|(Table)|(table)|(DELETE)|(Delete)|(delete)|(INSERT)|(Insert)|(insert)|(UPDATE)|(Update)|(update)|(USERS)|(Users)|(users)|(DATABASE)|(Database)|(database)|(WHERE)|(Where)|(where)|(AND)|(And)|(and)|(OR)|(Or)|(or)|(INNER)|(Inner)|(inner)|(LEFT)|(Left)|(left)|(RIGHT)|(Right)|(right)/g

    // Validacion de campos; Parte 1: Evaluacion de campos vacios
    if(!correo && !contra){
        respCorreo.condicion = 2;
        respCorreo.mensaje = "Error: No se ingreso información, favor de ingresarla";
        respContra.condicion = 2;
        respContra.mensaje = "Error: No se ingreso información, favor de ingresarla";
    }else{
        // Validacion de campos; Parte 2: Evaluacion de direccion de correo
        // Validacion de campos; Parte 2.1: Evaluacion de contenido del campo
        if(!correo){
            respCorreo.condicion = 2;
            respCorreo.mensaje = "Error: Favor de ingresar su dirección de correo";
        }else{
            // Validacion de campos; Parte 2.2: Busqueda de espacios en la direccion de correo
            if(expreEspa.test(correo)){
                respCorreo.condicion = 2;
                respCorreo.mensaje = "Error: Dirección de correo invalida";
            }else{
                // Validacion de campos; Parte 2.3: Busqueda de caracteres de agrupacion en la direccion de correo
                if(correo.includes("(") || correo.includes(")") || correo.includes("()") || correo.includes("{") || correo.includes("}") || correo.includes("{}") || correo.includes("[") || correo.includes("]") || correo.includes("[]")){
                    respCorreo.condicion = 2;
                    respCorreo.mensaje = "Error: Dirección de correo invalida";
                }else{
                    // Validacion de campos; Parte 2.4: Evaluacion de la estructura de la dirección (cmp con RegeExp)
                    if(expreCorr.test(correo)){
                        respCorreo.condicion = 1;
                        respCorreo.mensaje = "Direccion Aceptada";
                    }else{
                        /* Si no se valido correctamente el correo, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procedera con la sanitizacion, validacion y posterior evaluacion de la direccion*/
                        // Validacion de campos; Parte 2.4.1: Sanitizacion de comillas y punto/coma
                        if(exprePuntu.test(correo)){
                            correo=correo.replace(exprePuntu, "");
                        }
                        // Validacion de campos; Parte 2.4.2: Sanitizacion de igualdades
                        if(expreIgual.test(correo)){
                            correo=correo.replace(expreIgual, "");
                        }
                        // Validacion de campos; Parte 2.4.3: Sanitizacion de palabras reservadas SQL
                        if(expreQueSQL.test(correo)){
                            correo=correo.replace(expreQueSQL, "");
                        }
                        // Validacion de campos; Parte 2.4.4: Reevaluación de la direccion de correo
                        if(expreCorr.test(correo)){
                            respCorreo.condicion = 1;
                            respCorreo.mensaje = "Direccion Sanitizada Aceptada";
                        }else{
                            respCorreo.condicion = 2;
                            respCorreo.mensaje = "Error: Su dirección de correo no es valida, favor de revisarla";
                        }
                    }
                }
            }
        }

        // Validacion de campos; Parte 3: Evaluacion de contraseña
        // Validacion de campos; Parte 3.1: Evaluacion de contenido del campo
        if(!contra){
            respContra.condicion = 2;
            respContra.mensaje = "Error: Favor de ingresar su contraseña";
        }else{
            // Validacion de campos; Parte 3.2: Evaluacion de espacios
            contra = contra.replace(expreEspa, "");
            // Si se borraron todos los espacios y el campo se quedo vacio se mandara un error
            if(contra.length === 0 || contra === ""){
                respContra.condicion = 2;
                respContra.mensaje = "Error: Contraseña incorrecta";
            }else{
                // Validacion de campos; Parte 3.3: Busqueda de mayusculas
                if(!/[A-Z]/g.test(contra)){
                    respContra.condicion = 2;
                    respContra.mensaje = "Error: Favor de revisar el contenido de su contraseña";
                }else{
                    // Validacion de campos; Parte 3.4: Busqueda de numeros
                    if(!/\d/g.test(contra)){
                        respContra.condicion = 2;
                        respContra.mensaje = "Error: Favor de revisar el contenido de su contraseña";
                    }else{
                        // Validacion de campos; Parte 3.5: Busqueda de caracteres especiales
                        if(!/\W/g.test(contra)){
                            respContra.condicion = 2;
                            respContra.mensaje = "Error: Favor de revisar el contenido de su contraseña";
                        }else{
                            /* Dado que la contraseñas son mas dificiles de evaluar, porque no hay una expresion regular establecida, de igual manera se les realizara el proceso de sanitizacion de elementos.
                            Por consiguiente, las contraseñas no podran incluir los siguientes caracteres: ' ; =
                            Ademas, a diferencia del correo, en este caso se procedera directo con una sanitizacion y posterior evaluacion.*/
                            // Validacion de campos; Parte 3.6.1: Sanitizacion de comillas y punto/coma
                            if(exprePuntu.test(contra)){
                                contra=contra.replace(contra, "");
                            }
                            // Validacion de campos; Parte 3.6.2: Sanitizacion de igualdades
                            if(expreIgual.test(contra)){
                                contra=contra.replace(expreIgual, "");
                            }
                            // Validacion de campos; Parte 3.6.3: Sanitizacion de palabras reservadas SQL
                            if(expreQueSQL.test(contra)){
                                contra=contra.replace(expreQueSQL, "");
                                respContra.condicion = 1;
                                respContra.mensaje = "Contraseña Sanitizada Aceptada";
                            }else{
                                respContra.condicion = 1;
                                respContra.mensaje = "Contraseña Aceptada";
                            }
                        }
                    }
                }
            }
        }
    }
    return [respCorreo, respContra];
}

/**Funcion para formatear las fechas
 * @param {string} fechTransform 
 * @returns {string} */
function getFecha(fechTransform){
    let fecha, dia="", mes="", hora="", min="", seg="";
    fecha = new Date(fechTransform)

    // Agregar un cero por si el dia tiene solo un digito
    if(fecha.getDate().toString().length === 1)
        dia="0"+fecha.getDate().toString()
    else
        dia=fecha.getDate()
    // Agregar un cero por si el mes tiene un solo digito
    if(fecha.getMonth().toString().length === 1)
        mes="0"+fecha.getMonth().toString()
    else
        mes=fecha.getMonth()
    // Agregar un cero por si la hora solo tiene un digito
    if(fecha.getHours().toString().length === 1)
        hora="0"+fecha.getHours().toString()
    else    
        hora=fecha.getHours()
    // Agregar un cero por si el minuto tiene un solo digito
    if(fecha.getMinutes().toString().length === 1)
        min="0"+fecha.getMinutes().toString()
    else
        min=fecha.getMinutes()
    // Agregar un cero por si el segundo tiene un solo digito
    if(fecha.getSeconds().toString().length === 1)
        seg="0"+fecha.getSeconds().toString()
    else
        seg=fecha.getSeconds()
    // Formato de retorno: YYYY-MM-DD hh:mm:ss
    return(`${fecha.getFullYear()}/${mes}/${dia} ${hora}:${min}:${seg}`);
}