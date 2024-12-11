"use client";
import Image from "next/image";
import { User, Calendar, Mail, Clock } from "react-feather";
import { getFecha } from "@/app/components/logic/fecha";
import React, { useEffect, useState } from "react";

export default function Perfil(){
    // Variable de estado para las credenciales del usuario
    const[infoUser, setInfoUser] = useState({ correo: "alguien@ejemplo.com", fechLAcc: getFecha() });

    // useEffect para obtener las credenciales del usuario
    useEffect(() => {
        try {
            setInfoUser(JSON.parse(localStorage.getItem("usInfo")));
        } catch (error) { }
    }, []);

    /* Obteniendo las credenciales del usuario
    let infoUser = { correo: "alguien@ejemplo.com", fechLAcc: getFecha() };
    try {
        infoUser = JSON.parse(localStorage.getItem("usInfo"));
    } catch (error) { }*/
    
    // Url de origen para la imagen
    let imgSrc = "https://picsum.photos/500/600";

    return(
        <section className="bg-slate-500 h-full">
            <section className="max-w-screen lg:p-7 p-6 w-full lg:max-w-full lg:flex self-center justify-center">
                <section className="h-full w-full lg:h-auto lg:w-48 flex-none bg-cover lg:rounded-l text-center overflow-hidden border border-gray-400">
                    <Image alt="PicProfile" loader={() => imgSrc} unoptimized={true} src={imgSrc} width={500} height={600}/>
                </section>
                <section className="border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
                    <section className="mb-8">
                        <p className="text-sm text-gray-600 flex items-center">
                            <User size={25} className="mr-2"/>
                            ¿Que desea hacer hoy?
                        </p>
                        <section className="text-gray-900 font-bold text-xl my-2 inline-flex">
                            <Calendar size={25} className="mr-2"/> La fecha actual es: {getFecha()} hrs.
                        </section>
                        <section className="text-gray-700 text-base flex flex-col mt-2">
                            <section className="inline-flex">
                                <Mail size={25} className="mr-2"/> Su direccion de correo es: { infoUser.correo }
                            </section>
                            <section className="inline-flex mt-3">
                                <Clock size={25} className="mr-2"/> Su ultimo acceso fue: { infoUser.fechLAcc } hrs.
                            </section>
                        </section>
                    </section>
                </section>
            </section>
        </section>
    );
}