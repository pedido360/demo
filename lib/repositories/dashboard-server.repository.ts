import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface RestaurantMetricsSummary {
    menuViews: number;
    whatsappOrders: number;
}

export async function getRestaurantMetricsForDashboard(
    restaurantId: string
): Promise<RestaurantMetricsSummary> {
    if (!restaurantId) {
        return { menuViews: 0, whatsappOrders: 0 };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("restaurant_metrics")
        .select("event_type")
        .eq("restaurant_id", restaurantId);

    if (error) {
        console.error("Error obteniendo métricas del dashboard:", error);
        return { menuViews: 0, whatsappOrders: 0 };
    }

    return {
        menuViews: data?.filter(item => item.event_type === "menu_view").length ?? 0,
        whatsappOrders: data?.filter(item => item.event_type === "whatsapp_order").length ?? 0,
    };
}

export async function getPendingOrdersCountForDashboard(
    restaurantId: string
): Promise<number> {
    if (!restaurantId) return 0;

    const supabase = await createClient();

    const { count, error } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .eq("status", "pending");

    if (error) {
        console.error("Error contando pedidos pendientes del dashboard:", error);
        throw new Error(error.message);
    }

    return count ?? 0;
}
