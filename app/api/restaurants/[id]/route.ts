import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(
    _request: Request,
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
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || profile?.role !== "super_admin") {
            return NextResponse.json(
                { success: false, message: "No tienes autorización." },
                { status: 403 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("restaurants")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return NextResponse.json(
            { success: true, restaurant: data },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error consultando restaurante:", error);

        return NextResponse.json(
            {
                success: false,
                message: "No fue posible consultar el restaurante.",
            },
            { status: 500 }
        );
    }
}
