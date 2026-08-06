import { Restaurant } from "@/types/restaurant";
import { RestaurantHour } from "@/types/restaurant-hour";

import { isRestaurantOpen } from "@/lib/utils/isRestaurantOpen";

interface SmartHeaderProps {
    restaurant: Restaurant;
    hours?: RestaurantHour[];
}

export default function SmartHeader({
    restaurant,
    hours,
}: SmartHeaderProps) {

    const open =
        isRestaurantOpen(hours ?? []);

    return (

        <section className="rounded-3xl bg-white p-6 shadow-sm">

            <div className="flex items-center gap-4">

                <img
                    src={restaurant.logo}
                    alt={restaurant.name}
                    className="h-20 w-20 rounded-2xl object-cover"
                />

                <div className="flex-1">

                    <h1 className="text-2xl font-bold">
                        {restaurant.name}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Smart Panel
                    </p>

                    <div className="mt-3">

                        <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${open
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            {open
                                ? "🟢 Restaurante Abierto"
                                : "🔴 Restaurante Cerrado"}
                        </span>

                    </div>

                </div>

            </div>

        </section>

    );

}