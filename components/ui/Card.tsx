import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
}

export default function Card({
    title,
    description,
    actions,
    children,
    className = "",
    style,
    ...props
}: CardProps) {
    return (
        <div
            {...props}
            className={`
        overflow-hidden
        rounded-xl
        border
        bg-white
        shadow-sm
        ${className}
      `}
            style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                ...style,
            }}
        >
            {(title || description || actions) && (
                <div
                    className="flex flex-col gap-4 border-b p-6 md:flex-row md:items-center md:justify-between"
                    style={{
                        borderColor: "var(--border)",
                    }}
                >
                    <div>
                        {title && (
                            <h2
                                className="text-lg font-semibold"
                                style={{
                                    color: "var(--foreground)",
                                }}
                            >
                                {title}
                            </h2>
                        )}

                        {description && (
                            <p className="mt-1 text-sm text-gray-500">
                                {description}
                            </p>
                        )}
                    </div>

                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            )}

            <div className="p-6">
                {children}
            </div>
        </div>
    );
}