import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createWaiter } from "@/lib/server/waiter.service";

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
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { success: false, message: "Perfil no encontrado." },
                { status: 403 }
            );
        }

        if (
            profile.role !== "super_admin" &&
            profile.role !== "restaurant_admin"
        ) {
            return NextResponse.json(
                { success: false, message: "No tienes autorización." },
                { status: 403 }
            );
        }

        const body = await request.json();

        const fullName =
            typeof body.fullName === "string" ? body.fullName.trim() : "";

        const email =
            typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

        const username =
            typeof body.username === "string"
                ? body.username.trim().toLowerCase()
                : "";

        const password =
            typeof body.password === "string" ? body.password : "";

        const requestedRestaurantId =
            typeof body.restaurantId === "string"
                ? body.restaurantId.trim()
                : "";

        let restaurantId: string;

        if (profile.role === "super_admin") {
            restaurantId = requestedRestaurantId;
        } else {
            if (!profile.restaurant_id) {
                return NextResponse.json(
                    { success: false, message: "Tu cuenta no tiene un restaurante asignado." },
                    { status: 403 }
                );
            }

            if (
                requestedRestaurantId &&
                requestedRestaurantId !== profile.restaurant_id
            ) {
                return NextResponse.json(
                    { success: false, message: "No puedes administrar otro restaurante." },
                    { status: 403 }
                );
            }

            restaurantId = profile.restaurant_id;
        }

        if (!fullName || !email || !username || !password || !restaurantId) {
            return NextResponse.json(
                { success: false, message: "Faltan datos obligatorios." },
                { status: 400 }
            );
        }

        const { data: restaurant, error: restaurantError } =
            await supabaseAdmin
                .from("restaurants")
                .select("id")
                .eq("id", restaurantId)
                .maybeSingle();

        if (restaurantError || !restaurant) {
            return NextResponse.json(
                { success: false, message: "El restaurante seleccionado no existe." },
                { status: 404 }
            );
        }

        const waiter = await createWaiter({
            fullName,
            email,
            username,
            password,
            restaurantId,
            createdByProfileId: profile.id,
        });

        return NextResponse.json(
            { success: true, waiter },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creando mesero:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error desconocido al crear el mesero.",
            },
            { status: 500 }
        );
    }
}
