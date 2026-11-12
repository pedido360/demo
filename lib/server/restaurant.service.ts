import { createClient } from "@/lib/supabase/server";
import { getProductsWithClient } from "@/lib/repositories/product.repository";
import { getCategoryEmoji } from "@/lib/getCategoryEmoji";

export async function getAuthenticatedRestaurant() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error("Usuario no autenticado.");
    }

    const { data: profile, error: profileError } = await supabase
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
        restaurantResult,
        hoursResult,
        categoriesResult,
        products,
    ] = await Promise.all([
        supabase
            .from("restaurants")
            .select("*")
            .eq("id", restaurantId)
            .single(),

        supabase
            .from("restaurant_hours")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .order("day_of_week", { ascending: true }),

        supabase
            .from("categories")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .order("sort_order", { ascending: true }),

        getProductsWithClient(supabase, restaurantId),
    ]);

    if (restaurantResult.error) throw restaurantResult.error;
    if (hoursResult.error) throw hoursResult.error;
    if (categoriesResult.error) throw categoriesResult.error;

    const data = restaurantResult.data;

    const restaurant = {
        id: data.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        logo: data.logo,
        banner: data.banner,
        whatsapp: data.whatsapp,
        address: data.address,
        neighborhood: data.neighborhood ?? undefined,
        city: data.city,
        department: data.department,
        isOpen: data.is_open,
        rating: data.rating,
        categories: data.categories ?? [],
        status: data.status,
        pauseReason: data.pause_reason,
        pausedAt: data.paused_at,
    };

    const hours = (hoursResult.data ?? []).map((hour) => ({
        id: hour.id,
        restaurantId: hour.restaurant_id,
        dayOfWeek: hour.day_of_week,
        isOpen: hour.is_open,
        openTime: hour.open_time ?? "",
        closeTime: hour.close_time ?? "",
    }));

    const categories = (categoriesResult.data ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        description: "",
        emoji: getCategoryEmoji(category.name),
        isActive: category.is_active,
    }));

    return {
        restaurant,
        hours,
        categories,
        products,
    };
}
