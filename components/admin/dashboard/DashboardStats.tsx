interface DashboardStatsProps {
    totalRestaurants: number;
}

export default function DashboardStats({
    totalRestaurants,
}: DashboardStatsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                    Restaurantes registrados
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {totalRestaurants}
                </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                    Productos
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    —
                </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                    Pedidos
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    —
                </h2>
            </div>
        </div>
    );
}