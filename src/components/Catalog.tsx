import { useState, useMemo } from 'react';
import FiltersSidebar from './FiltersSidebar';
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
    category?: string;
}

interface CatalogProps {
    initialVehicles: Vehicle[];
    brands: string[];
    categories: string[];
}

export default function Catalog({ initialVehicles, brands, categories }: CatalogProps) {
    const [filters, setFilters] = useState({
        brand: '',
        category: '',
        fuel: '',
        transmission: '',
        maxPrice: 2000
    });

    const filteredVehicles = useMemo(() => {
        return initialVehicles.filter(v => {
            // Brand Match
            if (filters.brand && v.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;

            // Category Match (Normalize strings loosely)
            if (filters.category && v.category) {
                const vCat = v.category.toLowerCase().replace(/\s/g, '');
                const fCat = filters.category.toLowerCase().replace(/\s/g, '');
                if (!vCat.includes(fCat) && !fCat.includes(vCat)) return false;
            }

            // Fuel Match
            if (filters.fuel && v.fuel.toLowerCase() !== filters.fuel.toLowerCase()) return false;

            // Transmission Match
            if (filters.transmission && v.transmission.toLowerCase() !== filters.transmission.toLowerCase()) return false;

            // Price Match
            if (v.price > filters.maxPrice) return false;

            return true;
        });
    }, [initialVehicles, filters]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* SIDEBAR (Left) */}
            <div className="w-full lg:w-1/4 sticky top-24">
                <FiltersSidebar
                    filters={filters}
                    setFilters={setFilters}
                    brands={brands}
                    categories={categories}
                />
            </div>

            {/* VEHICLE GRID (Right) */}
            <div className="w-full lg:w-3/4">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">
                        Trovati <span className="text-primary font-bold">{filteredVehicles.length}</span> veicoli
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.length > 0 ? (
                        filteredVehicles.map((vehicle, index) => (
                            <div className="h-full" key={index}>
                                <VehicleCard vehicle={vehicle} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-card border-dashed border-2 border-gray-200">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Nessun veicolo trovato</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">Prova a cambiare i filtri per vedere più risultati.</p>
                            <button
                                onClick={() => setFilters({ brand: '', category: '', fuel: '', transmission: '', maxPrice: 2000 })}
                                className="mt-6 px-6 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors"
                            >
                                Reset Filtri
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
