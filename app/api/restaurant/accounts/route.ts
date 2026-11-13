import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function getAdminContext() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return { error: "Debes iniciar sesión.", status: 401 as const };

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, restaurant_id")
        .eq("id", user.id)
        .maybeSingle();

    if (!profile || profile.role !== "restaurant_admin" || !profile.restaurant_id) {
        return { error: "No tienes permisos para administrar Caja.", status: 403 as const };
    }
    return { supabase, profile, restaurantId: profile.restaurant_id };
}

function validId(value: unknown): value is string {
    return typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function GET() {
    try {
        const context = await getAdminContext();
        if ("error" in context) {
            return NextResponse.json(
                { error: context.error },
                { status: context.status }
            );
        }

        const { data: journey, error: journeyError } = await supabaseAdmin
            .from("sales_journeys")
            .select("id, opened_at, opened_by_profile_id, status")
            .eq("restaurant_id", context.restaurantId)
            .eq("status", "open")
            .maybeSingle();

        if (journeyError) throw journeyError;

        const { data: sessions, error } = await supabaseAdmin
            .from("table_sessions")
            .select("id, restaurant_table_id, opened_by_waiter_id, opened_at, status")
            .eq("restaurant_id", context.restaurantId)
            .eq("status", "open")
            .order("opened_at", { ascending: true });

        if (error) throw error;

        const tableIds = [...new Set((sessions ?? []).map(s => s.restaurant_table_id))];
        const waiterIds = [...new Set((sessions ?? []).map(s => s.opened_by_waiter_id))];

        const [{ data: tables, error: tablesError }, { data: waiters, error: waitersError }] =
            await Promise.all([
                supabaseAdmin
                    .from("restaurant_tables")
                    .select("id, table_number, label")
                    .in("id", tableIds.length ? tableIds : ["00000000-0000-0000-0000-000000000000"]),
                supabaseAdmin
                    .from("waiter_accounts")
                    .select("id, profile_id")
                    .in("id", waiterIds.length ? waiterIds : ["00000000-0000-0000-0000-000000000000"])
            ]);

        if (tablesError) throw tablesError;
        if (waitersError) throw waitersError;

        const profileIds = [...new Set((waiters ?? []).map(w => w.profile_id))];
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name")
            .in("id", profileIds.length ? profileIds : ["00000000-0000-0000-0000-000000000000"]);

        if (profilesError) throw profilesError;

        const accounts = await Promise.all((sessions ?? []).map(async session => {
            const [{ data: summary, error: summaryError }, { data: closeRequest }, { data: verifications }, { data: orders, error: ordersError }] =
                await Promise.all([
                    supabaseAdmin.rpc("waiter_session_account_summary", {
                        p_session_id: session.id,
                        p_restaurant_id: context.restaurantId
                    }),
                    supabaseAdmin
                        .from("table_session_close_requests")
                        .select("*")
                        .eq("session_id", session.id)
                        .order("requested_at", { ascending: false })
                        .limit(1)
                        .maybeSingle(),
                    supabaseAdmin
                        .from("cashier_payment_verifications")
                        .select("transaction_id, verified_amount, verified_at")
                        .eq("session_id", session.id),
                    supabaseAdmin
                        .from("service_orders")
                        .select("id, order_number, order_type, status, items, subtotal, total, notes, created_at")
                        .eq("restaurant_id", context.restaurantId)
                        .eq("table_session_id", session.id)
                        .order("created_at", { ascending: true })
                ]);

            if (summaryError) throw summaryError;
            if (ordersError) throw ordersError;

            const waiter = (waiters ?? []).find(w => w.id === session.opened_by_waiter_id);
            const table = (tables ?? []).find(t => t.id === session.restaurant_table_id);
            const profile = (profiles ?? []).find(p => p.id === waiter?.profile_id);
            const verificationMap = new Map(
                (verifications ?? []).map(v => [v.transaction_id, v])
            );

            return {
                ...summary,
                sessionId: session.id,
                orders: orders ?? [],
                openedAt: session.opened_at,
                table,
                waiter: {
                    username: waiter?.id ?? "",
                    fullName: profile?.full_name ?? "Mesero"
                },
                closeRequest: closeRequest ? { ...closeRequest, reason: closeRequest.return_reason } : null,
                paymentHistory: (summary?.paymentHistory ?? []).map((payment: any) => ({
                    ...payment,
                    verification: verificationMap.get(payment.id) ?? null
                }))
            };
        }));

        let salesReport = null;

        if (journey) {
            const { data: journeyOrders, error: journeyOrdersError } = await supabaseAdmin
                .from("service_orders")
                .select("id, order_number, order_type, table_session_id, waiter_id, status, items, subtotal, total, notes, customer_name, created_at")
                .eq("restaurant_id", context.restaurantId)
                .eq("sales_journey_id", journey.id)
                .order("created_at", { ascending: true });

            if (journeyOrdersError) throw journeyOrdersError;

            const orders = journeyOrders ?? [];
            const orderIds = orders.map(o => o.id);
            const sessionIds = [...new Set(orders.map(o => o.table_session_id).filter(Boolean))];
            const reportWaiterIds = [...new Set(orders.map(o => o.waiter_id))];

            const [
                { data: paymentTransactions, error: paymentError },
                { data: independentVerifications, error: independentVerificationError },
                { data: tableVerifications, error: tableVerificationError },
                { data: tablePayments, error: tablePaymentError },
                { data: reportWaiters, error: reportWaiterError }
            ] = await Promise.all([
                orderIds.length
                    ? supabaseAdmin.from("independent_order_payment_transactions")
                        .select("id, order_id, transaction_type, payment_method, amount, related_transaction_id, created_at")
                        .in("order_id", orderIds)
                    : Promise.resolve({ data: [], error: null }),
                orderIds.length
                    ? supabaseAdmin.from("independent_order_payment_verifications")
                        .select("order_id, transaction_id, verified_amount, verified_at")
                        .in("order_id", orderIds)
                    : Promise.resolve({ data: [], error: null }),
                sessionIds.length
                    ? supabaseAdmin.from("cashier_payment_verifications")
                        .select("session_id, transaction_id, verified_amount, verified_at")
                        .in("session_id", sessionIds)
                    : Promise.resolve({ data: [], error: null }),
                sessionIds.length
                    ? supabaseAdmin.from("table_session_payment_transactions")
                        .select("id, session_id, transaction_type, payment_method, amount, related_transaction_id, created_at")
                        .in("session_id", sessionIds)
                    : Promise.resolve({ data: [], error: null }),
                reportWaiterIds.length
                    ? supabaseAdmin.from("waiter_accounts")
                        .select("id, profile_id")
                        .in("id", reportWaiterIds)
                    : Promise.resolve({ data: [], error: null })
            ]);

            if (paymentError) throw paymentError;
            if (independentVerificationError) throw independentVerificationError;
            if (tableVerificationError) throw tableVerificationError;
            if (tablePaymentError) throw tablePaymentError;
            if (reportWaiterError) throw reportWaiterError;

            const reportProfileIds = [...new Set((reportWaiters ?? []).map(w => w.profile_id))];
            const { data: reportProfiles, error: reportProfilesError } = await supabaseAdmin
                .from("profiles")
                .select("id, full_name")
                .in("id", reportProfileIds.length ? reportProfileIds : ["00000000-0000-0000-0000-000000000000"]);

            if (reportProfilesError) throw reportProfilesError;

            const waiterNames = new Map(
                (reportWaiters ?? []).map(w => [
                    w.id,
                    (reportProfiles ?? []).find(profile => profile.id === w.profile_id)?.full_name ?? "Mesero"
                ])
            );

            const confirmedOrders = orders.filter(o => o.status === "confirmed");
            const confirmedOrderIds = new Set(confirmedOrders.map(o => o.id));

            const confirmedSales = confirmedOrders.reduce(
                (sum, o) => sum + Number(o.total || 0), 0
            );

            const dineInOrders = confirmedOrders.filter(
                o => o.order_type === "dine_in"
            );

            const takeawayTableOrders = confirmedOrders.filter(
                o => o.order_type === "takeaway" && o.table_session_id !== null
            );

            const independentTakeawayOrders = confirmedOrders.filter(
                o => o.order_type === "takeaway" && o.table_session_id === null
            );

            const independentLedger = (paymentTransactions ?? []).filter(
                payment => confirmedOrderIds.has(payment.order_id)
            );

            const tableLedger = tablePayments ?? [];

            function summarizeLedger(transactions: any[], verifications: any[]) {
                const payments = transactions.filter(
                    transaction => transaction.transaction_type === "payment"
                );

                const reversals = transactions.filter(
                    transaction => transaction.transaction_type === "reversal"
                );

                const reversedByPayment = new Map<string, number>();

                for (const reversal of reversals) {
                    if (!reversal.related_transaction_id) continue;

                    const id = reversal.related_transaction_id;
                    reversedByPayment.set(
                        id,
                        (reversedByPayment.get(id) ?? 0) +
                            Number(reversal.amount || 0)
                    );
                }

                const verifiedByPayment = new Map<string, number>();

                for (const verification of verifications) {
                    verifiedByPayment.set(
                        verification.transaction_id,
                        (verifiedByPayment.get(verification.transaction_id) ?? 0) +
                            Number(verification.verified_amount || 0)
                    );
                }

                const methods: Record<
                    "cash" | "transfer",
                    { reported: number; verified: number; pending: number }
                > = {
                    cash: { reported: 0, verified: 0, pending: 0 },
                    transfer: { reported: 0, verified: 0, pending: 0 }
                };

                for (const payment of payments) {
                    const method = payment.payment_method as "cash" | "transfer" | null;

                    if (method !== "cash" && method !== "transfer") continue;

                    const amount = Number(payment.amount || 0);
                    const reversed = reversedByPayment.get(payment.id) ?? 0;
                    const netReported = Math.max(0, amount - reversed);

                    const verifiedAmount = verifiedByPayment.get(payment.id) ?? 0;
                    const netVerified = Math.max(
                        0,
                        verifiedAmount - Math.min(reversed, verifiedAmount)
                    );

                    methods[method].reported += netReported;
                    methods[method].verified += Math.min(netReported, netVerified);
                    methods[method].pending += Math.max(
                        0, netReported - netVerified
                    );
                }

                return {
                    methods,
                    reported: methods.cash.reported + methods.transfer.reported,
                    verified: methods.cash.verified + methods.transfer.verified,
                    pending: methods.cash.pending + methods.transfer.pending
                };
            }

            const independentSummary = summarizeLedger(
                independentLedger,
                independentVerifications ?? []
            );

            const tableSummary = summarizeLedger(
                tableLedger,
                tableVerifications ?? []
            );

            const reportedCash =
                independentSummary.methods.cash.reported +
                tableSummary.methods.cash.reported;

            const reportedTransfer =
                independentSummary.methods.transfer.reported +
                tableSummary.methods.transfer.reported;

            const verifiedPayments =
                independentSummary.verified + tableSummary.verified;

            const reportedPayments =
                independentSummary.reported + tableSummary.reported;

            const pendingVerification =
                independentSummary.pending + tableSummary.pending;

            const byWaiter = new Map();

            for (const order of confirmedOrders) {
                const name = waiterNames.get(order.waiter_id) ?? "Mesero";
                const current = byWaiter.get(name) ?? {
                    waiter: name,
                    orders: 0,
                    sales: 0
                };

                current.orders += 1;
                current.sales += Number(order.total || 0);
                byWaiter.set(name, current);
            }

            salesReport = {
                journey,

                totals: {
                    confirmedSales,
                    confirmedOrderCount: confirmedOrders.length,
                    cancelledOrderCount: orders.filter(
                        o => o.status === "cancelled"
                    ).length,
                    averageTicket: confirmedOrders.length
                        ? confirmedSales / confirmedOrders.length
                        : 0,

                    dineInSales: dineInOrders.reduce(
                        (sum, o) => sum + Number(o.total || 0), 0
                    ),
                    dineInCount: dineInOrders.length,

                    takeawayTableSales: takeawayTableOrders.reduce(
                        (sum, o) => sum + Number(o.total || 0), 0
                    ),
                    takeawayTableCount: takeawayTableOrders.length,

                    independentTakeawaySales: independentTakeawayOrders.reduce(
                        (sum, o) => sum + Number(o.total || 0), 0
                    ),
                    independentTakeawayCount: independentTakeawayOrders.length,

                    reportedPayments,
                    reportedCash,
                    reportedTransfer,
                    verifiedPayments,
                    pendingVerification,
                    balanceDue: Math.max(0, confirmedSales - reportedPayments)
                },

                byWaiter: [...byWaiter.values()],

                byPaymentMethod: [
                    { method: "cash", amount: reportedCash },
                    { method: "transfer", amount: reportedTransfer }
                ],

                orders: orders.map(order => {
                    const orderPayments = independentLedger
                        .filter(payment => payment.order_id === order.id)
                        .map(payment => ({
                            ...payment,
                            verification: (independentVerifications ?? [])
                                .find(v => v.transaction_id === payment.id) ?? null
                        }));

                    const netPaid = orderPayments.reduce((sum, payment) =>
                        sum + (
                            payment.transaction_type === "payment"
                                ? Number(payment.amount)
                                : -Number(payment.amount)
                        ), 0);

                    const verifiedTotal = orderPayments.reduce((sum, payment) =>
                        sum + (
                            payment.verification
                                ? Number(payment.verification.verified_amount)
                                : 0
                        ), 0);

                    return {
                        ...order,
                        waiterName: waiterNames.get(order.waiter_id) ?? "Mesero",
                        payments: orderPayments,
                        netPaid,
                        balanceDue: Math.max(
                            0, Number(order.total || 0) - netPaid
                        ),
                        verifiedTotal,
                        pendingVerification: orderPayments.filter(payment =>
                            payment.transaction_type === "payment" &&
                            !payment.verification
                        ).length
                    };
                })
            };
        }

        return NextResponse.json({ success: true, accounts, journey, salesReport });
    } catch (error) {
        console.error("Caja accounts GET:", error);
        return NextResponse.json(
            { error: "No se pudieron cargar las cuentas." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const context = await getAdminContext();
        if ("error" in context) {
            return NextResponse.json(
                { error: context.error },
                { status: context.status }
            );
        }

        const body = await request.json();
        const { action, sessionId } = body;

        if (action === "open_journey" || action === "close_journey") {
            const rpcName = action === "open_journey" ? "open_sales_journey" : "close_sales_journey";
            const { data, error } = await context.supabase.rpc(rpcName, {
                p_restaurant_id: context.restaurantId
            });
            if (error) throw error;
            return NextResponse.json({ success: true, result: data });
        }

        if (action === "verify_takeaway_payment") {
            if (!validId(body.orderId) || !validId(body.transactionId)) {
                return NextResponse.json({ error: "Pedido o pago inválido." }, { status: 400 });
            }
            const { data, error } = await context.supabase.rpc("verify_independent_takeaway_payment", {
                p_order_id: body.orderId,
                p_transaction_id: body.transactionId,
                p_notes: body.notes ?? null
            });
            if (error) throw error;
            return NextResponse.json({ success: true, result: data });
        }

        if (action === "reverse_takeaway_payment") {
            if (!validId(body.transactionId) || typeof body.reason !== "string" ||
                !body.reason.trim() || !validId(body.idempotencyKey)) {
                return NextResponse.json({ error: "Datos del reverso inválidos." }, { status: 400 });
            }
            const { data, error } = await context.supabase.rpc("reverse_independent_takeaway_payment", {
                p_transaction_id: body.transactionId,
                p_reason: body.reason.trim(),
                p_idempotency_key: body.idempotencyKey
            });
            if (error) throw error;
            return NextResponse.json({ success: true, result: data });
        }

        if (!validId(sessionId)) {
            return NextResponse.json({ error: "Cuenta inválida." }, { status: 400 });
        }

        let result;

        if (action === "verify_payment") {
            if (!validId(body.transactionId)) {
                return NextResponse.json({ error: "Pago inválido." }, { status: 400 });
            }
            result = await context.supabase.rpc("verify_cashier_session_payment", {
                p_transaction_id: body.transactionId,
                p_session_id: sessionId,
                p_restaurant_id: context.restaurantId,
                p_notes: body.notes ?? null
            });
        } else if (action === "approve_close") {
            result = await context.supabase.rpc("approve_waiter_table_session_close", {
                p_session_id: sessionId,
                p_restaurant_id: context.restaurantId
            });
        } else if (action === "return_close") {
            if (typeof body.reason !== "string" || !body.reason.trim()) {
                return NextResponse.json({ error: "Indica el motivo de devolución." }, { status: 400 });
            }
            result = await context.supabase.rpc("return_waiter_table_session_close", {
                p_session_id: sessionId,
                p_restaurant_id: context.restaurantId,
                p_reason: body.reason.trim()
            });
        } else if (body.paymentId) {
            const value = Number(body.amount);
            if (
                !validId(body.paymentId) ||
                !Number.isSafeInteger(value) ||
                value <= 0 ||
                typeof body.reason !== "string" ||
                !body.reason.trim() ||
                typeof body.idempotencyKey !== "string"
            ) {
                return NextResponse.json({ error: "Datos del reverso inválidos." }, { status: 400 });
            }

            const { data: session, error: sessionError } = await supabaseAdmin
                .from("table_sessions")
                .select("id, opened_by_waiter_id")
                .eq("id", sessionId)
                .eq("restaurant_id", context.restaurantId)
                .eq("status", "open")
                .maybeSingle();

            if (sessionError) throw sessionError;
            if (!session) {
                return NextResponse.json({ error: "La cuenta no está abierta." }, { status: 409 });
            }

            result = await supabaseAdmin.rpc("reverse_waiter_session_payment", {
                p_session_id: sessionId,
                p_restaurant_id: context.restaurantId,
                p_waiter_id: session.opened_by_waiter_id,
                p_authorized_by_profile_id: context.profile.id,
                p_payment_id: body.paymentId,
                p_amount: value,
                p_reason: body.reason.trim(),
                p_idempotency_key: body.idempotencyKey
            });
        } else {
            return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
        }

        if (result.error) throw result.error;
        return NextResponse.json({ success: true, result: result.data });
    } catch (error) {
        console.error("Caja accounts POST:", error);
        return NextResponse.json(
            { error: "No se pudo completar la acción de Caja." },
            { status: 500 }
        );
    }
}
