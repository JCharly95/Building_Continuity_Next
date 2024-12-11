/** Funcion para generar una fecha en formato de salida: YYYY-MM-DD;  hh:mm:ss */
export function getFecha(valFecha){
    let fecha, dia = "", mes = "", hora = "", min = "", sec = "";
    fecha = (valFecha) ? new Date(valFecha) : new Date();
    // Agregar un cero por si el dia tiene solo un digito
    if(fecha.getDate().toString().length === 1)
        dia = "0" + fecha.getDate().toString();
    else
        dia = fecha.getDate();
    // Agregar un cero por si el mes tiene un solo digito
    if(fecha.getMonth().toString().length === 1)
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
        min = "0"+fecha.getMinutes().toString();
    else
        min = fecha.getMinutes();
    // Agregar un cero por si el segundo tiene un solo digito
    if(fecha.getSeconds().toString().length === 1)
        sec = "0"+fecha.getSeconds().toString();
    else
        sec = fecha.getSeconds();

    return(`${fecha.getFullYear()}-${mes}-${dia}; ${hora}:${min}:${sec}`);
}