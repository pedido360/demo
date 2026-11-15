"use client";

import { useState } from "react";
import PendingOrders from "@/components/restaurant/PendingOrders";
import RestaurantAccounts from "@/components/restaurant/RestaurantAccounts";
import WaiterManagement from "@/components/admin/waiters/WaiterManagement";
import FixedTableManagement from "@/components/restaurant/FixedTableManagement";

interface Props {
    restaurantId: string;
    restaurantName: string;
}

export default function RestaurantDashboardOperations({
    restaurantId,
    restaurantName,
}: Props) {
    const [waiterPanel, setWaiterPanel] = useState<"create" | "list" | null>(null);
    const [tablesPanelOpen, setTablesPanelOpen] = useState(false);

    return (
        <section className="grid grid-cols-1 gap-5 lg:h-[calc(100vh-190px)] lg:min-h-[620px] lg:grid-cols-2 lg:items-stretch">
            <div className="min-h-0 overflow-y-auto rounded-2xl">
                <PendingOrders
                    restaurantId={restaurantId}
                    restaurantName={restaurantName}
                />
            </div>

            <div className="flex min-h-0 flex-col gap-4">
                <div className="shrink-0 rounded-2xl border border-green-700 bg-green-700 px-5 py-5 shadow-sm">
                    <h2 className="text-2xl font-extrabold tracking-wide text-white">
                        👥 MÓDULO MESEROS
                    </h2>
                    <p className="mt-1 text-sm text-green-50">
                        Cuentas abiertas y gestión del equipo
                    </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl">
                    <RestaurantAccounts />
                </div>

                <div className="shrink-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-lg font-bold text-gray-900">
                        Gestión de meseros
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setWaiterPanel((current) =>
                                    current === "create" ? null : "create"
                                )
                            }
                            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                waiterPanel === "create"
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {waiterPanel === "create" ? "Cerrar creación" : "+ Crear mesero"}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setWaiterPanel((current) =>
                                    current === "list" ? null : "list"
                                )
                            }
                            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                waiterPanel === "list"
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {waiterPanel === "list" ? "Cerrar listado" : "Ver meseros"}
                        </button>
                    </div>

                    {waiterPanel && (
                        <div className="mt-4 max-h-[55vh] overflow-y-auto border-t border-gray-100 pt-4">
                            <WaiterManagement
                                restaurants={[{ id: restaurantId, name: restaurantName }]}
                                initialRestaurantId={restaurantId}
                                isSuperAdmin={false}
                                view={waiterPanel}
                            />
                        </div>
                    )}
                </div>

                <div className="shrink-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Gestión de mesas fijas
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Agrega o retira las mesas permanentes del restaurante.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setTablesPanelOpen((current) => !current)}
                            aria-expanded={tablesPanelOpen}
                            className="shrink-0 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            {tablesPanelOpen ? "Cerrar" : "Administrar"}
                        </button>
                    </div>

                    {tablesPanelOpen && (
                        <div className="mt-4 max-h-[55vh] overflow-y-auto border-t border-gray-100 pt-4">
                            <FixedTableManagement />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
