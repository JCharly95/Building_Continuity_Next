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
    const [modalErrMsg, setModalErrMsg] = useState("Hubo un problema al registrar el sensor");
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
        // Prevenir el envio por defecto
        evento.preventDefault();
        // Obteniendo la respuesta de la validacion de los campos
        let valiCamposResp = validarCampos(`${idRef.current.value}`, `${nomRef.current.value}`, `${apePRef.current.value}`, `${apeMRef.current.value}`, `${emaRef.current.value}`);
        // Posicion 0: objeto de respuesta del correo, posicion 1: objeto de respuesta de la contraseña
    }

    return(
        <h1>Esta es la pagina de recuperacion de la contraseña</h1>
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
        // Validacion de campos; Parte 2: Evaluacion del nombre
        // Validacion de campos; Parte 2.1: Evaluacion de contenido del campo
        if(!codUsuario){
            respCodUs.condicion = 2;
            respCodUs.mensaje = "Error: No se ingreso el codigo de usuario, favor de ingresarlo";
        }else{
            // Validacion de campos; Parte 2.2: Busqueda de espacios en el codigo de usuario
            const codUsLimp = codUsLimp.replace(expreEspa, "");
            if(codUsLimp.length == 0){
                respCodUs.condicion = 2;
                respCodUs.mensaje = "Error: No se ingreso el codigo correcto, favor de ingresarlo";
            }else{
                // Validacion de campos; Parte 2.3: Busqueda de caracteres de agrupacion en el codigo
                if(codUsLimp.includes("(") || codUsLimp.includes(")") || codUsLimp.includes("()") || codUsLimp.includes("{") || codUsLimp.includes("}") || codUsLimp.includes("{}") || codUsLimp.includes("[") || codUsLimp.includes("]") || codUsLimp.includes("[]")){
                    respCodUs.condicion = 2;
                    respCodUs.mensaje = "Error: Codigo de usuario invalido";
                }else{
                    // Validacion de campos; Parte 2.4: Evaluacion de la estructura del codigo de usuario (cmp con RegeExp)
                    if(expreRegCod.test(codUsLimp)){
                        respCodUs.condicion = 1;
                        respCodUs.mensaje = "Direccion Aceptada";
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
                            respCodUs.mensaje = "Codigo de Usuario Sanitizado Aceptado";
                        }else{
                            respCodUs.condicion = 2;
                            respCodUs.mensaje = "Error: Su codigo de correo no es valido, favor de revisarlo";
                        }
                    }
                }
            }
        }
        // Validacion de campos; Parte 3: Evaluacion del nombre
        if(!nomPersona){
            setModalErrMsg("Error: Favor de ingresar su nombre");
        }
        // Validacion de campos; Parte 4: Evaluacion del nombre
        if(!apePatPersona){
            setModalErrMsg("Error: Favor de ingresar su primer apellido");
        }
        // Validacion de campos; Parte 5: Evaluacion del nombre
        if(!apeMatPersona){
            setModalErrMsg("Error: Favor de ingresar su segundo apellido");
        }
        // Validacion de campos; Parte 6: Evaluacion del nombre
        if(!dirEma){
            setModalErrMsg("Error: Favor de ingresar su direccion de correo");
        }
    }

    return [respCodUs, respNomPer, respApePat, respApeMat, respDirEma];
}