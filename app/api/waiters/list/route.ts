import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
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

        const requestedRestaurantId =
            request.nextUrl.searchParams.get("restaurantId");

        let restaurantId: string;

        if (profile.role === "super_admin") {
            restaurantId = requestedRestaurantId?.trim() || "";

            if (!restaurantId) {
                return NextResponse.json(
                    { success: false, message: "Debes seleccionar un restaurante." },
                    { status: 400 }
                );
            }
        } else {
            if (!profile.restaurant_id) {
                return NextResponse.json(
                    { success: false, message: "Tu cuenta no tiene restaurante asignado." },
                    { status: 403 }
                );
            }

            if (
                requestedRestaurantId &&
                requestedRestaurantId !== profile.restaurant_id
            ) {
                return NextResponse.json(
                    { success: false, message: "No puedes consultar otro restaurante." },
                    { status: 403 }
                );
            }

            restaurantId = profile.restaurant_id;
        }

        const { data: accounts, error: accountsError } =
            await supabaseAdmin
                .from("waiter_accounts")
                .select("id, profile_id, restaurant_id, username, status, created_at")
                .eq("restaurant_id", restaurantId)
                .order("created_at", { ascending: false });

        if (accountsError) {
            throw new Error(accountsError.message);
        }

        const profileIds = (accounts ?? []).map(
            (account) => account.profile_id
        );

        let profiles: Array<{
            id: string;
            full_name: string | null;
        }> = [];

        if (profileIds.length > 0) {
            const { data, error } = await supabaseAdmin
                .from("profiles")
                .select("id, full_name")
                .in("id", profileIds);

            if (error) {
                throw new Error(error.message);
            }

            profiles = data ?? [];
        }

        const profileMap = new Map(
            profiles.map((item) => [item.id, item.full_name])
        );

        const waiters = (accounts ?? []).map((account) => ({
            id: account.id,
            profileId: account.profile_id,
            fullName: profileMap.get(account.profile_id) ?? "Sin nombre",
            username: account.username,
            status: account.status,
            createdAt: account.created_at,
        }));

        return NextResponse.json({
            success: true,
            waiters,
        });
    } catch (error) {
        console.error("Error consultando meseros:", error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error desconocido al consultar meseros.",
            },
            { status: 500 }
        );
    }
}
