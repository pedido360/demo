import { Inbox } from "lucide-react";

interface Props {
    title: string;
    description?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
}

export default function EmptyState({
    title,
    description,
    action,
    icon,
}: Props) {
    return (
        <div className="rounded-xl border border-dashed p-12 text-center">
            <div className="flex justify-center">
                {icon ?? (
                    <Inbox
                        size={48}
                        className="text-gray-400"
                    />
                )}
            </div>

            <h2 className="mt-5 text-xl font-semibold">
                {title}
            </h2>

            {description && (
                <p className="mt-2 text-gray-500">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}