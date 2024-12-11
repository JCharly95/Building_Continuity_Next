// Objeto de respuesta de la validacion de correo
import { RespuestaValidacion } from "./objResp"

/** Funcion de validacion de la contraseña
 * @param {string} contra Valor de la contraseña ingresada para validar
 * @returns {RespuestaValidacion} Objeto con la respuesta obtenida en la validacion
 */
function validarPassword(contra){
    /*Posibles condiciones de respuesta:
    0: Retorno indefinido: la condicion no fue evaluada, por lo que es un error
    1: Retorno satisfactorio: condicion evaluada y retorna como aviso
    2: Retorno erroneo: condicion evaluada y se retorna como error*/
    // Objeto de respuesta
    let respContra = new RespuestaValidacion(0, "");
    // Expresion regular para buscar espacios
    const expreEspa = /\s+/g
    // Expresiones regulares para la filtracion de inyecciones SQL
    // Buscar/remover comillas o punto y coma
    const exprePuntu = /(')|(;)|(';)/g
    // Buscar numero=numero o 1=1
    const expreIgual = /(\d=\d)|(=)/g
    // Expresion regular para remover consultas tipicas implementadas en SQL para inyecciones
    const expreQueSQL = /(SELECT)|(Select)|(select)|(UNION)|(Union)|(union)|(FROM)|(From)|(from)|(JOIN)|(Join)|(join)|(PASSWORD)|(Password)|(password)|(PASS)|(Pass)|(pass)|(PASSWD)|(Passwd)|(passwd)|(DROP)|(Drop)|(drop)|(TABLE)|(Table)|(table)|(DELETE)|(Delete)|(delete)|(INSERT)|(Insert)|(insert)|(UPDATE)|(Update)|(update)|(USERS)|(Users)|(users)|(DATABASE)|(Database)|(database)|(WHERE)|(Where)|(where)|(AND)|(And)|(and)|(OR)|(Or)|(or)|(INNER)|(Inner)|(inner)|(LEFT)|(Left)|(left)|(RIGHT)|(Right)|(right)/g

    // Validacion de la contraseña; Parte 1: Contenido del campo
    if(!contra){
        respContra.setCondicion = 2;
        respContra.setMensaje = "Error: No se ingreso contraseña, favor de ingresarla";
    }else{
        // Validacion de la contraseña; Parte 2: Evaluacion de espacios
        contra = contra.replace(expreEspa, "");
        // Si se borraron todos los espacios y el campo se quedo vacio se mandara un error
        if(contra.length === 0 || contra === ""){
            respContra.setCondicion = 2;
            respContra.setMensaje = "Error: Contraseña incorrecta";
        }else{
            // Validacion de la contraseña; Parte 3: Busqueda de mayusculas
            if(!/[A-Z]/g.test(contra)){
                respContra.setCondicion = 2;
                respContra.setMensaje = "Error: Favor de revisar el contenido de su contraseña";
            }else{
                // Validacion de la contraseña; Parte 4: Busqueda de numeros
                if(!/\d/g.test(contra)){
                    respContra.setCondicion = 2;
                    respContra.setMensaje = "Error: Favor de revisar el contenido de su contraseña";
                }else{
                    // Validacion de la contraseña; Parte 5: Busqueda de caracteres especiales
                    if(!/\W/g.test(contra)){
                        respContra.setCondicion = 2;
                        respContra.setMensaje = "Error: Favor de revisar el contenido de su contraseña";
                    }else{
                        /* Dado que la contraseñas son mas dificiles de evaluar, porque no hay una expresion regular establecida, de igual manera se les realizara el proceso de sanitizacion de elementos.
                        Por consiguiente, las contraseñas no podran incluir los siguientes caracteres: ' ; =
                        Ademas, a diferencia del correo, en este caso se procedera directo con una sanitizacion y posterior evaluacion.*/
                        // Validacion de la contraseña; Parte 6: Sanitizacion de comillas y punto/coma
                        if(exprePuntu.test(contra)){
                            contra=contra.replace(contra, "");
                        }
                        // Validacion de la contraseña; Parte 7: Sanitizacion de igualdades
                        if(expreIgual.test(contra)){
                            contra=contra.replace(expreIgual, "");
                        }
                        // Validacion de la contraseña; Parte 8: Sanitizacion de palabras reservadas SQL
                        if(expreQueSQL.test(contra)){
                            contra=contra.replace(expreQueSQL, "");
                            respContra.setCondicion = 1;
                            respContra.setMensaje = "Contraseña Sanitizada Aceptada";
                        }else{
                            respContra.setCondicion = 1;
                            respContra.setMensaje = "Contraseña Aceptada";
                        }
                    }
                }
            }
        }
    }
    return respContra;
}
// Exportacion de la funcion para usarse en otros modulos
export { validarPassword };