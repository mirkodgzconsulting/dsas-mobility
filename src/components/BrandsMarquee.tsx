import React from 'react';

const BRANDS = [
    { name: 'Fiat', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Fiat_Automobiles_logo.svg/2048px-Fiat_Automobiles_logo.svg.png' },
    { name: 'Audi', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/1024px-Audi-Logo_2016.svg.png' },
    { name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/1024px-BMW.svg.png' },
    { name: 'Mercedes', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Mercedes-Benz_Star_2022.svg/1024px-Mercedes-Benz_Star_2022.svg.png' },
    { name: 'Volkswagen', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/1024px-Volkswagen_logo_2019.svg.png' },
    { name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tesla_logo.png/640px-Tesla_logo.png' },
    { name: 'Jeep', logo: 'https://liberadores.es/wp-content/uploads/2018/02/Jeep-logo-3D-2560x1440-e1519302285966.png' },
    { name: 'Peugeot', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Peugeot_Logo.svg/1024px-Peugeot_Logo.svg.png' },
    { name: 'Toyota', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/1024px-Toyota_carlogo.svg.png' },
    { name: 'Ford', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/1024px-Ford_logo_flat.svg.png' },
];

export default function BrandsMarquee() {
    return (
        <div className="w-full overflow-hidden bg-white py-10 border-b border-gray-100">
            <div className="relative w-full">
                {/* Gradient Masks for smooth fade effect at edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>

                <div className="flex w-max animate-loop-scroll hover:pause-animation">
                    {/* ORIGINAL SET */}
                    {BRANDS.map((brand, index) => (
                        <div key={`brand-${index}`} className="flex items-center justify-center mx-8 w-32 h-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="max-w-full max-h-full object-contain"
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    ))}
                    {/* DUPLICATE SET FOR INFINITE LOOP */}
                    {BRANDS.map((brand, index) => (
                        <div key={`brand-dup-${index}`} className="flex items-center justify-center mx-8 w-32 h-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="max-w-full max-h-full object-contain"
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
