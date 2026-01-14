import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from './ui/Button';

interface ConfiguratorProps {
    initialMonths?: number;
    initialDistance?: string;
    basePrice: number;
    vehicleTitle?: string;
    vehicleVersion?: string;
    image?: string;
    onSubmit?: (data: any) => void;
}

const MONTH_OPTIONS = [24, 36, 48, 60];
const KM_OPTIONS = ['10.000', '15.000', '20.000', '25.000', '30.000', '35.000', '40.000'];

export default function Configurator({
    initialMonths = 36,
    initialDistance = '15.000',
    basePrice,
    vehicleTitle = 'Veicolo Selezionato',
    vehicleVersion = '',
    image,
    onSubmit
}: ConfiguratorProps) {
    const [selectedMonths, setSelectedMonths] = useState(initialMonths);
    const [selectedDistance, setSelectedDistance] = useState(initialDistance);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [userType, setUserType] = useState<'privato' | 'piva'>('privato');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        fiscalCode: '',
        message: '',
        privacy: false,
        marketing: false
    });

    const handleKmChange = (val: string) => {
        setSelectedDistance(val);
    };

    // Slider logic
    let distanceIndex = KM_OPTIONS.indexOf(selectedDistance);
    if (distanceIndex === -1) {
        const normalized = KM_OPTIONS.find(opt => opt.replace('.', '') === selectedDistance.toString().replace('.', ''));
        if (normalized) {
            distanceIndex = KM_OPTIONS.indexOf(normalized);
            if (normalized !== selectedDistance) setSelectedDistance(normalized);
        } else {
            distanceIndex = 1;
        }
    }
    const sliderPercentage = (distanceIndex / (KM_OPTIONS.length - 1)) * 100;

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isModalOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                vehicle: vehicleTitle,
                version: vehicleVersion,
                config: { months: selectedMonths, km: selectedDistance },
                user: { type: userType, ...formData }
            };

            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Errore sconosciuto');

            alert('Richiesta inviata con successo! Verrai contattato a breve.');
            setIsModalOpen(false);
            setFormData({ ...formData, message: '', privacy: false, marketing: false });

        } catch (error: any) {
            console.error(error);
            alert(`Errore: ${error.message || 'Si è verificato un errore.'}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-[20px] p-6 shadow-soft border border-gray-100">
                <h3 className="text-secondary font-extrabold tracking-widest uppercase text-lg mb-2 block !text-primary !mb-4">COSTRUISCI LA TUA OFFERTA</h3>
                <p className="text-gray-500 text-sm mb-6">Richiedi il tuo preventivo personalizzato</p>

                {/* Months Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Seleziona i mesi di <span className="text-primary">Noleggio</span></label>
                    <div className="grid grid-cols-4 gap-2">
                        {MONTH_OPTIONS.map(m => (
                            <button
                                key={m}
                                onClick={() => setSelectedMonths(m)}
                                className={`py-2 px-1 rounded-full text-sm font-bold border transition-all ${selectedMonths === m
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                                    : 'bg-white text-gray-400 border-gray-200 hover:border-primary/50'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KM Selector */}
                <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Seleziona i <span className="text-primary">Chilometri Annui</span></label>
                    <div
                        className="w-full bg-gray-200 rounded-full h-1.5 mb-4 relative cursor-pointer flex items-center"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percentage = x / rect.width;
                            const index = Math.round(percentage * (KM_OPTIONS.length - 1));
                            const safeIndex = Math.max(0, Math.min(index, KM_OPTIONS.length - 1));
                            handleKmChange(KM_OPTIONS[safeIndex]);
                        }}
                    >
                        <div
                            className="absolute left-0 h-full bg-primary/20 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${sliderPercentage}%` }}
                        ></div>
                        <div
                            className="absolute w-5 h-5 bg-secondary border-2 border-white rounded-full shadow-md transition-all duration-300 ease-out z-10 hover:scale-110"
                            style={{
                                left: `${sliderPercentage}%`,
                                top: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-medium px-1">
                        {KM_OPTIONS.map((km) => (
                            <button
                                key={km}
                                onClick={() => handleKmChange(km)}
                                className={`${selectedDistance === km ? 'text-secondary font-bold scale-110' : 'text-gray-400 hover:text-gray-600'} transition-all`}
                            >
                                {km}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CTA SECTION */}
                <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-primary font-bold text-lg mb-1">RICHIEDI IL TUO PREVENTIVO</h4>
                    <p className="text-gray-400 text-xs mb-4">Un consulente ti contatterà entro 24 ore</p>
                    <Button
                        className="w-full rounded-full py-4 text-base font-bold !bg-secondary !text-white hover:opacity-90 transition-opacity"
                        onClick={() => setIsModalOpen(true)}
                    >
                        RICHIEDI ORA
                    </Button>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm transition-all animate-fadeIn">
                    <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn relative">

                        {/* Unified Modal Content */}
                        <div className="p-6 md:p-8 bg-white relative">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-50 transition-colors text-gray-400 hover:text-primary z-10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <div className="mb-8 border-b border-gray-100 pb-6">
                                <h2 className="font-heading font-extrabold text-2xl text-primary mb-1 uppercase leading-tight pr-8">{vehicleTitle}</h2>
                                <p className="text-gray-500 mb-4 text-sm">{vehicleVersion}</p>

                                <div className="flex items-center gap-6 bg-gray-50 rounded-lg p-3 inline-flex">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Durata</span>
                                        <span className="text-lg font-bold text-primary leading-none">{selectedMonths} <span className="text-xs font-normal text-gray-400">Mesi</span></span>
                                    </div>
                                    <div className="w-px h-6 bg-gray-200"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Percorrenza</span>
                                        <span className="text-lg font-bold text-primary leading-none">{selectedDistance} <span className="text-xs font-normal text-gray-400">Km</span></span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* User Type Selector */}
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="font-bold text-primary text-sm">Sono un:</span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { console.log('Clicked user type'); setUserType('privato'); }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${userType === 'privato' ? 'bg-secondary text-white border-secondary shadow-md' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            Privato
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUserType('piva')}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${userType === 'piva' ? 'bg-secondary text-white border-secondary shadow-md' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            P.IVA
                                        </button>
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="relative z-0">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Nome e Cognome"
                                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all placeholder:text-gray-400 text-sm font-medium bg-gray-50/50 focus:bg-white text-gray-900"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative z-0">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all placeholder:text-gray-400 text-sm font-medium bg-gray-50/50 focus:bg-white text-gray-900"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative z-0">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Telefono"
                                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all placeholder:text-gray-400 text-sm font-medium bg-gray-50/50 focus:bg-white text-gray-900"
                                            required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative z-0">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Codice Fiscale"
                                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all placeholder:text-gray-400 text-sm font-medium bg-gray-50/50 focus:bg-white text-gray-900"
                                            value={formData.fiscalCode}
                                            onChange={e => setFormData({ ...formData, fiscalCode: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <textarea
                                        placeholder="Facci sapere se hai necessità particolari..."
                                        rows={3}
                                        className="w-full p-3 rounded-lg border border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all placeholder:text-gray-400 text-sm font-medium resize-none bg-gray-50/50 focus:bg-white text-gray-900"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="space-y-2 pt-1 border-t border-gray-50">
                                    <label className="flex items-start gap-2.5 cursor-pointer group">
                                        <div className="relative flex items-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                className="peer appearance-none w-4 h-4 border-2 border-gray-300 rounded checked:bg-secondary checked:border-secondary transition-colors"
                                                required
                                                checked={formData.privacy}
                                                onChange={e => setFormData({ ...formData, privacy: e.target.checked })}
                                            />
                                            <svg className="absolute w-2.5 h-2.5 text-white pointer-events-none hidden peer-checked:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                        <span className="text-[11px] text-gray-500 leading-tight group-hover:text-gray-700 transition-colors">Ho letto l'informativa sulla <a href="#" className="underline decoration-gray-300 hover:decoration-secondary hover:text-secondary transition-all">Privacy</a></span>
                                    </label>

                                    <label className="flex items-start gap-2.5 cursor-pointer group">
                                        <div className="relative flex items-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                className="peer appearance-none w-4 h-4 border-2 border-gray-300 rounded checked:bg-secondary checked:border-secondary transition-colors"
                                                checked={formData.marketing}
                                                onChange={e => setFormData({ ...formData, marketing: e.target.checked })}
                                            />
                                            <svg className="absolute w-2.5 h-2.5 text-white pointer-events-none hidden peer-checked:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                        <span className="text-[11px] text-gray-500 leading-tight group-hover:text-gray-700 transition-colors">Marketing e profilazione</span>
                                    </label>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full rounded-pill py-3.5 text-sm font-bold !bg-secondary !text-white hover:opacity-90 hover:scale-[1.01] shadow-lg shadow-secondary/20 transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'INVIO IN CORSO...' : 'INVIA RICHIESTA'}
                                    </Button>
                                </div>

                            </form>
                        </div>

                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
