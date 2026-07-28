import { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "danger";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    className = "",
    disabled,
    style,
    ...props
}: ButtonProps) {
    const baseClasses =
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

    const sizeClasses = {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    const variantStyle = {
        primary: {
            backgroundColor: "var(--primary)",
            color: "#ffffff",
        },
        secondary: {
            backgroundColor: "var(--secondary)",
            color: "#ffffff",
        },
        outline: {
            backgroundColor: "#ffffff",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
        },
        danger: {
            backgroundColor: "var(--danger)",
            color: "#ffffff",
        },
    };

    return (
        <button
            {...props}
            disabled={disabled || loading}
            className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
            style={{
                ...variantStyle[variant],
                ...style,
            }}
            onMouseEnter={(e) => {
                if (variant === "primary") {
                    e.currentTarget.style.backgroundColor = "var(--primary-dark)";
                }

                if (variant === "secondary") {
                    e.currentTarget.style.opacity = "0.9";
                }

                if (variant === "danger") {
                    e.currentTarget.style.opacity = "0.9";
                }

                if (variant === "outline") {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                }
            }}
            onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, variantStyle[variant]);
            }}
            onFocus={(e) => {
                e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(249,115,22,.25)";
            }}
            onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            {loading ? (
                <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Cargando...
                </>
            ) : (
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
}