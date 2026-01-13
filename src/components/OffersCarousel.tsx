import { useState, useEffect } from 'react';
import VehicleCard from './VehicleCard';

interface Vehicle {
    brand: string;
    model: string;
    version: string;
    price: number;
    image: string;
    fuel: string;
    transmission: string;
    available: boolean;
}

export default function OffersCarousel({ vehicles }: { vehicles: Vehicle[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setItemsPerPage(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(3);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, vehicles.length - itemsPerPage);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    // Auto-play effect
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 4000); // 4 seconds interval

        return () => clearInterval(interval);
    }, [isPaused, maxIndex, itemsPerPage]); // Re-run if maxIndex changes (resize)

    return (
        <div
            className="relative group px-0 md:px-12"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >

            {/* LEFT ARROW */}
            <button
                onClick={prevSlide}
                className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-primary hover:text-secondary transition-colors"
                aria-label="Previous"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>

            {/* VIEWPORT */}
            <div className="overflow-hidden md:p-4 -mx-4 md:mx-0 px-4 md:px-0">
                <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
                >
                    {vehicles.map((vehicle, index) => (
                        <div
                            key={index}
                            style={{ flex: `0 0 ${100 / itemsPerPage}%` }}
                            className="h-full px-4"
                        >
                            <VehicleCard vehicle={vehicle} />
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT ARROW */}
            <button
                onClick={nextSlide}
                className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-primary hover:text-secondary transition-colors"
                aria-label="Next"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>

            {/* MOBILE CONTROLS */}
            <div className="flex md:hidden justify-center gap-4 mt-6">
                <button
                    onClick={prevSlide}
                    className="p-3 bg-white rounded-full shadow-md text-primary"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button
                    onClick={nextSlide}
                    className="p-3 bg-white rounded-full shadow-md text-primary"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
            </div>
        </div>
    );
}
