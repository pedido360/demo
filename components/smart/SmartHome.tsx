import { Package, FolderOpen, Clock3 } from "lucide-react";

import { Restaurant } from "@/types/restaurant";
import { RestaurantHour } from "@/types/restaurant-hour";

import SmartHeader from "./SmartHeader";
import SmartCard from "./SmartCard";
import SmartSupport from "./SmartSupport";

interface SmartHomeProps {
    restaurant: Restaurant;
    hours?: RestaurantHour[];
}

export default function SmartHome({
    restaurant,
    hours,
}: SmartHomeProps) {

    return (

        <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 bg-gray-50 p-5">

            <SmartHeader
                restaurant={restaurant}
                hours={hours}
            />

            <SmartCard
                title="Productos"
                description="Agrega, edita o pausa productos."
                icon={<Package size={28} />}
                href="/smart/products"
            />

            <SmartCard
                title="Categorías"
                description="Organiza tu menú."
                icon={<FolderOpen size={28} />}
                href="/smart/categories"
            />

            <SmartCard
                title="Horarios"
                description="Configura los horarios del restaurante."
                icon={<Clock3 size={28} />}
                href="/smart/hours"
            />

            <div className="pt-4">
                <SmartSupport />
            </div>

        </div>

    );

}