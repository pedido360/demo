interface Props {
    isOpen: boolean;
}

export default function RestaurantStatusBadge({
    isOpen,
}: Props) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isOpen
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
        >
            {isOpen ? "🟢 Abierto" : "🔴 Cerrado"}
        </span>
    );
}