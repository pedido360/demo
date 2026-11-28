"use client";

import { useState } from "react";

export default function RestaurantJourneyHistory() {
    const [historyDate, setHistoryDate] = useState("");
    const [historyJourneys, setHistoryJourneys] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");
    const [expandedHistoryJourneyId, setExpandedHistoryJourneyId] = useState<string | null>(null);

    return (
            <section className="overflow-hidden rounded-xl border border-green-200 bg-white shadow-sm">
                <div className="mb-4 border-b border-green-200 bg-green-50 px-4 py-4">
                    <span className="mb-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-800">
                        MÓDULO MESEROS
                    </span>
                    <h2 className="text-lg font-extrabold text-green-800">
                        HISTORIAL DE JORNADAS MESEROS
                    </h2>
                    <p className="mt-1 text-sm text-green-700">
                        Consulta jornadas cerradas, sus ventas y el detalle de cada pedido.
                    </p>
                </div>
                <div className="space-y-4 p-4">

                <div className="flex flex-wrap items-end gap-3">
                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                        Fecha de apertura
                        <input
                            type="date"
                            value={historyDate}
                            onChange={(event) => setHistoryDate(event.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2"
                        />
                    </label>
                    <button
                        type="button"
                        disabled={historyLoading}
                        onClick={async () => {
                            setHistoryLoading(true);
                            setHistoryError("");
                            setExpandedHistoryJourneyId(null);
                            try {
                                const qs = historyDate ? `?date=${encodeURIComponent(historyDate)}` : "";
                                const response = await fetch(`/api/restaurant/journeys/history${qs}`, { cache: "no-store" });
                                const result = await response.json();
                                if (!response.ok || !result.success) {
                                    throw new Error(result.error || "No fue posible cargar el historial.");
                                }
                                setHistoryJourneys(Array.isArray(result.journeys) ? result.journeys : []);
                            } catch (error) {
                                setHistoryError(error instanceof Error ? error.message : "Error consultando el historial.");
                            } finally {
                                setHistoryLoading(false);
                            }
                        }}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {historyLoading ? "Consultando..." : "Consultar jornadas"}
                    </button>
                    {historyDate && (
                        <button
                            type="button"
                            onClick={() => setHistoryDate("")}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                        >
                            Ver últimas jornadas
                        </button>
                    )}
                </div>

                {historyError && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{historyError}</p>
                )}

                {historyJourneys.length === 0 && !historyLoading && !historyError && (
                    <p className="text-sm text-slate-500">
                        Consulta sin fecha para ver las últimas jornadas cerradas o selecciona un día.
                    </p>
                )}

                <div className="space-y-3">
                    {historyJourneys.map((j) => {
                        const expanded = expandedHistoryJourneyId === j.id;
                        const totals = j.totals ?? {};
                        const orders = Array.isArray(j.orders) ? j.orders : [];
                        const money = (value: unknown) => Number(value ?? 0).toLocaleString("es-CO", {
                            style: "currency", currency: "COP", maximumFractionDigits: 0
                        });
                        const dateTime = (value: string | null) => value
                            ? new Date(value).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })
                            : "No registrada";

                        return (
                            <article key={j.id} className="overflow-hidden rounded-xl border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setExpandedHistoryJourneyId(expanded ? null : j.id)}
                                    className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-slate-50"
                                >
                                    <span>
                                        <span className="block font-semibold text-slate-900">
                                            Jornada del {j.opened_at ? new Date(j.opened_at).toLocaleDateString("es-CO") : "día no disponible"}
                                        </span>
                                        <span className="mt-1 block text-xs text-slate-500">
                                            Apertura: {dateTime(j.opened_at)} · Cierre: {dateTime(j.closed_at)}
                                        </span>
                                    </span>
                                    <span className="text-right">
                                        <span className="block font-semibold text-slate-900">{money(totals.confirmedSales)}</span>
                                        <span className="block text-xs text-slate-500">{Number(totals.confirmedOrderCount ?? 0)} pedidos confirmados</span>
                                    </span>
                                    <span className="text-sm text-slate-500">{expanded ? "Ocultar ▲" : "Ver detalle ▼"}</span>
                                </button>

                                {expanded && (
                                    <div className="space-y-4 border-t border-slate-200 bg-slate-50 p-4">
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <div className="rounded-lg bg-white p-3">
                                                <p className="text-xs text-slate-500">Total vendido</p>
                                                <p className="font-semibold">{money(totals.confirmedSales)}</p>
                                            </div>
                                            <div className="rounded-lg bg-white p-3">
                                                <p className="text-xs text-slate-500">Pedidos confirmados</p>
                                                <p className="font-semibold">{Number(totals.confirmedOrderCount ?? 0)}</p>
                                            </div>
                                            <div className="rounded-lg bg-white p-3">
                                                <p className="text-xs text-slate-500">Pedidos cancelados</p>
                                                <p className="font-semibold">{Number(totals.cancelledOrderCount ?? 0)}</p>
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-slate-800">Pedidos de la jornada</h3>
                                        {orders.length === 0 && <p className="text-sm text-slate-500">No hay pedidos guardados en el resumen.</p>}

                                        {orders.map((order: any, oi: number) => {
                                            const type = order.order_type === "dine_in" && order.table_session_id
                                                ? "En mesa"
                                                : order.order_type === "takeaway" && order.table_session_id
                                                    ? "Para llevar desde mesa"
                                                    : order.order_type === "takeaway"
                                                        ? "Pedido independiente" : "Tipo no especificado";
                                            const confirmed = order.status === "confirmed";
                                            const items = Array.isArray(order.items) ? order.items : [];

                                            return (
                                                <article key={order.order_id ?? `${j.id}-${oi}`} className="rounded-lg border border-slate-200 bg-white p-3">
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Pedido #{order.order_number ?? oi + 1}</p>
                                                            <p className="text-xs text-slate-500">{type} · {dateTime(order.created_at)}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold">{money(order.total)}</p>
                                                            <span className={`text-xs font-medium ${confirmed ? "text-green-700" : "text-red-700"}`}>
                                                                {confirmed ? "Confirmado" : order.status === "cancelled" ? "Cancelado" : order.status ?? "Estado no disponible"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                                                        {items.map((item: any, ii: number) => {
                                                            const product = item.product ?? {};
                                                            const daily = item.dailyMenu ?? {};
                                                            const name = product.name ?? item.name ?? item.product_name ?? item.title ?? "Producto";
                                                            const qty = Number(item.quantity ?? daily.quantity ?? 1);
                                                            const unitPrice = Number(item.unitPrice ?? 0);
                                                            const lineTotal = Number(item.total ?? unitPrice * qty);
                                                            const details = [
                                                                item.variant?.label ?? item.variant?.name,
                                                                ...(Array.isArray(item.ingredients) ? item.ingredients.map((x: any) => x?.name).filter(Boolean) : []),
                                                                ...(Array.isArray(item.extras) ? item.extras.map((x: any) => x?.name).filter(Boolean) : []),
                                                                daily.size?.label, daily.soup?.name,
                                                                ...(Array.isArray(daily.secos) ? daily.secos.map((x: any) => x?.name).filter(Boolean) : []),
                                                                daily.principle, daily.protein, daily.drink, daily.dessert
                                                            ].filter(Boolean);

                                                            return (
                                                                <div key={`${order.order_id ?? oi}-${ii}`} className="text-sm">
                                                                    <div className="flex justify-between gap-3">
                                                                        <span className="font-medium text-slate-800">{qty} × {name}</span>
                                                                        <span className="shrink-0">{money(lineTotal)}</span>
                                                                    </div>
                                                                    {details.length > 0 && <p className="mt-1 text-xs text-slate-500">{details.join(" · ")}</p>}
                                                                    {(item.notes || daily.notes) && <p className="mt-1 text-xs text-slate-500">Nota: {item.notes || daily.notes}</p>}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {order.notes && <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">Nota del pedido: {order.notes}</p>}
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
                </div>
            </section>
    );
}
