"use client";

import { useEffect, useMemo, useState } from "react";
import { CartProvider } from "@/context/CartContext";
import ProductGrid from "@/components/products/ProductGrid";
import Categories from "@/components/restaurant/Categories";
import { Product, ProductSelection } from "@/types/product";
import { RestaurantPageData } from "@/types/restaurant-page";
import {
    getProductPurchaseScheduleMessage,
    isProductPurchaseAllowed,
} from "@/lib/utils/product-purchase-hours";

interface WaiterMenuProps {
    data: RestaurantPageData;
    waiterName: string;
    waiterAccountId: string;
}

interface PendingWaiterOrder {
    idempotencyKey: string;
    orderType: "dine_in" | "takeaway";
    tableSessionId: string | null;
    selectedTableId: string;
    customerName: string;
    items: ProductSelection[];
    notes: null;
}

interface WaiterSessionAccount {
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
    orders?: Array<{
        id: string;
        order_number: number | string | null;
        order_type: string;
        items: Array<Record<string, any>>;
        notes?: string | null;
        created_at: string;
        total: number;
        printJobs: Array<{
            id: string;
            destination: string;
            status: string;
            attempt_count: number;
            last_error: string | null;
            printed_at: string | null;
            verified_by_waiter_id: string | null;
            verified_at: string | null;
        }>;
    }>;
    paymentHistory: Array<{
        id: string;
        type: "payment" | "reversal";
        method: "cash" | "transfer" | null;
        amount: number;
        reference: string | null;
        reason: string | null;
        createdAt: string;
    }>;
    status?: string;
}

interface PendingWaiterPayment {
    idempotencyKey: string;
    sessionId: string;
    amount: number;
    paymentMethod: "cash" | "transfer";
    reference: string | null;
}

interface IndependentTakeawayOrder {
    id: string;
    orderNumber: number | string | null;
    total: number;
    balanceDue: number;
    netPaid: number;
    verifiedTotal: number;
    canDeliver: boolean;
}

interface IndependentTakeawayHistoryOrder {
    id: string;
    customer_name: string | null;
    order_number: number | string | null;
    order_type: string;
    status: string;
    items: Array<Record<string, any>>;
    notes: string | null;
    subtotal: number;
    total: number;
    created_at: string;
    payments: Array<{
        id: string;
        transaction_type: string;
        payment_method: string | null;
        amount: number;
        reference: string | null;
        reason: string | null;
        created_at: string;
        verification: {
            verified_amount: number;
            verified_at: string;
            notes: string | null;
        } | null;
    }>;
    printJobs: Array<{
        id: string;
        destination: string;
        status: string;
        attempt_count: number;
        last_error: string | null;
        printed_at: string | null;
        verified_by_waiter_id: string | null;
        verified_at: string | null;
    }>;
    netPaid: number;
    balanceDue: number;
    verifiedTotal: number;
    canDeliver: boolean;
}

function validOrderId(value: unknown): value is string {
    return typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function WaiterMenuContent({
    data,
    waiterName,
    waiterAccountId,
}: WaiterMenuProps) {
    const storageKey = `pedidos360:waiter-pending:${data.restaurant.slug}:${waiterAccountId}`;
    const paymentStorageKey = `pedidos360:waiter-payment-pending:${data.restaurant.slug}:${waiterAccountId}`;
    const [search, setSearch] = useState("");
    const [workflowStep, setWorkflowStep] = useState<"tables" | "service" | "catalog">("tables");
    const [orderPanelOpen, setOrderPanelOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(data.categories.find(category => category.isActive)?.id ?? "all");
    const [items, setItems] = useState<ProductSelection[]>([]);
    const [orderType, setOrderType] = useState<"dine_in" | "takeaway">("takeaway");
    const [customerName, setCustomerName] = useState("");
    const [tables, setTables] = useState<Array<{
        id: string;
        table_number: number;
        label: string | null;
        currentSession: {
            id: string;
            isMine: boolean;
            tableConsumptionSubtotal: number;
            takeawaySubtotal: number;
            combinedTotal: number;
        } | null;
    }>>([]);
    const [selectedTableId, setSelectedTableId] = useState("");
    const [tablesLoaded, setTablesLoaded] = useState(false);
    const [loadingTables, setLoadingTables] = useState(false);
    const [addingTable, setAddingTable] = useState(false);
    const [existingTables, setExistingTables] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [orderMessage, setOrderMessage] = useState("");
    const [confirmedOrder, setConfirmedOrder] = useState("");
    const [independentOrder, setIndependentOrder] = useState<IndependentTakeawayOrder | null>(null);
    const [independentOrders, setIndependentOrders] = useState<IndependentTakeawayHistoryOrder[]>([]);
    const [loadingIndependentOrders, setLoadingIndependentOrders] = useState(false);
    const [independentOrdersOpen, setIndependentOrdersOpen] = useState(false);
    const [independentOrdersMessage, setIndependentOrdersMessage] = useState("");
    const [retryingPrintJobId, setRetryingPrintJobId] = useState<string | null>(null);
    const [independentPaymentAmount, setIndependentPaymentAmount] = useState("");
    const [independentPaymentMethod, setIndependentPaymentMethod] = useState<"cash" | "transfer">("cash");
    const [independentPaymentReference, setIndependentPaymentReference] = useState("");
    const [independentPaymentMessage, setIndependentPaymentMessage] = useState("");
    const [independentPaymentSubmitting, setIndependentPaymentSubmitting] = useState(false);
    const [pendingOrder, setPendingOrder] = useState<PendingWaiterOrder | null>(null);
    const [recoveryReady, setRecoveryReady] = useState(false);
    const [recoveryBlocked, setRecoveryBlocked] = useState(false);

    const [account, setAccount] = useState<WaiterSessionAccount | null>(null);
    const [productsExpanded, setProductsExpanded] = useState(false);
    const [loadingAccount, setLoadingAccount] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState("");
    const [pendingPayment, setPendingPayment] = useState<PendingWaiterPayment | null>(null);
    const [closingSession, setClosingSession] = useState(false);

    useEffect(() => {
        let active = true;

        queueMicrotask(() => {
            if (!active) return;
            try {
            const stored = window.localStorage.getItem(storageKey);

            if (stored) {
                const parsed = JSON.parse(stored) as PendingWaiterOrder;

                if (
                    !parsed ||
                    typeof parsed.idempotencyKey !== "string" ||
                    !parsed.idempotencyKey ||
                    !["dine_in", "takeaway"].includes(parsed.orderType) ||
                    !Array.isArray(parsed.items) ||
                    parsed.items.length === 0 ||
                    typeof parsed.selectedTableId !== "string" ||
                    !("tableSessionId" in parsed)
                ) {
                    throw new Error("El pedido pendiente guardado no tiene un formato válido.");
                }

                if (active) {
                    setPendingOrder(parsed);
                    setItems(parsed.items);
                    setOrderType(parsed.orderType);
                    setSelectedTableId(parsed.selectedTableId);
                    setCustomerName(typeof parsed.customerName === "string" ? parsed.customerName : "");
                    setOrderMessage(
                        "Se recuperó una confirmación pendiente. Reintenta con el mismo pedido para verificar su resultado."
                    );
                }
            }
        } catch (error) {
            if (active) {
                setRecoveryBlocked(true);
                setOrderMessage(
                    error instanceof Error
                        ? error.message
                        : "No fue posible recuperar el pedido pendiente. No envíes otro pedido desde esta sesión."
                );
            }
        } finally {
            if (active) setRecoveryReady(true);
        }

            });

        return () => {
            active = false;
        };
    }, [storageKey]);

    useEffect(() => {
        let active = true;
        queueMicrotask(() => {
            if (!active) return;
            try {
            const stored = window.localStorage.getItem(paymentStorageKey);
            if (!stored) return;

            const parsed = JSON.parse(stored) as PendingWaiterPayment;
            if (
                !parsed ||
                typeof parsed.idempotencyKey !== "string" ||
                typeof parsed.sessionId !== "string" ||
                !Number.isSafeInteger(parsed.amount) ||
                parsed.amount <= 0 ||
                (parsed.paymentMethod !== "cash" && parsed.paymentMethod !== "transfer")
            ) {
                throw new Error("El pago pendiente guardado no tiene un formato válido.");
            }

            setPendingPayment(parsed);
            setPaymentAmount(String(parsed.amount));
            setPaymentMethod(parsed.paymentMethod);
            setPaymentReference(parsed.reference ?? "");
            setPaymentMessage(
                "Hay un pago pendiente de confirmar. Reintenta con los mismos datos para evitar registrarlo dos veces."
            );
        } catch (error) {
            setPaymentMessage(
                error instanceof Error
                    ? error.message
                    : "No se pudo recuperar el pago pendiente."
            );
        }
            });
        return () => {
            active = false;
        };
    }, [paymentStorageKey]);

    useEffect(() => {
        void loadTables();
    }, []);

    async function loadIndependentOrders() {
        setLoadingIndependentOrders(true);
        setIndependentOrdersMessage("");

        try {
            const response = await fetch(
                "/api/waiters/account?independentOrders=1",
                { cache: "no-store" }
            );
            const result = await response.json();

            if (!response.ok || !result?.success) {
                throw new Error(
                    result?.message || "No fue posible cargar tus pedidos para llevar."
                );
            }

            setIndependentOrders(result.orders ?? []);
        } catch (error) {
            setIndependentOrdersMessage(
                error instanceof Error
                    ? error.message
                    : "Error consultando el historial de pedidos."
            );
        } finally {
            setLoadingIndependentOrders(false);
        }
    }

    async function retryPrintJob(orderId: string, jobId: string) {
        if (retryingPrintJobId) return;

        setRetryingPrintJobId(jobId);
        setIndependentOrdersMessage("");

        try {
            const response = await fetch("/api/waiters/account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "retry_print_job",
                    orderId,
                    jobId,
                }),
            });
            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "No fue posible solicitar la reimpresión.");
            }

            await loadIndependentOrders();
            setIndependentOrdersMessage(result.message || "Reimpresión enviada a la cola.");
        } catch (error) {
            setIndependentOrdersMessage(
                error instanceof Error ? error.message : "No fue posible solicitar la reimpresión."
            );
        } finally {
            setRetryingPrintJobId(null);
        }
    }

    useEffect(() => {
        void loadIndependentOrders();

        const interval = window.setInterval(() => {
            void loadIndependentOrders();
        }, 15000);

        return () => window.clearInterval(interval);
    }, []);

    async function loadTables() {
        setLoadingTables(true);
        setOrderMessage("");

        try {
            const response = await fetch("/api/waiters/tables", {
                cache: "no-store",
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "No fue posible cargar las mesas.");
            }

            setTables(result.tables ?? []);
            setExistingTables(Number(result.existingTables) || 0);
            setTablesLoaded(true);
        } catch (error) {
            setOrderMessage(error instanceof Error ? error.message : "Error cargando mesas.");
        } finally {
            setLoadingTables(false);
        }
    }

    async function addTable() {
        if (addingTable || existingTables >= 200) return;

        setAddingTable(true);
        setOrderMessage("");

        try {
            const response = await fetch("/api/waiters/tables", {
                method: "POST",
            });
            const result = await response.json();

            if (!response.ok || !result.success || !result.table?.id) {
                throw new Error(result.message || "No fue posible agregar la mesa.");
            }

            await loadTables();
            setSelectedTableId(result.table.id);
            setOrderType("dine_in");
            setOrderMessage(`${result.table.label} agregada correctamente.`);
        } catch (error) {
            setOrderMessage(
                error instanceof Error ? error.message : "No fue posible agregar la mesa."
            );
        } finally {
            setAddingTable(false);
        }
    }

    async function getTableSession(tableId: string): Promise<string> {
        const table = tables.find(value => value.id === tableId);

        if (!table) {
            throw new Error("Selecciona una mesa válida.");
        }

        if (table.currentSession?.id) {
            if (!table.currentSession.isMine) {
                throw new Error(
                    "Esta mesa tiene una cuenta abierta por otro mesero. Selecciona una mesa propia."
                );
            }

            return table.currentSession.id;
        }

        const response = await fetch(`/api/waiters/tables/${tableId}/open`, {
            method: "POST",
        });
        const result = await response.json();

        if (response.ok && result.success && result.session?.id) {
            setTables(current => current.map(table =>
                table.id === tableId
                    ? {
                        ...table,
                        currentSession: {
                            id: result.session.id,
                            isMine: true,
                            tableConsumptionSubtotal: 0,
                            takeawaySubtotal: 0,
                            combinedTotal: 0,
                        },
                    }
                    : table
            ));

            return result.session.id;
        }

        if (response.status === 409) {
            const refreshed = await fetch("/api/waiters/tables", {
                cache: "no-store",
            });
            const refreshedResult = await refreshed.json();

            if (!refreshed.ok || !refreshedResult.success) {
                throw new Error(
                    refreshedResult.message || "No fue posible actualizar las mesas."
                );
            }

            const refreshedTables = refreshedResult.tables ?? [];
            setTables(refreshedTables);

            const existing = refreshedTables.find(
                (value: typeof tables[number]) => value.id === tableId
            );

            if (existing?.currentSession?.isMine) {
                return existing.currentSession.id;
            }

            if (existing?.currentSession) {
                throw new Error(
                    "Otro mesero abrió esta mesa. No puedes utilizar su cuenta."
                );
            }
        }

        throw new Error(
            result.message || "No fue posible abrir la cuenta de la mesa."
        );
    }

    async function submitPayment() {
        const sessionId = selectedSession?.id;

        if (!sessionId || !selectedSession?.isMine || paymentSubmitting) return;

        let request = pendingPayment;

        if (request && request.sessionId !== sessionId) {
            setPaymentMessage(
                "Hay un pago pendiente de otra cuenta. Selecciona primero la mesa de ese pago para reintentarlo."
            );
            return;
        }

        if (!request) {
            const amount = Number(paymentAmount);

            if (!Number.isSafeInteger(amount) || amount <= 0) {
                setPaymentMessage("Ingresa un importe positivo en pesos enteros.");
                return;
            }

            if (!account || amount > account.balanceDue) {
                setPaymentMessage("El importe supera el saldo pendiente actual.");
                return;
            }

            request = {
                idempotencyKey: crypto.randomUUID(),
                sessionId,
                amount,
                paymentMethod,
                reference: paymentReference.trim() || null,
            };

            try {
                window.localStorage.setItem(paymentStorageKey, JSON.stringify(request));
            } catch {
                setPaymentMessage(
                    "No se pudo guardar la protección del pago en este dispositivo. No se envió el cobro."
                );
                return;
            }

            setPendingPayment(request);
        }

        setPaymentSubmitting(true);
        setPaymentMessage("");

        try {
            const response = await fetch("/api/waiters/account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: request.sessionId,
                    amount: request.amount,
                    paymentMethod: request.paymentMethod,
                    reference: request.reference,
                    idempotencyKey: request.idempotencyKey,
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                try {
                    window.localStorage.removeItem(paymentStorageKey);
                } catch {
                    // La clave antigua no autoriza un segundo cobro con datos distintos.
                }
                setPendingPayment(null);
                throw new Error(result?.message || "No fue posible registrar el pago.");
            }

            setAccount(result.account);
            setPaymentAmount("");
            setPaymentReference("");
            setPendingPayment(null);

            try {
                window.localStorage.removeItem(paymentStorageKey);
                setPaymentMessage(
                    result.account?.duplicate
                        ? "Este pago ya estaba registrado. Se recuperó su resultado sin duplicarlo."
                        : "Pago registrado correctamente."
                );
            } catch {
                setPaymentMessage(
                    "Pago registrado. Conserva esta cuenta y actualízala para verificar el historial."
                );
            }

            await loadTables();
        } catch (error) {
            setPaymentMessage(
                error instanceof Error
                    ? error.message
                    : "No se pudo confirmar el pago. Reintenta con la misma solicitud pendiente."
            );
        } finally {
            setPaymentSubmitting(false);
        }
    }

    async function submitIndependentPayment() {
        if (!independentOrder || independentPaymentSubmitting) return;

        const amount = Number(independentPaymentAmount);
        if (!Number.isSafeInteger(amount) || amount <= 0 || amount > independentOrder.balanceDue) {
            setIndependentPaymentMessage("Ingresa un abono válido que no supere el saldo pendiente.");
            return;
        }

        setIndependentPaymentSubmitting(true);
        setIndependentPaymentMessage("");

        const idempotencyKey = crypto.randomUUID();

        try {
            const response = await fetch("/api/waiters/account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "record_independent_takeaway_payment",
                    orderId: independentOrder.id,
                    amount,
                    paymentMethod: independentPaymentMethod,
                    reference: independentPaymentReference.trim() || null,
                    idempotencyKey,
                }),
            });
            const result = await response.json();

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "No fue posible registrar el abono.");
            }

            const refresh = await fetch(
                `/api/waiters/account?orderId=${encodeURIComponent(independentOrder.id)}`,
                { cache: "no-store" }
            );
            const current = await refresh.json();

            if (!refresh.ok || !current?.success) {
                throw new Error("El abono se registró, pero no se pudo actualizar el saldo. Actualiza la consulta del pedido.");
            }

            setIndependentOrder({
                id: independentOrder.id,
                orderNumber: independentOrder.orderNumber,
                total: Number(current.order.total ?? 0),
                balanceDue: Number(current.balanceDue ?? 0),
                netPaid: Number(current.netPaid ?? 0),
                verifiedTotal: Number(current.verifiedTotal ?? 0),
                canDeliver: Boolean(current.canDeliver),
            });
            setIndependentPaymentAmount("");
            setIndependentPaymentReference("");
            setIndependentPaymentMessage("Abono registrado. Está pendiente de verificación por Caja.");
        } catch (error) {
            setIndependentPaymentMessage(
                error instanceof Error ? error.message : "No fue posible registrar el abono."
            );
        } finally {
            setIndependentPaymentSubmitting(false);
        }
    }

    async function closeSession() {
        const sessionId = selectedSession?.id;

        if (
            !sessionId ||
            !selectedSession?.isMine ||
            !account ||
            account.balanceDue !== 0 ||
            account.unresolvedPrintJobs !== 0 ||
            closingSession
        ) return;

        if (!window.confirm("¿Confirmas el cierre de esta cuenta y la liberación de la mesa?")) {
            return;
        }

        setClosingSession(true);
        setPaymentMessage("");

        try {
            const response = await fetch("/api/waiters/account/close", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "No fue posible cerrar la cuenta.");
            }

            setAccount(null);
            setSelectedTableId("");
            setPaymentMessage("Cuenta cerrada correctamente. La mesa quedó liberada.");
            await loadTables();
        } catch (error) {
            setPaymentMessage(
                error instanceof Error ? error.message : "No fue posible cerrar la cuenta."
            );
        } finally {
            setClosingSession(false);
        }
    }

    async function submitOrder() {
        if (!recoveryReady || recoveryBlocked || items.length === 0 || submitting) return;

        if (!pendingOrder && orderType === "dine_in" && !selectedTableId) {
            setOrderMessage("Selecciona una mesa para continuar.");
            return;
        }

        if (!pendingOrder && orderType === "takeaway" && !selectedTableId && !customerName.trim()) {
            setOrderMessage("Escribe el nombre del cliente para el pedido independiente.");
            return;
        }

        setSubmitting(true);
        setOrderMessage("");
        setConfirmedOrder("");

        try {
            let request = pendingOrder;

            if (!request) {
                let tableSessionId: string | null = null;

                if (selectedTableId) {
                    tableSessionId = await getTableSession(selectedTableId);
                }

                request = {
                    idempotencyKey: crypto.randomUUID(),
                    orderType,
                    tableSessionId,
                    selectedTableId,
                    customerName: !tableSessionId && orderType === "takeaway" ? customerName.trim() : "",
                    items: structuredClone(items),
                    notes: null,
                };

                // Persistir antes de enviar: si se pierde la respuesta,
                // el siguiente intento reutiliza exactamente esta solicitud.
                window.localStorage.setItem(storageKey, JSON.stringify(request));
                setPendingOrder(request);
            }

            const response = await fetch(
                `/${data.restaurant.slug}/api/waiter/service-orders`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderType: request.orderType,
                        tableSessionId: request.tableSessionId,
                        customerName: request.customerName,
                        idempotencyKey: request.idempotencyKey,
                        items: request.items,
                        notes: request.notes,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error || "No fue posible confirmar el pedido. Conservamos la solicitud para reintentar sin duplicarlo."
                );
            }

            setConfirmedOrder(
                `Pedido #${result.orderNumber} confirmado. Impresión: ${result.printStatus === "queued" ? "en cola" : result.printStatus}.`
            );

            // Si falla la limpieza local, la clave persistida seguirá siendo
            // segura: el servidor debe devolver el mismo pedido al reintentar.
            try {
                window.localStorage.removeItem(storageKey);
            } catch {
                setOrderMessage(
                    "El pedido fue confirmado, pero el navegador no pudo limpiar el registro local pendiente."
                );
            }

            setPendingOrder(null);
            setItems([]);

            if (!request.tableSessionId && request.orderType === "takeaway" && validOrderId(result.orderId)) {
                const paymentResponse = await fetch(
                    `/api/waiters/account?orderId=${encodeURIComponent(result.orderId)}`,
                    { cache: "no-store" }
                );
                const paymentResult = await paymentResponse.json();

                if (paymentResponse.ok && paymentResult?.success) {
                    setIndependentOrder({
                        id: result.orderId,
                        orderNumber: result.orderNumber ?? null,
                        total: Number(paymentResult.order.total ?? 0),
                        balanceDue: Number(paymentResult.balanceDue ?? 0),
                        netPaid: Number(paymentResult.netPaid ?? 0),
                        verifiedTotal: Number(paymentResult.verifiedTotal ?? 0),
                        canDeliver: Boolean(paymentResult.canDeliver),
                    });
                } else {
                    setIndependentPaymentMessage(
                        paymentResult?.message || "Pedido confirmado. Actualiza para consultar el saldo y registrar el pago."
                    );
                }
            }

            if (request.tableSessionId) {
                await loadTables();

                try {
                    const accountResponse = await fetch(
                        `/api/waiters/account?sessionId=${encodeURIComponent(request.tableSessionId)}`,
                        { cache: "no-store" }
                    );
                    const accountResult = await accountResponse.json();

                    if (!accountResponse.ok || !accountResult?.success) {
                        throw new Error(
                            accountResult?.message || "No fue posible actualizar la cuenta."
                        );
                    }

                    setAccount(accountResult.account);
                } catch {
                    setPaymentMessage(
                        "La orden fue confirmada. Actualiza la cuenta para consultar los nuevos totales."
                    );
                }
            }
        } catch (error) {
            setOrderMessage(
                error instanceof Error
                    ? error.message
                    : "No fue posible confirmar el pedido. Conservamos la solicitud para reintentar."
            );
        } finally {
            setSubmitting(false);
        }
    }

    const categories = useMemo(
        () => data.categories.filter(category => category.isActive),
        [data.categories]
    );

    function isProductVisibleToday(product: Product): boolean {
        if (product.restrictPurchaseHours) return true;

        const weekday = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Bogota",
            weekday: "short",
        }).format(new Date());

        const dayMap: Record<string, number> = {
            Sun: 0, Mon: 1, Tue: 2, Wed: 3,
            Thu: 4, Fri: 5, Sat: 6,
        };

        const today = dayMap[weekday];
        const availableDays = product.availableDays ?? [];

        if (availableDays.length === 0) return true;
        if (!availableDays.includes(today)) return false;

        const availableHours = product.availableHours ?? [];
        if (availableHours.length === 0) return true;

        const todayHours = availableHours.find(
            hour => hour.dayOfWeek === today
        );

        if (!todayHours) return true;

        const now = new Intl.DateTimeFormat("en-GB", {
            timeZone: "America/Bogota",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).format(new Date());

        const currentTime = now === "24:00" ? "00:00" : now;

        return (
            currentTime >= todayHours.startTime.slice(0, 5) &&
            currentTime < todayHours.endTime.slice(0, 5)
        );
    }

    const filteredProducts = useMemo(() => {
        const term = search
            .normalize("NFD")
            .replace(/[\\u0300-\\u036f]/g, "")
            .toLowerCase()
            .trim();

        return data.products.filter(product => {
            if (!product.isAvailable || !isProductVisibleToday(product)) {
                return false;
            }

            const matchesCategory =
                selectedCategory === "all" ||
                product.categoryId === selectedCategory;

            const name = product.name
                .normalize("NFD")
                .replace(/[\\u0300-\\u036f]/g, "")
                .toLowerCase();

            const description = (product.description ?? "")
                .normalize("NFD")
                .replace(/[\\u0300-\\u036f]/g, "")
                .toLowerCase();

            const matchesSearch =
                !term || name.includes(term) || description.includes(term);

            return matchesCategory && matchesSearch;
        });
    }, [data.products, selectedCategory, search]);

    function startNewOrder(type: "dine_in" | "takeaway") {
        if (submitting || pendingOrder || !selectedTableId) return;

        if (items.length > 0) {
            setOrderMessage("Termina o elimina los productos del pedido actual antes de iniciar otra orden.");
            return;
        }

        setOrderType(type);
        setConfirmedOrder("");
        setOrderMessage(
            type === "dine_in"
                ? `Nueva orden en ${selectedTable?.label || `Mesa ${selectedTable?.table_number}`}. Se conserva la cuenta abierta.`
                : `Nueva orden para llevar vinculada a ${selectedTable?.label || `Mesa ${selectedTable?.table_number}`}. Se conserva la cuenta abierta.`
        );
        setSearch("");
        setOrderPanelOpen(false);
        setWorkflowStep("catalog");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function addSelection(selection: ProductSelection) {
        if (!recoveryReady || recoveryBlocked || pendingOrder) return;

        if (
            selection.product.restrictPurchaseHours &&
            !isProductPurchaseAllowed(selection.product)
        ) {
            window.alert(
                getProductPurchaseScheduleMessage(selection.product)
            );
            return;
        }

        setItems(current => [...current, selection]);
    }

    function removeSelection(index: number) {
        if (!recoveryReady || recoveryBlocked || pendingOrder) return;

        setItems(current => current.filter((_, itemIndex) => itemIndex !== index));
    }

    function updateQuantity(index: number, quantity: number) {
        if (!recoveryReady || recoveryBlocked || pendingOrder) return;
        if (quantity < 1 || quantity > 99) return;

        setItems(current => current.map((item, itemIndex) => {
            if (itemIndex !== index) return item;

            return {
                ...item,
                quantity,
                ...(item.dailyMenu
                    ? {
                        dailyMenu: {
                            ...item.dailyMenu,
                            quantity,
                        },
                    }
                    : {}),
            };
        }));
    }

    function getUnitPrice(item: ProductSelection): number {
        if (item.dailyMenu) {
            return Number(item.dailyMenu.size.price) || 0;
        }

        const basePrice = Number(
            item.variant?.price ?? item.product.price
        ) || 0;

        const extrasPrice = item.extras.reduce(
            (total, extra) => total + (Number(extra.price) || 0),
            0
        );

        return basePrice + extrasPrice;
    }

    function formatPrice(value: number): string {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(Number(value) || 0);
    }

    const orderTotal = items.reduce(
        (total, item) => total + getUnitPrice(item) * item.quantity,
        0
    );

    const selectedTable = tables.find(table => table.id === selectedTableId);
    const selectedSession = selectedTable?.currentSession ?? null;

    useEffect(() => {
        let active = true;

        if (!selectedSession?.id || !selectedSession.isMine) {
            queueMicrotask(() => {
                if (active) setPaymentMessage("");
            });
            return () => {
                active = false;
            };
        }

        queueMicrotask(() => {
            if (active) {
                setLoadingAccount(true);
                setPaymentMessage("");
            }
        });

        const refreshAccount = async (showLoading = false) => {
            if (showLoading && active) setLoadingAccount(true);

            try {
                const response = await fetch(
                    `/api/waiters/account?sessionId=${encodeURIComponent(selectedSession.id)}`,
                    { cache: "no-store" }
                );
                const result = await response.json().catch(() => null);

                if (!response.ok || !result?.success) {
                    throw new Error(result?.message || "No fue posible consultar la cuenta.");
                }

                if (active) setAccount(result.account);
            } catch (error) {
                if (active && showLoading) {
                    setPaymentMessage(
                        error instanceof Error ? error.message : "Error consultando la cuenta."
                    );
                }
            } finally {
                if (active && showLoading) setLoadingAccount(false);
            }
        };

        void refreshAccount(true);

        const interval = window.setInterval(() => {
            void refreshAccount(false);
        }, 15000);

        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [selectedSession?.id, selectedSession?.isMine]);

    return (
        <main className="min-h-screen bg-gray-100">
            <header className="bg-white px-4 py-5 shadow-sm">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {data.restaurant.name}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Mesero: {waiterName}
                        </p>
                    </div>
                    <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                        {workflowStep !== "tables" && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (pendingOrder || items.length > 0) {
                                        alert("Primero confirma o termina el pedido actual para cambiar de mesa.");
                                        return;
                                    }
                                    setWorkflowStep("tables");
                                }}
                                className="flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-xl bg-[#FF6900] px-5 py-3 text-base font-extrabold tracking-wide text-white shadow-lg transition hover:bg-[#E85F00] active:scale-95 sm:w-auto"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <span aria-hidden="true">▦</span>
                                    CAMBIAR DE MESA
                                    <span aria-hidden="true">→</span>
                                </span>
                            </button>
                        )}
                        <div className="self-end rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 sm:self-auto">
                            Modo mesero
                        </div>
                    </div>
                </div>
            </header>

            {workflowStep === "tables" && (
                <section className="mx-auto max-w-5xl space-y-5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Mis mesas</h2>
                            <p className="text-sm text-gray-600">
                                Selecciona una mesa para iniciar o continuar el servicio.
                            </p>
                        </div>
                        <button type="button" onClick={loadTables}
                            disabled={loadingTables}
                            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50">
                            {loadingTables ? "Actualizando..." : "Actualizar"}
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                        {tables.map(table => {
                            const session = table.currentSession;
                            const mine = Boolean(session?.isMine);
                            const occupied = Boolean(session && !mine);
                            return (
                                <button key={table.id} type="button"
                                    disabled={occupied}
                                    onClick={() => {
                                        setSelectedTableId(table.id);
                                        setOrderType("dine_in");
                                        setWorkflowStep("service");
                                    }}
                                    className={`min-h-20 rounded-lg border p-2 text-center shadow-sm transition ${
                                        occupied
                                            ? "cursor-not-allowed border-red-200 bg-red-50 text-red-800"
                                            : mine
                                                ? "border-blue-300 bg-blue-50 text-blue-900"
                                                : "border-green-300 bg-green-50 text-green-900"
                                    }`}>
                                    <span className="block truncate text-sm font-bold sm:text-base">
                                        {table.label || `Mesa ${table.table_number}`}
                                    </span>
                                    <span className="mt-1 block text-[10px] font-medium leading-tight sm:text-xs">
                                        {occupied ? "Ocupada · otro mesero" : mine ? "Mi cuenta abierta" : "Disponible"}
                                    </span>
                                    {mine && (
                                        <span className="mt-1 block truncate text-[10px]">
                                            {formatPrice(session!.combinedTotal)}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {tables.length === 0 && !loadingTables && (
                        <p className="rounded-xl bg-white p-6 text-center text-gray-600">
                            No hay mesas disponibles. Puedes agregar una mesa temporal.
                        </p>
                    )}

                                        <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs text-gray-500">
                            {existingTables} de 200 registros técnicos
                        </span>
                            <button type="button"
                                onClick={() => {
                                    setSelectedTableId("");
                                    setCustomerName("");
                                    setOrderType("takeaway");
                                    setWorkflowStep("catalog");
                                }}
                                className="rounded-lg border border-[#FF6900] px-4 py-2 text-sm font-semibold text-[#FF6900]">
                                Pedido independiente para llevar
                            </button>
                        </div>
            <div className="mt-4">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <button
                        type="button"
                        onClick={() => setIndependentOrdersOpen(open => !open)}
                        aria-expanded={independentOrdersOpen}
                        className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-gray-50"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-xl">
                                🛍️
                            </span>
                            <h2 className="font-bold text-gray-900">
                                VER PEDIDOS INDEPENDIENTES
                            </h2>
                        </div>

                        <span className="text-lg text-gray-500">
                            {independentOrdersOpen ? "▲" : "▼"}
                        </span>
                    </button>

                    {independentOrdersOpen && (
                        <div className="space-y-3 border-t border-gray-200 bg-gray-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm text-gray-600">
                                    Historial de tus pedidos independientes.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => void loadIndependentOrders()}
                                    disabled={loadingIndependentOrders}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50"
                                >
                                    {loadingIndependentOrders ? "Actualizando..." : "↻ Actualizar"}
                                </button>
                            </div>

                            {independentOrdersMessage && (
                                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {independentOrdersMessage}
                                </p>
                            )}

                            {independentOrders.length === 0 && !loadingIndependentOrders ? (
                                <div className="rounded-lg bg-white p-6 text-center">
                                    <p className="font-semibold text-gray-700">
                                        No tienes pedidos independientes registrados.
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Los pedidos para llevar aparecerán aquí.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {independentOrders.map(order => (
                                        <details
                                            key={order.id}
                                            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                                        >
                                            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4">
                                                <div>
                                                    <p className="font-bold text-gray-900">
                                                        Pedido #{order.order_number ?? "—"}
                                                    </p>
                                                    {order.customer_name && (
                                                        <p className="text-sm font-medium text-orange-700">
                                                            Cliente: {order.customer_name}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(order.created_at).toLocaleString("es-CO")}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                        {order.status}
                                                    </span>
                                                    <span className="font-bold text-gray-900">
                                                        {formatPrice(Number(order.total))}
                                                    </span>
                                                </div>
                                            </summary>

                                            <div className="space-y-4 border-t border-gray-100 p-4">
                                                <div>
                                                    <h4 className="mb-2 text-sm font-bold text-gray-800">
                                                        Productos
                                                    </h4>
                                                    {(order.items ?? []).length === 0 ? (
                                                        <p className="text-sm text-gray-500">
                                                            Sin detalle de productos.
                                                        </p>
                                                    ) : (
                                                        <ul className="space-y-2">
                                                            {(order.items ?? []).map((item, index) => (
                                                                <li
                                                                    key={index}
                                                                    className="flex justify-between gap-3 text-sm"
                                                                >
                                                                    <span className="text-gray-700">
                                                                        {Number(item.quantity ?? item.qty ?? 1)} × {" "}
                                                                        {String(item.name ?? item.product_name ?? item.title ?? item.product?.name ?? "Producto")}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {order.notes && (
                                                        <p className="mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
                                                            Nota: {order.notes}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                                    <div className="rounded-lg bg-gray-50 p-3">
                                                        <p className="text-xs text-gray-500">Total</p>
                                                        <p className="font-bold">{formatPrice(Number(order.total))}</p>
                                                    </div>
                                                    <div className="rounded-lg bg-gray-50 p-3">
                                                        <p className="text-xs text-gray-500">Pagado neto</p>
                                                        <p className="font-bold">{formatPrice(order.netPaid)}</p>
                                                    </div>
                                                    <div className="rounded-lg bg-gray-50 p-3">
                                                        <p className="text-xs text-gray-500">Saldo pendiente</p>
                                                        <p className="font-bold">{formatPrice(order.balanceDue)}</p>
                                                    </div>
                                                    <div className="rounded-lg bg-gray-50 p-3">
                                                        <p className="text-xs text-gray-500">Verificado</p>
                                                        <p className="font-bold">{formatPrice(order.verifiedTotal)}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="mb-2 text-sm font-bold text-gray-800">
                                                        Pagos y verificaciones de Caja
                                                    </h4>
                                                    {(order.payments ?? []).length === 0 ? (
                                                        <p className="text-sm text-gray-500">
                                                            Todavía no hay transacciones.
                                                        </p>
                                                    ) : (
                                                        <ul className="space-y-2">
                                                            {order.payments.map(payment => (
                                                                <li key={payment.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                                                                    <div className="flex justify-between gap-2">
                                                                        <span className="font-medium text-gray-700">
                                                                            {payment.transaction_type === "reversal" ? "Reverso" : "Pago"} · {payment.payment_method === "cash" ? "Efectivo" : payment.payment_method === "transfer" ? "Transferencia" : "—"}
                                                                        </span>
                                                                        <span className="font-bold">
                                                                            {payment.transaction_type === "reversal" ? "−" : "+"}
                                                                            {formatPrice(Number(payment.amount))}
                                                                        </span>
                                                                    </div>
                                                                    {payment.reference && (
                                                                        <p className="text-xs text-gray-500">
                                                                            Referencia: {payment.reference}
                                                                        </p>
                                                                    )}
                                                                    <p className="mt-1 text-xs text-gray-600">
                                                                        {payment.verification
                                                                            ? `Verificado por Caja: ${formatPrice(Number(payment.verification.verified_amount))}`
                                                                            : "Pendiente de verificación por Caja"}
                                                                    </p>
                                                                    {payment.verification?.notes && (
                                                                        <p className="text-xs text-gray-500">
                                                                            {payment.verification.notes}
                                                                        </p>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>

                                                <div>
                                                    <h4 className="mb-2 text-sm font-bold text-gray-800">
                                                        Estado de impresión
                                                    </h4>
                                                    {(order.printJobs ?? []).length === 0 ? (
                                                        <p className="text-sm text-gray-500">
                                                            No hay trabajos de impresión registrados.
                                                        </p>
                                                    ) : (
                                                        <ul className="space-y-2">
                                                            {order.printJobs.map(job => (
                                                                <li key={job.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                                                                    <p className={`font-medium ${
                                                                        job.status === "failed" ? "text-red-700" :
                                                                        job.status === "printed" ? "text-green-700" :
                                                                        "text-gray-800"
                                                                    }`}>
                                                                        {job.destination === "kitchen" ? "Cocina" : job.destination === "cashier" ? "Caja" : job.destination}: {{
                                                                            queued: "En cola",
                                                                            processing: "Enviando a impresora",
                                                                            submitted: "Enviado a impresora, esperando resultado",
                                                                            printed: "Impresión exitosa",
                                                                            failed: "IMPRESIÓN FALLIDA",
                                                                            cancelled: "Cancelado",
                                                                        }[job.status] ?? "IMPRESIÓN PENDIENTE"}
                                                                    </p>
                                                                    {job.status === "failed" && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => void retryPrintJob(order.id, job.id)}
                                                                            disabled={retryingPrintJobId !== null}
                                                                            className="mt-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                                                        >
                                                                            {retryingPrintJobId === job.id ? "Solicitando..." : "Reimprimir"}
                                                                        </button>
                                                                    )}
                                                                    {job.printed_at && (
                                                                        <p className="text-xs text-gray-500">
                                                                            Impresión completada: {new Date(job.printed_at).toLocaleString("es-CO")}
                                                                        </p>
                                                                    )}
                                                                    {job.last_error && (
                                                                        <p className="text-xs text-red-600">
                                                                            {job.last_error}
                                                                        </p>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>

                                                <div className={`rounded-lg p-3 text-sm font-bold ${
                                                    order.canDeliver
                                                        ? "bg-green-50 text-green-800"
                                                        : "bg-amber-50 text-amber-800"
                                                }`}>
                                                    {order.canDeliver
                                                        ? "✓ PEDIDO AUTORIZADO PARA ENTREGA"
                                                        : "Pedido pendiente: requiere confirmación, pago e impresión completada."}
                                                </div>
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={addTable}
                                disabled={addingTable || existingTables >= 200}
                                className="rounded-lg bg-[#FF6900] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                {addingTable ? "Agregando..." : existingTables >= 200 ? "Límite alcanzado" : "+ Agregar mesa temporal"}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {workflowStep === "service" && (
                <section className="mx-auto max-w-xl space-y-5 p-4">
                    <button type="button" onClick={() => setWorkflowStep("tables")}
                        className="text-sm font-semibold text-blue-700">
                        ← Volver a mis mesas
                    </button>
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900">
                            {selectedTable?.label || "Mesa seleccionada"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Selecciona el tipo de servicio.
                        </p>
                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <button type="button"
                                onClick={() => {
                                    setOrderType("dine_in");
                                    setWorkflowStep("catalog");
                                }}
                                className="min-h-24 rounded-xl border-2 border-orange-300 bg-orange-50 p-4 text-left font-bold text-orange-900">
                                En mesa
                                <span className="mt-1 block text-sm font-normal">Agregar productos a la cuenta</span>
                            </button>
                            <button type="button"
                                onClick={() => {
                                    setOrderType("takeaway");
                                    setWorkflowStep("catalog");
                                }}
                                className="min-h-24 rounded-xl border-2 border-orange-300 bg-orange-50 p-4 text-left font-bold text-orange-900">
                                Para llevar
                                <span className="mt-1 block text-sm font-normal">Vincular el pedido a esta mesa</span>
                            </button>
                        </div>
                        {selectedTable?.currentSession?.isMine && (
                            <button type="button"
                                onClick={() => {
                                    setOrderType("dine_in");
                                    setWorkflowStep("catalog");
                                }}
                                className="mt-3 w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white">
                                Ver cuenta y registrar pagos
                            </button>
                        )}
                    </div>
                </section>
            )}

            {workflowStep === "catalog" && (
            <div className="mx-auto grid max-w-6xl gap-6 p-4 pb-28 lg:grid-cols-[1fr_320px] lg:pb-4">
                <section className="order-last min-w-0 lg:order-none">
                    <section className="sticky top-0 z-40 bg-white/95 shadow-sm backdrop-blur-md">
                        <Categories
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    </section>

                    <section className="mx-auto max-w-2xl px-5 py-2">
                        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
                            <div className="mb-3 text-center">
                                <h2 className="text-lg font-bold text-orange-700">
                                    🔎 ¿Qué estás buscando?
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Busca cualquier producto del menú.
                                </p>
                            </div>

                            <label htmlFor="waiter-menu-search" className="sr-only">
                                Buscar productos
                            </label>
                            <input
                                id="waiter-menu-search"
                                type="search"
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                placeholder="Buscar productos..."
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            />
                        </div>
                    </section>

                    <ProductGrid
                        products={filteredProducts}
                        selectedCategory={selectedCategory}
                        searchActive={Boolean(search.trim())}
                        dailyMenu={data.dailyMenu}
                        onSelectionAdd={addSelection}
                    />
                </section>

                <aside className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-gray-200 bg-white p-3 shadow-2xl lg:static lg:order-none lg:h-fit lg:rounded-xl lg:p-5 lg:shadow-sm lg:sticky lg:top-4">
                    <button
                        type="button"
                        onClick={() => setOrderPanelOpen(open => !open)}
                        aria-expanded={orderPanelOpen}
                        className="flex w-full items-center justify-between gap-3 text-left"
                    >
                        <span>
                            <span className="block text-base font-bold">Pedido actual</span>
                            <span className="text-xs text-gray-500">
                                {items.reduce((total, item) => total + item.quantity, 0)} artículos ·
                                {items.length === 0 ? " Sin productos" : ` ${formatPrice(items.reduce((total, item) => total + getUnitPrice(item) * item.quantity, 0))}`}
                            </span>
                        </span>
                        <span className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
                            {orderPanelOpen ? "Cerrar ▲" : "Ver pedido ▼"}
                        </span>
                    </button>

                    {orderType === "takeaway" && !selectedTableId && (
                        <div className="mt-3">
                            <label htmlFor="independent-customer-name" className="mb-1 block text-sm font-semibold text-gray-800">Nombre del cliente *</label>
                            <input
                                id="independent-customer-name"
                                type="text"
                                maxLength={80}
                                required
                                value={customerName}
                                onChange={event => setCustomerName(event.target.value)}
                                disabled={Boolean(pendingOrder) || submitting}
                                placeholder="Nombre de quien recoge el pedido"
                                className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            />
                        </div>
                    )}

                    {items.length > 0 && (
                        <button
                            type="button"
                            onClick={submitOrder}
                            disabled={!recoveryReady || recoveryBlocked || submitting}
                            className="mt-3 w-full rounded-xl bg-[#FF6900] px-4 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#E85F00] disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
                        >
                            {!recoveryReady
                                ? "Recuperando pedido..."
                                : submitting
                                    ? "Enviando a cocina..."
                                    : pendingOrder
                                        ? "Reintentar confirmación"
                                        : "✓ CONFIRMAR E IMPRIMIR ORDEN"}
                        </button>
                    )}

                    <div className={`${orderPanelOpen ? "block" : "hidden"} mt-3 max-h-[70vh] space-y-4 overflow-y-auto overscroll-contain pb-2 lg:block lg:max-h-none lg:overflow-visible`}>

                    {items.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-500">
                            Selecciona productos del menú para preparar el pedido.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {items.map((item, index) => (
                                <li
                                    key={`${item.product.id}-${index}`}
                                    className="border-b border-gray-100 pb-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900">
                                                {item.product.name}
                                            </p>
                                            {item.variant && (
                                                <p className="text-xs text-gray-500">
                                                    Presentación: {item.variant.label}
                                                </p>
                                            )}
                                            {item.dailyMenu && (
                                                <div className="text-xs text-gray-500">
                                                    <p>{item.dailyMenu.size.label}</p>
                                                    {item.dailyMenu.soup && <p>Sopa: {item.dailyMenu.soup.name}</p>}
                                                    {item.dailyMenu.secos.length > 0 && <p>Secos: {item.dailyMenu.secos.map(option => option.name).join(", ")}</p>}
                                                    {item.dailyMenu.principle && <p>Principio: {item.dailyMenu.principle.name}</p>}
                                                    {item.dailyMenu.protein && <p>Proteína: {item.dailyMenu.protein.name}</p>}
                                                    {item.dailyMenu.drink && <p>Bebida: {item.dailyMenu.drink.name}</p>}
                                                    {item.dailyMenu.dessert && <p>Postre: {item.dailyMenu.dessert.name}</p>}
                                                </div>
                                            )}
                                            {item.ingredients.length > 0 && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Ingredientes: {item.ingredients.map(value => value.name).join(", ")}
                                                </p>
                                            )}
                                            {item.extras.length > 0 && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    {item.extras.map(extra => (
                                                        <p key={extra.id}>
                                                            + {extra.name} ({formatPrice(extra.price)})
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                            {(item.notes || item.dailyMenu?.notes) && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Nota: {item.notes || item.dailyMenu?.notes}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSelection(index)}
                                            className="shrink-0 text-sm font-medium text-red-600 hover:text-red-800"
                                            aria-label={`Quitar ${item.product.name}`}
                                        >
                                            Quitar
                                        </button>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || !recoveryReady || recoveryBlocked || Boolean(pendingOrder)}
                                                className="h-8 w-8 rounded-lg border border-gray-300 disabled:opacity-40"
                                                aria-label={`Disminuir cantidad de ${item.product.name}`}
                                            >
                                                −
                                            </button>
                                            <span className="min-w-5 text-center text-sm font-semibold">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                                disabled={item.quantity >= 99 || !recoveryReady || recoveryBlocked || Boolean(pendingOrder)}
                                                className="h-8 w-8 rounded-lg border border-gray-300 disabled:opacity-40"
                                                aria-label={`Aumentar cantidad de ${item.product.name}`}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            {formatPrice(getUnitPrice(item) * item.quantity)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {items.length > 0 && (
                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                            <span className="font-semibold text-gray-700">Total del pedido</span>
                            <span className="text-xl font-bold text-gray-900">
                                {formatPrice(orderTotal)}
                            </span>
                        </div>
                    )}

                    <div className="mt-5 space-y-3 border-t border-gray-200 pt-4">
                        <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-medium text-gray-500">MESA Y SERVICIO VINCULADOS</p>
                            <p className="mt-1 font-semibold text-gray-900">
                                {selectedTable
                                    ? (selectedTable.label || `Mesa ${selectedTable.table_number}`)
                                    : "Pedido independiente"}
                                {" · "}
                                {orderType === "dine_in" ? "En mesa" : "Para llevar"}
                            </p>
                        </div>

                        {selectedSession?.isMine && (
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    type="button"
                                    onClick={() => startNewOrder("dine_in")}
                                    className="w-full rounded-lg bg-[#FF6900] px-3 py-3 text-sm font-semibold text-white"
                                >
                                    + Pedir más para esta mesa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => startNewOrder("takeaway")}
                                    className="w-full rounded-lg border border-orange-300 bg-orange-50 px-3 py-3 text-sm font-semibold text-orange-800"
                                >
                                    + Agregar pedido para llevar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById("waiter-session-account")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm font-semibold text-gray-800"
                                >
                                    Consultar cuenta y pagos
                                </button>
                            </div>
                        )}
                    </div>

                    {selectedSession?.isMine && (
                            <div id="waiter-session-account" className="space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
                                <div>
                                    <p className="mb-2 text-sm font-semibold text-blue-900">
                                        Consumo de {selectedTable?.label || `Mesa ${selectedTable?.table_number}`}
                                    </p>
                                    <div className="space-y-1 text-sm text-gray-700">
                                        <div className="flex justify-between gap-3">
                                            <span>Consumo en mesa</span>
                                            <span className="font-medium">
                                                {formatPrice(selectedSession.tableConsumptionSubtotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-3">
                                            <span>Pedidos para llevar</span>
                                            <span className="font-medium">
                                                {formatPrice(selectedSession.takeawaySubtotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-3 border-t border-blue-200 pt-2 font-bold text-blue-900">
                                            <span>Total combinado</span>
                                            <span>{formatPrice(selectedSession.combinedTotal)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t border-blue-200 pt-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="font-semibold text-gray-900">Cobro de la cuenta</h3>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const id = selectedSession.id;
                                                fetch(`/api/waiters/account?sessionId=${encodeURIComponent(id)}`, {
                                                    cache: "no-store",
                                                })
                                                    .then(async response => {
                                                        const result = await response.json().catch(() => null);
                                                        if (!response.ok || !result?.success) {
                                                            throw new Error(result?.message || "No se pudo actualizar la cuenta.");
                                                        }
                                                        setAccount(result.account);
                                                        setPaymentMessage("Cuenta actualizada.");
                                                    })
                                                    .catch(error => setPaymentMessage(
                                                        error instanceof Error ? error.message : "Error actualizando la cuenta."
                                                    ));
                                            }}
                                            disabled={loadingAccount || paymentSubmitting || closingSession}
                                            className="text-xs font-semibold text-blue-800 disabled:opacity-50"
                                        >
                                            Actualizar cuenta
                                        </button>
                                    </div>

                                    {loadingAccount && (
                                        <p className="text-sm text-gray-600">Consultando saldo e historial...</p>
                                    )}

                                    {account && account.sessionId === selectedSession.id && (
                                        <>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="rounded-lg bg-white p-2">
                                                    <p className="text-gray-500">Total de la cuenta</p>
                                                    <p className="font-semibold">{formatPrice(account.grossTotal)}</p>
                                                </div>
                                                <div className="rounded-lg bg-white p-2">
                                                    <p className="text-gray-500">Pagado neto</p>
                                                    <p className="font-semibold">{formatPrice(account.netPaidTotal)}</p>
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-blue-200 bg-white p-3">
                                                <p className="text-sm text-gray-600">Saldo pendiente</p>
                                                <p className="text-2xl font-bold text-blue-900">
                                                    {formatPrice(account.balanceDue)}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setProductsExpanded(value => !value)}
                                                className="w-full rounded-lg bg-[#FF6900] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-700"
                                            >
                                                {productsExpanded ? "OCULTAR PRODUCTOS" : "VER DETALLE PRODUCTOS"}
                                            </button>

                                            {productsExpanded && (
                                                <div className="space-y-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
                                                    <h4 className="font-bold text-orange-900">Productos de esta cuenta</h4>
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
                                                                return (
                                                                    <div key={`${order.id}-${index}`} className="border-b border-gray-100 py-2 last:border-0">
                                                                        <p className="font-semibold text-gray-900">
                                                                            {item.quantity ?? daily.quantity ?? 1} × {product.name ?? "Producto"}
                                                                        </p>
                                                                        {daily.size?.label && <p className="text-sm text-gray-600">Tamaño: {daily.size.label}</p>}
                                                                        {daily.soup?.name && <p className="text-sm text-gray-600">Sopa: {daily.soup.name}</p>}
                                                                        {daily.secos?.length > 0 && <p className="text-sm text-gray-600">Secos: {daily.secos.map((x: any) => x.name).join(", ")}</p>}
                                                                        {daily.principle?.name && <p className="text-sm text-gray-600">Principio: {daily.principle.name}</p>}
                                                                        {daily.protein?.name && <p className="text-sm text-gray-600">Proteína: {daily.protein.name}</p>}
                                                                        {daily.drink?.name && <p className="text-sm text-gray-600">Bebida: {daily.drink.name}</p>}
                                                                        {daily.dessert?.name && <p className="text-sm text-gray-600">Postre: {daily.dessert.name}</p>}
                                                                        {item.variant?.label && <p className="text-sm text-gray-600">Variante: {item.variant.label}</p>}
                                                                        {item.ingredients?.length > 0 && <p className="text-sm text-gray-600">Ingredientes: {item.ingredients.map((x: any) => x.name).join(", ")}</p>}
                                                                        {item.extras?.length > 0 && <p className="text-sm text-gray-600">Extras: {item.extras.map((x: any) => x.name).join(", ")}</p>}
                                                                        {(item.notes || daily.notes) && <p className="text-sm text-gray-600">Nota: {item.notes || daily.notes}</p>}
                                                                    </div>
                                                                );
                                                            })}
                                                            {order.notes && <p className="text-sm text-blue-800">Observaciones: {order.notes}</p>}
                                                            <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
                                                                <p className="text-sm font-bold text-blue-900">Estado de impresión</p>
                                                                {(order.printJobs ?? []).length === 0 ? (
                                                                    <p className="text-sm text-gray-600">No hay trabajos de impresión registrados.</p>
                                                                ) : order.printJobs.map(job => {
                                                                    const destination = job.destination === "kitchen" ? "Cocina" : job.destination === "cashier" ? "Caja" : job.destination;
                                                                    const statusLabels: Record<string, string> = {
                                                                        queued: "En cola",
                                                                        processing: "Enviando a impresora",
                                                                        submitted: "Enviado a impresora, esperando resultado",
                                                                        printed: "Impresión exitosa",
                                                                        failed: "Impresión fallida",
                                                                        cancelled: "Cancelado",
                                                                    };
                                                                    const failed = job.status === "failed";
                                                                    const completed = job.status === "printed";
                                                                    return (
                                                                        <div key={job.id} className="rounded-md bg-white p-2 text-sm">
                                                                            <p className={`font-semibold ${failed ? "text-red-700" : completed ? "text-green-700" : "text-gray-800"}`}>
                                                                                {destination}: {statusLabels[job.status] ?? "Estado desconocido"}
                                                                            </p>
                                                                            {failed && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => void retryPrintJob(order.id, job.id)}
                                                                                    disabled={retryingPrintJobId !== null}
                                                                                    className="mt-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                                                                >
                                                                                    {retryingPrintJobId === job.id ? "Solicitando..." : "Reimprimir"}
                                                                                </button>
                                                                            )}
                                                                            {job.printed_at && (
                                                                                <p className="text-xs text-gray-500">
                                                                                    Impresión completada: {new Date(job.printed_at).toLocaleString("es-CO")}
                                                                                </p>
                                                                            )}
                                                                            {job.last_error && (
                                                                                <p className="text-xs text-red-600">{job.last_error}</p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            <p className="text-right font-bold">{formatPrice(Number(order.total ?? 0))}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {(account.balanceDue > 0 || pendingPayment?.sessionId === selectedSession.id) && (
                                                <div className="space-y-2 rounded-lg bg-white p-3">
                                                    <label htmlFor="waiter-payment-amount" className="block text-sm font-medium text-gray-700">
                                                        Importe a recibir (pesos enteros)
                                                    </label>
                                                    <input
                                                        id="waiter-payment-amount"
                                                        type="number"
                                                        min="1"
                                                        max={account.balanceDue}
                                                        step="1"
                                                        inputMode="numeric"
                                                        value={paymentAmount}
                                                        onChange={event => setPaymentAmount(event.target.value)}
                                                        disabled={Boolean(pendingPayment) || paymentSubmitting}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                                        placeholder="Ej. 25000"
                                                    />

                                                    <label htmlFor="waiter-payment-method" className="block text-sm font-medium text-gray-700">
                                                        Medio de pago
                                                    </label>
                                                    <select
                                                        id="waiter-payment-method"
                                                        value={paymentMethod}
                                                        onChange={event => setPaymentMethod(event.target.value as "cash" | "transfer")}
                                                        disabled={Boolean(pendingPayment) || paymentSubmitting}
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                                                    >
                                                        <option value="cash">Efectivo</option>
                                                        <option value="transfer">Transferencia</option>
                                                    </select>

                                                    {paymentMethod === "transfer" && (
                                                        <>
                                                            <label htmlFor="waiter-payment-reference" className="block text-sm font-medium text-gray-700">
                                                                Referencia de transferencia (opcional)
                                                            </label>
                                                            <input
                                                                id="waiter-payment-reference"
                                                                type="text"
                                                                maxLength={120}
                                                                value={paymentReference}
                                                                onChange={event => setPaymentReference(event.target.value)}
                                                                disabled={Boolean(pendingPayment) || paymentSubmitting}
                                                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                                                placeholder="Número o referencia"
                                                            />
                                                        </>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={submitPayment}
                                                        disabled={paymentSubmitting || closingSession || (!pendingPayment && (!paymentAmount || Number(paymentAmount) <= 0))}
                                                        className="w-full rounded-lg bg-[#FF6900] px-3 py-3 text-sm font-semibold text-white disabled:opacity-50"
                                                    >
                                                        {paymentSubmitting
                                                            ? "Registrando pago..."
                                                            : pendingPayment
                                                                ? "Reintentar el mismo pago"
                                                                : "Registrar pago"}
                                                    </button>
                                                    <p className="text-xs text-gray-500">
                                                        Puedes registrar varios pagos para combinar efectivo y transferencia.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold text-gray-800">Historial de pagos</h4>
                                                {account.paymentHistory.length === 0 ? (
                                                    <p className="text-sm text-gray-500">Todavía no hay pagos registrados.</p>
                                                ) : (
                                                    <ul className="max-h-48 space-y-2 overflow-y-auto">
                                                        {account.paymentHistory.map(entry => (
                                                            <li key={entry.id} className="flex justify-between gap-3 rounded-lg bg-white p-2 text-sm">
                                                                <div className="min-w-0">
                                                                    <p className="font-medium text-gray-800">
                                                                        {entry.type === "reversal" ? "Reversión" : "Pago"} · {
                                                                            entry.method === "cash"
                                                                                ? "Efectivo"
                                                                                : entry.method === "transfer"
                                                                                    ? "Transferencia"
                                                                                    : "—"
                                                                        }
                                                                    </p>
                                                                    <p className="truncate text-xs text-gray-500">
                                                                        {entry.reason || entry.reference || new Date(entry.createdAt).toLocaleString("es-CO")}
                                                                    </p>
                                                                </div>
                                                                <span className="shrink-0 font-semibold">
                                                                    {entry.type === "reversal" ? "−" : "+"}{formatPrice(entry.amount)}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>

                                            {account.unresolvedPrintJobs > 0 && (
                                                <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
                                                    No se puede cerrar: hay {account.unresolvedPrintJobs} trabajos de impresión sin resolver.
                                                </p>
                                            )}

                                            <button
                                                type="button"
                                                onClick={closeSession}
                                                disabled={
                                                    closingSession ||
                                                    paymentSubmitting ||
                                                    Boolean(pendingPayment) ||
                                                    account.balanceDue !== 0 ||
                                                    account.unresolvedPrintJobs !== 0
                                                }
                                                className="w-full rounded-lg bg-gray-900 px-3 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                {closingSession ? "Cerrando cuenta..." : "Confirmar cierre y liberar mesa"}
                                            </button>
                                            <p className="text-xs text-gray-500">
                                                El servidor también verificará que no existan pedidos pendientes antes de cerrar.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {paymentMessage && (
                            <p role="status" className="rounded-lg border border-blue-200 bg-white p-3 text-sm text-blue-900">
                                {paymentMessage}
                            </p>
                        )}

                        {pendingOrder && (
                            <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                Hay una confirmación pendiente. El contenido del pedido está bloqueado para evitar duplicados o cambios. Usa «Reintentar confirmación» para consultar el mismo pedido.
                            </p>
                        )}
                        {orderMessage && (
                            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {orderMessage}
                            </p>
                        )}
                        {independentOrder && (
                            <section className="space-y-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                                <h3 className="font-semibold text-gray-900">
                                    Pedido para llevar #{independentOrder.orderNumber}
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-600">Total del pedido</p>
                                        <p className="font-bold">{formatPrice(independentOrder.total)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Abonos registrados</p>
                                        <p className="font-bold">{formatPrice(independentOrder.netPaid)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Saldo pendiente</p>
                                        <p className="font-bold">{formatPrice(independentOrder.balanceDue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Verificado por Caja</p>
                                        <p className="font-bold">{formatPrice(independentOrder.verifiedTotal)}</p>
                                    </div>
                                </div>

                                {independentOrder.canDeliver ? (
                                    <p className="rounded-lg bg-green-100 p-3 text-sm font-semibold text-green-900">
                                        Pago verificado por Caja. Puedes entregar el pedido al cliente.
                                    </p>
                                ) : (
                                    <p className="rounded-lg bg-amber-100 p-3 text-sm text-amber-900">
                                        {independentOrder.balanceDue > 0
                                            ? "Registra el pago pendiente. La entrega requiere saldo pagado y verificado por Caja."
                                            : "Pago registrado. La entrega queda pendiente de verificación por Caja."}
                                    </p>
                                )}

                                {independentOrder.balanceDue > 0 && (
                                    <div className="space-y-2 rounded-lg bg-white p-3">
                                        <label className="block text-sm font-medium" htmlFor="independent-payment-amount">
                                            Importe del abono (pesos enteros)
                                        </label>
                                        <input
                                            id="independent-payment-amount"
                                            type="number"
                                            min="1"
                                            max={independentOrder.balanceDue}
                                            step="1"
                                            inputMode="numeric"
                                            value={independentPaymentAmount}
                                            onChange={event => setIndependentPaymentAmount(event.target.value)}
                                            disabled={independentPaymentSubmitting}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                            placeholder="Ej. 25000"
                                        />
                                        <label className="block text-sm font-medium" htmlFor="independent-payment-method">
                                            Medio de pago
                                        </label>
                                        <select
                                            id="independent-payment-method"
                                            value={independentPaymentMethod}
                                            onChange={event => setIndependentPaymentMethod(event.target.value as "cash" | "transfer")}
                                            disabled={independentPaymentSubmitting}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                                        >
                                            <option value="cash">Efectivo</option>
                                            <option value="transfer">Transferencia</option>
                                        </select>
                                        {independentPaymentMethod === "transfer" && (
                                            <input
                                                type="text"
                                                maxLength={120}
                                                value={independentPaymentReference}
                                                onChange={event => setIndependentPaymentReference(event.target.value)}
                                                disabled={independentPaymentSubmitting}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                                placeholder="Referencia de transferencia (opcional)"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={submitIndependentPayment}
                                            disabled={independentPaymentSubmitting || !independentPaymentAmount || Number(independentPaymentAmount) <= 0}
                                            className="w-full rounded-lg bg-[#FF6900] px-3 py-3 text-sm font-semibold text-white disabled:opacity-50"
                                        >
                                            {independentPaymentSubmitting ? "Registrando abono..." : "Registrar abono"}
                                        </button>
                                    </div>
                                )}

                                {independentPaymentMessage && (
                                    <p role="status" className="rounded-lg bg-white p-3 text-sm text-gray-800">
                                        {independentPaymentMessage}
                                    </p>
                                )}
                            </section>
                        )}

                        {confirmedOrder && (
                            <p role="status" className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-800">
                                {confirmedOrder}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={submitOrder}
                            disabled={!recoveryReady || recoveryBlocked || items.length === 0 || submitting}
                            className="w-full rounded-xl bg-[#FF6900] px-4 py-3 font-semibold text-white hover:bg-[#E85F00] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {!recoveryReady
                                ? "Recuperando pedido..."
                                : submitting
                                    ? "Confirmando pedido..."
                                    : pendingOrder
                                        ? "Reintentar confirmación"
                                        : "Confirmar pedido"}
                        </button>
                        <p className="text-xs text-gray-500">
                            Al confirmar, el pedido se registra y sus comprobantes pasan a la cola de impresión.
                        </p>
                    </div>
                </aside>
            </div>
            )}
        </main>
    );
}

export default function WaiterMenu(props: WaiterMenuProps) {
    return (
        <CartProvider>
            <WaiterMenuContent {...props} />
        </CartProvider>
    );
}
