import { createClient } from "@/lib/supabase/server";

import {
    getRestaurantById,
} from "@/lib/repositories/restaurant.repository";

import {
    getRestaurantHours,
} from "@/lib/repositories/restaurant-hours.repository";

import {
    getCategories,
} from "@/lib/repositories/category.repository";

import {
    getProducts,
} from "@/lib/repositories/product.repository";

export async function getAuthenticatedRestaurant() {

    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error("Usuario no autenticado.");
    }

    const { data: profile, error: profileError } =
        await supabase
            .from("profiles")
            .select("restaurant_id, role")
            .eq("id", user.id)
            .single();

    if (profileError || !profile) {
        throw new Error("Perfil no encontrado.");
    }

    if (profile.role !== "restaurant_admin") {
        throw new Error("Acceso denegado.");
    }

    const restaurantId = profile.restaurant_id;

    if (!restaurantId) {
        throw new Error("El usuario no tiene un restaurante asociado.");
    }

    const [
        restaurant,
        hours,
        categories,
        products,
    ] = await Promise.all([
        getRestaurantById(restaurantId),
        getRestaurantHours(restaurantId),
        getCategories(restaurantId),
        getProducts(restaurantId),
    ]);

    return {
        restaurant,
        hours,
        categories,
        products,
    };
}