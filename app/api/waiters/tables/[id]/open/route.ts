import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveWaiter } from "@/lib/server/service-order.service";

export const runtime = "nodejs";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(
    _request: Request,
    context: RouteContext
) {
    try {
        const { id: tableId } = await context.params;

        if (!tableId) {
            return NextResponse.json(
                { success: false, message: "Mesa no identificada." },
                { status: 400 }
            );
        }

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
                { success: false, message: "No tienes autorización." },
                { status: 403 }
            );
        }

        const waiter = await getActiveWaiter(
            user.id,
            profile.restaurant_id
        );

        const { data: table, error: tableError } = await supabaseAdmin
            .from("restaurant_tables")
            .select("id, table_number, label, temporary_until")
            .eq("id", tableId)
            .eq("restaurant_id", profile.restaurant_id)
            .eq("is_active", true)
            .maybeSingle();

        if (tableError) {
            throw new Error(tableError.message);
        }

        if (!table) {
            return NextResponse.json(
                { success: false, message: "La mesa no existe o está inactiva." },
                { status: 404 }
            );
        }

        const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Bogota",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date());

        if (table.temporary_until && table.temporary_until < today) {
            return NextResponse.json(
                { success: false, message: "Esta mesa temporal ya venció y no puede recibir nuevas cuentas." },
                { status: 409 }
            );
        }

        const { data: session, error: sessionError } = await supabaseAdmin
            .from("table_sessions")
            .insert({
                restaurant_id: profile.restaurant_id,
                restaurant_table_id: table.id,
                opened_by_waiter_id: waiter.waiterId,
                status: "open",
            })
            .select("id, restaurant_table_id, status, opened_at")
            .single();

        if (sessionError) {
            if (sessionError.code === "23505") {
                return NextResponse.json(
                    { success: false, message: "Esta mesa ya tiene una cuenta abierta." },
                    { status: 409 }
                );
            }

            throw new Error(sessionError.message);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Cuenta abierta correctamente.",
                session,
            },
            { status: 201, headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error abriendo cuenta de mesa:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "No fue posible abrir la cuenta.",
            },
            { status: 500 }
        );
    }
}
