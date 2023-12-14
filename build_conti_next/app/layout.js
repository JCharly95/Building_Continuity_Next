import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import Pie_Page from './components/footer/page';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Building Continuity',
    description: 'El mejor sistema web para gestionar tu inmueble inteligente'
};

export default function RootLayout({ children }){
    return(
        <html lang='es'>
            <body className={inter.className}>
                { children }
                <Pie_Page />
            </body>
        </html>
    );
}