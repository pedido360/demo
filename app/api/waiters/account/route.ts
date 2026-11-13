import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveWaiter } from "@/lib/server/service-order.service";

export const runtime = "nodejs";

function validId(value: unknown): value is string {
    return typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function getWaiterContext() {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Debes iniciar sesión.", status: 401 as const };
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, role, restaurant_id")
        .eq("id", user.id)
        .maybeSingle();

    if (
        error ||
        !profile ||
        profile.role !== "waiter" ||
        !profile.restaurant_id
    ) {
        return {
            error: "No tienes acceso al módulo de meseros.",
            status: 403 as const,
        };
    }

    const waiter = await getActiveWaiter(user.id, profile.restaurant_id);

    return {
        supabase,
        profile,
        waiter,
    };
}

export async function GET(request: NextRequest) {
    try {
        const context = await getWaiterContext();

        if ("error" in context) {
            return NextResponse.json(
                { success: false, message: context.error },
                { status: context.status }
            );
        }

        const orderId = request.nextUrl.searchParams.get("orderId");

        if (orderId) {
            if (!validId(orderId)) {
                return NextResponse.json(
                    { success: false, message: "El pedido indicado no es válido." },
                    { status: 400 }
                );
            }

            const { data: order, error: orderError } = await supabaseAdmin
                .from("service_orders")
                .select("id, waiter_id, restaurant_id, order_type, table_session_id, total, status")
                .eq("id", orderId)
                .eq("restaurant_id", context.profile.restaurant_id)
                .maybeSingle();

            if (orderError) throw orderError;
            if (!order || order.waiter_id !== context.waiter.waiterId ||
                order.order_type !== "takeaway" || order.table_session_id !== null) {
                return NextResponse.json(
                    { success: false, message: "El pedido independiente no está disponible para este mesero." },
                    { status: 404 }
                );
            }

            const [
                { data: transactions, error: transactionsError },
                { data: verifications, error: verificationsError },
                { data: printJobs, error: printJobsError }
            ] = await Promise.all([
                supabaseAdmin.from("independent_order_payment_transactions")
                    .select("id, transaction_type, payment_method, amount, reference, reason, related_transaction_id, created_at")
                    .eq("order_id", orderId)
                    .order("created_at", { ascending: true }),
                supabaseAdmin.from("independent_order_payment_verifications")
                    .select("transaction_id, verified_amount, verified_at, notes")
                    .eq("order_id", orderId),
                supabaseAdmin.from("print_jobs")
                    .select("id, service_order_id, destination, status, attempt_count, last_error, created_at, updated_at, printed_at, verified_by_waiter_id, verified_at")
                    .eq("service_order_id", orderId)
                    .eq("restaurant_id", context.profile.restaurant_id)
                    .order("created_at", { ascending: true })
            ]);

            if (transactionsError) throw transactionsError;
            if (verificationsError) throw verificationsError;
            if (printJobsError) throw printJobsError;

            const payments = transactions ?? [];
            const jobs = printJobs ?? [];
            const printsVerified = jobs.length === 2 &&
                ["cashier", "kitchen"].every(destination =>
                    jobs.some(job =>
                        job.destination === destination &&
                        job.status === "printed"
                    )
                );
            const netPaid = payments.reduce((sum, item) =>
                sum + (item.transaction_type === "payment" ? Number(item.amount) : -Number(item.amount)), 0);
            const verified = verifications ?? [];
            const verifiedTotal = verified.reduce((sum, item) => sum + Number(item.verified_amount), 0);

            return NextResponse.json({
                success: true,
                order,
                payments: payments.map(item => ({
                    ...item,
                    verification: verified.find(v => v.transaction_id === item.id) ?? null
                })),
                balanceDue: Math.max(0, Number(order.total) - netPaid),
                netPaid,
                verifiedTotal,
                printJobs: jobs,
                canDeliver: order.status === "confirmed" &&
                    Number(order.total) > 0 &&
                    netPaid >= Number(order.total) &&
                    verifiedTotal >= netPaid &&
                    printsVerified
            }, { headers: { "Cache-Control": "no-store" } });
        }

        if (request.nextUrl.searchParams.get("independentOrders") === "1") {
            const { data: orders, error: ordersError } = await supabaseAdmin
                .from("service_orders")
                .select("id, order_number, order_type, table_session_id, customer_name, total, subtotal, status, items, notes, created_at")
                .eq("restaurant_id", context.profile.restaurant_id)
                .eq("waiter_id", context.waiter.waiterId)
                .eq("order_type", "takeaway")
                .is("table_session_id", null)
                .order("created_at", { ascending: false })
                .limit(100);

            if (ordersError) throw ordersError;

            const orderIds = (orders ?? []).map(order => order.id);
            if (orderIds.length === 0) {
                return NextResponse.json(
                    { success: true, orders: [] },
                    { headers: { "Cache-Control": "no-store" } }
                );
            }

            const [
                { data: transactions, error: transactionsError },
                { data: verifications, error: verificationsError },
                { data: printJobs, error: printJobsError }
            ] = await Promise.all([
                supabaseAdmin.from("independent_order_payment_transactions")
                    .select("id, order_id, transaction_type, payment_method, amount, reference, reason, related_transaction_id, created_at")
                    .in("order_id", orderIds)
                    .order("created_at", { ascending: true }),
                supabaseAdmin.from("independent_order_payment_verifications")
                    .select("transaction_id, order_id, verified_amount, verified_at, notes")
                    .in("order_id", orderIds),
                supabaseAdmin.from("print_jobs")
                    .select("id, service_order_id, destination, status, attempt_count, last_error, created_at, updated_at, printed_at, verified_by_waiter_id, verified_at")
                    .in("service_order_id", orderIds)
                    .order("created_at", { ascending: true })
            ]);

            if (transactionsError) throw transactionsError;
            if (verificationsError) throw verificationsError;
            if (printJobsError) throw printJobsError;

            const resultOrders = (orders ?? []).map(order => {
                const payments = (transactions ?? []).filter(item => item.order_id === order.id);
                const verified = (verifications ?? []).filter(item => item.order_id === order.id);
                const jobs = (printJobs ?? []).filter(item => item.service_order_id === order.id);
                const netPaid = payments.reduce((sum, item) =>
                    sum + (item.transaction_type === "payment" ? Number(item.amount) : -Number(item.amount)), 0);
                const verifiedTotal = verified.reduce((sum, item) => sum + Number(item.verified_amount), 0);
                const total = Number(order.total);

                return {
                    ...order,
                    payments: payments.map(item => ({
                        ...item,
                        verification: verified.find(v => v.transaction_id === item.id) ?? null
                    })),
                    printJobs: jobs,
                    netPaid,
                    balanceDue: Math.max(0, total - netPaid),
                    verifiedTotal,
                    canDeliver: order.status === "confirmed" &&
                        total > 0 && netPaid >= total && verifiedTotal >= netPaid &&
                        jobs.length === 2 &&
                        ["cashier", "kitchen"].every(destination =>
                            jobs.some(job =>
                                job.destination === destination &&
                                job.status === "printed"
                            )
                        )
                };
            });

            return NextResponse.json(
                { success: true, orders: resultOrders },
                { headers: { "Cache-Control": "no-store" } }
            );
        }

        const sessionId = request.nextUrl.searchParams.get("sessionId");

        if (!validId(sessionId)) {
            return NextResponse.json(
                { success: false, message: "La cuenta indicada no es válida." },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin.rpc(
            "get_waiter_session_account",
            {
                p_session_id: sessionId,
                p_restaurant_id: context.profile.restaurant_id,
                p_waiter_id: context.waiter.waiterId,
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        if (!data) {
            return NextResponse.json(
                { success: false, message: "No se encontró una cuenta abierta a tu nombre." },
                { status: 404 }
            );
        }

        const { data: orders, error: ordersError } = await supabaseAdmin
            .from("service_orders")
            .select("id, order_number, order_type, status, items, subtotal, total, notes, created_at")
            .eq("restaurant_id", context.profile.restaurant_id)
            .eq("waiter_id", context.waiter.waiterId)
            .eq("table_session_id", sessionId)
            .order("created_at", { ascending: true });

        if (ordersError) throw ordersError;

        const orderIds = (orders ?? []).map(order => order.id);
        let printJobs: Array<Record<string, unknown>> = [];

        if (orderIds.length > 0) {
            const { data: jobs, error: printJobsError } = await supabaseAdmin
                .from("print_jobs")
                .select("id, service_order_id, destination, status, attempt_count, last_error, created_at, updated_at, printed_at, verified_by_waiter_id, verified_at")
                .in("service_order_id", orderIds)
                .order("created_at", { ascending: true });

            if (printJobsError) throw printJobsError;
            printJobs = jobs ?? [];
        }

        const ordersWithPrintJobs = (orders ?? []).map(order => ({
            ...order,
            printJobs: printJobs.filter(job => job.service_order_id === order.id)
        }));

        return NextResponse.json(
            { success: true, account: { ...data, orders: ordersWithPrintJobs } },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error consultando cuenta del mesero:", error);

        return NextResponse.json(
            { success: false, message: "No fue posible consultar la cuenta." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const context = await getWaiterContext();

        if ("error" in context) {
            return NextResponse.json(
                { success: false, message: context.error },
                { status: context.status }
            );
        }

        const body: unknown = await request.json();

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json(
                { success: false, message: "Los datos del pago no son válidos." },
                { status: 400 }
            );
        }

        const input = body as Record<string, unknown>;

        if (input.action === "retry_print_job") {
            const orderId = input.orderId;
            const jobId = input.jobId;

            if (!validId(orderId) || !validId(jobId)) {
                return NextResponse.json(
                    { success: false, message: "El pedido o trabajo de impresión no es válido." },
                    { status: 400 }
                );
            }

            const { data: order, error: orderError } = await supabaseAdmin
                .from("service_orders")
                .select("id")
                .eq("id", orderId)
                .eq("restaurant_id", context.profile.restaurant_id)
                .eq("waiter_id", context.waiter.waiterId)
                .maybeSingle();

            if (orderError) throw orderError;

            if (!order) {
                return NextResponse.json(
                    { success: false, message: "El pedido no está disponible para este mesero." },
                    { status: 404 }
                );
            }

            const { data: job, error: jobError } = await supabaseAdmin
                .from("print_jobs")
                .select("id, status")
                .eq("id", jobId)
                .eq("service_order_id", orderId)
                .eq("restaurant_id", context.profile.restaurant_id)
                .maybeSingle();

            if (jobError) throw jobError;

            if (!job) {
                return NextResponse.json(
                    { success: false, message: "El trabajo de impresión no pertenece a este pedido." },
                    { status: 404 }
                );
            }

            if (job.status !== "failed") {
                return NextResponse.json(
                    { success: false, message: "Solo se pueden reimprimir trabajos con error." },
                    { status: 409 }
                );
            }

            const { error: retryError } = await supabaseAdmin.rpc(
                "retry_print_job",
                { p_job_id: jobId }
            );

            if (retryError) {
                throw new Error(retryError.message);
            }

            return NextResponse.json(
                { success: true, message: "Trabajo enviado nuevamente a la cola de impresión." },
                { headers: { "Cache-Control": "no-store" } }
            );
        }

        if (input.action === "record_independent_takeaway_payment") {
            const amount = input.amount;
            const method = input.paymentMethod;
            const orderId = input.orderId;
            const idempotencyKey = input.idempotencyKey;
            const reference = typeof input.reference === "string" ? input.reference.trim() : null;

            if (
                !validId(orderId) ||
                !validId(idempotencyKey) ||
                typeof amount !== "number" ||
                !Number.isSafeInteger(amount) ||
                amount <= 0 ||
                (method !== "cash" && method !== "transfer") ||
                (reference !== null && reference.length > 120)
            ) {
                return NextResponse.json(
                    { success: false, message: "Revisa el importe y los datos del pago." },
                    { status: 400 }
                );
            }

            const { data, error } = await context.supabase.rpc(
                "record_independent_takeaway_payment",
                {
                    p_order_id: orderId,
                    p_amount: amount,
                    p_payment_method: method,
                    p_reference: reference,
                    p_idempotency_key: idempotencyKey
                }
            );

            if (error) throw new Error(error.message);

            return NextResponse.json(
                { success: true, result: data },
                { headers: { "Cache-Control": "no-store" } }
            );
        }

        const amount = input.amount;
        const method = input.paymentMethod;
        const sessionId = input.sessionId;
        const idempotencyKey = input.idempotencyKey;
        const reference =
            typeof input.reference === "string"
                ? input.reference.trim()
                : null;

        if (
            !validId(sessionId) ||
            !validId(idempotencyKey) ||
            typeof amount !== "number" ||
            !Number.isSafeInteger(amount) ||
            amount <= 0 ||
            (method !== "cash" && method !== "transfer") ||
            (reference !== null && reference.length > 120)
        ) {
            return NextResponse.json(
                { success: false, message: "Revisa el importe y los datos del pago." },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin.rpc(
            "record_waiter_session_payment",
            {
                p_session_id: sessionId,
                p_restaurant_id: context.profile.restaurant_id,
                p_waiter_id: context.waiter.waiterId,
                p_amount: amount,
                p_payment_method: method,
                p_reference: reference,
                p_idempotency_key: idempotencyKey,
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json(
            { success: true, account: data },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error registrando pago del mesero:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "No fue posible registrar el pago.",
            },
            { status: 400 }
        );
    }
}
