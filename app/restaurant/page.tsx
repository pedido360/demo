import SmartHeader from "@/components/smart/SmartHeader";
import SmartSupport from "@/components/smart/SmartSupport";
import { redirect } from "next/navigation";

import SmartMenu from "@/components/admin/smart-menu/SmartMenu";
import RestaurantHoursPanel from "@/components/restaurant/RestaurantHoursPanel";
import RestaurantDashboardOperations from "@/components/restaurant/RestaurantDashboardOperations";

import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import PrintingSettings from "@/components/admin/printing/PrintingSettings";

import { loadRestaurantDashboard } from "@/lib/services/restaurant-dashboard.service";

export default async function RestaurantPage() {

    const profile = await getCurrentProfile();

    if (!profile || profile.role !== "restaurant_admin" || !profile.restaurant_id) {
        redirect("/dashboard");
    }

    const restaurantId = profile.restaurant_id;

    const {
        restaurant,
        categories,
        products,
        hours,
    } = await loadRestaurantDashboard(
        restaurantId
    );

    return (

        <div className="flex min-h-screen w-full flex-col gap-6 bg-gray-50 px-4 py-5 sm:px-6 lg:px-8">

            <SmartHeader
                restaurant={restaurant}
                hours={hours}
                adminName={profile.full_name ?? undefined}
                adminEmail={profile?.email}
            />

            <RestaurantDashboardOperations
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
            />

            <SmartMenu
                restaurantId={restaurant.id}
                categories={categories}
                products={products}
            />

            <RestaurantHoursPanel
                restaurantId={restaurant.id}
                hours={hours}
            />


            <SmartSupport />

            <PrintingSettings />

        </div>

    );

}