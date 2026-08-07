import SmartHeader from "@/components/smart/SmartHeader";
import SmartSupport from "@/components/smart/SmartSupport";

import SmartMenu from "@/components/admin/smart-menu/SmartMenu";
import RestaurantHoursPanel from "@/components/restaurant/RestaurantHoursPanel";

import { getCurrentRestaurantId } from "@/lib/server/current-restaurant";
import { getCurrentProfile } from "@/lib/server/current-profile";

import { loadRestaurantDashboard } from "@/lib/services/restaurant-dashboard.service";

export default async function RestaurantPage() {

    const restaurantId =
        await getCurrentRestaurantId();

    const profile =
        await getCurrentProfile();

    const {
        restaurant,
        categories,
        products,
        hours,
    } = await loadRestaurantDashboard(
        restaurantId
    );

    return (

        <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 bg-gray-50 p-6">

            <SmartHeader
                restaurant={restaurant}
                hours={hours}
                adminName={profile?.full_name}
                adminEmail={profile?.email}
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

        </div>

    );

}