"use client";
import React, { useRef } from "react";
import Flatpickr from 'react-flatpickr';
import { Spanish } from "flatpickr/dist/l10n/es.js";
import 'flatpickr/dist/themes/light.css';
import { Calendar, Trash2 } from 'react-feather';

export default function Calendario({ valorSel, tipoCalen }){
    // Establecer la referencia del calendario para la obtencion de la fecha seleccionada
    const calenRef = useRef(null);

    // Establecer la opciones de configuracion del objeto Flatpickr
    const optionsCalen = {
        enableTime: true,
        altFormat: "Y/m/d; H:i",
        dateFormat: 'Y-m-d H:i',
        locale: Spanish,
        onClose: function(selectedDates, fechaSel) {
            valorSel(new Date(fechaSel));
        },
    };

    return(
        <section className="inline-flex ring-2 ring-inset ring-gray-400 rounded-md border-0 p-0.5">
            <label className="flex items-center justify-between text-black bg-blue-500 font-bold px-0.5 rounded-s border-0" htmlFor={`Calen${tipoCalen}`}>
                <Calendar />
            </label>
            <Flatpickr id={`Calen${tipoCalen}`} placeholder={`Fecha y Hora de ${tipoCalen}`} options={optionsCalen} ref={calenRef} className="pl-1"/>
            <button type="button" className="bg-red-600 text-center text-white px-0.5 rounded-e" onClick={() => {
                    if(!calenRef?.current?.flatpickr) return;
                    calenRef.current.flatpickr.clear();
                }}>
                <Trash2 />
            </button>
        </section>
    );
}