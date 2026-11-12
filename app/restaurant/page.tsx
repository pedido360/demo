import SmartHeader from "@/components/smart/SmartHeader";
import SmartSupport from "@/components/smart/SmartSupport";
import { redirect } from "next/navigation";

import SmartMenu from "@/components/admin/smart-menu/SmartMenu";
import RestaurantHoursPanel from "@/components/restaurant/RestaurantHoursPanel";
import PendingOrders from "@/components/restaurant/PendingOrders";

import WaiterManagement from "@/components/admin/waiters/WaiterManagement";
import RestaurantAccounts from "@/components/restaurant/RestaurantAccounts";
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

        <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 bg-gray-50 p-6">

            <SmartHeader
                restaurant={restaurant}
                hours={hours}
                adminName={profile.full_name ?? undefined}
                adminEmail={profile?.email}
            />

            <PendingOrders
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
            />

            <section className="mt-8">
                <WaiterManagement
                    restaurants={[{ id: restaurant.id, name: restaurant.name }]}
                    initialRestaurantId={restaurant.id}
                    isSuperAdmin={false}
                />
            </section>

            <RestaurantAccounts />

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