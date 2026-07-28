import { supabase } from "@/lib/supabase";
import { Restaurant } from "@/types/restaurant";

function mapRestaurant(data: any): Restaurant {
    return {
        id: data.id,
        slug: data.slug,

        name: data.name,
        description: data.description,

        logo: data.logo,
        banner: data.banner,

        whatsapp: data.whatsapp,

        address: data.address,
        city: data.city,

        isOpen: data.is_open,

        rating: data.rating,

        categories: data.categories ?? [],

        status: data.status,

        pauseReason: data.pause_reason,

        pausedAt: data.paused_at,
    };
}

export async function createRestaurant(
    restaurant: Restaurant
): Promise<Restaurant> {
    const slug = restaurant.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase
        .from("restaurants")
        .insert({
            slug,

            name: restaurant.name,
            description: restaurant.description,

            logo: restaurant.logo,
            banner: restaurant.banner,

            whatsapp: restaurant.whatsapp,

            address: restaurant.address,
            city: restaurant.city,

            is_open: restaurant.isOpen,
            rating: restaurant.rating,

            status: restaurant.status,
            pause_reason: restaurant.pauseReason,
            paused_at: restaurant.pausedAt,
        })
        .select()
        .single();

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

    return mapRestaurant(data);
}

export async function getRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

    return (data ?? []).map(mapRestaurant);
}

export async function getRestaurantById(
    id: string
): Promise<Restaurant> {
    const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

    return mapRestaurant(data);
}

export async function updateRestaurant(
    id: string,
    restaurant: Restaurant
): Promise<Restaurant> {
    const slug = restaurant.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase
        .from("restaurants")
        .update({
            slug,

            name: restaurant.name,
            description: restaurant.description,

            logo: restaurant.logo,
            banner: restaurant.banner,

            whatsapp: restaurant.whatsapp,

            address: restaurant.address,
            city: restaurant.city,

            is_open: restaurant.isOpen,
            rating: restaurant.rating,

            status: restaurant.status,
            pause_reason: restaurant.pauseReason,
            paused_at: restaurant.pausedAt,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

    return mapRestaurant(data);
}

export async function deleteRestaurant(
    id: string
): Promise<void> {
    const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }
}

/**
 * Suspende temporalmente un restaurante.
 */
export async function pauseRestaurant(
    id: string,
    reason?: string
): Promise<void> {
    const { error } = await supabase
        .from("restaurants")
        .update({
            status: "paused",
            pause_reason: reason ?? null,
            paused_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }
}

/**
 * Reactiva un restaurante suspendido.
 */
export async function resumeRestaurant(
    id: string
): Promise<void> {
    const { error } = await supabase
        .from("restaurants")
        .update({
            status: "active",
            pause_reason: null,
            paused_at: null,
        })
        .eq("id", id);

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }
}