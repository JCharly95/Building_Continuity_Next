'use client';
import React, { useRef } from "react";
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { Calendar } from 'react-feather';
import "bootstrap/dist/css/bootstrap.min.css";

export default function Calendario({ valorSel, tipoCal }){
    const calenRef = useRef(null);

    const optionsConfCalen = {
        enableTime: true,
        altFormat: "Y/m/d; H:i",
        dateFormat: 'Y-m-d H:i',
        defaultDate: Date.now(),
        onClose: function(selectedDates, dateSel) {
            valorSel(new Date(dateSel));
        }
    }

    return(
        <section className='input-group mb-3'>
            <span className='input-group-text'><Calendar/></span>
            <Flatpickr className='form-control' placeholder={"Seleccionar Fecha y Hora de " + tipoCal + ":"} options={optionsConfCalen} ref={calenRef} />
            <button className='btn btn-outline-danger' type="button" onClick={() => {
                if (!calenRef?.current?.flatpickr) return;
                    calenRef.current.flatpickr.clear();
                }}>
                Borrar
            </button>
        </section>
    );
}