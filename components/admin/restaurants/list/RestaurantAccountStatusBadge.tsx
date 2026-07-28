import { RestaurantStatus } from "@/types/restaurant";

interface Props {
    status: RestaurantStatus;
}

export default function RestaurantAccountStatusBadge({
    status,
}: Props) {
    const paused = status === "paused";

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${paused
                    ? "bg-orange-100 text-orange-700"
                    : "bg-green-100 text-green-700"
                }`}
        >
            {paused ? "🟠 Suspendido" : "🟢 Activo"}
        </span>
    );
}