import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveWaiter } from "@/lib/server/service-order.service";

export const runtime = "nodejs";

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, message: "Debes iniciar sesión." },
                { status: 401 }
            );
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, restaurant_id")
            .eq("id", user.id)
            .maybeSingle();

        if (
            profileError ||
            !profile ||
            profile.role !== "waiter" ||
            !profile.restaurant_id
        ) {
            return NextResponse.json(
                { success: false, message: "No tienes acceso al módulo de meseros." },
                { status: 403 }
            );
        }

        const waiter = await getActiveWaiter(user.id, profile.restaurant_id);

        const { data: tables, error: tablesError } = await supabaseAdmin
            .from("restaurant_tables")
            .select("id, table_number, label, is_custom, sort_order, temporary_until")
            .eq("restaurant_id", profile.restaurant_id)
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
            .order("table_number", { ascending: true });

        if (tablesError) {
            throw new Error(tablesError.message);
        }

        const { data: sessions, error: sessionsError } = await supabaseAdmin
            .from("table_sessions")
            .select("id, restaurant_table_id, opened_at, opened_by_waiter_id")
            .eq("restaurant_id", profile.restaurant_id)
            .eq("status", "open");

        if (sessionsError) {
            throw new Error(sessionsError.message);
        }

        // Calcular los consumos de cada sesión abierta sin mezclar
        // pedidos independientes ni órdenes canceladas.
        const sessionTotals = new Map<
            string,
            { tableConsumptionSubtotal: number; takeawaySubtotal: number }
        >();

        const sessionIds = (sessions ?? []).map((session) => session.id);

        if (sessionIds.length > 0) {
            const { data: serviceOrders, error: serviceOrdersError } =
                await supabaseAdmin
                    .from("service_orders")
                    .select("table_session_id, order_type, total")
                    .eq("restaurant_id", profile.restaurant_id)
                    .eq("status", "confirmed")
                    .in("table_session_id", sessionIds);

            if (serviceOrdersError) {
                throw new Error(serviceOrdersError.message);
            }

            for (const order of serviceOrders ?? []) {
                if (!order.table_session_id) continue;

                const amount = Number(order.total);

                if (!Number.isFinite(amount) || amount < 0) {
                    throw new Error("Se encontró un total de pedido no válido.");
                }

                const totals = sessionTotals.get(order.table_session_id) ?? {
                    tableConsumptionSubtotal: 0,
                    takeawaySubtotal: 0,
                };

                if (order.order_type === "dine_in") {
                    totals.tableConsumptionSubtotal += amount;
                } else if (order.order_type === "takeaway") {
                    totals.takeawaySubtotal += amount;
                } else {
                    continue;
                }

                sessionTotals.set(order.table_session_id, totals);
            }
        }

        const sessionMap = new Map(
            (sessions ?? []).map((session) => {
                const totals = sessionTotals.get(session.id) ?? {
                    tableConsumptionSubtotal: 0,
                    takeawaySubtotal: 0,
                };

                const {
                    opened_by_waiter_id,
                    ...sessionData
                } = session;

                return [
                    session.restaurant_table_id,
                    {
                        ...sessionData,
                        isMine: opened_by_waiter_id === waiter.waiterId,
                        ...totals,
                        combinedTotal:
                            totals.tableConsumptionSubtotal +
                            totals.takeawaySubtotal,
                    },
                ] as const;
            })
        );

        const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Bogota",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date());

        const expiredWithoutSession = (tables ?? []).filter(
            (table) =>
                table.temporary_until !== null &&
                table.temporary_until < today &&
                !sessionMap.has(table.id)
        );

        if (expiredWithoutSession.length > 0) {
            const { error: deactivateError } = await supabaseAdmin
                .from("restaurant_tables")
                .update({ is_active: false })
                .in("id", expiredWithoutSession.map((table) => table.id))
                .eq("restaurant_id", profile.restaurant_id);

            if (deactivateError) throw new Error(deactivateError.message);
        }

        const visibleTables = (tables ?? []).filter(
            (table) =>
                table.temporary_until === null ||
                table.temporary_until >= today ||
                sessionMap.has(table.id)
        );

        const result = visibleTables.map((table) => ({
            ...table,
            currentSession: sessionMap.get(table.id) ?? null,
        }));

        const [{ data: restaurant, error: restaurantError }, { count: existingTables, error: countError }] =
            await Promise.all([
                supabaseAdmin
                    .from("restaurants")
                    .select("max_tables")
                    .eq("id", profile.restaurant_id)
                    .single(),
                supabaseAdmin
                    .from("restaurant_tables")
                    .select("id", { count: "exact", head: true })
                    .eq("restaurant_id", profile.restaurant_id),
            ]);

        if (restaurantError) throw new Error(restaurantError.message);
        if (countError) throw new Error(countError.message);

        return NextResponse.json(
            {
                success: true,
                tables: result,
                maxTables: restaurant.max_tables,
                existingTables: existingTables ?? 0,
            },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error consultando mesas:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "No fue posible consultar las mesas.",
            },
            { status: 400 }
        );
    }
}

export async function POST() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, message: "Debes iniciar sesión." },
                { status: 401 }
            );
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, restaurant_id")
            .eq("id", user.id)
            .maybeSingle();

        if (
            profileError ||
            !profile ||
            profile.role !== "waiter" ||
            !profile.restaurant_id
        ) {
            return NextResponse.json(
                { success: false, message: "No tienes permiso para agregar mesas." },
                { status: 403 }
            );
        }

        const { data, error } = await supabase.rpc(
            "add_waiter_restaurant_table"
        );

        if (error) {
            const status = error.code === "23514" ? 409 : 400;
            return NextResponse.json(
                { success: false, message: error.message },
                { status }
            );
        }

        const createdTable = Array.isArray(data) ? data[0] : data;

        if (!createdTable?.id) {
            throw new Error("No se recibió la mesa creada.");
        }

        return NextResponse.json(
            { success: true, table: createdTable },
            { status: 201, headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error agregando mesa:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "No fue posible agregar la mesa.",
            },
            { status: 400 }
        );
    }
}
