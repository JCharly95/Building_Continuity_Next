import "./globals.css";
import { Inter } from "next/font/google";
import Pie_Pagina from "./components/ui/pie";

const inter = Inter({
    subsets: ['latin']
});

export const metadata = {
    title: 'Building Continuity',
    description: 'El mejor sistema web para gestionar tu inmueble inteligente'
};

export default function RootLayout({ children }){
    return(
        <html lang="es">
            <body className={`${inter.className} w-full h-full flex flex-col items-center justify-center`}>
                { children }
                <Pie_Pagina />
            </body>
        </html>
    );
}