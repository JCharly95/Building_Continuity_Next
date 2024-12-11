'use client';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'react-feather';
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, Alert } from "reactstrap";

export default function CerrarSesPage(){
    // Variable de estado para la obtencion de la navegacion y redireccionamiento usando el react-router
    const navegar = useRouter();
    // Variable de estado para la apertura o cierre del modal de aviso de errores
    const [modalAdv, setModalAdv] = useState(false);
    // Variable de estado para el establecimiento del mensaje contenido en el modal de errores
    const [modalMsg, setModalMsg] = useState("Esperando el estado de respuesta...");

    // UseEffect de accion de cierre de sesion
    useEffect(() => {
        // Limpiar la cache local usada para la sesion
        localStorage.clear();
        // Establecer el mensaje de salida y abrir el modal
        setModalMsg("Gracias por su atencion, cerrando sesion...");
        setModalAdv(true);
        // Redireccionamiento hacia el login despues de 2 segundos
        setTimeout( () => ( navegar.push("/") ), 2000);
    }, [navegar]);

    // Abrir/Cerrar modal de avisos
    function OpenCloseAvisos() {
        setModalAdv(!modalAdv);
    }

    return(
        <section className="container-fluid">
            <Modal isOpen={modalAdv} toggle={OpenCloseAvisos}>
                <ModalHeader toggle={OpenCloseAvisos}>
                    Adios <AlertCircle color="blue" size={30} />
                </ModalHeader>
                <ModalBody>
                    <Alert color="success">
                        {modalMsg}
                    </Alert>
                </ModalBody>
            </Modal>
        </section>
    );
}