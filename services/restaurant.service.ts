import { createClient } from "@/lib/supabase/client";

import { Restaurant } from "@/types/restaurant";

const supabase = createClient();

/**
 * Obtiene todos los restaurantes.
 */
export async function getRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw error;
    }

    return data ?? [];
}

/**
 * Obtiene un restaurante por su ID.
 */
export async function getRestaurantById(
    id: string
): Promise<Restaurant | null> {
    const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return null;
    }

    return data;
}