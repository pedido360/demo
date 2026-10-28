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
    const normalizedHours = hours.map(hour => ({
        id: hour.id,
        productId,
        dayOfWeek: Number(hour.dayOfWeek),
        startTime: hour.startTime,
        endTime: hour.endTime,
    }));

    const isValidTime = (value: string) =>
        /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/.test(value);

    for (const hour of normalizedHours) {
        if (
            !Number.isInteger(hour.dayOfWeek) ||
            hour.dayOfWeek < 0 ||
            hour.dayOfWeek > 6 ||
            !isValidTime(hour.startTime) ||
            !isValidTime(hour.endTime) ||
            hour.startTime >= hour.endTime
        ) {
            throw new Error(
                "Hay un horario inválido. No se modificó la disponibilidad."
            );
        }
    }

    const days = normalizedHours.map(hour => hour.dayOfWeek);
    if (new Set(days).size !== days.length) {
        throw new Error(
            "Hay más de un horario para el mismo día. No se modificó la disponibilidad."
        );
    }

    const uniqueByDay =
        Array.from(
            new Map(
                normalizedHours.map(hour => [hour.dayOfWeek, hour])
            ).values()
        ).sort(
            (a, b) => a.dayOfWeek - b.dayOfWeek
        );

    if (hours.length > 0 && uniqueByDay.length === 0) {
        throw new Error(
            "No se guardaron horarios: todos los horarios recibidos son inválidos."
        );
    }

    const { data, error } = await supabase.rpc(
        "replace_product_available_hours",
        {
            p_product_id: productId,
            p_hours: uniqueByDay.map(hour => ({
                day_of_week: hour.dayOfWeek,
                start_time: hour.startTime.slice(0, 5),
                end_time: hour.endTime.slice(0, 5),
            })),
        }
    );

    if (error) {
        console.error("replace_product_available_hours RPC error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw new Error(error.message);
    }

    const rows = (data ?? []) as {
        id: string;
        product_id: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
    }[];

    return rows.map(row => ({
        id: row.id,
        productId: row.product_id,
        dayOfWeek: Number(row.day_of_week),
        startTime: row.start_time,
        endTime: row.end_time,
    }));
}
