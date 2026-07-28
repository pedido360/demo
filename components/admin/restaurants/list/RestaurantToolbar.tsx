"use client";

import { Plus, Search } from "lucide-react";

interface RestaurantToolbarProps {
    onCreate?: () => void;
}

export default function RestaurantToolbar({
    onCreate,
}: RestaurantToolbarProps) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Restaurantes
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Administra los restaurantes de Pedidos360.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Buscar restaurante..."
                        className="h-11 w-full rounded-xl border border-gray-300 pl-10 pr-4 outline-none transition focus:border-green-600 md:w-72"
                    />
                </div>

                <button
                    onClick={onCreate}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 font-medium text-white transition hover:bg-green-700"
                >
                    <Plus size={18} />

                    Nuevo restaurante
                </button>
            </div>
        </div>
    );
}