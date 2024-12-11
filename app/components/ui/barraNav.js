'use client';
import Link from "next/link";
import react, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Modal from "@/app/components/ui/modals/modal";
import Dialog from "@/app/components/ui/modals/plantillas/dialog";

export default function Barra_Navega(){
    // Variable de estado para la visibilidad de la barra de navegacion
    const [nav, setNav] = useState(false);
    // Obtener la ruta actual
    const pathname = usePathname();
    // Constante del router para el redireccionamiento
    const router = useRouter();
    /*Variable de estado para la apertura/cierre del modal
    Variable de estado para el titulo del modal
    Variable de estado para establecer el contenido del modal */
    const [modalOpen, setModalOpen] = useState(false),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState("");

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => {
        setModalOpen(estado);
    }

    // Funcion para cierre de sesion
    const cerSes = () => {
        // Establecer el titulo del modal, el contenido del mismo y la apertura de este
        setModalTitu("Cerrar Sesión");
        setModalConte(<Dialog textMsg="Gracias por su visita. Nos vemos después"/>);
        setModalOpen(true);

        // Limpiar la cache local usada para la sesion
        localStorage.clear();
        // Redireccionamiento hacia el login despues de 2 segundos
        setTimeout( () => ( router.push("/") ), 2000);
    }

    // Cambiar el estado de visibilidad de la barra de navegacion
    const handleNav = () => { setNav(!nav) };

    // Links de idea base
    /*
    https://medium.com/@ryaddev/build-responsive-navbar-with-tailwind-css-and-react-icons-3b13a272dec4
    https://medium.com/@hanekcud/how-to-create-responsive-navbar-in-next-js-using-tailwind-css-eed2e7dc925a
    https://v1.tailwindcss.com/components/navigation
    */

    return(
        <nav className="flex items-center justify-between flex-wrap bg-teal-600 p-4">
            <section className="flex items-center flex-shrink-0 text-white mr-6">
                <span>CDI</span>
                <span className="ml-2 font-semibold text-xl tracking-tight">Building Continuity</span>
            </section>
            <section className="block lg:hidden">
                <button type="button" className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white" onClick={handleNav}>
                    <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
                </button>
            </section>
            <section className={`w-full flex-grow lg:flex lg:items-center lg:w-auto ${nav ? 'block transition-all duration-500 ease-out' : 'hidden transition-all duration-500 ease-in'}`}>
                <section className="text-sm lg:flex-grow">
                    <Link href="/pages/grafica" className={`block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4 ${(pathname == "/pages/grafica" ? "border border-blue-500 rounded py-1 px-3 bg-blue-500 text-black" : "")}`}>
                        Grafica
                    </Link>
                    <Link href="/pages/perfil" className={`block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4 ${(pathname == "/pages/perfil" ? "border border-blue-500 rounded py-1 px-3 bg-blue-500  text-black" : "")}`}>
                        Perfil
                    </Link>
                    {/*<Link href="/pages/sesion" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white">
                        Cerrar Sesion
                    </Link>*/}
                    <Link href="" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white" onClick={cerSes}>
                        Cerrar Sesion
                    </Link>
                </section>
                { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
            </section>
        </nav>
    );
}