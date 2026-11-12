import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createRestaurantUser } from "@/lib/server/user.service";

export async function POST(request: NextRequest) {
    try {
        // Verificar la sesión real del solicitante.
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

        // Esta operación está reservada al Super Admin.
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || profile?.role !== "super_admin") {
            return NextResponse.json(
                { success: false, message: "No tienes autorización para crear administradores." },
                { status: 403 }
            );
        }

        const body = await request.json();

        const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const restaurantId = typeof body.restaurantId === "string" ? body.restaurantId.trim() : "";

        if (!fullName || !email || !password || !restaurantId) {
            return NextResponse.json(
                { success: false, message: "Faltan datos obligatorios para crear el administrador." },
                { status: 400 }
            );
        }

        const userCreated = await createRestaurantUser({
            fullName,
            email,
            password,
            restaurantId,
        });

        return NextResponse.json({
            success: true,
            user: userCreated,
        });
    } catch (error) {
        console.error("Error creando administrador del restaurante:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error desconocido al crear el administrador.",
            },
            { status: 500 }
        );
    }
}
