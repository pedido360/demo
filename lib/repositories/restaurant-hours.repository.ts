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

export async function getRestaurantHours(
    restaurantId: string
): Promise<RestaurantHour[]> {

    const { data, error } = await supabase
        .from("restaurant_hours")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("day_of_week", {
            ascending: true,
        });

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

    return (data ?? []).map((hour) => ({
        id: hour.id,
        restaurantId: hour.restaurant_id,
        dayOfWeek: hour.day_of_week,
        isOpen: hour.is_open,
        openTime: hour.open_time ?? "",
        closeTime: hour.close_time ?? "",
    }));

}

export async function updateRestaurantHours(
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

    const { error } = await supabase
        .from("restaurant_hours")
        .upsert(
            records,
            {
                onConflict:
                    "restaurant_id,day_of_week",
            }
        );

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

}