import React from 'react';
import estilos from './footer.module.css';

export default function Pie_Page(){
    const fecha = new Date();
    const copyright = "Buiding Continuity "+fecha.getFullYear()+" Copyright © Todos los derechos reservados";
    return(
        <footer className={estilos.footer}>
            <p>{copyright}</p>
        </footer>
    );
}