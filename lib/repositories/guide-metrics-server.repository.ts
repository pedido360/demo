import { createClient } from "@/lib/supabase/server";

export interface GuideMetricsSummary {
    guideViews: number;
    restaurantViews: Record<string, number>;
}

export interface GuideMetricsPeriod {
    from?: string;
    to?: string;
}

export async function getGuideMetrics(period: GuideMetricsPeriod = {}): Promise<GuideMetricsSummary> {

    const supabase =
        await createClient();

    let query = supabase
        .from("guide_metrics")
        .select("event_type, restaurant_name");

    if (period.from) query = query.gte("created_at", period.from);
    if (period.to) query = query.lt("created_at", period.to);

    const { data, error } = await query;

    if (error) {
        console.error(
            "Error obteniendo métricas de Boquisabrosa:",
            error
        );

        return {
            guideViews: 0,
            restaurantViews: {},
        };
    }

    let guideViews = 0;

    const restaurantViews: Record<
        string,
        number
    > = {};

    data?.forEach((item) => {

        if (
            item.event_type ===
            "guide_view"
        ) {
            guideViews += 1;
        }

        if (
            item.event_type ===
                "restaurant_view" &&
            item.restaurant_name
        ) {
            restaurantViews[item.restaurant_name] =
                (restaurantViews[item.restaurant_name] ?? 0) + 1;
        }
    });

    return {
        guideViews,
        restaurantViews,
    };
}
