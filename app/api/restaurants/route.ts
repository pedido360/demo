import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || profile?.role !== "super_admin") {
            return NextResponse.json(
                { success: false, message: "No tienes autorización." },
                { status: 403 }
            );
        }

        const { data, error } = await supabase
            .from("restaurants")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json(
            { success: true, restaurants: data ?? [] },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error consultando restaurantes:", error);

        return NextResponse.json(
            { success: false, message: "No fue posible consultar los restaurantes." },
            { status: 500 }
        );
    }
}
