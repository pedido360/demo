import Link from "next/link";
import { ReactNode } from "react";

interface LinkButtonProps {
    href: string;
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    className?: string;
}

export default function LinkButton({
    href,
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = "",
}: LinkButtonProps) {
    const baseClasses =
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 active:scale-[0.98]";

    const sizeClasses = {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    const variantClasses = {
        primary:
            "bg-orange-500 text-white hover:bg-orange-600",

        secondary:
            "bg-gray-800 text-white hover:bg-gray-900",

        outline:
            "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100",
    };

    return (
        <Link
            href={href}
            className={`
                ${baseClasses}
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${fullWidth ? "w-full" : ""}
                ${className}
            `}
        >
            {leftIcon}

            {children}

            {rightIcon}
        </Link>
    );
}