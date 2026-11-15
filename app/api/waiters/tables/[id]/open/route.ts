import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

        const { data, error: sessionError } = await supabase.rpc(
            "open_waiter_table_session",
            { p_table_id: tableId }
        );

        if (sessionError) {
            if (sessionError.code === "23505") {
                return NextResponse.json(
                    { success: false, message: "Esta mesa ya tiene una cuenta abierta." },
                    { status: 409 }
                );
            }

            const status =
                sessionError.code === "P0002" ? 404 :
                sessionError.code === "23514" ? 409 :
                sessionError.code === "42501" ? 403 : 500;

            return NextResponse.json(
                { success: false, message: sessionError.message },
                { status }
            );
        }

        const session = Array.isArray(data) ? data[0] : data;

        if (!session?.id) {
            throw new Error("No se recibió la confirmación de apertura de la cuenta.");
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
