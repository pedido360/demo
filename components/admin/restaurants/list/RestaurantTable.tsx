export default function RestaurantTable() {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Restaurante
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Ciudad
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Estado
                        </th>

                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                            Acciones
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td
                            colSpan={4}
                            className="px-6 py-16 text-center text-gray-500"
                        >
                            Todavía no hay restaurantes.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}