'use client'
import Link from 'next/link';
import React, { useState } from "react";
import estilos from './navbar.module.css';
import { useRouter } from 'next/navigation';
import "bootstrap/dist/css/bootstrap.min.css";
import { Nav, Navbar, NavItem, NavbarToggler, Collapse, NavbarBrand } from "reactstrap";

export default function BarraNavega(){
    // Constante de historial de navegacion
    const navegar = useRouter();
    // Constante de estado para saber si la barra esta abierta o no
    const [navBarSta, setNavBarSta] = useState(false);
    // Lista de opciones para la barra
    const opcs = listaOpcNav();

    return (
        <Navbar className={estilos.barraContainer} light expand="md">
            <NavbarBrand style={{color: "white"}}> Building Continuity </NavbarBrand>
            <NavbarToggler onClick={() => { setNavBarSta(!navBarSta) }} />
            <Collapse isOpen={navBarSta} navbar>
                <Nav className="mr-auto">
                    {
                        opcs.map((item, index) => {
                            return (
                                <NavItem key={"ItemLink"+index}>
                                    <Link href={item.url} className={estilos.enlace}> {item.title} </Link>
                                </NavItem>
                            );
                        })
                    }
                </Nav>
            </Collapse>
        </Navbar>
    );
}

/* 
    Esta funcion sirve para listar de manera dinamica las opciones que tendra la barra de navegacion.
    NOTA: Las url deben ser dadas de alta primero en el archivo de direcciones en ruteo
*/
function listaOpcNav(){
    const listaOpc = [
        {
            title: "Grafica",
            url: "/pages/graphics"
        },
        {
            title: "Perfil",
            url: "/pages/profile"
        },
        {
            title: "Cerrar Sesion",
            url: "/pages/session"
        }
    ];
    return listaOpc;
}