import { supabase } from "@/lib/supabase";
import { RestaurantHour } from "@/types/restaurant-hour";

export async function createRestaurantHours(
    restaurantId: string,
    hours: RestaurantHour[]
) {
    const records = hours.map((hour) => ({
        restaurant_id: restaurantId,
        day_of_week: hour.dayOfWeek,
        is_open: hour.isOpen,
        open_time: hour.isOpen ? hour.openTime : null,
        close_time: hour.isOpen ? hour.closeTime : null,
    }));

    const { data, error } = await supabase
        .from("restaurant_hours")
        .insert(records)
        .select();

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

    return data;
}

export async function getRestaurantHours(restaurantId: string) {
    const { data, error } = await supabase
        .from("restaurant_hours")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("day_of_week", { ascending: true });

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

    return data;
}

export async function updateRestaurantHours(
    restaurantId: string,
    hours: RestaurantHour[]
) {
    const { error: deleteError } = await supabase
        .from("restaurant_hours")
        .delete()
        .eq("restaurant_id", restaurantId);

    if (deleteError) {
        console.error("SUPABASE ERROR:", deleteError);
        throw new Error(deleteError.message);
    }

    return createRestaurantHours(restaurantId, hours);
}