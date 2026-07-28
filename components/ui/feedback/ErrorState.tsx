import { TriangleAlert } from "lucide-react";

interface Props {
    title?: string;
    description?: string;
    action?: React.ReactNode;
}

export default function ErrorState({
    title = "Ha ocurrido un error",
    description = "Intenta nuevamente dentro de unos segundos.",
    action,
}: Props) {
    return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">

            <TriangleAlert
                size={46}
                className="mx-auto text-red-500"
            />

            <h2 className="mt-5 text-xl font-semibold text-red-700">
                {title}
            </h2>

            <p className="mt-2 text-red-600">
                {description}
            </p>

            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}

        </div>
    );
}