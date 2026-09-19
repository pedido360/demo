import { createClient } from "@/lib/supabase/client";

export type RestaurantMetricEvent =
    | "menu_view"
    | "whatsapp_order";

export async function recordRestaurantMetric(
    restaurantId: string,
    eventType: RestaurantMetricEvent
): Promise<void> {

    if (!restaurantId) {
        return;
    }

    const supabase =
        createClient();

    const { error } =
        await supabase
            .from("restaurant_metrics")
            .insert({
                restaurant_id: restaurantId,
                event_type: eventType,
            });

    if (error) {
        console.error(
            "Error registrando métrica del restaurante:",
            error
        );
    }
}

export interface RestaurantMetricsSummary {
    menuViews: number;
    whatsappOrders: number;
}

export async function getRestaurantMetrics(
    restaurantId: string
): Promise<RestaurantMetricsSummary> {

    if (!restaurantId) {
        return {
            menuViews: 0,
            whatsappOrders: 0,
        };
    }

    const supabase =
        createClient();

    const { data, error } =
        await supabase
            .from("restaurant_metrics")
            .select("event_type")
            .eq("restaurant_id", restaurantId);

    if (error) {
        console.error(
            "Error obteniendo métricas del restaurante:",
            error
        );

        return {
            menuViews: 0,
            whatsappOrders: 0,
        };
    }

    const menuViews =
        data?.filter(
            (item) =>
                item.event_type === "menu_view"
        ).length ?? 0;

    const whatsappOrders =
        data?.filter(
            (item) =>
                item.event_type === "whatsapp_order"
        ).length ?? 0;

    return {
        menuViews,
        whatsappOrders,
    };
}

export async function getRestaurantsMetrics(
    restaurantIds: string[]
): Promise<Record<string, RestaurantMetricsSummary>> {

    if (restaurantIds.length === 0) {
        return {};
    }

    const supabase =
        createClient();

    const { data, error } =
        await supabase
            .from("restaurant_metrics")
            .select("restaurant_id, event_type")
            .in("restaurant_id", restaurantIds);

    if (error) {
        console.error(
            "Error obteniendo métricas de restaurantes:",
            error
        );

        return {};
    }

    const result: Record<
        string,
        RestaurantMetricsSummary
    > = {};

    restaurantIds.forEach((restaurantId) => {
        result[restaurantId] = {
            menuViews: 0,
            whatsappOrders: 0,
        };
    });

    data?.forEach((item) => {

        const metrics =
            result[item.restaurant_id];

        if (!metrics) {
            return;
        }

        if (
            item.event_type ===
            "menu_view"
        ) {
            metrics.menuViews += 1;
        }

        if (
            item.event_type ===
            "whatsapp_order"
        ) {
            metrics.whatsappOrders += 1;
        }
    });

    return result;
}
