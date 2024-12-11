export class RespuestaValidacion {
    /**
     * @argument {number} Valor numerico de la respuesta
     */
    condicion;
    /**
     * @argument {string} Mensaje textual de la respuesta
     */
    mensaje;

    /**
     * @param {number} condicion Codigo de respuesta
     * @param {string} mensaje Mensaje de respuesta
     */
    constructor(condicion, mensaje){
        this.condicion = condicion;
        this.mensaje = mensaje;
    }
    // Getters
    /**
     * @returns {number} Codigo de respuesta
     */
    get getCondicion(){
        return this.condicion;
    }
    /**
     * @returns {string} Mensaje de respuesta
     */
    get getMensaje(){
        return this.mensaje;
    }
    // Setters
    /**
     * @param {number} valor Valor del codigo de respuesta
     */
    set setCondicion(valor){
        this.condicion = valor;
    }
    /**
     * @param {string} valorMsg Mensaje de respuesta
     */
    set setMensaje(valorMsg){
        this.mensaje = valorMsg;
    }
}