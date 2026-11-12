import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProductsWithClient } from "@/lib/repositories/product.repository";

import { getRestaurantDailyMenuClientWithSupabase } from "@/lib/services/daily-menu.service";
import { getColombiaDate } from "@/lib/utils/getColombiaDate";
import { RestaurantPageData } from "@/types/restaurant-page";
import WaiterMenu from "@/components/waiter/WaiterMenu";

export default async function WaiterPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/mesero/login");
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, full_name, restaurant_id")
        .eq("id", user.id)
        .single();

    if (
        profileError ||
        !profile ||
        profile.role !== "waiter" ||
        !profile.restaurant_id
    ) {
        redirect("/mesero/login");
    }

    const { data: account, error: accountError } = await supabaseAdmin
        .from("waiter_accounts")
        .select("id, restaurant_id, status")
        .eq("profile_id", user.id)
        .eq("restaurant_id", profile.restaurant_id)
        .maybeSingle();

    if (
        accountError ||
        !account ||
        account.status !== "active"
    ) {
        redirect("/mesero/login?error=inactive");
    }

    const [restaurant, categories, allProducts, dailyMenu] = await Promise.all([
        supabase
            .from("restaurants")
            .select("*")
            .eq("id", account.restaurant_id)
            .single()
            .then(({ data, error }) => {
                if (error) throw error;
                return data;
            }),
        supabase
            .from("categories")
            .select("*")
            .eq("restaurant_id", account.restaurant_id)
            .order("sort_order", { ascending: true })
            .then(({ data, error }) => {
                if (error) throw error;
                return (data || []).map(category => ({
                    ...category,
                    isActive: category.is_active,
                    emoji: category.emoji || "🍽️",
                }));
            }),
        getProductsWithClient(supabase, account.restaurant_id),
        getRestaurantDailyMenuClientWithSupabase(supabase, account.restaurant_id, getColombiaDate()),
    ]);

    console.log("[MESERO] Productos recibidos:", allProducts.length);
    console.log("[MESERO] Productos disponibles:", allProducts.filter(product => product.isAvailable).length);
    console.log("[MESERO] Categorías recibidas:", categories.length);

    const data: RestaurantPageData = {
        restaurant,
        categories,
        products: allProducts.filter(product => product.isAvailable),
        dailyMenu,
    };

    return (
        <WaiterMenu
            data={data}
            waiterName={profile.full_name || "Mesero"}
            waiterAccountId={account.id}
        />
    );
}
