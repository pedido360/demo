import { Store, Plus } from "lucide-react";

import Card from "@/components/ui/Card";
import LinkButton from "@/components/ui/LinkButton";

import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { getRestaurantMetrics } from "@/lib/repositories/restaurant-metrics.repository";
import { getPendingOrders } from "@/lib/repositories/order.repository";
import { getGuideMetrics } from "@/lib/repositories/guide-metrics-server.repository";

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

    const pendingOrders = profile?.restaurant_id
        ? await getPendingOrders(
            profile.restaurant_id
        )
        : [];

    const guideMetrics =
        profile?.role === "super_admin"
            ? await getGuideMetrics()
            : {
                guideViews: 0,
                restaurantViews: {},
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
                    title="Pedidos pendientes"
                    description="Pedidos recibidos y pendientes de confirmación."
                >
                    <p className="text-3xl font-bold text-gray-900">
                        {pendingOrders.length}
                    </p>
                </Card>
            )}

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

            {profile?.role === "super_admin" && (
                <Card
                    title="Guía Boquisabrosa"
                    description="Visitas reales registradas desde la Guía."
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-yellow-100 p-3">
                                <span className="text-xl">🍽️</span>
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Guía Boquisabrosa
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {guideMetrics.guideViews} visitas a la Guía.
                                </p>
                            </div>
                        </div>

                        <details className="group">
                            <summary className="cursor-pointer list-none rounded-xl bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-orange-600">
                                Ver métricas
                            </summary>

                            <div className="mt-4 space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-5">
                                <div className="rounded-xl border border-gray-200 bg-white p-5">
                                    <p className="text-sm text-gray-500">
                                        👀 Visitas a la Guía
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                        {guideMetrics.guideViews}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                                        🍽️ Visitas por restaurante
                                    </h3>

                                    <div className="space-y-2">
                                        {Object.entries(
                                            guideMetrics.restaurantViews
                                        ).length > 0 ? (
                                            Object.entries(
                                                guideMetrics.restaurantViews
                                            )
                                                .sort(
                                                    ([, a], [, b]) =>
                                                        b - a
                                                )
                                                .map(
                                                    ([restaurantName, views]) => (
                                                        <div
                                                            key={restaurantName}
                                                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
                                                        >
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {restaurantName}
                                                            </span>

                                                            <span className="text-sm font-bold text-gray-700">
                                                                {views}
                                                            </span>
                                                        </div>
                                                    )
                                                )
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                Aún no hay visitas registradas.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </details>
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