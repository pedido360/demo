import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
    getActiveWaiter,
    confirmWaiterServiceOrder,
} from "@/lib/server/service-order.service";
import { getColombiaDate } from "@/lib/utils/getColombiaDate";

export const runtime = "nodejs";

interface RouteContext {
    params: Promise<{ slug: string }>;
}

export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { slug } = await context.params;

        if (!slug) {
            return NextResponse.json(
                { error: "Restaurante no identificado." },
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
                { error: "Debes iniciar sesión." },
                { status: 401 }
            );
        }

        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("id, role, restaurant_id")
                .eq("id", user.id)
                .maybeSingle();

        if (profileError || !profile) {
            return NextResponse.json(
                { error: "No se encontró el perfil del usuario." },
                { status: 403 }
            );
        }

        if (profile.role !== "waiter" || !profile.restaurant_id) {
            return NextResponse.json(
                { error: "No tienes permisos para registrar pedidos de mesero." },
                { status: 403 }
            );
        }

        const { data: restaurant, error: restaurantError } =
            await supabaseAdmin
                .from("restaurants")
                .select("id, slug")
                .eq("slug", slug)
                .maybeSingle();

        if (restaurantError || !restaurant) {
            return NextResponse.json(
                { error: "El restaurante no existe." },
                { status: 404 }
            );
        }

        if (restaurant.id !== profile.restaurant_id) {
            return NextResponse.json(
                { error: "No tienes acceso a este restaurante." },
                { status: 403 }
            );
        }

        const waiter = await getActiveWaiter(
            user.id,
            restaurant.id
        );

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "El contenido del pedido no es válido." },
                { status: 400 }
            );
        }

        const result = await confirmWaiterServiceOrder(
            restaurant.id,
            waiter.waiterId,
            body,
            getColombiaDate()
        );

        return NextResponse.json(
            {
                success: true,
                ...result,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error en API de pedidos de meseros:", error);

        return NextResponse.json(
            {
                error: error instanceof Error
                    ? error.message
                    : "No fue posible procesar el pedido.",
            },
            { status: 400 }
        );
    }
}
