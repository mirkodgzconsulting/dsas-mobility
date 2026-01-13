
interface BadgeProps {
    variant?: 'success' | 'info' | 'warning' | 'neutral' | 'outline' | 'glass';
    children: React.ReactNode;
    className?: string;
}

export default function Badge({
    variant = 'neutral',
    children,
    className = ''
}: BadgeProps) {

    const baseStyles = "inline-flex items-center px-3 py-1 rounded-pill text-xs font-bold uppercase tracking-wide border";

    const variants = {
        success: "bg-green-100 text-green-700 border-green-200",
        info: "bg-blue-50 text-blue-700 border-blue-200",
        warning: "bg-orange-50 text-orange-700 border-orange-200",
        neutral: "bg-gray-100 text-gray-600 border-gray-200",
        outline: "bg-transparent text-primary border-primary/20",
        glass: "bg-white/10 text-secondary border-white/20 backdrop-blur-sm"
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
