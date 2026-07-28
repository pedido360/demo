import { LoaderCircle } from "lucide-react";

interface Props {
    title?: string;
    description?: string;
}

export default function Loading({
    title = "Cargando...",
    description,
}: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-16">

            <LoaderCircle
                size={40}
                className="animate-spin text-orange-500"
            />

            <h3 className="mt-6 text-lg font-semibold">
                {title}
            </h3>

            {description && (
                <p className="mt-2 text-center text-gray-500">
                    {description}
                </p>
            )}

        </div>
    );
}