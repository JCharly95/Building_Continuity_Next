// Objeto de respuesta de validacion del correo
import { RespuestaValidacion } from "./objResp";

/** Funcion de validacion del nombre o apellido de la persona
 * @param {string} valor Valor del nombre o apellido para validar
 * @param {string} campo Tipo de Campo para validar
 * @returns {RespuestaValidacion} Objeto con la respuesta obtenida en la validacion
 */
function validarCampoNomApe(valor, campo){
    /*Posibles condiciones de respuesta:
    0: Retorno indefinido: la condicion no fue evaluada, por lo que es un error
    1: Retorno satisfactorio: condicion evaluada y retorna como aviso
    2: Retorno erroneo: condicion evaluada y se retorna como error*/
    // Objeto de respuesta
    let respNomApe = new RespuestaValidacion(0, "");
    // Expresiones regulares para la filtracion de inyecciones SQL
    // Buscar/remover comillas o punto y coma
    const exprePuntu = /(')|(;)|(';)/g
    // Buscar numero=numero o 1=1
    const expreIgual = /(\d=\d)|(=)/g
    // Expresion regular para remover consultas tipicas implementadas en SQL para inyecciones
    const expreQueSQL = /(SELECT)|(Select)|(select)|(UNION)|(Union)|(union)|(FROM)|(From)|(from)|(JOIN)|(Join)|(join)|(PASSWORD)|(Password)|(password)|(PASS)|(Pass)|(pass)|(PASSWD)|(Passwd)|(passwd)|(DROP)|(Drop)|(drop)|(TABLE)|(Table)|(table)|(DELETE)|(Delete)|(delete)|(INSERT)|(Insert)|(insert)|(UPDATE)|(Update)|(update)|(USERS)|(Users)|(users)|(DATABASE)|(Database)|(database)|(WHERE)|(Where)|(where)|(AND)|(And)|(and)|(OR)|(Or)|(or)|(INNER)|(Inner)|(inner)|(LEFT)|(Left)|(left)|(RIGHT)|(Right)|(right)/g
    /* Expresion regular para evaluar el nombre completo
    const expreNomComple = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+){1,5}(?:\s+[-\sa-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)?$/ */
    // Expresion regular para evaluar el contenido de nombre o apellidos en general
    const expreNomElems = /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+/

    // Validacion de campos; Parte 3: Evaluacion del nombre y Parte 3.1: Evaluacion de contenido del campo
    if(!valor){
        respNomApe.condicion = 2;
        if(campo == "Nombre")
            respNomApe.mensaje = "Error: No se ingreso su nombre, favor de ingresarlo";
        else
            respNomApe.mensaje = "Error: No se ingreso su apellido, favor de ingresarlo";
    }else{
        // Validacion de campos; Parte 3.2: Limpiando espacios antes y despues del nombre
        let valorLimp = valor.trim();
        // Validacion de campos; Parte 3.3: Busqueda de caracteres de agrupacion en el codigo
        if(valorLimp.includes("(") || valorLimp.includes(")") || valorLimp.includes("()") || valorLimp.includes("{") || valorLimp.includes("}") || valorLimp.includes("{}") || valorLimp.includes("[") || valorLimp.includes("]") || valorLimp.includes("[]")){
            respNomApe.condicion = 2;
            if(campo == "Nombre")
                respNomApe.mensaje = "Error: El nombre ingresado no es valido";
            else
                respNomApe.mensaje = "Error: El apellido ingresado no es valido";
        }else{
            // Validacion de campos; Parte 3.4: Evaluacion de la estructura del nombre (cmp con RegeExp)
            if(expreNomElems.test(valorLimp)){
                respNomApe.condicion = 1;
                if(campo == "Nombre")
                    respNomApe.mensaje = "Nombre aceptado";
                else
                    respNomApe.mensaje = "Apellido aceptado";
            }else{
                /* Si no se valido correctamente el nombre, se interpretará que se tiene algun elemento extraño para inyeccion SQL, por lo que se procedera con la sanitizacion, validacion y posterior evaluacion del nombre*/
                // Validacion de campos; Parte 3.5.1: Sanitizacion de comillas y punto/coma
                if(exprePuntu.test(valorLimp)){
                    valorLimp=valorLimp.replace(exprePuntu, "");
                }
                // Validacion de campos; Parte 3.5.2: Sanitizacion de igualdades
                if(expreIgual.test(valorLimp)){
                    valorLimp=valorLimp.replace(expreIgual, "");
                }
                // Validacion de campos; Parte 3.5.3: Sanitizacion de palabras reservadas SQL
                if(expreQueSQL.test(valorLimp)){
                    valorLimp=valorLimp.replace(expreQueSQL, "");
                }
                // Validacion de campos; Parte 3.5.4: Reevaluación del nombre
                if(expreNomElems.test(valorLimp)){
                    respNomApe.condicion = 1;
                    if(campo == "Nombre")
                        respNomApe.mensaje = "Nombre sanitizado aceptado";
                    else
                        respNomApe.mensaje = "Apellido sanitizado aceptado";
                }else{
                    respNomApe.condicion = 2;
                    if(campo == "Nombre")
                        respNomApe.mensaje = "Error: Su nombre no es valido, favor de revisarlo";
                    else
                        respNomApe.mensaje = "Error: Su apellido no es valido, favor de revisarlo";
                }
            }
        }
    }
}
// Exportacion de la funcion para usarse en otros modulos
export { validarCampoNomApe };