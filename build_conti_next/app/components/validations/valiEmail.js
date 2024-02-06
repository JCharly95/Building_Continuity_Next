// Objeto de respuesta de la validacion de correo
import { RespuestaValidacion } from "./objResp";

/** Funcion de validacion de la direccion de correo
 * @param {string} direccion Valor de la direccion de correo ingresada para validar
 * @returns {RespuestaValidacion} Objeto con la respuesta obtenida en la validacion
 */
function validarCorreo(direccion){
    /*Posibles condiciones de respuesta:
    0: Retorno indefinido: la condicion no fue evaluada, por lo que es un error
    1: Retorno satisfactorio: condicion evaluada y retorna como aviso
    2: Retorno erroneo: condicion evaluada y se retorna como error*/
    // Objeto de respuesta
    let respCorreo = new RespuestaValidacion(0, "");
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

    // Validacion de direccion de correo; Parte 1: Contenido del campo
    if(!direccion){
        respCorreo.setCondicion = 2;
        respCorreo.setMensaje = "Error: No se ingreso correo, favor de ingresarlo";
    }else{
        // Validacion de direccion de correo; Parte 2: Busqueda de espacios
        if(expreEspa.test(direccion)){
            respCorreo.setCondicion = 2;
            respCorreo.setMensaje = "Error: Dirección de correo invalida";
        }else{
            // Validacion de direccion de correo; Parte 3: Busqueda de caracteres de agrupacion en el contenido
            if(direccion.includes("(") || direccion.includes(")") || direccion.includes("()") || direccion.includes("{") || direccion.includes("}") || direccion.includes("{}") || direccion.includes("[") || direccion.includes("]") || direccion.includes("[]")){
                respCorreo.setCondicion = 2;
                respCorreo.setMensaje = "Error: Dirección de correo invalida";
            }else{
                // Validacion de direccion de correo; Parte 4: Evaluacion de la estructura del contenido (cmp con RegeExp)
                if(expreCorr.test(direccion)){
                    respCorreo.setCondicion = 1;
                    respCorreo.setMensaje = "Direccion Aceptada";
                }else{
                    /* Si no se valido correctamente el correo, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procedera con la sanitizacion, validacion y posterior evaluacion de la direccion*/
                    // Validacion de direccion de correo; Parte 5: Sanitizacion de comillas y punto/coma
                    if(exprePuntu.test(direccion)){
                        direccion=direccion.replace(exprePuntu, "");
                    }
                    // Validacion de direccion de correo; Parte 6: Sanitizacion de igualdades
                    if(expreIgual.test(direccion)){
                        direccion=direccion.replace(expreIgual, "");
                    }
                    // Validacion de direccion de correo; Parte 7: Sanitizacion de palabras reservadas SQL
                    if(expreQueSQL.test(direccion)){
                        direccion=direccion.replace(expreQueSQL, "");
                    }
                    // Validacion de direccion de correo; Parte 8: Reevaluación del contenido
                    if(expreCorr.test(direccion)){
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
// Exportacion de la funcion para usarse en otros modulos
export { validarCorreo };