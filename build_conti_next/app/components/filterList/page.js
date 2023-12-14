'use client'
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

export default function Lista_Filtros_Grafica({ selFilBus, elemSel, title }){
    // Variable de estado para abrir/cerrar el menu desplegable
    const [bandeMenu, setBandeMenu] = useState(false);
    // Variable de estado para establecer el valor a mostrar en el menu desplegable
    const [tituloMenu, setTituloMenu] = useState(title);
    // Metodo para abrir o cerrar la lista desplegable, segun el estado en el que este
    const abrirCerrarMenu = () => {
        setBandeMenu(!bandeMenu);
    }
    return (
        <div>
            <Dropdown isOpen={bandeMenu} toggle={abrirCerrarMenu}>
                <DropdownToggle caret>
                    {tituloMenu}
                </DropdownToggle>
                <DropdownMenu>
                    {
                        elemSel.map((elemento, index) => {
                            return (
                                <DropdownItem onClick={ () => {
                                        selFilBus(`${elemento.valor};${elemento.nombre};${elemento.unidad}`); 
                                        setTituloMenu(`${elemento.nombre} (${elemento.unidad})`);
                                    }
                                } key={"TipSensor"+index}>{`${elemento.nombre} (${elemento.unidad})`}</DropdownItem>
                            );
                        })
                    }
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}