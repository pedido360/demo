import { ReactNode, TextareaHTMLAttributes } from "react";

interface TextareaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    leftIcon?: ReactNode;
    error?: string;
    helperText?: string;
}

export default function Textarea({
    leftIcon,
    error,
    helperText,
    className = "",
    disabled,
    style,
    ...props
}: TextareaProps) {
    return (
        <div className="w-full">
            <div
                className={`
          flex
          items-start
          gap-3
          rounded-lg
          border
          bg-white
          px-4
          py-3
          transition-all
          duration-200
          focus-within:ring-2
          ${disabled ? "cursor-not-allowed opacity-60" : ""}
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
                        className="mt-1 flex items-center"
                        style={{ color: "var(--foreground)" }}
                    >
                        {leftIcon}
                    </span>
                )}

                <textarea
                    {...props}
                    disabled={disabled}
                    className={`
            min-h-[120px]
            w-full
            resize-y
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