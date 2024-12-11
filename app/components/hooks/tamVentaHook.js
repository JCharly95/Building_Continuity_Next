"use client";
import React, { useState, useEffect } from "react";

export default function useVentaDimen(){
    // Crear una variable de estado con un objeto que contiene el tamaño de la ventana actual, anchura y altura
    const [dimension, setDimension] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Usar el hook useEffect para que cada que la ventana sea cambiada de tamaño obtenga el valor de la misma
    useEffect(() => {
        // Funcion flecha que actualiza el valor del estado con las dimensiones de pantalla
        const cambiaTam = () =>{
            setDimension({ width: window.innerWidth, height: window.innerHeight });
        };
        // Agregar un listener para el evento de cambio de tamaño que llamará a la funcion de actualizacion de valores
        window.addEventListener("resize", cambiaTam);
        // Regresar la remocion del listener para que no se quede en bucle por el procesamiento del re-renderizado
        return () => {
            window.removeEventListener("resize", cambiaTam);
        };
    }, []);

    // Regresar los valores con la dimension de pantalla correspondiente
    return dimension;
}