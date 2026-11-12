import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function validId(value: unknown): value is string {
    return typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: NextRequest) {
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
            .select("id, role, restaurant_id")
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

        const body: unknown = await request.json();

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json(
                { success: false, message: "Los datos de cierre no son válidos." },
                { status: 400 }
            );
        }

        const sessionId = (body as Record<string, unknown>).sessionId;

        if (!validId(sessionId)) {
            return NextResponse.json(
                { success: false, message: "La cuenta indicada no es válida." },
                { status: 400 }
            );
        }

        // La base de datos identifica al mesero mediante auth.uid().
        const { data, error } = await supabase.rpc(
            "request_waiter_table_session_close",
            {
                p_session_id: sessionId,
                p_restaurant_id: profile.restaurant_id,
            }
        );

        if (error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Solicitud enviada a Caja. La mesa continúa ocupada hasta su autorización.",
                account: data,
            },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error solicitando cierre de cuenta:", error);
        return NextResponse.json(
            { success: false, message: "No fue posible solicitar el cierre." },
            { status: 500 }
        );
    }
}
