
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    className?: string;
    href?: string;
    as?: 'button' | 'a';
}

export default function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    href,
    as = 'button',
    ...props
}: ButtonProps) {

    // Base styles
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 rounded-pill focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    // Variants
    const variants = {
        primary: "bg-secondary text-white hover:bg-orange-600 shadow-lg hover:shadow-orange-500/30",
        secondary: "bg-primary text-white hover:bg-blue-900 shadow-lg",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
        ghost: "text-gray-600 hover:text-primary hover:bg-gray-100",
        white: "bg-white text-primary hover:bg-gray-100 shadow-lg"
    };

    // Sizes
    const sizes = {
        sm: "text-xs px-4 py-2",
        md: "text-sm px-6 py-2.5",
        lg: "text-base px-8 py-3.5",
        icon: "p-3"
    };

    const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    if (href) {
        return (
            <a href={href} className={combinedClasses} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
                {children}
            </a>
        );
    }

    return (
        <button className={combinedClasses} {...props}>
            {children}
        </button>
    );
}
