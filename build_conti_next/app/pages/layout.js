import BarraNavega from './components/navBar/page';

export default function PageLayout({ children }){
    return (
        <section>
            <BarraNavega />
            { children }
        </section>
    );
}