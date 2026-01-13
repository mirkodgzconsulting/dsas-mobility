import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Vehicle {
    id: string;
    titolo: string;
    marca: string;
    modello: string;
    versione: string;
    canone_mensile: number;
    immagine_url: string;
    targa?: string;
    promo: boolean;
    noleggio_breve: boolean;
}

interface VehicleListProps {
    initialVehicles: Vehicle[];
}

export default function VehicleList({ initialVehicles }: VehicleListProps) {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Sei sicuro di voler eliminare questo veicolo? Questa azione non può essere annullata.')) {
            return;
        }

        setDeletingId(id);
        try {
            const { error } = await supabase
                .from('veicoli')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setVehicles(prev => prev.filter(v => v.id !== id));
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Errore durante l\'eliminazione del veicolo.');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.titolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.modello.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.targa && vehicle.targa.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* TOOLBAR */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Cerca veicolo per marca, modello o titolo..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="text-sm text-gray-500">
                    Totale Veicoli: <span className="font-bold text-gray-900">{vehicles.length}</span>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <th className="px-6 py-4">Veicolo</th>
                            <th className="px-6 py-4">Titolo / Info</th>
                            <th className="px-6 py-4">Prezzo</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredVehicles.length > 0 ? (
                            filteredVehicles.map(vehicle => (
                                <tr key={vehicle.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 w-24">
                                        <div className="h-16 w-24 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 relative">
                                            {vehicle.immagine_url ? (
                                                <img
                                                    src={vehicle.immagine_url}
                                                    alt={vehicle.titolo}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><image x="1" y="1" width="22" height="22"></image></svg>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 mb-1">{vehicle.titolo}</div>
                                        <div className="text-xs text-gray-500 font-medium">
                                            {vehicle.marca} {vehicle.modello} <span className="text-gray-300 mx-1">|</span> {vehicle.versione}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-primary">€ {vehicle.canone_mensile || vehicle.noleggio_breve ? 'Variabile' : '0'}</div>
                                        <div className="text-xs text-gray-400">Canone/Mese</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {vehicle.noleggio_breve ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                                Breve
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                Lungo
                                            </span>
                                        )}
                                        {vehicle.promo && (
                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                                Promo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={`/admin/veicoli/edit/${vehicle.id}`}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifica"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </a>
                                            <button
                                                onClick={() => handleDelete(vehicle.id)}
                                                disabled={deletingId === vehicle.id}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Elimina"
                                            >
                                                {deletingId === vehicle.id ? (
                                                    <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    {searchTerm ? 'Nessun veicolo trovato per questa ricerca.' : 'Nessun veicolo presente nel database.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
