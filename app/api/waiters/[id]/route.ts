import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function PATCH(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const { id } = await params;

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
            .single();

        if (
            profileError ||
            !profile ||
            !["super_admin", "restaurant_admin"].includes(profile.role)
        ) {
            return NextResponse.json(
                { success: false, message: "No tienes autorización." },
                { status: 403 }
            );
        }

        const body = await request.json();
        const status = body.status;

        if (!["active", "suspended", "deactivated"].includes(status)) {
            return NextResponse.json(
                { success: false, message: "Estado de mesero no válido." },
                { status: 400 }
            );
        }

        const { data: account, error: accountError } =
            await supabaseAdmin
                .from("waiter_accounts")
                .select("id, restaurant_id, status")
                .eq("id", id)
                .maybeSingle();

        if (accountError) {
            throw new Error(accountError.message);
        }

        if (!account) {
            return NextResponse.json(
                { success: false, message: "Mesero no encontrado." },
                { status: 404 }
            );
        }

        if (
            profile.role === "restaurant_admin" &&
            profile.restaurant_id !== account.restaurant_id
        ) {
            return NextResponse.json(
                { success: false, message: "No puedes modificar meseros de otro restaurante." },
                { status: 403 }
            );
        }

        // Un mesero no puede suspenderse ni desactivarse mientras
        // conserve cuentas abiertas bajo su responsabilidad.
        if (status !== "active") {
            const { data: openSessions, error: sessionsError } =
                await supabaseAdmin
                    .from("table_sessions")
                    .select("id")
                    .eq("restaurant_id", account.restaurant_id)
                    .eq("opened_by_waiter_id", account.id)
                    .eq("status", "open");

            if (sessionsError) {
                throw new Error(sessionsError.message);
            }

            if (openSessions && openSessions.length > 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `No se puede suspender ni desactivar este mesero: ` +
                            `tiene ${openSessions.length} cuenta(s) de mesa abierta(s). ` +
                            "Primero debe completar el cobro y cierre de todas sus mesas.",
                        openSessionsCount: openSessions.length,
                    },
                    { status: 409 }
                );
            }
        }

        const { data: updated, error: updateError } =
            await supabaseAdmin
                .from("waiter_accounts")
                .update({
                    status,
                    deactivated_at:
                        status === "deactivated"
                            ? new Date().toISOString()
                            : null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id)
                .select("id, status, restaurant_id, deactivated_at")
                .single();

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({
            success: true,
            waiter: updated,
            message: "Estado del mesero actualizado correctamente.",
        });
    } catch (error) {
        console.error("Error actualizando estado del mesero:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error desconocido al actualizar el mesero.",
            },
            { status: 500 }
        );
    }
}
