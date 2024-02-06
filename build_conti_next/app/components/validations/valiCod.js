// Objeto de respuesta de validacion del correo
import { RespuestaValidacion } from "./objResp";

/** Funcion de validacion del codigo de usuario
 * @param {string} codigo Valor del codigo de usuario ingresado para validar
 * @returns {RespuestaValidacion} Objeto con la respuesta obtenida en la validacion
 */
function validarCodigoUsuario(codigo){
    /*Posibles condiciones de respuesta:
    0: Retorno indefinido: la condicion no fue evaluada, por lo que es un error
    1: Retorno satisfactorio: condicion evaluada y retorna como aviso
    2: Retorno erroneo: condicion evaluada y se retorna como error*/
    // Objeto de respuesta
    let respCodigo = new RespuestaValidacion(0, "");
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

    // Validacion del codigo de usuario; Parte 1: Contenido del campo
    if(!codigo){
        respCodigo.setCondicion = 2;
        respCodigo.setMensaje = "Error: No se ingreso codigo de usuario, favor de ingresarlo";
    }else{
        // Validacion del codigo de usuario; Parte 2: Busqueda de espacios
        let codUsLimp = codigo.replace(expreEspa, "");
        if(codUsLimp.length == 0){
            respCodigo.condicion = 2;
            respCodigo.mensaje = "Error: No se ingreso el codigo correcto, favor de ingresarlo";
        }else{
            // Validacion del codigo de usuario; Parte 3: Busqueda de caracteres de agrupacion
            if(codUsLimp.includes("(") || codUsLimp.includes(")") || codUsLimp.includes("()") || codUsLimp.includes("{") || codUsLimp.includes("}") || codUsLimp.includes("{}") || codUsLimp.includes("[") || codUsLimp.includes("]") || codUsLimp.includes("[]")){
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
                        codUsLimp=codUsLimp.replace(exprePuntu, "");
                    }
                    // Validacion del codigo de usuario; Parte 6: Sanitizacion de igualdades
                    if(expreIgual.test(codUsLimp)){
                        codUsLimp=codUsLimp.replace(expreIgual, "");
                    }
                    // Validacion del codigo de usuario; Parte 7: Sanitizacion de palabras reservadas SQL
                    if(expreQueSQL.test(codUsLimp)){
                        codUsLimp=codUsLimp.replace(expreQueSQL, "");
                    }
                    // Validacion del codigo de usuario; Parte 8: Reevaluación del contenido
                    if(expreRegCod.test(codUsLimp)){
                        respCodigo.condicion = 1;
                        respCodigo.mensaje = "Codigo de usuario sanitizado aceptado";
                    }else{
                        respCodigo.condicion = 2;
                        respCodigo.mensaje = "Error: Su codigo de correo no es valido, favor de revisarlo";
                    }
                }
            }
        }
    }
}
// Exportacion de la funcion para usarse en otros modulos
export { validarCodigoUsuario };