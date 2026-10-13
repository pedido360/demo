import { createClient } from "@/lib/supabase/server";

export interface GuideMetricsSummary {
    guideViews: number;
    restaurantViews: Record<string, number>;
    proposalViews: number;
    proposalInfoClicks: number;
    proposalWhatsappClicks: number;
    proposalGuideClicks: number;
}

export interface GuideMetricsPeriod {
    from?: string;
    to?: string;
}

export async function getGuideMetrics(
    period: GuideMetricsPeriod = {}
): Promise<GuideMetricsSummary> {
    const supabase = await createClient();

    let query = supabase
        .from("guide_metrics")
        .select("event_type, restaurant_name");

    if (period.from) query = query.gte("created_at", period.from);
    if (period.to) query = query.lt("created_at", period.to);

    const { data, error } = await query;

    if (error) {
        console.error("Error obteniendo métricas de Boquisabrosa:", error);

        return {
            guideViews: 0,
            restaurantViews: {},
            proposalViews: 0,
            proposalInfoClicks: 0,
            proposalWhatsappClicks: 0,
            proposalGuideClicks: 0,
        };
    }

    let guideViews = 0;
    let proposalViews = 0;
    let proposalInfoClicks = 0;
    let proposalWhatsappClicks = 0;
    let proposalGuideClicks = 0;

    const restaurantViews: Record<string, number> = {};

    data?.forEach((item) => {
        if (item.event_type === "guide_view") {
            guideViews += 1;
        }

        if (
            item.event_type === "restaurant_view" &&
            item.restaurant_name
        ) {
            restaurantViews[item.restaurant_name] =
                (restaurantViews[item.restaurant_name] ?? 0) + 1;
        }

        if (item.event_type === "proposal_view") {
            proposalViews += 1;
        }

        if (item.event_type === "proposal_info_click") {
            proposalInfoClicks += 1;
        }

        if (item.event_type === "proposal_whatsapp_click") {
            proposalWhatsappClicks += 1;
        }

        if (item.event_type === "proposal_guide_click") {
            proposalGuideClicks += 1;
        }
    });

    return {
        guideViews,
        restaurantViews,
        proposalViews,
        proposalInfoClicks,
        proposalWhatsappClicks,
        proposalGuideClicks,
    };
}
