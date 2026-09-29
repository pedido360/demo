import { supabase } from "@/lib/supabase";
import { ProductAvailableHour } from "@/types/product";

export async function getProductAvailableHours(
    productId: string
): Promise<ProductAvailableHour[]> {
    const { data, error } =
        await supabase
            .from("product_available_hours")
            .select("id, product_id, day_of_week, start_time, end_time")
            .eq("product_id", productId)
            .order("day_of_week", { ascending: true });

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return (data ?? []).map(row => ({
        id: row.id,
        productId: row.product_id,
        dayOfWeek: Number(row.day_of_week),
        startTime: row.start_time,
        endTime: row.end_time,
    }));
}

export async function replaceProductAvailableHours(
    productId: string,
    hours: ProductAvailableHour[]
): Promise<ProductAvailableHour[]> {
    const normalizedHours =
        hours
            .map(hour => ({
                id: hour.id,
                productId,
                dayOfWeek: Number(hour.dayOfWeek),
                startTime: hour.startTime,
                endTime: hour.endTime,
            }))
            .filter(
                hour =>
                    Number.isInteger(hour.dayOfWeek) &&
                    hour.dayOfWeek >= 0 &&
                    hour.dayOfWeek <= 6 &&
                    /^([01]\d|2[0-3]):[0-5]\d$/.test(hour.startTime) &&
                    /^([01]\d|2[0-3]):[0-5]\d$/.test(hour.endTime) &&
                    hour.startTime < hour.endTime
            );

    const uniqueByDay =
        Array.from(
            new Map(
                normalizedHours.map(hour => [hour.dayOfWeek, hour])
            ).values()
        ).sort(
            (a, b) => a.dayOfWeek - b.dayOfWeek
        );

    const { error: deleteError } =
        await supabase
            .from("product_available_hours")
            .delete()
            .eq("product_id", productId);

    if (deleteError) {
        console.error(deleteError);
        throw new Error(deleteError.message);
    }

    if (uniqueByDay.length === 0) {
        return [];
    }

    const rows = uniqueByDay.map(hour => ({
        product_id: productId,
        day_of_week: hour.dayOfWeek,
        start_time: hour.startTime,
        end_time: hour.endTime,
    }));

    const { data, error: insertError } =
        await supabase
            .from("product_available_hours")
            .insert(rows)
            .select(
                "id, product_id, day_of_week, start_time, end_time"
            );

    if (insertError) {
        console.error("product_available_hours INSERT error:", {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
        });

        throw new Error(insertError.message);
    }

    return (data ?? []).map(row => ({
        id: row.id,
        productId: row.product_id,
        dayOfWeek: Number(row.day_of_week),
        startTime: row.start_time,
        endTime: row.end_time,
    }));
}
