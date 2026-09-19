import { Store, Plus } from "lucide-react";

import Card from "@/components/ui/Card";
import LinkButton from "@/components/ui/LinkButton";

import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { getRestaurantMetrics } from "@/lib/repositories/restaurant-metrics.repository";

export default async function DashboardPage() {
    const profile = await getCurrentProfile();

    const metrics = profile?.restaurant_id
        ? await getRestaurantMetrics(
            profile.restaurant_id
        )
        : {
            menuViews: 0,
            whatsappOrders: 0,
        };

    const conversion =
        metrics.menuViews > 0
            ? (
                (metrics.whatsappOrders /
                    metrics.menuViews) *
                100
            ).toFixed(1)
            : "0.0";

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">
                    Dashboard
                </h1>

                <p className="mt-2 text-gray-500">
                    Bienvenido a Pedidos360.
                </p>
            </div>

            {profile?.restaurant_id && (
                <Card
                    title="Métricas de tu restaurante"
                    description="Resumen de visitas y pedidos por WhatsApp."
                >
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <p className="text-sm text-gray-500">
                                👀 Visitas al menú
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {metrics.menuViews}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <p className="text-sm text-gray-500">
                                📲 Pedidos por WhatsApp
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {metrics.whatsappOrders}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <p className="text-sm text-gray-500">
                                📈 Conversión
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {conversion}%
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <Card
                title="Restaurantes"
                description="Administra los restaurantes registrados."
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-orange-100 p-3">
                            <Store
                                className="text-orange-600"
                                size={24}
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Restaurantes
                            </h2>

                            <p className="text-sm text-gray-500">
                                Crear, editar y administrar restaurantes.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <LinkButton href="/dashboard/restaurants">
                            Ver restaurantes
                        </LinkButton>

                        <LinkButton
                            href="/dashboard/restaurants/new"
                            leftIcon={<Plus size={18} />}
                        >
                            Nuevo
                        </LinkButton>
                    </div>
                </div>
            </Card>
        </div>
    );
}