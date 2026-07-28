"use client";

import { Bell, CircleUserRound } from "lucide-react";

export default function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">
                    Restaurantes
                </h2>

                <p className="text-sm text-gray-500">
                    Administra los restaurantes de Pedidos360.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <button
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Notificaciones"
                >
                    <Bell size={20} />
                </button>

                <button
                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 transition hover:bg-gray-50"
                    aria-label="Perfil"
                >
                    <CircleUserRound size={22} />

                    <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                            Administrador
                        </p>

                        <p className="text-xs text-gray-500">
                            Pedidos360
                        </p>
                    </div>
                </button>
            </div>
        </header>
    );
}