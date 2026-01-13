
import Badge from './ui/Badge';
import Button from './ui/Button';

interface VehicleProps {
    brand: string;
    model: string;
    version: string;
    price: number;
    image: string;
    fuel: string;
    transmission: string;
    available: boolean;
}

export default function VehicleCard({ vehicle }: { vehicle: VehicleProps }) {
    return (
        <div className="group relative bg-white rounded-card shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">
            {/* BADGE */}
            <div className="absolute top-4 left-4 z-10">
                <Badge variant={vehicle.available ? 'success' : 'info'}>
                    {vehicle.available ? 'Pronta Consegna' : 'Ordinabile'}
                </Badge>
            </div>            {/* IMAGE AREA */}
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-200 border-b border-gray-100">
                <img
                    src={vehicle.image}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-contain p-6 object-center group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* CONTENT */}
            <div className="p-6 flex flex-col flex-grow relative">
                {/* BRAND & MODEL */}
                <div className="mb-4">
                    <h3 className="text-secondary font-bold text-sm tracking-wide uppercase mb-1">{vehicle.brand}</h3>
                    <h2 className="text-primary font-bold text-xl leading-tight group-hover:text-secondary transition-colors">
                        {vehicle.model}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-1">{vehicle.version}</p>
                </div>

                {/* SPECS GRID */}
                <div className="grid grid-cols-2 gap-2 py-4 border-t border-gray-100 mb-6">
                    <SpecItem icon="fuel" label={vehicle.fuel} />
                    <SpecItem icon="transmission" label={vehicle.transmission} />
                </div>

                {/* BOTTOM ACTION */}
                <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium">Da</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-primary">€{vehicle.price}</span>
                            <span className="text-sm text-gray-400 font-medium">/mese</span>
                        </div>
                        <span className="text-[10px] text-gray-400">iva esclusa</span>
                    </div>

                    <Button variant="primary" size="icon" className="group-hover:scale-110 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Subcomponent for specs to reduce repetition
function SpecItem({ icon, label }: { icon: string, label: string }) {
    const icons: Record<string, React.ReactNode> = {
        fuel: <path d="M3 22v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />, // Simplified for demo
        transmission: <circle cx="12" cy="12" r="10" />,
        seats: <path d="M19 9l-7 7-7-7" />
    };

    // Full SVG paths
    const svgPaths = {
        fuel: <><path d="M3 22v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" /><line x1="3" y1="18" x2="21" y2="18" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
        transmission: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
        seats: <path d="M19 9l-7 7-7-7" />
    };

    return (
        <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg">
            <span className="text-gray-400 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {svgPaths[icon as keyof typeof svgPaths]}
                </svg>
            </span>
            <span className="text-xs font-semibold text-gray-700">{label}</span>
        </div>
    );
}
