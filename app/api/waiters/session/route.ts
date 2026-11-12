import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, message: "Sesión no válida." },
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
            profile.role !== "waiter" ||
            !profile.restaurant_id
        ) {
            return NextResponse.json(
                { success: false, message: "Esta cuenta no tiene acceso de mesero." },
                { status: 403 }
            );
        }

        const { data: account, error: accountError } = await supabaseAdmin
            .from("waiter_accounts")
            .select("id, status, restaurant_id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (accountError) {
            throw new Error(accountError.message);
        }

        if (
            !account ||
            account.status !== "active" ||
            account.restaurant_id !== profile.restaurant_id
        ) {
            return NextResponse.json(
                { success: false, message: "Tu cuenta de mesero está suspendida o desactivada." },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: true },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error validando sesión de mesero:", error);

        return NextResponse.json(
            { success: false, message: "No fue posible validar tu cuenta." },
            { status: 500 }
        );
    }
}
