"use client";
import GraficaCompo from "./grafCompo";
import React, { useState } from "react";
import BarBusGraf from "./formBusGraf/barBusGraf";

export default function Grafica(){
    // Variable de estado que contendra la informacion del filtro de busqueda
    const [infoBus, setInfoBus] = useState({});

    // Funcion para la obtencion de la informacion de la barra de busqueda
    const obteInfoBus = (infoBusIngre) => {
        setInfoBus(infoBusIngre);
    }

    return(
        <section className="w-full h-full flex flex-col items-center justify-center bg-slate-400 mt-1">
            <BarBusGraf infoBus={obteInfoBus} />
            <GraficaCompo infoIntro={infoBus} />
        </section>
    );
}