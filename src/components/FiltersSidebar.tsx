import { useState, useEffect } from 'react';

interface FiltersState {
    brand: string;
    category: string;
    fuel: string;
    transmission: string;
    maxPrice: number;
}

interface FiltersSidebarProps {
    filters: FiltersState;
    setFilters: (filters: FiltersState) => void;
    brands: string[];
    categories: string[];
}

export default function FiltersSidebar({ filters, setFilters, brands, categories }: FiltersSidebarProps) {

    const handleChange = (key: keyof FiltersState, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    return (
        <div className="bg-white rounded-card shadow-soft p-6 border border-gray-100 h-full">
            <h3 className="heading-3 text-primary mb-6 uppercase tracking-wide text-lg border-b border-gray-100 pb-4">
                Filtra la tua ricerca
            </h3>

            <div className="space-y-6">
                {/* Brand Filter */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Marca
                    </label>
                    <select
                        value={filters.brand}
                        onChange={(e) => handleChange('brand', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Tutte le marche</option>
                        {brands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Categoria
                    </label>
                    <select
                        value={filters.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Tutte le categorie</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Fuel Filter */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Alimentazione
                    </label>
                    <select
                        value={filters.fuel}
                        onChange={(e) => handleChange('fuel', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Qualsiasi</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Benzina">Benzina</option>
                        <option value="Ibrida">Ibrida</option>
                        <option value="Elettrica">Elettrica</option>
                        <option value="GPL">GPL</option>
                    </select>
                </div>

                {/* Transmission Filter */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Cambio
                    </label>
                    <select
                        value={filters.transmission}
                        onChange={(e) => handleChange('transmission', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Qualsiasi</option>
                        <option value="Manuale">Manuale</option>
                        <option value="Automatico">Automatico</option>
                    </select>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex justify-between">
                        <span>Canone Mensile (Max)</span>
                        <span className="text-secondary">€ {filters.maxPrice}</span>
                    </label>
                    <input
                        type="range"
                        min="200"
                        max="2000"
                        step="50"
                        value={filters.maxPrice}
                        onChange={(e) => handleChange('maxPrice', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>€ 200</span>
                        <span>€ 2000+</span>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={() => setFilters({ brand: '', category: '', fuel: '', transmission: '', maxPrice: 2000 })}
                        className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                    >
                        Reset Filtri
                    </button>
                </div>
            </div>
        </div>
    );
}
