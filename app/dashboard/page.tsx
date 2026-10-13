import { Store, Plus } from "lucide-react";

import Card from "@/components/ui/Card";
import LinkButton from "@/components/ui/LinkButton";

import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { getRestaurantMetrics } from "@/lib/repositories/restaurant-metrics.repository";
import { getPendingOrders } from "@/lib/repositories/order.repository";
import { getGuideMetrics } from "@/lib/repositories/guide-metrics-server.repository";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ periodo?: string; desde?: string; hasta?: string }>;
}) {
    const params = await searchParams;
    const periodo = params.periodo ?? "total";
    const fecha = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const inicio = new Date(`${fecha}T00:00:00-05:00`);
    let desde: Date | undefined;
    let hasta: Date | undefined;
    if (periodo === "hoy") { desde = inicio; hasta = new Date(inicio.getTime() + 86400000); }
    else if (periodo === "7dias") { desde = new Date(inicio.getTime() - 6 * 86400000); hasta = new Date(inicio.getTime() + 86400000); }
    else if (periodo === "mes") { desde = new Date(`${fecha.slice(0, 7)}-01T00:00:00-05:00`); hasta = new Date(inicio.getTime() + 86400000); }
    else if (periodo === "personalizado" && params.desde && params.hasta) {
        const d = new Date(`${params.desde}T00:00:00-05:00`);
        const h = new Date(`${params.hasta}T00:00:00-05:00`);
        if (!isNaN(d.getTime()) && !isNaN(h.getTime()) && d <= h) { desde = d; hasta = new Date(h.getTime() + 86400000); }
    }
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
            ? await getGuideMetrics({ from: desde?.toISOString(), to: hasta?.toISOString() })
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
                                <form method="GET" className="flex flex-wrap items-end gap-3">
                                    <div><label htmlFor="periodo" className="mb-1 block text-sm font-medium">Período</label><select id="periodo" name="periodo" defaultValue={periodo} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"><option value="total">Todo el histórico</option><option value="hoy">Hoy</option><option value="7dias">Últimos 7 días</option><option value="mes">Mes actual</option><option value="personalizado">Rango personalizado</option></select></div>
                                    <div><label htmlFor="desde" className="mb-1 block text-sm font-medium">Desde</label><input id="desde" name="desde" type="date" defaultValue={params.desde ?? ""} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" /></div>
                                    <div><label htmlFor="hasta" className="mb-1 block text-sm font-medium">Hasta</label><input id="hasta" name="hasta" type="date" defaultValue={params.hasta ?? ""} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" /></div>
                                    <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">Aplicar filtro</button>
                                </form>
                                <p className="text-xs text-gray-500">Métricas exclusivas de Guía Boquisabrosa.</p>
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