"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Transaction {
    id: string;
    type: "payment" | "reversal";
    method: "cash" | "transfer" | null;
    amount: number;
    reference: string | null;
    reason: string | null;
    relatedTransactionId: string | null;
    createdAt: string;
    verification?: { verified_amount: number; verified_at: string } | null;
}

interface Account {
    sessionId: string;
    dineInTotal: number;
    takeawayTotal: number;
    grossTotal: number;
    paymentsTotal: number;
    reversalsTotal: number;
    netPaidTotal: number;
    balanceDue: number;
    confirmedOrdersCount: number;
    unresolvedPrintJobs: number;
    paymentHistory: Transaction[];
    openedAt: string;
    table: { label: string | null; table_number: number } | null;
    waiter: { fullName: string; username: string } | null;
    closeRequest?: { status: string; reason?: string | null; requested_at?: string } | null;
    orders?: Array<{
        id: string;
        order_number: number | string | null;
        order_type: string;
        status: string;
        items: Array<Record<string, any>>;
        notes?: string | null;
        created_at: string;
        total: number;
    }>;
}

const money = (value: number) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);

export default function RestaurantAccounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [selected, setSelected] = useState<string | null>(null);
    const [productsExpanded, setProductsExpanded] = useState<string | null>(null);
    const [pendingPaymentOrderExpanded, setPendingPaymentOrderExpanded] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState("");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [closeReasons, setCloseReasons] = useState<Record<string, string>>({});
    const [journey, setJourney] = useState<any>(null);
    const [salesReport, setSalesReport] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const [showMovements, setShowMovements] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [priorityIndependentOrderId, setPriorityIndependentOrderId] = useState<string | null>(null);
    const previousIndependentOrderIds = useRef<Set<string> | null>(null);
    const [newIndependentOrderAlert, setNewIndependentOrderAlert] = useState(false);

    const loadAccounts = useCallback(async () => {
        try {
            const response = await fetch("/api/restaurant/accounts", {
                cache: "no-store",
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "No se pudieron consultar las cuentas.");
            }
            const independentOrders = (result.salesReport?.orders ?? []).filter(
                (order: any) =>
                    order.order_type === "takeaway" &&
                    !order.table_session_id &&
                    order.status === "confirmed" &&
            !order.delivered
            );

            const currentIds = new Set<string>(
                independentOrders.map((order: any) => order.id)
            );

            const previousIds = previousIndependentOrderIds.current;

            if (
                previousIds !== null &&
                independentOrders.some((order: any) => !previousIds.has(order.id))
            ) {
                setNewIndependentOrderAlert(true);
                setShowMovements(true);
            }

            previousIndependentOrderIds.current = currentIds;

            setAccounts(result.accounts ?? []);
            setJourney(result.journey ?? null);
            setSalesReport(result.salesReport ?? null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error consultando cuentas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(() => void loadAccounts());
    }, [loadAccounts]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            void loadAccounts();
        }, 10000);
        return () => window.clearInterval(interval);
    }, [loadAccounts]);

    async function journeyAction(action: "open_journey" | "close_journey") {
        if (action === "close_journey" &&
            !window.confirm("¿Confirmas el cierre de la jornada? Se guardará el resumen histórico.")) {
            return;
        }

        setSubmitting(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch("/api/restaurant/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || "No se pudo completar la acción de jornada.");
            }
            setMessage(action === "open_journey"
                ? "Jornada abierta correctamente."
                : "Jornada cerrada. El resumen quedó guardado.");
            setLoading(true);
            await loadAccounts();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error gestionando la jornada.");
        } finally {
            setSubmitting(false);
        }
    }

    async function verifyTakeawayPayment(orderId: string, transactionId: string) {
        if (submitting) return;
        if (!window.confirm("¿Confirmas que recibiste y verificaste este importe?")) return;

        setSubmitting(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch("/api/restaurant/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "verify_takeaway_payment",
                    orderId,
                    transactionId
                })
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || "No se pudo verificar el pago.");
            }
            setMessage("Pago de pedido para llevar verificado. La entrega queda autorizada cuando el saldo esté cubierto.");
            setNewIndependentOrderAlert(false);
            await loadAccounts();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error verificando el pago.");
        } finally {
            setSubmitting(false);
        }
    }

    function remainingForPayment(account: Account, transaction: Transaction) {
        const reversed = account.paymentHistory
            .filter(entry =>
                entry.type === "reversal" &&
                entry.relatedTransactionId === transaction.id
            )
            .reduce((sum, entry) => sum + entry.amount, 0);
        return transaction.amount - reversed;
    }

    async function submitReversal(account: Account) {
        const value = Number(amount);
        if (
            !paymentId ||
            !Number.isSafeInteger(value) ||
            value <= 0 ||
            !reason.trim()
        ) {
            setError("Indica un importe entero positivo y el motivo del reverso.");
            return;
        }

        setSubmitting(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/restaurant/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: account.sessionId,
                    paymentId,
                    amount: value,
                    reason: reason.trim(),
                    idempotencyKey: crypto.randomUUID(),
                }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "No se pudo registrar el reverso.");
            }

            setMessage("Reverso registrado y auditado correctamente.");
            setPaymentId("");
            setAmount("");
            setReason("");
            setSelected(null);
            setLoading(true);
            setError("");
            await loadAccounts();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error registrando reverso.");
        } finally {
            setSubmitting(false);
        }
    }

    async function cashierAction(
        account: Account,
        action: "verify_payment" | "approve_close" | "return_close",
        extra: Record<string, string> = {}
    ) {
        setSubmitting(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch("/api/restaurant/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: account.sessionId, action, ...extra }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || "No se pudo completar la acción.");
            }
            setMessage("Acción de Caja registrada correctamente.");
            setLoading(true);
            await loadAccounts();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error en Caja.");
        } finally {
            setSubmitting(false);
        }
    }

    const pendingAccountPayments = accounts.flatMap(account =>
        account.paymentHistory
            .filter(transaction => transaction.type === "payment" && !transaction.verification)
            .map(transaction => ({ account, transaction }))
    );
    const pendingCloseAccounts = accounts.filter(
        account => account.closeRequest?.status === "pending"
    );

    const pendingIndependentOrders = (salesReport?.orders ?? []).filter(
        (order: any) =>
            order.order_type === "takeaway" &&
            !order.table_session_id &&
            order.status === "confirmed" &&
            !order.delivered
    );

    const pendingIndependentPayments = pendingIndependentOrders.flatMap((order: any) =>
        (order.payments ?? [])
            .filter((payment: any) =>
                payment.transaction_type === "payment" && !payment.verification
            )
            .map((payment: any) => ({ order, payment }))
    );

    return (
        <section className="min-h-full space-y-5 rounded-xl border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold">Cuentas abiertas</h2>
                    <p className="text-sm text-gray-500">
                        Supervisión de consumos, pagos e historial del restaurante
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => { setLoading(true); setError(""); void loadAccounts(); }}
                    disabled={loading}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    {loading ? "Actualizando..." : "Actualizar"}
                </button>
            </div>

            {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}
            {message && (
                <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>
            )}


            {(pendingAccountPayments.length > 0 || pendingCloseAccounts.length > 0 || pendingIndependentOrders.length > 0) && (
                <section className="space-y-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-lg font-extrabold text-amber-950">
                            Atención de Caja
                        </h3>
                        <div className="flex flex-wrap gap-2 text-xs font-bold">
                            {pendingAccountPayments.length > 0 && (
                                <span className="rounded-full bg-amber-200 px-3 py-1 text-amber-950">
                                    {pendingAccountPayments.length} pagos pendientes
                                </span>
                            )}
                            {pendingIndependentPayments.length > 0 && (
                                <span className="rounded-full bg-amber-200 px-3 py-1 text-amber-950">
                                    {pendingIndependentPayments.length} pagos independientes por verificar
                                </span>
                            )}
                            {pendingCloseAccounts.length > 0 && (
                                <span className="rounded-full bg-rose-200 px-3 py-1 text-rose-950">
                                    {pendingCloseAccounts.length} cierres pendientes
                                </span>
                            )}
                        </div>
                    </div>

                    {pendingAccountPayments.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-bold text-amber-900">Pagos por verificar</h4>
                            {pendingAccountPayments.map(({ account, transaction }) => (
                                <article
                                    key={`${account.sessionId}-${transaction.id}`}
                                    className="animate-pulse rounded-xl border-2 border-amber-300 bg-white p-3 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-extrabold text-amber-950">
                                                {account.table?.label || `Mesa ${account.table?.table_number ?? "—"}`}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {account.waiter?.fullName ?? "Mesero no disponible"} ·
                                                {" "}{transaction.method === "cash" ? "Efectivo" : "Transferencia"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(transaction.createdAt).toLocaleString("es-CO")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <strong className="text-lg text-amber-900">
                                                {money(transaction.amount)}
                                            </strong>
                                            <button
                                                type="button"
                                                onClick={() => setPendingPaymentOrderExpanded(
                                                    pendingPaymentOrderExpanded === account.sessionId ? null : account.sessionId
                                                )}
                                                className="rounded-lg border border-orange-300 px-4 py-2 text-sm font-bold text-orange-800 hover:bg-orange-50"
                                            >
                                                VER PEDIDO
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void cashierAction(account, "verify_payment", { transactionId: transaction.id })}
                                                disabled={submitting}
                                                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50"
                                            >
                                                VERIFICAR PAGO
                                            </button>
                                        </div>
                                    </div>
                                    {pendingPaymentOrderExpanded === account.sessionId && (
                                        <div className="mt-3 space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                                            <h5 className="font-bold text-orange-900">Pedido de esta mesa</h5>
                                            {!account.orders?.length ? (
                                                <p className="text-sm text-gray-600">No hay pedidos asociados a esta cuenta.</p>
                                            ) : account.orders.map(order => (
                                                <div key={order.id} className="space-y-2 rounded-lg border bg-white p-3">
                                                    <div className="flex flex-wrap justify-between gap-2 border-b pb-2">
                                                        <strong>Pedido {order.order_number ?? ""}</strong>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(order.created_at).toLocaleString("es-CO")}
                                                        </span>
                                                    </div>
                                                    {(order.items ?? []).map((item, index) => {
                                                        const product = item.product ?? {};
                                                        const daily = item.dailyMenu ?? {};
                                                        const productName = product.name ?? item.name ?? item.product_name ?? item.title ?? "Producto";
                                                        const quantity = Number(item.quantity ?? daily.quantity ?? 1);
                                                        const unitPrice = Number(item.unitPrice ?? 0);
                                                        const lineTotal = Number(item.total ?? unitPrice * quantity);

                                                        return (
                                                            <div key={`${order.id}-${index}`} className="border-b border-gray-100 py-2 last:border-0">
                                                                <div className="flex flex-wrap justify-between gap-2">
                                                                    <p className="font-semibold">{quantity} × {productName}</p>
                                                                    <strong>{money(lineTotal)}</strong>
                                                                </div>
                                                                {unitPrice > 0 && <p className="text-xs text-gray-500">Precio unitario: {money(unitPrice)}</p>}
                                                                {daily.size?.label && <p className="text-sm text-gray-600">Tamaño: {daily.size.label}</p>}
                                                                {daily.soup?.name && <p className="text-sm text-gray-600">Sopa: {daily.soup.name}</p>}
                                                                {daily.secos?.length > 0 && <p className="text-sm text-gray-600">Secos: {daily.secos.map((x: any) => x.name).join(", ")}</p>}
                                                                {daily.principle?.name && <p className="text-sm text-gray-600">Principio: {daily.principle.name}</p>}
                                                                {daily.protein?.name && <p className="text-sm text-gray-600">Proteína: {daily.protein.name}</p>}
                                                                {daily.drink?.name && <p className="text-sm text-gray-600">Bebida: {daily.drink.name}</p>}
                                                                {daily.dessert?.name && <p className="text-sm text-gray-600">Postre: {daily.dessert.name}</p>}
                                                                {(item.variant?.label || item.variant?.name) && <p className="text-sm text-gray-600">Variante: {item.variant.label ?? item.variant.name}</p>}
                                                                {item.ingredients?.length > 0 && <p className="text-sm text-gray-600">Ingredientes: {item.ingredients.map((x: any) => x.name).filter(Boolean).join(", ")}</p>}
                                                                {item.extras?.length > 0 && <p className="text-sm text-gray-600">Extras: {item.extras.map((x: any) => x.name).filter(Boolean).join(", ")}</p>}
                                                                {(item.notes || daily.notes) && <p className="text-sm text-gray-600">Nota: {item.notes || daily.notes}</p>}
                                                            </div>
                                                        );
                                                    })}
                                                    {order.notes && <p className="text-sm text-blue-800">Observaciones: {order.notes}</p>}
                                                    <p className="text-right font-bold">{money(Number(order.total ?? 0))}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}

                    {pendingIndependentOrders.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-bold text-blue-900">Pedidos independientes para llevar</h4>
                            {pendingIndependentOrders.map((order: any) => {
                                const pendingPayments = (order.payments ?? []).filter(
                                    (payment: any) =>
                                        payment.transaction_type === "payment" &&
                                        !payment.verification
                                );
                    
                                return (
                                    <article
                                        key={order.id}
                                        className="rounded-xl border-2 border-blue-300 bg-blue-50 p-3 shadow-sm"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="font-extrabold text-blue-950">
                                                    Pedido #{order.order_number ?? "—"} · Para llevar
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    Mesero: {order.waiterName ?? "No disponible"}
                                                </p>
                                                {order.customer_name && (
                                                    <p className="text-sm font-medium text-blue-800">
                                                        Cliente: {order.customer_name}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    {new Date(order.created_at).toLocaleString("es-CO")}
                                                </p>
                                            </div>
                    
                                            <div className="flex flex-wrap items-center gap-2">
                                                <strong className="text-lg text-blue-900">
                                                    {money(Number(order.total ?? 0))}
                                                </strong>
                                                <button
                                                    type="button"
                                                    onClick={() => setPriorityIndependentOrderId(
                                                        current => current === order.id ? null : order.id
                                                    )}
                                                    className="rounded-lg border border-blue-400 bg-white px-4 py-2 text-sm font-bold text-blue-800 hover:bg-blue-100"
                                                >
                                                    {priorityIndependentOrderId === order.id
                                                        ? "OCULTAR PEDIDO"
                                                        : "VER PEDIDO"}
                                                </button>
                                            </div>
                                        </div>
                    
                                        {priorityIndependentOrderId === order.id && (
                                            <div className="mt-3 space-y-2 rounded-lg border border-blue-200 bg-white p-3">
                                                <h5 className="font-bold text-blue-900">Productos del pedido</h5>
                                                {(order.items ?? []).length === 0 ? (
                                                    <p className="text-sm text-gray-500">No hay productos detallados.</p>
                                                ) : (order.items ?? []).map((item: any, index: number) => (
                                                    <div
                                                        key={`${order.id}-${index}`}
                                                        className="border-b border-gray-100 py-2 last:border-0"
                                                    >
                                                        <div className="flex flex-wrap justify-between gap-2">
                                                            <span className="font-semibold">
                                                                {item.quantity ?? 1} × {item.product?.name ?? item.name ?? item.product_name ?? item.title ?? "Producto"}
                                                            </span>
                                                            <strong>
                                                                {money(Number(item.total ?? (
                                                                    Number(item.unitPrice ?? item.unit_price ?? 0) *
                                                                    Number(item.quantity ?? 1)
                                                                )))}
                                                            </strong>
                                                        </div>
                                                        {item.notes && (
                                                            <p className="text-xs text-gray-600">Nota: {item.notes}</p>
                                                        )}
                                                    </div>
                                                ))}
                                                {order.notes && (
                                                    <p className="border-t pt-2 text-sm text-blue-800">
                                                        Observaciones: {order.notes}
                                                    </p>
                                                )}
                                                <p className="text-right font-bold text-blue-950">
                                                    Total: {money(Number(order.total ?? 0))}
                                                </p>
                                            </div>
                                        )}
                    
                                        {pendingPayments.length > 0 && (
                                            <div className="mt-3 space-y-2 border-t border-blue-200 pt-3">
                                                {pendingPayments.map((payment: any) => (
                                                    <div
                                                        key={payment.id}
                                                        className="flex flex-wrap items-center justify-between gap-3"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-semibold text-blue-900">
                                                                Pago pendiente · {payment.payment_method === "cash" ? "Efectivo" : "Transferencia"}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {new Date(payment.created_at).toLocaleString("es-CO")}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => void verifyTakeawayPayment(order.id, payment.id)}
                                                            disabled={submitting}
                                                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                                                        >
                                                            VERIFICAR PAGO
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {pendingCloseAccounts.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-bold text-rose-900">Solicitudes para liberar mesas</h4>
                            {pendingCloseAccounts.map(account => (
                                <article
                                    key={account.sessionId}
                                    className="animate-pulse rounded-xl border-2 border-rose-300 bg-white p-3 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-extrabold text-rose-950">
                                                {account.table?.label || `Mesa ${account.table?.table_number ?? "—"}`}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Responsable: {account.waiter?.fullName ?? "No disponible"}
                                            </p>
                                            {account.closeRequest?.reason && (
                                                <p className="mt-1 text-sm text-gray-700">
                                                    Motivo: {account.closeRequest.reason}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => void cashierAction(account, "approve_close")}
                                            disabled={submitting}
                                            className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white hover:bg-rose-800 disabled:opacity-50"
                                        >
                                            AUTORIZAR Y LIBERAR MESA
                                        </button>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <textarea
                                            value={closeReasons[account.sessionId] ?? ""}
                                            onChange={event => setCloseReasons(current => ({ ...current, [account.sessionId]: event.target.value }))}
                                            rows={2}
                                            maxLength={500}
                                            placeholder="Motivo para devolver la solicitud a revisión"
                                            className="w-full rounded-lg border bg-white p-2 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => void cashierAction(account, "return_close", { reason: (closeReasons[account.sessionId] ?? "").trim() }).then(() => setCloseReasons(current => ({ ...current, [account.sessionId]: "" })))}
                                            disabled={submitting || !(closeReasons[account.sessionId] ?? "").trim()}
                                            className="rounded-lg border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-50"
                                        >
                                            DEVOLVER A REVISIÓN
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}

            <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="font-bold text-gray-900">Jornada de ventas</h3>
                        <p className="text-sm text-gray-600">
                            {journey
                                ? `Abierta desde ${new Date(journey.opened_at).toLocaleString("es-CO")}`
                                : "No hay una jornada abierta."}
                        </p>
                    </div>
                    {journey ? (
                        <button
                            type="button"
                            onClick={() => void journeyAction("close_journey")}
                            disabled={submitting}
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {submitting ? "Procesando..." : "CERRAR JORNADA"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => void journeyAction("open_journey")}
                            disabled={submitting}
                            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {submitting ? "Procesando..." : "ABRIR JORNADA"}
                        </button>
                    )}
                </div>

                {journey && salesReport && (
                    <>
                        <button
                            type="button"
                            onClick={() => setShowReport(value => !value)}
                            className="w-full rounded-lg border border-orange-300 bg-white px-4 py-3 text-sm font-bold text-orange-700 hover:bg-orange-50"
                        >
                            {showReport ? "OCULTAR INFORME DE JORNADA" : "VER INFORME DE JORNADA"}
                        </button>

                        {showReport && (
                            <>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            <div className="rounded-lg bg-white p-3">
                                <p className="text-xs text-gray-500">Ventas confirmadas</p>
                                <p className="font-bold">{money(salesReport.totals.confirmedSales)}</p>
                            </div>
                            <div className="rounded-lg bg-white p-3">
                                <p className="text-xs text-gray-500">Pedidos confirmados</p>
                                <p className="font-bold">{salesReport.totals.confirmedOrderCount}</p>
                            </div>
                            <div className="rounded-lg bg-white p-3">
                                <p className="text-xs text-gray-500">Pagos verificados</p>
                                <p className="font-bold">{money(salesReport.totals.verifiedPayments)}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-800">Ventas por modalidad</h4>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs text-gray-500">Pedidos en mesa</p>
                                    <p className="font-bold">{money(Number(salesReport.totals.dineInSales ?? 0))}</p>
                                    <p className="text-xs text-gray-500">{salesReport.totals.dineInCount ?? 0} pedidos</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs text-gray-500">Para llevar asociado a mesa</p>
                                    <p className="font-bold">{money(Number(salesReport.totals.takeawayTableSales ?? 0))}</p>
                                    <p className="text-xs text-gray-500">{salesReport.totals.takeawayTableCount ?? 0} pedidos</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs text-gray-500">Para llevar independiente</p>
                                    <p className="font-bold">{money(Number(salesReport.totals.independentTakeawaySales ?? 0))}</p>
                                    <p className="text-xs text-gray-500">{salesReport.totals.independentTakeawayCount ?? 0} pedidos</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-800">Consolidado de pagos y recaudo</h4>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs text-gray-500">Efectivo reportado</p>
                                    <p className="font-bold">{money(Number(salesReport.totals.reportedCash ?? 0))}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs text-gray-500">Transferencias reportadas</p>
                                    <p className="font-bold">{money(Number(salesReport.totals.reportedTransfer ?? 0))}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs text-gray-500">Total pagos reportados</p>
                                    <p className="font-bold">{money(Number(salesReport.totals.reportedPayments ?? 0))}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs text-gray-500">Verificado por Caja</p>
                                    <p className="font-bold text-green-700">{money(Number(salesReport.totals.verifiedPayments ?? 0))}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs text-gray-500">Pendiente de verificación</p>
                                    <p className="font-bold text-orange-700">{money(Number(salesReport.totals.pendingVerification ?? 0))}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs text-gray-500">Saldo por cobrar</p>
                                    <p className="font-bold text-red-700">{money(Number(salesReport.totals.balanceDue ?? 0))}</p>
                                </div>
                            </div>
                        </div>
                            </>
                        )}

                        {newIndependentOrderAlert && (
                            <div className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">
                                ¡Tienes un nuevo pedido independiente pendiente de atención!
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowMovements(value => !value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                        >
                            {showMovements ? "OCULTAR PEDIDOS INDEPENDIENTES" : "VER PEDIDOS INDEPENDIENTES"}
                        </button>

                        {showMovements && (
                            <>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-gray-800">Detalle de movimientos de la jornada</h4>
                            {(salesReport.orders ?? []).filter((order: any) =>
                                order.order_type === "takeaway" && !order.table_session_id
                            ).length === 0 ? (
                                <p className="text-sm text-gray-500">No hay pedidos independientes en esta jornada.</p>
                            ) : salesReport.orders
                                .filter((order: any) =>
                                    order.order_type === "takeaway" && !order.table_session_id
                                )
                                .map((order: any) => (
                                <div key={order.id} className="rounded-lg bg-white p-3 text-sm">
                                    <div className="flex flex-wrap justify-between gap-2">
                                        <span className="font-semibold">
                                            Pedido #{order.order_number ?? "—"} · {order.waiterName}
                                        </span>
                                        <span className="font-bold">{money(Number(order.total || 0))}</span>
                                    </div>
                                    {order.customer_name && (
                                        <p className="mt-1 text-sm font-medium text-orange-700">
                                            Cliente: {order.customer_name}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        {new Date(order.created_at).toLocaleString("es-CO")} ·
                                        {" "}{order.order_type === "dine_in" ? "En mesa" : "Para llevar"} ·
                                        {" "}{order.status === "confirmed" ? "Confirmado" : "Cancelado"}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                                        <span>Abonado: <strong>{money(Number(order.netPaid ?? 0))}</strong></span>
                                        <span>Saldo: <strong>{money(Number(order.balanceDue ?? order.total ?? 0))}</strong></span>
                                        <span>Verificado: <strong>{money(Number(order.verifiedTotal ?? 0))}</strong></span>
                                    </div>
                                    {(order.payments ?? []).map((payment: any) => (
                                        <div key={payment.id} className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-xs">
                                            <div>
                                                <p className="font-semibold">
                                                    {payment.payment_method === "cash" ? "Efectivo" : "Transferencia"} · {money(Number(payment.amount))}
                                                </p>
                                                <p className="text-gray-500">
                                                    {new Date(payment.created_at).toLocaleString("es-CO")} ·
                                                    {payment.verification
                                                        ? ` Verificado ${new Date(payment.verification.verified_at).toLocaleString("es-CO")}`
                                                        : " Pendiente de verificación"}
                                                </p>
                                            </div>
                                            {!payment.verification && payment.transaction_type === "payment" && (
                                                <button
                                                    type="button"
                                                    onClick={() => void verifyTakeawayPayment(order.id, payment.id)}
                                                    disabled={submitting}
                                                    className="rounded-lg bg-green-700 px-3 py-2 font-semibold text-white disabled:opacity-50"
                                                >
                                                    VERIFICAR PAGO
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setExpandedOrderId(
                                            current => current === order.id ? null : order.id
                                        )}
                                        className="mt-3 rounded-lg border border-orange-200 px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-50"
                                    >
                                        {expandedOrderId === order.id
                                            ? "OCULTAR DETALLE"
                                            : "VER DETALLE DEL PEDIDO"}
                                    </button>

                                    {expandedOrderId === order.id && (
                                        <div className="mt-3 rounded-lg bg-gray-50 p-3">
                                            <p className="mb-2 text-xs font-bold text-gray-700">
                                                Productos solicitados
                                            </p>
                                            <div className="space-y-2 text-sm text-gray-700">
                                                {(order.items ?? []).map((item: any, index: number) => (
                                                    <div
                                                        key={`${order.id}-${index}`}
                                                        className="flex flex-wrap justify-between gap-2"
                                                    >
                                                        <span>
                                                            {item.name ?? item.product_name ?? item.title ?? item.product?.name ?? "Producto"}
                                                            {item.variant?.name ? ` · ${item.variant.name}` : ""}
                                                            {item.notes ? ` · ${item.notes}` : ""}
                                                        </span>
                                                        <strong>× {item.quantity ?? 1}</strong>
                                                    </div>
                                                ))}
                                                {(!order.items || order.items.length === 0) && (
                                                    <p className="text-xs text-gray-500">
                                                        Este pedido no tiene productos detallados.
                                                    </p>
                                                )}
                                                {order.notes && (
                                                    <p className="border-t pt-2 text-xs text-gray-500">
                                                        Nota: {order.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {loading ? (
                <p className="py-6 text-center text-gray-500">Cargando cuentas...</p>
            ) : accounts.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                    No hay cuentas abiertas en este momento.
                </p>
            ) : (
                <div className="space-y-4">
                    {accounts.map(account => {
                        const tableName = account.table?.label ||
                            `Mesa ${account.table?.table_number ?? "—"}`;

                        return (
                            <article id={`account-${account.sessionId}`} key={account.sessionId} className="scroll-mt-4 rounded-xl border p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold">{tableName}</h3>
                                        <p className="text-sm text-gray-500">
                                            Responsable: {account.waiter?.fullName ?? "No disponible"}
                                            {" · "}Usuario: {account.waiter?.username ?? "—"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Apertura: {new Date(account.openedAt).toLocaleString("es-CO")}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelected(
                                            selected === account.sessionId ? null : account.sessionId
                                        )}
                                        className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                                    >
                                        {selected === account.sessionId ? "Ocultar detalle" : "Ver cuenta e historial"}
                                    </button>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Consumo en mesa</p>
                                        <p className="font-semibold">{money(account.dineInTotal)}</p>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Para llevar</p>
                                        <p className="font-semibold">{money(account.takeawayTotal)}</p>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Total combinado</p>
                                        <p className="font-semibold">{money(account.grossTotal)}</p>
                                    </div>
                                    <div className="rounded-lg bg-blue-50 p-3">
                                        <p className="text-xs text-blue-700">Saldo pendiente</p>
                                        <p className="text-lg font-bold text-blue-900">{money(account.balanceDue)}</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setProductsExpanded(
                                        productsExpanded === account.sessionId ? null : account.sessionId
                                    )}
                                    className="mt-3 rounded-lg bg-[#FF6900] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-700"
                                >
                                    {productsExpanded === account.sessionId ? "OCULTAR PRODUCTOS" : "VER DETALLE PRODUCTOS"}
                                </button>

                                {productsExpanded === account.sessionId && (
                                    <div className="mt-3 space-y-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                                        <h4 className="font-bold text-orange-900">Detalle de productos de la cuenta</h4>
                                        {!account.orders?.length ? (
                                            <p className="text-sm text-gray-600">No hay pedidos asociados a esta cuenta.</p>
                                        ) : account.orders.map(order => (
                                            <div key={order.id} className="space-y-2 rounded-lg border bg-white p-3">
                                                <div className="flex flex-wrap justify-between gap-2 border-b pb-2">
                                                    <strong>Pedido {order.order_number ?? ""}</strong>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(order.created_at).toLocaleString("es-CO")}
                                                    </span>
                                                </div>
                                                {(order.items ?? []).map((item, index) => {
                                                    const product = item.product ?? {};
                                                    const daily = item.dailyMenu ?? {};
                                                    const productName = product.name ?? item.name ?? item.product_name ?? item.title ?? "Producto";
                                                    const quantity = Number(item.quantity ?? daily.quantity ?? 1);
                                                    const unitPrice = Number(item.unitPrice ?? 0);
                                                    const lineTotal = Number(item.total ?? unitPrice * quantity);

                                                    return (
                                                        <div key={`${order.id}-${index}`} className="border-b border-gray-100 py-3 last:border-0">
                                                            <div className="flex flex-wrap justify-between gap-2">
                                                                <p className="font-semibold text-gray-900">
                                                                    {quantity} × {productName}
                                                                </p>
                                                                <strong className="text-gray-900">{money(lineTotal)}</strong>
                                                            </div>
                                                            {unitPrice > 0 && (
                                                                <p className="text-xs text-gray-500">
                                                                    Precio unitario: {money(unitPrice)}
                                                                </p>
                                                            )}
                                                            {daily.size?.label && <p className="text-sm text-gray-600">Tamaño: {daily.size.label}</p>}
                                                            {daily.soup?.name && <p className="text-sm text-gray-600">Sopa: {daily.soup.name}</p>}
                                                            {daily.secos?.length > 0 && <p className="text-sm text-gray-600">Secos: {daily.secos.map((x: any) => x.name).join(", ")}</p>}
                                                            {daily.principle?.name && <p className="text-sm text-gray-600">Principio: {daily.principle.name}</p>}
                                                            {daily.protein?.name && <p className="text-sm text-gray-600">Proteína: {daily.protein.name}</p>}
                                                            {daily.drink?.name && <p className="text-sm text-gray-600">Bebida: {daily.drink.name}</p>}
                                                            {daily.dessert?.name && <p className="text-sm text-gray-600">Postre: {daily.dessert.name}</p>}
                                                            {(item.variant?.label || item.variant?.name) && <p className="text-sm text-gray-600">Variante: {item.variant.label ?? item.variant.name}</p>}
                                                            {item.ingredients?.length > 0 && <p className="text-sm text-gray-600">Ingredientes: {item.ingredients.map((x: any) => x.name).filter(Boolean).join(", ")}</p>}
                                                            {item.extras?.length > 0 && <p className="text-sm text-gray-600">Extras: {item.extras.map((x: any) => x.name).filter(Boolean).join(", ")}</p>}
                                                            {(item.notes || daily.notes) && <p className="text-sm text-gray-600">Nota: {item.notes || daily.notes}</p>}
                                                        </div>
                                                    );
                                                })}
                                                {order.notes && <p className="text-sm text-blue-800">Observaciones: {order.notes}</p>}
                                                <p className="text-right font-bold">{money(Number(order.total ?? 0))}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selected === account.sessionId && (
                                    <div className="mt-4 space-y-4 border-t pt-4">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <p>Pagos: <strong>{money(account.paymentsTotal)}</strong></p>
                                            <p>Reversos: <strong>{money(account.reversalsTotal)}</strong></p>
                                            <p>Pagado neto: <strong>{money(account.netPaidTotal)}</strong></p>
                                            <p>Pedidos confirmados: <strong>{account.confirmedOrdersCount}</strong></p>
                                        </div>

                                        {account.unresolvedPrintJobs > 0 && (
                                            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                                Tiene {account.unresolvedPrintJobs} trabajos de impresión pendientes o sin resolver.
                                            </p>
                                        )}

                                        {account.closeRequest && (
                                            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                                <h4 className="font-semibold">Solicitud de cierre</h4>
                                                <p className="text-sm">
                                                    Estado: <strong>{account.closeRequest.status === "pending" ? "Pendiente de autorización" : account.closeRequest.status === "returned" ? "Devuelta a revisión" : account.closeRequest.status}</strong>
                                                </p>
                                                {account.closeRequest.reason && (
                                                    <p className="text-sm">Motivo: {account.closeRequest.reason}</p>
                                                )}
                                                {account.closeRequest.status === "pending" && (
                                                    <div className="space-y-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => void cashierAction(account, "approve_close")}
                                                            disabled={submitting}
                                                            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                                        >
                                                            Autorizar cierre y liberar mesa
                                                        </button>
                                                        <textarea
                                                            value={closeReasons[account.sessionId] ?? ""}
                                                            onChange={event => setCloseReasons(current => ({ ...current, [account.sessionId]: event.target.value }))}
                                                            rows={2}
                                                            maxLength={500}
                                                            placeholder="Motivo para devolver la solicitud"
                                                            className="w-full rounded-lg border bg-white p-2 text-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => void cashierAction(account, "return_close", { reason: (closeReasons[account.sessionId] ?? "").trim() }).then(() => setCloseReasons(current => ({ ...current, [account.sessionId]: "" })))}
                                                            disabled={submitting || !(closeReasons[account.sessionId] ?? "").trim()}
                                                            className="rounded-lg border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50"
                                                        >
                                                            Devolver a revisión
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="mb-2 font-semibold">Historial de pagos y reversos</h4>
                                            {account.paymentHistory.length === 0 ? (
                                                <p className="text-sm text-gray-500">Todavía no hay movimientos.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {account.paymentHistory.map(entry => {
                                                        const remaining = entry.type === "payment"
                                                            ? remainingForPayment(account, entry)
                                                            : 0;
                                                        return (
                                                            <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
                                                                <div className="min-w-0">
                                                                    <p className="font-medium">
                                                                        {entry.type === "payment" ? "Pago" : "Reverso"}
                                                                        {" · "}
                                                                        {entry.method === "cash" ? "Efectivo" : "Transferencia"}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {entry.reason || entry.reference || "Sin referencia"}
                                                                        {" · "}{new Date(entry.createdAt).toLocaleString("es-CO")}
                                                                    </p>
                                                                    {entry.type === "payment" && remaining > 0 && (
                                                                        <p className="text-xs text-gray-600">
                                                                            Disponible para reversar: {money(remaining)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <strong>{entry.type === "reversal" ? "−" : "+"}{money(entry.amount)}</strong>
                                                                    {entry.type === "payment" && remaining > 0 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setPaymentId(entry.id);
                                                                                setAmount(String(remaining));
                                                                                setReason("");
                                                                            }}
                                                                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                                                                        >
                                                                            Reversar
                                                                        </button>
                                                                    )}
                                                                    {entry.type === "payment" && !entry.verification && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => void cashierAction(account, "verify_payment", { transactionId: entry.id })}
                                                                            disabled={submitting}
                                                                            className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                                                                        >
                                                                            Verificar recepción
                                                                        </button>
                                                                    )}
                                                                    {entry.type === "payment" && entry.verification && (
                                                                        <span className="text-xs font-semibold text-green-700">
                                                                            Recepción verificada
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {paymentId && (
                                            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
                                                <h4 className="font-semibold text-red-900">Reverso administrativo</h4>
                                                <label className="block text-sm">
                                                    Importe entero a reversar
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={amount}
                                                        onChange={event => setAmount(event.target.value)}
                                                        className="mt-1 w-full rounded-lg border bg-white px-3 py-2"
                                                    />
                                                </label>
                                                <label className="block text-sm">
                                                    Motivo obligatorio
                                                    <textarea
                                                        value={reason}
                                                        onChange={event => setReason(event.target.value)}
                                                        maxLength={500}
                                                        rows={2}
                                                        className="mt-1 w-full rounded-lg border bg-white px-3 py-2"
                                                        placeholder="Explica por qué se reversa este pago"
                                                    />
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => void submitReversal(account)}
                                                        disabled={submitting}
                                                        className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                                    >
                                                        {submitting ? "Procesando..." : "Confirmar reverso"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentId("")}
                                                        disabled={submitting}
                                                        className="rounded-lg border px-4 py-2 text-sm"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                                <p className="text-xs text-red-800">
                                                    El reverso modifica el saldo de la cuenta y queda registrado en auditoría. Solo está permitido mientras la cuenta siga abierta.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
