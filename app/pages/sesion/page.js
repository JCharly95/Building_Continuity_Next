"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function CerrarSesion(){
    // Constante del router para el redireccionamiento
    const router = useRouter();

    // UseEffect de accion de cierre de sesion
    useEffect(() => {
        // Limpiar la cache local usada para la sesion
        localStorage.clear();
        // Redireccionamiento hacia el login despues de 2 segundos
        setTimeout( () => ( router.push("/") ), 2000);
    }, [router]);

    return(
        <section className="w-full h-full flex flex-col items-center py-3">
            <div className="max-w-md rounded overflow-hidden shadow-lg bg-white sm:m-2">
                <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">Cerrando Sesión...</div>
                    <p className="text-gray-700 text-base">
                        Gracias por tu visita, nos vemos después.
                    </p>
                </div>
            </div>
        </section>
    );
}