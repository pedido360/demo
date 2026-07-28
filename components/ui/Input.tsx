import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: ReactNode;
    error?: string;
    helperText?: string;
}

export default function Input({
    leftIcon,
    error,
    helperText,
    className = "",
    disabled,
    style,
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            <div
                className={`
          flex
          items-center
          gap-3
          rounded-lg
          border
          bg-white
          px-4
          transition-all
          duration-200
          focus-within:ring-2
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
                style={{
                    borderColor: error ? "var(--danger)" : "var(--border)",
                    boxShadow: error
                        ? "0 0 0 2px rgba(220,38,38,.10)"
                        : undefined,
                }}
            >
                {leftIcon && (
                    <span
                        className="flex items-center"
                        style={{ color: "var(--foreground)" }}
                    >
                        {leftIcon}
                    </span>
                )}

                <input
                    {...props}
                    disabled={disabled}
                    className={`
            h-11
            w-full
            bg-transparent
            text-sm
            outline-none
            placeholder:text-gray-400
            ${className}
          `}
                    style={style}
                />
            </div>

            {error ? (
                <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--danger)" }}
                >
                    {error}
                </p>
            ) : helperText ? (
                <p className="mt-1 text-xs text-gray-500">
                    {helperText}
                </p>
            ) : null}
        </div>
    );
}
