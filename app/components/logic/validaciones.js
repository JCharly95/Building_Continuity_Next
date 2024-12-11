// Seccion de expresiones regulares para sanitizacion o coincidencias
/** Expresion regular para buscar espacios */
const expreEspa = /\s+/gm;
// Expresiones regulares para la filtracion de inyecciones SQL
/** Expresion regular para buscar comillas simples o dobles ademas de punto y coma */
const exprePuntu = /(')|(")|(;)|(';)|(";)/gm;
/** Expresion regular para buscar numero=numero o 1=1 */
const expreIgual = /(\d=\d)|(=)/gm;
/** Expresion regular para buscar consultas tipicas implementadas en SQL para inyecciones */
const expreConsulSQL = /\b(SELECT|Select|select|UNION|Union|union|FROM|From|from|JOIN|Join|join|PASSWORD|Password|password|PASS|Pass|pass|PASSWD|Passwd|passwd|DROP|Drop|drop|TABLE|Table|table|DELETE|Delete|delete|INSERT|Insert|insert|UPDATE|Update|update|USERS|Users|users|DATABASE|Database|database|WHERE|Where|where|AND|And|and|OR|Or|or|INNER|Inner|inner|LEFT|Left|left|RIGHT|Right|right)\b/gm;
/** Expresion regular para buscar caracteres de agrupacion */
const expreAgruCar = /[\(\)\{\}\[\]]/gm;

class RespuestaValidacion {
    /** Valor numerico de la respuesta */
    condicion;
    /** Mensaje textual de la respuesta */
    mensaje;

    /** Objeto de respuesta para las validaciones
     * @param {number} condicion Codigo de respuesta
     * @param {string} mensaje Mensaje de respuesta */
    constructor(condicion, mensaje){
        this.condicion = condicion;
        this.mensaje = mensaje;
    }

    // Getters
    /** Obtener el codigo de respuesta en la validacion
     * @returns {number} Codigo de respuesta */
    get getCondicion(){
        return this.condicion;
    }
    /** Obtener el mensaje de la respuesta en la validacion
     * @returns {string} Mensaje de respuesta */
    get getMensaje(){
        return this.mensaje;
    }
    
    // Setters
    /** Establecer el codigo de respuesta en la validacion
     * @param {number} valor Valor del codigo de respuesta */
    set setCondicion(valor){
        this.condicion = valor;
    }
    /** Establecer el mensaje de respuesta en la validacion
     * @param {string} valorMsg Mensaje de respuesta */
    set setMensaje(valorMsg){
        this.mensaje = valorMsg;
    }
}

/** Funcion de validacion del codigo de usuario
 * @param {string} codigo Valor del codigo de usuario a validar
 * @returns {RespuestaValidacion} Objeto con la respuesta obtenida en la validacion */
function validarCodigoUsuario(codigo){
    /*Posibles condiciones de respuesta:
    0: Retorno indefinido: la condicion no fue evaluada, por lo que es un error
    1: Retorno satisfactorio: condicion evaluada y retorna como aviso
    2: Retorno erroneo: condicion evaluada y se retorna como error*/
    // Objeto de respuesta
    let respCodigo = new RespuestaValidacion(0, "");
    /** Expresion regular para evaluar el formato del codigo de usuario: acroPais-codigo (3 mayusculas - 4 digitos); por ejemplo: MXN-2060 */
    const expreRegCod = /[A-Z]{3}[-]?[\d]{4}/gm;

    // Validacion del codigo de usuario; Parte 1: Contenido del campo
    if(codigo.length == 0){
        respCodigo.setCondicion = 2;
        respCodigo.setMensaje = "Error: No se ingresó codigo de usuario, favor de ingresarlo";
    }else{
        // Validacion del codigo de usuario; Parte 2: Busqueda y remocion de espacios
        let codUsLimp = codigo.replace(expreEspa, "");
        if(codUsLimp.length == 0){
            respCodigo.condicion = 2;
            respCodigo.mensaje = "Error: No se ingresó el codigo correcto, favor de ingresarlo";
        }else{
            // Validacion del codigo de usuario; Parte 3: Busqueda de caracteres de agrupacion
            if(expreAgruCar.test(codUsLimp)){
                respCodigo.condicion = 2;
                respCodigo.mensaje = "Error: Codigo de usuario invalido";
            }else{
                // Validacion del codigo de usuario; Parte 4: Evaluacion de la estructura del contenido (cmp con RegeExp)
                if(expreRegCod.test(codUsLimp)){
                    respCodigo.condicion = 1;
                    respCodigo.mensaje = "Codigo aceptado";
                }else{
                    /* Si no se valido correctamente el codigo de usuario, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procedera con la sanitizacion, validacion y posterior evaluacion de la direccion*/
                    // Validacion del codigo de usuario; Parte 5: Sanitizacion de comillas y punto/coma
                    if(exprePuntu.test(codUsLimp)){
                        codUsLimp = codUsLimp.replace(exprePuntu, "");
                    }
                    // Validacion del codigo de usuario; Parte 6: Sanitizacion de igualdades
                    if(expreIgual.test(codUsLimp)){
                        codUsLimp = codUsLimp.replace(expreIgual, "");
                    }
                    // Validacion del codigo de usuario; Parte 7: Sanitizacion de palabras reservadas SQL
                    if(expreConsulSQL.test(codUsLimp)){
                        codUsLimp = codUsLimp.replace(expreConsulSQL, "");
                    }
                    // Validacion del codigo de usuario; Parte 8: Reevaluación del contenido
                    if(expreRegCod.test(codUsLimp)){
                        respCodigo.condicion = 1;
                        respCodigo.mensaje = "Codigo de usuario sanitizado aceptado";
                    }else{
                        respCodigo.condicion = 2;
                        respCodigo.mensaje = "Error: Su codigo de usuario no es valido, favor de revisarlo";
                    }
                }
            }
        }
    }
    return respCodigo;
}

/** Funcion de validacion de la direccion de correo
 * @param {string} direccion Valor de la direccion de correo a validar
 * @returns {RespuestaValidacion} Objeto con la respuesta obtenida en la validacion */
function validarCorreo(direccion){
    /*Posibles condiciones de respuesta:
    0: Retorno indefinido: la condicion no fue evaluada, por lo que es un error
    1: Retorno satisfactorio: condicion evaluada y retorna como aviso
    2: Retorno erroneo: condicion evaluada y se retorna como error*/
    // Objeto de respuesta
    let respCorreo = new RespuestaValidacion(0, "");
    // Expresion regular para correo
    const expreCorr = /\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+/gm;

    // Validacion de direccion de correo; Parte 1: Contenido del campo
    if(direccion.length == 0){
        respCorreo.setCondicion = 2;
        respCorreo.setMensaje = "Error: No se ingresó correo, favor de ingresarlo.";
    }else{
        // Validacion de direccion de correo; Parte 2: Remocion de espacios al inicio y final, con posterior busqueda de espacios dentro del string a evaluar
        let direccionLimp = direccion.trim();
        if(expreEspa.test(direccionLimp)){
            respCorreo.setCondicion = 2;
            respCorreo.setMensaje = "Error: Dirección de correo invalida, favor de remover los espacios innecesarios";
        }else{
            // Validacion de direccion de correo; Parte 3: Busqueda de caracteres de agrupacion en el contenido
            if(expreAgruCar.test(direccionLimp)){
                respCorreo.setCondicion = 2;
                respCorreo.setMensaje = "Error: Dirección de correo invalida";
            }else{
                // Validacion de direccion de correo; Parte 4: Evaluacion de la estructura del contenido (cmp con RegeExp)
                if(expreCorr.test(direccionLimp)){
                    respCorreo.setCondicion = 1;
                    respCorreo.setMensaje = "Direccion de Correo Aceptada";
                }else{
                    /* Si no se valido correctamente el correo, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procedera con la sanitizacion, validacion y posterior evaluacion de la direccion*/
                    // Validacion de direccion de correo; Parte 5: Sanitizacion de comillas y punto/coma
                    if(exprePuntu.test(direccionLimp)){
                        direccionLimp = direccionLimp.replace(exprePuntu, "");
                    }
                    // Validacion de direccion de correo; Parte 6: Sanitizacion de igualdades
                    if(expreIgual.test(direccionLimp)){
                        direccionLimp = direccionLimp.replace(expreIgual, "");
                    }
                    // Validacion de direccion de correo; Parte 7: Sanitizacion de palabras reservadas SQL
                    if(expreConsulSQL.test(direccionLimp)){
                        direccionLimp = direccionLimp.replace(expreConsulSQL, "");
                    }
                    // Validacion de direccion de correo; Parte 8: Reevaluación del contenido
                    if(expreCorr.test(direccionLimp)){
                        respCorreo.setCondicion = 1;
                        respCorreo.setMensaje = "Direccion Sanitizada Aceptada";
                    }else{
                        respCorreo.setCondicion = 2;
                        respCorreo.setMensaje = "Error: Su dirección de correo no es valida, favor de revisarla";
                    }
                }
            }
        }
    }
    return respCorreo;
}

/** Funcion de validacion de la contraseña
 * @param {string} contra Valor de la contraseña a validar
 * @returns {RespuestaValidacion} Objeto con la respuesta obtenida en la validacion */
function validarContrasenia(contra){
    /*Posibles condiciones de respuesta:
    0: Retorno indefinido: la condicion no fue evaluada, por lo que es un error
    1: Retorno satisfactorio: condicion evaluada y retorna como aviso
    2: Retorno erroneo: condicion evaluada y se retorna como error*/
    // Objeto de respuesta
    let respContra = new RespuestaValidacion(0, "");
    /** Expresion regular para las contraseñas */
    /* Explicacion; NOTA: cuando se dice que busca mas no coincide se refiere a que si se encuentra el patron (por ejemplo usando test) no se regresará un true, porque no "consume o coincide" el resultado:
        (?=.*[a-z]): busca mas no coincide con cualquier minuscula en la cadena
        (?=.*[A-Z]): busca mas no coincide con cualquier mayuscula en la cadena
        (?=.*\\d): busca mas no coincide con cualquier digito numerico en la cadena
        (?=.*[\\°\\|\\¬\\¡\\!\\#\\$\\%\\&\\\/\\(\\)\\=\\\'\\\\\\¿\\?\\´\\¨\\+\\*\\~\\{\\[\\]\\}\\\\\\^\\`\\<\\>\\,\\;\\.\\:\\-\\_]): busca mas no coincide con cualquier caracter especial dentro del arreglo en la cadena
        [A-Za-z\\d\\°\\|\\¬\\¡\\!\\#\\$\\%\\&\\\/\\(\\)\\=\\\'\\\\\\¿\\?\\´\\¨\\+\\*\\~\\{\\[\\]\\}\\\\\\^\\`\\<\\>\\,\\;\\.\\:\\-\\_]{6,20}: busca coincidencia con cualquiera de los elementos que se encuentren en el arreglo y que la cadena en cuestion tenga una longitud de entre 6 y 20 caracteres
        -- Si se tiene dudas, usar https://regex101.com/ y seleccionar ECMAScript como lenguaje */
    let expreContra = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\°\\|\\¬\\¡\\!\\#\\$\\%\\&\\\/\\(\\)\\=\\\'\\\\\\¿\\?\\´\\¨\\+\\*\\~\\{\\[\\]\\}\\\\\\^\\`\\<\\>\\,\\;\\.\\:\\-\\_])[A-Za-z\\d\\°\\|\\¬\\¡\\!\\#\\$\\%\\&\\\/\\(\\)\\=\\\'\\\\\\¿\\?\\´\\¨\\+\\*\\~\\{\\[\\]\\}\\\\\\^\\`\\<\\>\\,\\;\\.\\:\\-\\_]{6,20}', 'gm');

    // Validacion de la contraseña; Parte 1: Contenido del campo
    if(contra.length == 0){
        respContra.setCondicion = 2;
        respContra.setMensaje = "Error: No se ingresó contraseña, favor de ingresarla.";
    }else{
        // Validacion de la contraseña; Parte 2: Remocion de espacios en la contraseña
        let contraLimp = contra.replace(expreEspa, "");
        // Si se borraron todos los espacios y el campo se quedo vacio se mandara un error
        if(contraLimp.length == 0 || contraLimp == ""){
            respContra.setCondicion = 2;
            respContra.setMensaje = "Error: Contraseña invalida, favor de revisarla.";
        }else{
            // Validacion de la contraseña; Parte 3: Evaluacion de la estructura de la contraseña
            if(expreContra.test(contraLimp)){
                respContra.setCondicion = 1;
                respContra.setMensaje = "Contraseña Aceptada";
            }else{
                /* Si no se valido correctamente la contraseña, se interpretará que se tiene algun elemento extraño para inyeccion SQL y en este caso, algun componente en la estructura de la misma que no le permitio aprobar el patron de contraseñas, por lo que se procedera con la sanitizacion, validacion y posterior reevaluacion de la misma */
                // Validacion de la contraseña; Parte 4: Sanitizacion de comillas y punto/coma
                if(exprePuntu.test(contraLimp)){
                    contraLimp = contraLimp.replace(exprePuntu, "");
                }
                // Validacion de la contraseña; Parte 5: Sanitizacion de igualdades
                if(expreIgual.test(contraLimp)){
                    contraLimp = contraLimp.replace(expreIgual, "");
                }
                // Validacion de la contraseña; Parte 6: Sanitizacion de palabras reservadas SQL
                if(expreConsulSQL.test(contraLimp)){
                    contraLimp = contraLimp.replace(expreConsulSQL, "");
                }
                // Validacion de la contraseña; Parte 7: Reevaluacion de la contraseña
                if(expreContra.test(contraLimp)){
                    respContra.setCondicion = 1;
                    respContra.setMensaje = "Contraseña Sanitizada Aceptada";
                }else{
                    respContra.setCondicion = 2;
                    respContra.setMensaje = "Error: Su contraseña no es valida, favor de revisarla";
                }
            }
        }
    }
    return respContra;
}

/** Funcion de validacion del nombre o apellido de la persona
 * @param {string} valor Valor del nombre o apellido para validar
 * @param {string} campo Tipo de Campo para validar
 * @returns {RespuestaValidacion} Objeto con la respuesta obtenida en la validacion */
function validarCamposPerso(valor, campo){
    /*Posibles condiciones de respuesta:
    0: Retorno indefinido: la condicion no fue evaluada, por lo que es un error
    1: Retorno satisfactorio: condicion evaluada y retorna como aviso
    2: Retorno erroneo: condicion evaluada y se retorna como error*/
    // Objeto de respuesta
    let respNomApe = new RespuestaValidacion(0, "");
    /* Expresion regular para evaluar el nombre completo
    const expreNomComple = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+){1,5}(?:\s+[-\sa-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)?$/ */
    /** Expresion regular para encontrar caracteres que no sean letras mayusculas, minusculas, acentuadas, con dieresis o tilde y espacio, en caso de tener mas de un nombre */
    const expreNomElems = /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+/gm;

    // Validacion de nombre/apellido; Parte 1: Evaluacion de contenido del campo
    if(valor.length == 0){
        respNomApe.condicion = 2;
        switch(campo){
            case "Nombre":
                respNomApe.mensaje = "Error: No se ingresó el nombre, favor de ingresarlo";
                break;
            case "Apellido":
                respNomApe.mensaje = "Error: No se ingresó el apellido, favor de ingresarlo";
                break;
        }
    }else{
        // Validacion de nombre/apellido; Parte 2: Limpiando espacios al inicio y al final del campo, ademas de buscar caracteres que no sean letras mayusculas, minusculas, acentuadas, con dieresis o tilde
        let valorLimp = valor.trim();
        if(expreNomElems.test(valorLimp)){
            /* Si no se validó correctamente el nombre o apellido, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procederá con la sanitización, validación y posterior evaluación del campo */
            // Validacion de campos; Parte 3: Sanitizacion de comillas y punto/coma
            if(exprePuntu.test(valorLimp)){
                valorLimp = valorLimp.replace(exprePuntu, "");
            }
            // Validacion de campos; Parte 4: Sanitizacion de igualdades
            if(expreIgual.test(valorLimp)){
                valorLimp = valorLimp.replace(expreIgual, "");
            }
            // Validacion de campos; Parte 5: Sanitizacion de caracteres de agrupación
            if(expreAgruCar.test(valorLimp)){
                valorLimp = valorLimp.replace(expreAgruCar, "");
            }
            // Validacion de campos; Parte 6: Sanitizacion de palabras reservadas SQL
            if(expreConsulSQL.test(valorLimp)){
                valorLimp = valorLimp.replace(expreConsulSQL, "");
            }
            // Validacion de campos; Parte 7: Reevaluación del nombre o apellido
            if(expreNomElems.test(valorLimp)){
                respNomApe.condicion = 2;
                switch(campo){
                    case "Nombre":
                        respNomApe.mensaje = "Error: Su nombre no es valido, favor de revisarlo";
                        break;
                    case "Apellido":
                        respNomApe.mensaje = "Error: Su apellido no es valido, favor de revisarlo";
                        break;
                }
            }else{
                respNomApe.condicion = 1;
                switch(campo){
                    case "Nombre":
                        respNomApe.mensaje = "Nombre sanitizado aceptado";
                        break;
                    case "Apellido":
                        respNomApe.mensaje = "Apellido sanitizado aceptado";
                        break;
                }
            }
        }else{
            // Si no se encontraron caracteres raros, se da por sentado que se tiene un nombre o apellido adecuados
            respNomApe.condicion = 1;
            switch(campo){
                case "Nombre":
                    respNomApe.mensaje = "Nombre aceptado";
                    break;
                case "Apellido":
                    respNomApe.mensaje = "Apellido aceptado";
                    break;
            }
        }
    }
    return respNomApe;
}

/** Funcion de validacion del nombre o apellido de la persona
 * @param {string} nomSensor Valor del nombre del sensor a validar
 * @returns {RespuestaValidacion} Objeto con la respuesta obtenida en la validacion */
function validarNombreSensores(nomSensor){
    /*Posibles condiciones de respuesta:
    0: Retorno indefinido: la condicion no fue evaluada, por lo que es un error
    1: Retorno satisfactorio: condicion evaluada y retorna como aviso
    2: Retorno erroneo: condicion evaluada y se retorna como error*/
    // Objeto de respuesta
    let respNomSen = new RespuestaValidacion(0, "");
    // Expresion regular para encontrar cualquier caracter que no se encuentre dentro del arreglo (salvo ^ funje como negacion de los caracteres del arreglo)
    const expreNomSenso = /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\d\-\_ ]+/gm

    // Validacion de nombre sensor; Parte 1: Evaluacion de contenido del campo
    if(nomSensor.length == 0){
        respNomSen.condicion = 2;
        respNomSen.mensaje = "Error: No se ingresó el nombre, favor de ingresarlo";
    }else{
        // Validacion de nombre sensor; Parte 2: Limpiando espacios antes y despues del nombre
        let valorLimp = nomSensor.trim();
        // Validacion de nombre sensor; Parte 3: Busqueda de caracteres que no sean minusculas, mayusculas, letras acentuadas letras ü o ñ, numeros o guiones
        if(expreNomSenso.test(valorLimp)){
            /* Si no se validó correctamente el nombre del sensor, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procederá con la sanitización, validación y posterior evaluación del campo */
            // Validacion de nombre sensor; Parte 4: Sanitizacion de comillas y punto/coma
            if(exprePuntu.test(valorLimp)){
                valorLimp = valorLimp.replace(exprePuntu, "");
            }
            // Validacion de nombre sensor; Parte 5: Sanitizacion de igualdades
            if(expreIgual.test(valorLimp)){
                valorLimp = valorLimp.replace(expreIgual, "");
            }
            // Validacion de nombre sensor; Parte 6: Sanitizacion de caracteres de agrupación
            if(expreAgruCar.test(valorLimp)){
                valorLimp = valorLimp.replace(expreAgruCar, "");
            }
            // Validacion de nombre sensor; Parte 7: Sanitizacion de palabras reservadas SQL
            if(expreConsulSQL.test(valorLimp)){
                valorLimp = valorLimp.replace(expreConsulSQL, "");
            }
            // Validacion de nombre sensor; Parte 8: Reevaluación del nombre
            if(expreNomElems.test(valorLimp)){
                respNomSen.condicion = 2;
                respNomSen.mensaje = "Error: El nombre dado al sensor no es valido, favor de revisarlo";
            }else{
                respNomSen.condicion = 1;
                respNomSen.mensaje = "Nombre del sensor sanitizado aceptado";
            }
        }else{
            // Si no se encontraron caracteres raros, se da por sentado que se tiene un nombre adecuado
            respNomSen.condicion = 1;
            respNomSen.mensaje = "Nombre del sensor aceptado";
        }
    }
    return respNomSen;
}

// Exportar las funciones de validaciones
export { validarCodigoUsuario, validarCorreo, validarContrasenia, validarCamposPerso, validarNombreSensores };