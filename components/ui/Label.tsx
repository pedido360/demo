import { LabelHTMLAttributes, ReactNode } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    children: ReactNode;
    required?: boolean;
}

export default function Label({
    children,
    required = false,
    className = "",
    ...props
}: LabelProps) {
    return (
        <label
            {...props}
            className={`
        mb-2
        block
        select-none
        text-sm
        font-medium
        leading-none
        ${className}
      `}
            style={{
                color: "var(--foreground)",
            }}
        >
            {children}

            {required && (
                <span
                    className="ml-1"
                    style={{ color: "var(--danger)" }}
                >
                    *
                </span>
            )}
        </label>
    );
}