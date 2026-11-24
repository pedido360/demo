import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function getAdminContext() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return { error: "Debes iniciar sesión.", status: 401 as const };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, restaurant_id")
        .eq("id", user.id)
        .maybeSingle();

    if (!profile || profile.role !== "restaurant_admin" || !profile.restaurant_id) {
        return { error: "No tienes permisos para consultar el historial de Caja.", status: 403 as const };
    }

    return { restaurantId: profile.restaurant_id };
}

export async function GET(request: NextRequest) {
    try {
        const context = await getAdminContext();

        if ("error" in context) {
            return NextResponse.json(
                { success: false, error: context.error },
                { status: context.status }
            );
        }

        const date = request.nextUrl.searchParams.get("date");

        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json(
                { success: false, error: "La fecha enviada no es válida." },
                { status: 400 }
            );
        }

        let query = supabaseAdmin
            .from("sales_journeys")
            .select("id, opened_at, closed_at, close_summary")
            .eq("restaurant_id", context.restaurantId)
            .eq("status", "closed")
            .order("opened_at", { ascending: false })
            .limit(100);

        if (date) {
            const start = new Date(`${date}T00:00:00-05:00`);
            const nextDay = new Date(`${date}T12:00:00-05:00`);

            if (Number.isNaN(start.getTime()) ||
                nextDay.toISOString().slice(0, 10) !== date) {
                return NextResponse.json(
                    { success: false, error: "La fecha enviada no es válida." },
                    { status: 400 }
                );
            }

            const end = new Date(start.getTime() + 86400000);
            query = query
                .gte("opened_at", start.toISOString())
                .lt("opened_at", end.toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;

        const journeys = (data ?? []).map((journey) => {
            const summary = journey.close_summary &&
                typeof journey.close_summary === "object"
                ? journey.close_summary as Record<string, any>
                : {};
            const orders = Array.isArray(summary.orders) ? summary.orders : [];

            return {
                id: journey.id,
                opened_at: journey.opened_at,
                closed_at: journey.closed_at,
                orders,
                totals: {
                    confirmedSales: Number(summary.confirmed_sales_total ?? 0),
                    confirmedOrderCount: Number(
                        summary.confirmed_order_count ??
                        orders.filter((o: any) => o.status === "confirmed").length
                    ),
                    cancelledOrderCount: Number(
                        summary.cancelled_order_count ??
                        orders.filter((o: any) => o.status === "cancelled").length
                    ),
                    averageTicket: Number(summary.average_ticket ?? 0)
                }
            };
        });

        return NextResponse.json({ success: true, journeys });
    } catch (error) {
        console.error("Error consultando historial de jornadas:", error);
        return NextResponse.json(
            { success: false, error: "No fue posible consultar el historial de jornadas." },
            { status: 500 }
        );
    }
}
