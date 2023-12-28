'use client';
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

export default function Lista_Sensores({ solFilBus, elemSel, title }){
    // Variable de estado para abrir/cerrar el menu desplegable
    const [bandeMenu, setBandeMenu] = useState(false);
    // Variable de estado para establecer el valor a mostrar en el menu desplegable
    const [tituloMenu, setTituloMenu] = useState(title);

    // Metodo para abrir o cerrar la lista desplegable, segun el estado en el que este
    const OpenCloseMenu = () => { 
        setBandeMenu(!bandeMenu); 
    }
    return (
        <Dropdown isOpen={bandeMenu} toggle={OpenCloseMenu}>
            <DropdownToggle caret>
                {tituloMenu}
            </DropdownToggle>
            <DropdownMenu>
                {
                    elemSel.map((elemento, index) => {
                        return (
                            <DropdownItem onClick={ () => {
                                    solFilBus (elemento); 
                                    setTituloMenu(elemento);
                                }
                            } key={"SenBD"+index}>
                                {elemento}
                            </DropdownItem>
                        );
                    })
                }
            </DropdownMenu>
        </Dropdown>
    );
}