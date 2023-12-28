'use client';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AlertTriangle } from 'react-feather';
import React, { useState, useEffect , useRef } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';

export default function RecuPassPage(){
    // Variable de estado para la obtencion de los usuarios en la BD con axios
    const [usersBD, setUsersBD] = useState([]);
    // Constante de estado para establecer la apertura o cierre del modal
    const [modal, setModal] = useState(false);
    const [modalError, setModalError] = useState(false);
    const [modalErrMsg, setModalErrMsg] = useState("");
    // Variables de referencia para obtener los campos de informacion: IDUser, Nombre, ApePat, ApeMat, Correo
    const idRef = useRef(null);
    const nomRef = useRef(null);
    const apePRef = useRef(null);
    const apeMRef = useRef(null);
    const emaRef = useRef(null);
    // Bandera de busqueda de usuario
    let busUser = false;
    
    //-------------------------Peticion con Axios para obtener la informacion--------------------------------------
    // Obtener a los usuarios de la BD usando una consulta get con axios
    useEffect(() => {
        const obteInfo = async (estado) => {
            try {
                const peticion = await axios.get('https://app.buildingcontinuity.com.mx/php/data.php?tipo_consulta=usuarios');
                estado(peticion.data);
            } catch (error) {
                console.log("Error en los datos");
            }
        }
        obteInfo(setUsersBD);
    }, []);
    //-------------------------------------------------------------------------------------------------------------

    // Abrir/Cerrar el modal
    function OpenCloseModal() {
        setModal(!modal);
    }

    // Abrir/Cerrar modal de errores
    function OpenCloseError() {
        setModalError(!modalError);
    }

    // Verificacion del formulario
    function valiForm(evento){
        // Bandera de deteccion de error
        let errorBande = false;
        // Prevenir el envio por defecto
        evento.preventDefault();
        // Obteniendo la respuesta de la validacion de los campos
        let valiCamposResp = validarCampos(`${idRef.current.value}`, `${nomRef.current.value}`, `${apePRef.current.value}`, `${apeMRef.current.value}`, `${emaRef.current.value}`);
        /*  Posicion 0: objeto de respuesta del codigo, 
            posicion 1: objeto de respuesta del nombre, 
            posicion 2: objeto de respuesta del apellido paterno, 
            posicion 3: objeto de respuesta del apellido materno, 
            posicion 4: objeto de respuesta del correo 
        Busqueda de errores retornados*/
        for (let contResp = 0; contResp < valiCamposResp.length; contResp++) {
            const elemento = valiCamposResp[contResp];
            // Si se retorno un error, se ira acumulando en el mensaje de error y luego se mostrara
            if(elemento.condicion == 0 || elemento.condicion == 2){
                if(modalErrMsg.length == 0){
                    setModalErrMsg(elemento.mensaje);
                }else{
                    setModalErrMsg(modalErrMsg + "\n" + elemento.mensaje);
                }
                // Si se detecto un error se avisara
                errorBande = true;
            }
        }

        // Si la bandera de errores no fue activada, se entiende que todos los campos se validaron adecuadamente y se comienza con la busqueda
        if(!errorBande){
            // Elementos ingresados en el formulario
            let codIngre =`${idRef.current.value}`, nombreIngre =`${nomRef.current.value}`, apePatIngre =`${apePRef.current.value}`, apeMatIngre =`${apeMRef.current.value}`, correoIngre =`${emaRef.current.value}`;
            // Busqueda del usuario en el arreglo de elementos
            usersBD.forEach(function(usuario){
                // Obteniendo los valores almacenados para comparar
                let codigo = `${usuario.Cod_User}`, nombre =`${usuario.Nombre}`, apePat =`${usuario.Ape_Pat}`, apeMat =`${usuario.Ape_Mat}`, correo =`${usuario.Correo}`;
                // Si y solo si todos los valores ingresados coinciden es cuando se mandara el correo
                if(codIngre === codigo){
                    if(nombre === nombreIngre){
                        if(apePat === apePatIngre){
                            if(apeMat === apeMatIngre){
                                if(correo === correoIngre){
                                    busUser = true;
                                }
                            }
                        }
                    }
                }
            });
            // Como ya se encontro el usuario en los registros, se procedera con el proceso pero ahora del lado del servidor
            if(busUser){
                // Preparar el paquete de informacion de XMLRequest para el servidor
                let infoCaptuRecPass = new FormData();
                infoCaptuRecPass.append('codigo', `${idRef.current.value}`);
                infoCaptuRecPass.append('correo', `${emaRef.current.value}`);
                // Este sera el formato a usar de axios para todas las consultas que alteren la base de datos, pero para diferenciarlos, el endpoint de la consulta (la URL) cambiara con la variable tipo_consulta, donde se colocara la direccion del metodo a usar. NOTA: Para hacer esto ultimo, se deberan generar las respectivas consultas en el archivo PHP del servidor, en este caso es data3
                axios({
                    method: 'post',
                    url: 'https://app.buildingcontinuity.com.mx/php/data.php?tipo_consulta=recPass',
                    data: infoCaptuRecPass,
                    config: { headers: {'Content-Type': 'multipart/form-data' }}
                }).then(() => {
                    alert("Aviso: El correo fue enviado a su direccion de correo satisfactoriamente");
                }).catch(function (error){
                    if(error.response.status === 400){
                        // Este es un error controlado, si la informacion proporcionada no arrojo registros de la BD, se lanzará este error
                        alert("Error: Informacion no encontrada");
                    }
                    if(error.response.status === 402){
                        // Este es un error controlado, si el servidor no pudo enviar el correo se regresará este error.
                        alert("Error: Ocurrio un problema en el envio del correo");
                    }
                });
            }else{
                // Si no, es porque algun valor esta incorrecto o no coincide con los registros por lo que no se puede continuar con el proceso
                setModalErrMsg("Error: Favor de revisar la informacion ingresada");
                OpenCloseError();
            }
        }else{
            // Si la bandera de error se activo, se mostrara el banner de errores
            OpenCloseError();
        }
    }

    return(
        <div className="container-fluid">
            <div className="text-center">
                <Button color="secondary" onClick={OpenCloseModal} type="button">
                    <span>Recuperar Contraseña</span>
                </Button>
            </div>
            <Modal isOpen={modal} toggle={OpenCloseModal}>
                <ModalHeader toggle={OpenCloseModal}>
                    Recuperación de Contraseña
                </ModalHeader>
                <ModalBody>
                <form onSubmit={valiForm}>
                    <div className='col-md-12'>
                        <div className="row justify-content-center">
                            <div className='col-md-12'>
                                <div id="txtAdvice" className="form-control" name="areaAviso" style={{resize: "none", border: "none", textAlign:"justify"}}>
                                <label className="col-form-label">Disclaimer:</label><br/>
                                    Con el propósito de asegurar que es el usuario en cuestión quien realmente quiere recuperar su 
                                    contraseña.<br/>Serán solicitados sus datos personales. (Se recomienda discreción)
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center">
                            <div className='col-md-10 offset-md-1'>
                                <label htmlFor="id-usuario" className="col-form-label">Codigo de Usuario:</label>
                                <input type="text" className="form-control" ref={idRef} id="id-usuario" name="idUser" />
                            </div>
                            <div className='col-md-1' />
                        </div>
                        <div className="row justify-content-center">
                            <div className='col-md-10 offset-md-1'>
                                <label htmlFor="nombre-usuario" className="col-form-label">Nombre:</label>
                                <input type="text" className="form-control" ref={nomRef} id="nombre-usuario" name="nombre" />
                            </div>
                            <div className='col-md-1' />
                        </div>
                        <div className="row justify-content-center">
                            <div className='col-md-10 offset-md-1'>
                                <label htmlFor="ape-paterno" className="col-form-label">Primer Apellido:</label>
                                <input type="text" className="form-control" ref={apePRef} id="ape-paterno" name="apePat" />
                            </div>
                            <div className='col-md-1' />
                        </div>
                        <div className="row justify-content-center">
                            <div className='col-md-10 offset-md-1'>
                                <label htmlFor="ape-materno" className="col-form-label">Segundo Apellido:</label>
                                <input type="text" className="form-control" ref={apeMRef} id="ape-materno" name="apeMat" />
                            </div>
                            <div className='col-md-1' />
                        </div>
                        <div className="row justify-content-center">
                            <div className='col-md-10 offset-md-1'>
                                <label htmlFor="dir-correo" className="col-form-label">Correo:</label>
                                <input type="text" className="form-control" ref={emaRef} id="dir-correo" name="correo" />
                            </div>
                            <div className='col-md-1' />
                        </div>
                    </div>
                </form>
                </ModalBody>
                <ModalFooter>
                    <div className='col-md-12'>
                        <div className="row justify-content-center">
                            <div className='col-md-4 offset-md-1'>
                                <Button color="success" className="form-control" type="submit" onClick={valiForm}>Enviar Correo</Button>
                            </div>
                            <div className='col-md-4 offset-md-1'>
                                <Button color="danger" className="form-control" onClick={OpenCloseModal}>Cancelar</Button>
                            </div>
                            <div className='col-md-1' />
                        </div>
                    </div>
                </ModalFooter>
                <div id="ModalError">
                    <Modal isOpen={modalError} toggle={OpenCloseError}>
                        <ModalHeader toggle={OpenCloseError}>
                            Error <AlertTriangle color="red" size={30} />
                        </ModalHeader>
                        <ModalBody>
                            <Alert color="danger">
                                {modalErrMsg}
                            </Alert>
                        </ModalBody>
                    </Modal>
                </div>
            </Modal>
        </div>
    );
}

/** Funcion para validacion de los campos
 * @param {string} codUsuario 
 * @param {string} nomPersona 
 * @param {string} apePatPersona 
 * @param {string} apeMatPersona 
 * @param {string} dirEma 
 * @returns {[object]} */
function validarCampos(codUsuario, nomPersona, apePatPersona, apeMatPersona, dirEma){
    /*Posibles condiciones de respuesta:
    0: Retorno indefinido: la condicion no fue evaluada, por lo que es un error
    1: Retorno satisfactorio: condicion evaluada y retorna como aviso
    2: Retorno erroneo: condicion evaluada y se retorna como error*/
    // Objetos de respuesta
    let respCodUs = {
        'condicion': 0,
        'mensaje': ""
    }
    let respNomPer = {
        'condicion': 0,
        'mensaje': ""
    }
    let respApePat = {
        'condicion': 0,
        'mensaje': ""
    }
    let respApeMat = {
        'condicion': 0,
        'mensaje': ""
    }
    let respDirEma = {
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
    // Expresion regular para evaluar el formato del codigo de usuario: acroPais-Codigo 4 digitos; por ejemplo: MX-2060
    const expreRegCod = /[A-Z]{2}[-]?[\d]{4}/
    /* Expresion regular para evaluar el nombre completo
    const expreNomComple = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+){1,5}(?:\s+[-\sa-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)?$/ */
    const expreNomElems = /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+/
    
    // Validacion de campos; Parte 1: Evaluacion de campos vacios (todos)
    if(!codUsuario && !nomPersona && !apePatPersona && !apeMatPersona && !dirEma){
        respCodUs.condicion = 2;
        respCodUs.mensaje = "Error: No se ingreso información, favor de ingresarla";
        respNomPer.condicion = 2;
        respNomPer.mensaje = "Error: No se ingreso información, favor de ingresarla";
        respApePat.condicion = 2;
        respApePat.mensaje = "Error: No se ingreso información, favor de ingresarla";
        respApeMat.condicion = 2;
        respApeMat.mensaje = "Error: No se ingreso información, favor de ingresarla";
        respDirEma.condicion = 2;
        respDirEma.mensaje = "Error: No se ingreso información, favor de ingresarla";
    }else{
        // Validacion de campos; Parte 2: Evaluacion del codigo de usuario y Parte 2.1: Evaluacion de contenido del campo
        if(!codUsuario){
            respCodUs.condicion = 2;
            respCodUs.mensaje = "Error: No se ingreso el codigo de usuario, favor de ingresarlo";
        }else{
            // Validacion de campos; Parte 2.2: Busqueda de espacios en el codigo de usuario
            let codUsLimp = codUsLimp.replace(expreEspa, "");
            if(codUsLimp.length == 0){
                respCodUs.condicion = 2;
                respCodUs.mensaje = "Error: No se ingreso el codigo correcto, favor de ingresarlo";
            }else{
                // Validacion de campos; Parte 2.3: Busqueda de caracteres de agrupacion en el codigo
                if(codUsLimp.includes("(") || codUsLimp.includes(")") || codUsLimp.includes("()") || codUsLimp.includes("{") || codUsLimp.includes("}") || codUsLimp.includes("{}") || codUsLimp.includes("[") || codUsLimp.includes("]") || codUsLimp.includes("[]")){
                    respCodUs.condicion = 2;
                    respCodUs.mensaje = "Error: codigo de usuario invalido";
                }else{
                    // Validacion de campos; Parte 2.4: Evaluacion de la estructura del codigo de usuario (cmp con RegeExp)
                    if(expreRegCod.test(codUsLimp)){
                        respCodUs.condicion = 1;
                        respCodUs.mensaje = "codigo aceptado";
                    }else{
                        /* Si no se valido correctamente el codigo de usuario, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procedera con la sanitizacion, validacion y posterior evaluacion de la direccion*/
                        // Validacion de campos; Parte 2.4.1: Sanitizacion de comillas y punto/coma
                        if(exprePuntu.test(codUsLimp)){
                            codUsLimp=codUsLimp.replace(exprePuntu, "");
                        }
                        // Validacion de campos; Parte 2.4.2: Sanitizacion de igualdades
                        if(expreIgual.test(codUsLimp)){
                            codUsLimp=codUsLimp.replace(expreIgual, "");
                        }
                        // Validacion de campos; Parte 2.4.3: Sanitizacion de palabras reservadas SQL
                        if(expreQueSQL.test(codUsLimp)){
                            codUsLimp=codUsLimp.replace(expreQueSQL, "");
                        }
                        // Validacion de campos; Parte 2.4.4: Reevaluación del codigo de usuario
                        if(expreRegCod.test(codUsLimp)){
                            respCodUs.condicion = 1;
                            respCodUs.mensaje = "codigo de usuario sanitizado aceptado";
                        }else{
                            respCodUs.condicion = 2;
                            respCodUs.mensaje = "Error: Su codigo de correo no es valido, favor de revisarlo";
                        }
                    }
                }
            }
        }
        
        // Validacion de campos; Parte 3: Evaluacion del nombre y Parte 3.1: Evaluacion de contenido del campo
        if(!nomPersona){
            respNomPer.condicion = 2;
            respNomPer.mensaje = "Error: No se ingreso su nombre, favor de ingresarlo";
        }else{
            // Validacion de campos; Parte 3.2: Limpiando espacios antes y despues del nombre
            let nomPerLimp = nomPersona.trim();
            // Validacion de campos; Parte 3.3: Busqueda de caracteres de agrupacion en el codigo
            if(nomPerLimp.includes("(") || nomPerLimp.includes(")") || nomPerLimp.includes("()") || nomPerLimp.includes("{") || nomPerLimp.includes("}") || nomPerLimp.includes("{}") || nomPerLimp.includes("[") || nomPerLimp.includes("]") || nomPerLimp.includes("[]")){
                respNomPer.condicion = 2;
                respNomPer.mensaje = "Error: El nombre ingresado no es valido";
            }else{
                // Validacion de campos; Parte 3.4: Evaluacion de la estructura del nombre (cmp con RegeExp)
                if(expreNomElems.test(nomPerLimp)){
                    respNomPer.condicion = 1;
                    respNomPer.mensaje = "nombre aceptado";
                }else{
                    /* Si no se valido correctamente el nombre, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procedera con la sanitizacion, validacion y posterior evaluacion del nombre*/
                    // Validacion de campos; Parte 3.5.1: Sanitizacion de comillas y punto/coma
                    if(exprePuntu.test(nomPerLimp)){
                        nomPerLimp=nomPerLimp.replace(exprePuntu, "");
                    }
                    // Validacion de campos; Parte 3.5.2: Sanitizacion de igualdades
                    if(expreIgual.test(nomPerLimp)){
                        nomPerLimp=nomPerLimp.replace(expreIgual, "");
                    }
                    // Validacion de campos; Parte 3.5.3: Sanitizacion de palabras reservadas SQL
                    if(expreQueSQL.test(nomPerLimp)){
                        nomPerLimp=nomPerLimp.replace(expreQueSQL, "");
                    }
                    // Validacion de campos; Parte 3.5.4: Reevaluación del nombre
                    if(expreNomElems.test(nomPerLimp)){
                        respNomPer.condicion = 1;
                        respNomPer.mensaje = "nombre sanitizado aceptado";
                    }else{
                        respNomPer.condicion = 2;
                        respNomPer.mensaje = "Error: Su nombre no es valido, favor de revisarlo";
                    }
                }
            }
        }

        // Validacion de campos; Parte 4: Evaluacion del apellido paterno y Parte 4.1: Evaluacion de contenido del campo
        if(!apePatPersona){
            respApePat.condicion = 2;
            respApePat.mensaje = "Error: No se ingreso su apellido paterno, favor de ingresarlo";
        }else{
            // Validacion de campos; Parte 4.2: Limpiando espacios antes y despues del apellido paterno
            let apePatLimp = apePatPersona.trim();
            // Validacion de campos; Parte 4.3: Busqueda de caracteres de agrupacion en el apellido paterno
            if(apePatLimp.includes("(") || apePatLimp.includes(")") || apePatLimp.includes("()") || apePatLimp.includes("{") || apePatLimp.includes("}") || apePatLimp.includes("{}") || apePatLimp.includes("[") || apePatLimp.includes("]") || apePatLimp.includes("[]")){
                respApePat.condicion = 2;
                respApePat.mensaje = "Error: El apellido ingresado no es valido";
            }else{
                // Validacion de campos; Parte 4.4: Evaluacion de la estructura del apellido paterno (cmp con RegeExp)
                if(expreNomElems.test(apePatLimp)){
                    respApePat.condicion = 1;
                    respApePat.mensaje = "apellido paterno aceptado";
                }else{
                    /* Si no se valido correctamente el apellido paterno, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procedera con la sanitizacion, validacion y posterior evaluacion del apellido paterno*/
                    // Validacion de campos; Parte 4.5.1: Sanitizacion de comillas y punto/coma
                    if(exprePuntu.test(apePatLimp)){
                        apePatLimp=apePatLimp.replace(exprePuntu, "");
                    }
                    // Validacion de campos; Parte 4.5.2: Sanitizacion de igualdades
                    if(expreIgual.test(apePatLimp)){
                        apePatLimp=apePatLimp.replace(expreIgual, "");
                    }
                    // Validacion de campos; Parte 4.5.3: Sanitizacion de palabras reservadas SQL
                    if(expreQueSQL.test(apePatLimp)){
                        apePatLimp=apePatLimp.replace(expreQueSQL, "");
                    }
                    // Validacion de campos; Parte 4.5.4: Reevaluación del apellido paterno
                    if(expreNomElems.test(apePatLimp)){
                        respApePat.condicion = 1;
                        respApePat.mensaje = "apellido paterno sanitizado aceptado";
                    }else{
                        respApePat.condicion = 2;
                        respApePat.mensaje = "Error: Su apellido no es valido, favor de revisarlo";
                    }
                }
            }
        }

        // Validacion de campos; Parte 5: Evaluacion del apellido materno y Parte 5.1: Evaluacion de contenido del campo
        if(!apeMatPersona){
            respApeMat.condicion = 2;
            respApeMat.mensaje = "Error: No se ingreso su apellido materno, favor de ingresarlo";
        }else{
            // Validacion de campos; Parte 5.2: Limpiando espacios antes y despues del apellido materno
            let apeMatLimp = apeMatPersona.trim();
            // Validacion de campos; Parte 5.3: Busqueda de caracteres de agrupacion en el apellido materno
            if(apeMatLimp.includes("(") || apeMatLimp.includes(")") || apeMatLimp.includes("()") || apeMatLimp.includes("{") || apeMatLimp.includes("}") || apeMatLimp.includes("{}") || apeMatLimp.includes("[") || apeMatLimp.includes("]") || apeMatLimp.includes("[]")){
                respApeMat.condicion = 2;
                respApeMat.mensaje = "Error: El apellido ingresado no es valido";
            }else{
                // Validacion de campos; Parte 5.4: Evaluacion de la estructura del apellido materno (cmp con RegeExp)
                if(expreNomElems.test(apeMatLimp)){
                    respApeMat.condicion = 1;
                    respApeMat.mensaje = "apellido materno aceptado";
                }else{
                    /* Si no se valido correctamente el apellido materno, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procedera con la sanitizacion, validacion y posterior evaluacion del apellido materno*/
                    // Validacion de campos; Parte 5.5.1: Sanitizacion de comillas y punto/coma
                    if(exprePuntu.test(apeMatLimp)){
                        apeMatLimp=apeMatLimp.replace(exprePuntu, "");
                    }
                    // Validacion de campos; Parte 5.5.2: Sanitizacion de igualdades
                    if(expreIgual.test(apeMatLimp)){
                        apeMatLimp=apeMatLimp.replace(expreIgual, "");
                    }
                    // Validacion de campos; Parte 5.5.3: Sanitizacion de palabras reservadas SQL
                    if(expreQueSQL.test(apeMatLimp)){
                        apeMatLimp=apeMatLimp.replace(expreQueSQL, "");
                    }
                    // Validacion de campos; Parte 5.5.4: Reevaluación del apellido materno
                    if(expreNomElems.test(apeMatLimp)){
                        respApeMat.condicion = 1;
                        respApeMat.mensaje = "apellido materno sanitizado aceptado";
                    }else{
                        respApeMat.condicion = 2;
                        respApeMat.mensaje = "Error: Su apellido no es valido, favor de revisarlo";
                    }
                }
            }
        }

        // Validacion de campos; Parte 6: Evaluacion de direccion de correo y Parte 6.1: Evaluacion de contenido del campo
        if(!dirEma){
            respDirEma.condicion = 2;
            respDirEma.mensaje = "Error: Favor de ingresar su dirección de correo";
        }else{
            // Validacion de campos; Parte 2.2: Busqueda de espacios en la direccion de correo
            if(expreEspa.test(dirEma)){
                respDirEma.condicion = 2;
                respDirEma.mensaje = "Error: El correo ingresado no es valido";
            }else{
                // Validacion de campos; Parte 2.3: Busqueda de caracteres de agrupacion en la direccion de correo
                if(dirEma.includes("(") || dirEma.includes(")") || dirEma.includes("()") || dirEma.includes("{") || dirEma.includes("}") || dirEma.includes("{}") || dirEma.includes("[") || dirEma.includes("]") || dirEma.includes("[]")){
                    respDirEma.condicion = 2;
                    respDirEma.mensaje = "Error: El correo ingresado no es valido";
                }else{
                    // Validacion de campos; Parte 2.4: Evaluacion de la estructura de la dirección (cmp con RegeExp)
                    if(expreCorr.test(dirEma)){
                        respDirEma.condicion = 1;
                        respDirEma.mensaje = "correo aceptado";
                    }else{
                        /* Si no se valido correctamente el correo, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procedera con la sanitizacion, validacion y posterior evaluacion de la direccion*/
                        // Validacion de campos; Parte 2.4.1: Sanitizacion de comillas y punto/coma
                        if(exprePuntu.test(dirEma)){
                            dirEma=dirEma.replace(exprePuntu, "");
                        }
                        // Validacion de campos; Parte 2.4.2: Sanitizacion de igualdades
                        if(expreIgual.test(dirEma)){
                            dirEma=dirEma.replace(expreIgual, "");
                        }
                        // Validacion de campos; Parte 2.4.3: Sanitizacion de palabras reservadas SQL
                        if(expreQueSQL.test(dirEma)){
                            dirEma=dirEma.replace(expreQueSQL, "");
                        }
                        // Validacion de campos; Parte 2.4.4: Reevaluación de la direccion de correo
                        if(expreCorr.test(dirEma)){
                            respDirEma.condicion = 1;
                            respDirEma.mensaje = "correo sanitizado aceptado";
                        }else{
                            respDirEma.condicion = 2;
                            respDirEma.mensaje = "Error: Su dirección de correo no es valida, favor de revisarla";
                        }
                    }
                }
            }
        }
    }
    
    // Retornar un arreglo con todos los objetos de respuesta
    return [respCodUs, respNomPer, respApePat, respApeMat, respDirEma];
}