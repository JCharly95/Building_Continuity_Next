'use client';
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { AlertTriangle } from 'react-feather';
import React, { useEffect, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalHeader, ModalBody, Alert } from "reactstrap";

export default function Lista_Sensores_NRegistrados({ selSenNRegi }){
    // Variable de estado para abrir/cerrar el menu desplegable
    const [bandeMenu, setBandeMenu] = useState(false);
    // Variable de estado para establecer el valor a mostrar en el menu desplegable
    const [tituloMenu, setTituloMenu] = useState("Seleccione el Identificador del Sensor");
    // Variable de estado para obtener la lista de los sensores registrados en la BD
    const [listaSenso, setListaSenso] = useState([]);
    // Variable de estado para la apertura o cierre del modal de aviso de errores
    const [modalError, setModalError] = useState(false);
    // Variable de estado para el establecimiento del mensaje contenido en el modal de errores
    const [modalMsg, setModalMsg] = useState("Descripción General");
    // Metodo para abrir o cerrar la lista desplegable, segun el estado en el que este
    function OpenCloseMenu(){
        setBandeMenu(!bandeMenu);
    }
    // Abrir/Cerrar modal de errores
    function OpenCloseError(){
        setModalError(!modalError);
    }

    // UseEffect con la obtencion de la lista de sensores no registrados y creacion del arreglo de la lista del menu dropdown
    useEffect(() => {
        async function consulSenso(){
            try {
                const peticion = await axios.get('http://localhost/Proyectos_Propios/BuildContiBack/index.php?tipo_consulta=senNoRegi');
                const datos = peticion.data;
                setListaSenso(
                    datos.map((sensor) => ({
                        ID: `${sensor.ID}`,
                        ID_Niag: `${sensor.ID_}`,
                        Unidad: `${sensor.VALUEFACETS}`
                    }))
                );
            }catch(error){
                // Si ocurrio un error en la peticion de busqueda se mostrará aqui
                if(error.response){
                    // Primer caso, el servidor no encontro la informacion de los sensores (Error contemplado)
                    setModalMsg("Selección Bloqueada, Información No Procesada");
                }else if (error.request){
                    // Segundo caso, el cliente no se pudo contactar con el servidor o este no respondio (Error controlado)
                    setModalMsg("Servicio No Disponible, Información Inaccesible");
                }else{
                    // Tercer caso, ocurrio un error en la disponibilidad de la respuesta del servidor (Error no contemplado y desconocido)
                    setModalMsg("Servicio No Disponible, Favor de Intentar Después");
                }
                OpenCloseError();
            }
        }
        consulSenso();
    }, []);

    return(
        <section>
            <Dropdown isOpen={bandeMenu} toggle={OpenCloseMenu}>
                <DropdownToggle caret>
                    {tituloMenu}
                </DropdownToggle>
                <DropdownMenu>
                    {
                        listaSenso.map((sensor, index) => {
                            return (
                                <DropdownItem onClick={ () => {
                                        selSenNRegi(`${sensor.ID_Niag}`);
                                        setTituloMenu(`${sensor.ID_Niag}`);
                                    }
                                } key={"SenBD"+index}> {`${sensor.ID_Niag}`} </DropdownItem>
                            );
                        })
                    }
                </DropdownMenu>
            </Dropdown>
            <Modal isOpen={modalError} toggle={OpenCloseError}>
                <ModalHeader toggle={OpenCloseError}>
                    Error <AlertTriangle color="red" size={30} />
                </ModalHeader>
                <ModalBody>
                    <Alert color="danger">
                        {modalMsg}
                    </Alert>
                </ModalBody>
            </Modal>
        </section>
    );
}