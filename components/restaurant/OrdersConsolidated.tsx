"use client";

import { useMemo, useState } from "react";

interface OrderItem {
    product?: {
        name?: string;
        price?: number;
    };
    variant?: {
        label?: string;
        price?: number;
    };
    quantity?: number;
    extras?: {
        name?: string;
        price?: number;
    }[];
    dailyMenu?: {
        size?: {
            name?: string;
            label?: string;
            price?: number;
        };
    };
    notes?: string;
}

interface ConsolidatedOrder {
    id: string;
    order_number?: number | null;
    customer_name: string;
    items: OrderItem[];
    subtotal: number;
    delivery_fee: number;
    total: number;
    created_at: string;
}

interface Props {
    orders: ConsolidatedOrder[];
}

function currency(value: number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}

function localDate(value: string) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export default function OrdersConsolidated({ orders }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const hasPeriod = Boolean(startDate && endDate);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const date = localDate(order.created_at);

            if (startDate && date < startDate) return false;
            if (endDate && date > endDate) return false;

            return true;
        });
    }, [orders, startDate, endDate]);

    const totalSales = useMemo(
        () =>
            filteredOrders.reduce(
                (sum, order) => sum + Number(order.total || 0),
                0
            ),
        [filteredOrders]
    );

    return (
        <section className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm">
            <div className="border-b border-orange-200 bg-orange-50 px-5 py-4">
                <span className="mb-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-800">MÓDULO PEDIDOS</span>
                <h3 className="text-xl font-extrabold text-orange-800">
                    CONSOLIDADO DE PEDIDOS
                </h3>
                <p className="mt-1 text-sm text-orange-700">
                    Resumen de pedidos confirmados del menú digital.
                </p>
            </div>

            <div className="grid gap-3 border-b border-gray-200 p-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-gray-700">
                    Desde
                    <input
                        type="date"
                        value={startDate}
                        max={endDate || undefined}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                </label>

                <label className="text-sm font-semibold text-gray-700">
                    Hasta
                    <input
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(event) => setEndDate(event.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                </label>
            </div>

            {hasPeriod ? (
                <div className="grid gap-3 p-5 sm:grid-cols-2">
                    <div className="rounded-xl bg-[#E8F3EB] p-4">
                        <p className="text-sm font-semibold text-[#4F805E]">
                            Pedidos confirmados
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-[#355B43]">
                            {filteredOrders.length}
                        </p>
                    </div>

                    <div className="rounded-xl bg-[#F1F5F2] p-4">
                        <p className="text-sm font-semibold text-[#527B5E]">
                            Total vendido
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-[#355B43]">
                            {currency(totalSales)}
                        </p>
                    </div>
                </div>
            ) : (
                <p className="px-5 py-6 text-center text-sm text-gray-500">
                    Selecciona las fechas Desde y Hasta para consultar las ventas.
                </p>
            )}

            {hasPeriod && (
            <div className="border-t border-[#D7E7DB] px-5 py-4">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700 shadow-sm"
                >
                    {isOpen ? "OCULTAR DETALLE DE PEDIDOS" : "VER DETALLE DE PEDIDOS"}
                </button>
            </div>
            )}

            {hasPeriod && isOpen && (
            <div className="space-y-4 px-5 pb-5">
                {filteredOrders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                        No hay pedidos confirmados en este período.
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <article
                            key={order.id}
                            className="rounded-xl border border-gray-200 p-4"
                        >
                            <div className="flex flex-wrap justify-between gap-2 border-b border-gray-100 pb-3">
                                <div>
                                    <p className="font-bold text-gray-900">
                                        {order.order_number
                                            ? `Pedido #${order.order_number}`
                                            : "Pedido confirmado"}
                                        {" · "}
                                        {order.customer_name}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formatDate(order.created_at)}
                                    </p>
                                </div>
                                <p className="font-extrabold text-[#4F805E]">
                                    {currency(Number(order.total))}
                                </p>
                            </div>

                            <div className="space-y-3 py-3">
                                {order.items.map((item, index) => {
                                    const quantity = item.quantity ?? 1;
                                    const basePrice =
                                        item.dailyMenu?.size?.price ??
                                        item.variant?.price ??
                                        item.product?.price ??
                                        0;

                                    const extrasPrice = item.dailyMenu
                                        ? 0
                                        : (item.extras ?? []).reduce(
                                              (sum, extra) =>
                                                  sum + Number(extra.price || 0),
                                              0
                                          );

                                    const unitPrice =
                                        Number(basePrice) + extrasPrice;

                                    return (
                                        <div
                                            key={`${order.id}-${index}`}
                                            className="text-sm"
                                        >
                                            <div className="flex justify-between gap-3">
                                                <span className="font-semibold text-gray-800">
                                                    {quantity} ×{" "}
                                                    {item.product?.name ??
                                                        "Menú del día"}
                                                    {item.variant?.label
                                                        ? ` (${item.variant.label})`
                                                        : ""}
                                                </span>
                                                <span className="whitespace-nowrap font-semibold text-gray-800">
                                                    {currency(
                                                        unitPrice * quantity
                                                    )}
                                                </span>
                                            </div>

                                            {item.extras?.length ? (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Extras:{" "}
                                                    {item.extras
                                                        .map((extra) => extra.name)
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                </p>
                                            ) : null}

                                            {item.notes ? (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Nota: {item.notes}
                                                </p>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-1 border-t border-gray-100 pt-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{currency(Number(order.subtotal))}</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Domicilio</span>
                                    <span>
                                        {currency(Number(order.delivery_fee))}
                                    </span>
                                </div>

                                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-extrabold text-gray-900">
                                    <span>Total del pedido</span>
                                    <span>{currency(Number(order.total))}</span>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>
            )}

            {hasPeriod && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D7E7DB] bg-[#F1F5F2] px-5 py-4">
                <span className="font-bold text-[#355B43]">
                    TOTAL GENERAL · {filteredOrders.length} pedidos
                </span>
                <span className="text-xl font-extrabold text-[#355B43]">
                    {currency(totalSales)}
                </span>
            </div>
            )}
        </section>
    );
}
