import { useState, useEffect } from 'react';
import Button from './ui/Button';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    const navLinkClass = (path: string) =>
        `hover:text-secondary transition-colors uppercase ${currentPath === path ? 'text-secondary' : ''}`;

    const navLinkClassNormal = (path: string) =>
        `hover:text-secondary transition-colors ${currentPath === path ? 'text-secondary' : ''}`;


    return (
        <header className="fixed top-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                {/* LOGO AREA */}
                <a href="/" className="flex items-center gap-2">
                    <img
                        src="/logo_dsas.webp"
                        alt="DSAS Mobility Logo"
                        className="h-14 w-auto object-contain"
                    />
                </a>

                {/* DESKTOP NAV */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-bold text-gray-800 text-sm lg:text-base">
                    <a href="/lungo-termine" className={navLinkClass('/lungo-termine')}>Noleggio LUNGO TERMINE</a>
                    <a href="/breve-termine" className={navLinkClass('/breve-termine')}>Noleggio BREVE TERMINE</a>
                    <a href="/chi-siamo" className={navLinkClassNormal('/chi-siamo')}>Chi siamo</a>
                    <a href="/faq" className={navLinkClassNormal('/faq')}>FAQ</a>
                </nav>

                {/* CTAs */}
                <div className="hidden md:flex items-center gap-4">
                    <a
                        href="https://wa.me/390000000000"
                        className="flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors"
                    >
                        {/* Whatsapp Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0 .5-.5l.14-.38a.5.5 0 0 0-.38-.62a9 9 0 0 0-1.74 0a.5.5 0 0 0-.3 0 .5.5 0 0 0-.25.5v1a.5.5 0 0 0 .5.5z" /></svg>
                        +39 351 000 0000
                    </a>
                    <Button variant="primary" className="transform hover:-translate-y-0.5">
                        Richiedi Preventivo
                    </Button>
                </div>

                {/* MOBILE MENU TOGGLE */}
                <button
                    className="md:hidden p-2 text-primary"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                </button>
            </div>

            {/* MOBILE NAV DROPDOWN */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full h-[calc(100vh-80px)] overflow-y-auto bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col gap-4 pb-8">
                    <a href="/lungo-termine" className={`text-lg font-medium uppercase ${currentPath === '/lungo-termine' ? 'text-secondary' : 'text-gray-800'}`}>Noleggio LUNGO TERMINE</a>
                    <a href="/breve-termine" className={`text-lg font-medium uppercase ${currentPath === '/breve-termine' ? 'text-secondary' : 'text-gray-800'}`}>Noleggio BREVE TERMINE</a>
                    <a href="/chi-siamo" className={`text-lg font-medium ${currentPath === '/chi-siamo' ? 'text-secondary' : 'text-gray-800'}`}>Chi siamo</a>
                    <a href="/faq" className={`text-lg font-medium ${currentPath === '/faq' ? 'text-secondary' : 'text-gray-800'}`}>FAQ</a>
                    <Button variant="primary" className="w-full mt-auto">
                        Richiedi Preventivo
                    </Button>
                </div>
            )}
        </header>
    );
}
