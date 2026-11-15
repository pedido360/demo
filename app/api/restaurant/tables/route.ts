import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function getAdminContext() {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Debes iniciar sesión.", status: 401 as const };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, restaurant_id")
        .eq("id", user.id)
        .maybeSingle();

    if (
        profileError ||
        !profile ||
        profile.role !== "restaurant_admin" ||
        !profile.restaurant_id
    ) {
        return {
            error: "Solo el administrador del restaurante puede gestionar mesas fijas.",
            status: 403 as const,
        };
    }

    return {
        supabase,
        restaurantId: profile.restaurant_id,
    };
}

export async function GET() {
    try {
        const context = await getAdminContext();

        if ("error" in context) {
            return NextResponse.json(
                { success: false, message: context.error },
                { status: context.status }
            );
        }

        const { data: tables, error } = await supabaseAdmin
            .from("restaurant_tables")
            .select("id, table_number, label, is_active, temporary_until")
            .eq("restaurant_id", context.restaurantId)
            .is("temporary_until", null)
            .order("table_number", { ascending: true });

        if (error) throw error;

        const activeIds = (tables ?? [])
            .filter((table) => table.is_active)
            .map((table) => table.id);

        const { data: sessions, error: sessionsError } = await supabaseAdmin
            .from("table_sessions")
            .select("restaurant_table_id")
            .eq("restaurant_id", context.restaurantId)
            .eq("status", "open")
            .in(
                "restaurant_table_id",
                activeIds.length
                    ? activeIds
                    : ["00000000-0000-0000-0000-000000000000"]
            );

        if (sessionsError) throw sessionsError;

        const openTableIds = new Set(
            (sessions ?? []).map((session) => session.restaurant_table_id)
        );

        return NextResponse.json(
            {
                success: true,
                tables: (tables ?? []).map((table) => ({
                    ...table,
                    hasOpenSession: openTableIds.has(table.id),
                })),
            },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error consultando mesas fijas:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "No fue posible consultar las mesas fijas.",
            },
            { status: 500 }
        );
    }
}

export async function POST() {
    try {
        const context = await getAdminContext();

        if ("error" in context) {
            return NextResponse.json(
                { success: false, message: context.error },
                { status: context.status }
            );
        }

        const { data, error } = await context.supabase.rpc(
            "create_restaurant_fixed_table"
        );

        if (error) {
            const status = error.code === "23514" ? 409 : 400;

            return NextResponse.json(
                { success: false, message: error.message },
                { status }
            );
        }

        const table = Array.isArray(data) ? data[0] : data;

        if (!table?.id) {
            throw new Error("No se recibió la mesa creada.");
        }

        return NextResponse.json(
            { success: true, table },
            { status: 201, headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error creando mesa fija:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "No fue posible crear la mesa fija.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const context = await getAdminContext();

        if ("error" in context) {
            return NextResponse.json(
                { success: false, message: context.error },
                { status: context.status }
            );
        }

        const body = await request.json().catch(() => null);
        const tableId = body?.tableId;

        if (
            typeof tableId !== "string" ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tableId)
        ) {
            return NextResponse.json(
                { success: false, message: "El identificador de la mesa no es válido." },
                { status: 400 }
            );
        }

        const { data, error } = await context.supabase.rpc(
            "deactivate_restaurant_fixed_table",
            { p_table_id: tableId }
        );

        if (error) {
            const status =
                error.code === "23514" ? 409 :
                error.code === "P0002" ? 404 : 400;

            return NextResponse.json(
                { success: false, message: error.message },
                { status }
            );
        }

        if (data !== true) {
            throw new Error("No se confirmó el retiro de la mesa.");
        }

        return NextResponse.json(
            { success: true },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error retirando mesa fija:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "No fue posible retirar la mesa fija.",
            },
            { status: 500 }
        );
    }
}
