"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import {
    confirmOrder,
    getConfirmedOrders,
    getPendingOrders,
} from "@/lib/repositories/order.repository";

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
    ingredients?: {
        name?: string;
    }[];
    extras?: {
        name?: string;
        price?: number;
    }[];
    notes?: string;
}

interface PendingOrder {
    id: string;
    order_number?: number | null;
    customer_name: string;
    delivery_method: string;
    address: string | null;
    payment_method: string;
    cash_change: string | null;
    observations: string | null;
    items: OrderItem[];
    subtotal: number;
    delivery_fee: number;
    total: number;
    created_at: string;
}

interface PendingOrdersProps {
    restaurantId: string;
    restaurantName: string;
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatTime(value: string) {
    return new Intl.DateTimeFormat("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function getItemSummary(items: OrderItem[]) {
    return items
        .map((item) => {
            const quantity = item.quantity ?? 1;
            const name = item.product?.name ?? "Producto";
            return `${name} ×${quantity}`;
        })
        .join(" · ");
}

function matchesSearch(order: PendingOrder, value: string) {
    if (!value) return true;

    const normalized = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const searchable = [
        order.customer_name,
        order.address ?? "",
        order.observations ?? "",
        order.payment_method,
        ...order.items.map((item) => item.product?.name ?? ""),
    ]
        .join(" ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    return searchable.includes(normalized);
}

export default function PendingOrders({
    restaurantId,
    restaurantName,
}: PendingOrdersProps) {
    const [orders, setOrders] = useState<PendingOrder[]>([]);
    const [confirmedOrders, setConfirmedOrders] =
        useState<PendingOrder[]>([]);
    const [confirmedOpen, setConfirmedOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(
        null
    );
    const [errorMessage, setErrorMessage] = useState("");

    async function loadOrders(showRefreshState = false) {
        if (showRefreshState) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setErrorMessage("");

        try {
            const [pendingData, confirmedData] =
                await Promise.all([
                    getPendingOrders(restaurantId),
                    getConfirmedOrders(restaurantId),
                ]);

            setOrders(pendingData as PendingOrder[]);
            setConfirmedOrders(
                confirmedData as PendingOrder[]
            );
        } catch (error) {
            console.error(error);
            setErrorMessage(
                "No fue posible cargar los pedidos pendientes."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        void loadOrders();
    }, [restaurantId]);

    async function handleConfirmAndPrint(order: PendingOrder) {
        if (confirmingOrderId) return;

        setConfirmingOrderId(order.id);
        setErrorMessage("");

        try {
            await confirmOrder(order.id);

            const removeAfterPrint = () => {
                setOrders((current) =>
                    current.filter((item) => item.id !== order.id)
                );
                setExpandedOrderId(null);
                window.removeEventListener(
                    "afterprint",
                    removeAfterPrint
                );
            };

            window.addEventListener("afterprint", removeAfterPrint);

            window.setTimeout(() => {
                window.print();
            }, 100);
        } catch (error) {
            console.error(error);
            setErrorMessage(
                "No fue posible confirmar el pedido."
            );
            setConfirmingOrderId(null);
        }
    }

    const filteredOrders = useMemo(
        () => orders.filter((order) => matchesSearch(order, search)),
        [orders, search]
    );

    const filteredConfirmedOrders = useMemo(
        () =>
            confirmedOrders.filter((order) =>
                matchesSearch(order, search)
            ),
        [confirmedOrders, search]
    );

    return (
        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
            <div className="border-b border-amber-200 bg-amber-50 px-5 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold text-amber-800">
                            🛎️ Pedidos
                        </h2>

                        <p className="mt-1 text-sm text-amber-700">
                            Pedidos pendientes de confirmar con WhatsApp.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadOrders(true)}
                        disabled={loading || refreshing}
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                refreshing ? "animate-spin" : ""
                            }
                        />
                        Actualizar
                    </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-amber-600 px-3 py-1 text-sm font-bold text-white">
                        Pendientes: {orders.length}
                    </span>

                    <div className="relative min-w-[260px] flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Buscar cliente, dirección o producto..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        />
                    </div>
                </div>
            </div>

            <div className="p-5">
                {errorMessage && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                <div className="grid gap-5 lg:grid-cols-2">
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-amber-800">
                                Pendientes
                            </h3>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                                {filteredOrders.length}
                            </span>
                        </div>

                        {loading ? (
                            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                                Cargando pedidos...
                            </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                        <p className="font-semibold text-gray-700">
                            {search
                                ? "No se encontraron pedidos."
                                : "No hay pedidos pendientes."}
                        </p>

                        {!search && (
                            <p className="mt-1 text-sm text-gray-500">
                                Los nuevos pedidos aparecerán aquí.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredOrders.map((order) => {
                            const expanded =
                                expandedOrderId === order.id;

                            return (
                                <article
                                    key={order.id}
                                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedOrderId(
                                                expanded
                                                    ? null
                                                    : order.id
                                            )
                                        }
                                        className="w-full px-4 py-4 text-left hover:bg-gray-50"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-bold text-amber-700">
                                                        🟠 {formatTime(order.created_at)}
                                                    </span>

                                                    <span className="font-bold text-gray-900">
                                                        {order.customer_name}
                                                    </span>
                                                </div>

                                                <p className="mt-1 truncate text-sm text-gray-600">
                                                    {getItemSummary(order.items)}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    📍 {order.delivery_method}
                                                    {" · "}
                                                    💳 {order.payment_method}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">
                                                    {formatCurrency(order.total)}
                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-amber-700">
                                                    {expanded
                                                        ? "Ocultar"
                                                        : "Ver pedido"}
                                                </p>
                                            </div>
                                        </div>
                                    </button>

                                    {expanded && (
                                        <div className="border-t border-gray-200 bg-gray-50 px-4 py-5">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-800">
                                                        Datos del cliente
                                                    </h3>

                                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                        <p>
                                                            👤{" "}
                                                            {order.customer_name}
                                                        </p>

                                                        <p>
                                                            📍{" "}
                                                            {order.address ??
                                                                "Sin dirección"}
                                                        </p>

                                                        <p>
                                                            💳{" "}
                                                            {order.payment_method}
                                                        </p>

                                                        {order.cash_change && (
                                                            <p>
                                                                💵 Cambio para:{" "}
                                                                {
                                                                    order.cash_change
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-800">
                                                        Pedido
                                                    </h3>

                                                    <div className="mt-2 space-y-3">
                                                        {order.items.map(
                                                            (item, index) => (
                                                                <div
                                                                    key={`${order.id}-${index}`}
                                                                    className="rounded-lg border border-gray-200 bg-white p-3"
                                                                >
                                                                    <p className="font-semibold text-gray-900">
                                                                        {item.quantity ??
                                                                            1}{" "}
                                                                        ×{" "}
                                                                        {item.product
                                                                            ?.name ??
                                                                            "Producto"}
                                                                    </p>

                                                                    {item.variant?.label && (
                                                                        <p className="text-sm text-gray-600">
                                                                            Variante:{" "}
                                                                            {
                                                                                item
                                                                                    .variant
                                                                                    .label
                                                                            }
                                                                        </p>
                                                                    )}

                                                                    {item.extras &&
                                                                        item.extras.length >
                                                                            0 && (
                                                                            <p className="text-sm text-gray-600">
                                                                                Extras:{" "}
                                                                                {item.extras
                                                                                    .map(
                                                                                        (
                                                                                            extra
                                                                                        ) =>
                                                                                            extra.name
                                                                                    )
                                                                                    .join(
                                                                                        ", "
                                                                                    )}
                                                                            </p>
                                                                        )}

                                                                    {item.ingredients &&
                                                                        item.ingredients.length >
                                                                            0 && (
                                                                            <p className="text-sm text-gray-600">
                                                                                Ingredientes:{" "}
                                                                                {item.ingredients
                                                                                    .map(
                                                                                        (
                                                                                            ingredient
                                                                                        ) =>
                                                                                            ingredient.name
                                                                                    )
                                                                                    .join(
                                                                                        ", "
                                                                                    )}
                                                                            </p>
                                                                        )}

                                                                    {item.notes && (
                                                                        <p className="mt-1 text-sm text-gray-600">
                                                                            📝{" "}
                                                                            {
                                                                                item.notes
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {order.observations && (
                                                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                                                        Observaciones
                                                    </p>

                                                    <p className="mt-1 text-sm text-blue-900">
                                                        {order.observations}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-gray-200 pt-4">
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <p>
                                                        Subtotal:{" "}
                                                        <span className="font-semibold text-gray-900">
                                                            {formatCurrency(
                                                                order.subtotal
                                                            )}
                                                        </span>
                                                    </p>

                                                    {order.delivery_fee > 0 && (
                                                        <p>
                                                            Domicilio:{" "}
                                                            <span className="font-semibold text-gray-900">
                                                                {formatCurrency(
                                                                    order.delivery_fee
                                                                )}
                                                            </span>
                                                        </p>
                                                    )}

                                                    <p className="text-lg font-bold text-gray-900">
                                                        Total:{" "}
                                                        {formatCurrency(
                                                            order.total
                                                        )}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleConfirmAndPrint(
                                                            order
                                                        )
                                                    }
                                                    disabled={
                                                        confirmingOrderId !==
                                                            null
                                                    }
                                                    className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {confirmingOrderId ===
                                                    order.id
                                                        ? "Confirmando..."
                                                        : "✓ Confirmar e imprimir"}
                                                </button>
                                            </div>

                                            <div className="print-only">
                                                <div className="order-print">
                                                    <div className="print-center print-title">
                                                        PEDIDOS360
                                                    </div>

                                                    <div className="print-center print-restaurant-name">
                                                        {restaurantName}
                                                    </div>

                                                    <div className="print-center print-subtitle">
                                                        COMANDA
                                                    </div>

                                                    <div className="print-divider" />

                                                    <div className="print-row">
                                                        <span>Fecha:</span>
                                                        <span>
                                                            {new Date(
                                                                order.created_at
                                                            ).toLocaleDateString(
                                                                "es-CO"
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="print-row">
                                                        <span>Hora:</span>
                                                        <span>
                                                            {formatTime(
                                                                order.created_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    {order.order_number ? (
                                                        <div className="print-row">
                                                            <span>Pedido:</span>
                                                            <span>
                                                                #{order.order_number}
                                                            </span>
                                                        </div>
                                                    ) : null}

                                                    <div className="print-divider" />

                                                    <div className="print-section-title">
                                                        DETALLE DEL PEDIDO
                                                    </div>

                                                    {order.items.map(
                                                        (item, index) => (
                                                            <div
                                                                key={`${order.id}-print-${index}`}
                                                                className="print-item"
                                                            >
                                                                <div className="print-item-main">
                                                                    <strong>
                                                                        {item.quantity} x{" "}
                                                                        {item.product?.name ??
                                                                            "Producto"}
                                                                    </strong>
                                                                </div>

                                                                {item.variant?.label ? (
                                                                    <div>
                                                                        Variante:{" "}
                                                                        {
                                                                            item.variant
                                                                                .label
                                                                        }
                                                                    </div>
                                                                ) : null}

                                                                {item.extras?.length ? (
                                                                    <div>
                                                                        Extras:{" "}
                                                                        {item.extras
                                                                            .map(
                                                                                (
                                                                                    extra
                                                                                ) =>
                                                                                    extra.name
                                                                            )
                                                                            .join(
                                                                                ", "
                                                                            )}
                                                                    </div>
                                                                ) : null}

                                                                {item.ingredients?.length ? (
                                                                    <div>
                                                                        Ingredientes:{" "}
                                                                        {item.ingredients
                                                                            .map(
                                                                                (
                                                                                    ingredient
                                                                                ) =>
                                                                                    ingredient.name
                                                                            )
                                                                            .join(
                                                                                ", "
                                                                            )}
                                                                    </div>
                                                                ) : null}

                                                                {item.notes ? (
                                                                    <div>
                                                                        Nota:{" "}
                                                                        {
                                                                            item.notes
                                                                        }
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        )
                                                    )}

                                                    {order.observations ? (
                                                        <>
                                                            <div className="print-divider" />

                                                            <div className="print-section-title">
                                                                OBSERVACIONES
                                                            </div>

                                                            <div>
                                                                {
                                                                    order.observations
                                                                }
                                                            </div>
                                                        </>
                                                    ) : null}

                                                    <div className="print-divider" />

                                                    <div className="print-row">
                                                        <span>Subtotal:</span>
                                                        <strong>
                                                            {formatCurrency(
                                                                order.subtotal
                                                            )}
                                                        </strong>
                                                    </div>

                                                    {Number(
                                                        order.delivery_fee
                                                    ) > 0 ? (
                                                        <div className="print-row">
                                                            <span>
                                                                Domicilio:
                                                            </span>
                                                            <strong>
                                                                {formatCurrency(
                                                                    order.delivery_fee
                                                                )}
                                                            </strong>
                                                        </div>
                                                    ) : null}

                                                    <div className="print-row print-total">
                                                        <span>TOTAL:</span>
                                                        <strong>
                                                            {formatCurrency(
                                                                order.total
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <div className="print-divider" />

                                                    <div className="print-section-title">
                                                        DATOS DEL CLIENTE
                                                    </div>

                                                    <div>
                                                        Nombre:{" "}
                                                        {order.customer_name ||
                                                            "Sin nombre"}
                                                    </div>

                                                    <div>
                                                        Entrega:{" "}
                                                        {order.delivery_method}
                                                    </div>

                                                    {order.delivery_method ===
                                                        "Domicilio" &&
                                                    order.address ? (
                                                        <div>
                                                            Dirección:{" "}
                                                            {order.address}
                                                        </div>
                                                    ) : null}

                                                    <div>
                                                        Pago:{" "}
                                                        {order.payment_method}
                                                    </div>

                                                    {order.cash_change ? (
                                                        <div>
                                                            Cambio:{" "}
                                                            {
                                                                order.cash_change
                                                            }
                                                        </div>
                                                    ) : null}

                                                    <div className="print-divider" />

                                                    <div className="print-center print-footer">
                                                        PEDIDOS360
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={() =>
                                setConfirmedOpen((open) => !open)
                            }
                            className="mb-3 flex w-full items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-left hover:bg-green-100"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-lg font-bold text-green-800">
                                    Confirmados
                                </span>
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                                    {filteredConfirmedOrders.length}
                                </span>
                            </span>

                            <span
                                className={`text-green-700 transition-transform ${
                                    confirmedOpen ? "rotate-180" : ""
                                }`}
                            >
                                ▼
                            </span>
                        </button>

                        {confirmedOpen && (
                            <>
                                {filteredConfirmedOrders.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                <p className="font-semibold text-gray-700">
                                    {search
                                        ? "No se encontraron pedidos."
                                        : "No hay pedidos confirmados."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredConfirmedOrders.map((order) => (
                                    <article
                                        key={order.id}
                                        className="overflow-hidden rounded-xl border border-green-200 bg-green-50"
                                    >
                                        <div className="px-4 py-4">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-bold text-green-700">
                                                            🟢 {formatTime(order.created_at)}
                                                        </span>
                                                        <span className="font-bold text-gray-900">
                                                            {order.customer_name}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 truncate text-sm text-gray-600">
                                                        {getItemSummary(order.items)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        📍 {order.delivery_method}
                                                        {" · "}
                                                        💳 {order.payment_method}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">
                                                        {formatCurrency(order.total)}
                                                    </p>
                                                    <p className="mt-1 text-xs font-semibold text-green-700">
                                                        ✓ Confirmado
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
