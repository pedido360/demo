"use client";

"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";

import EmptyState from "@/components/ui/feedback/EmptyState";

import RestaurantCard from "./RestaurantCard";

import { Restaurant } from "@/types/restaurant";
import {
    getRestaurantsMetrics,
    RestaurantMetricsSummary,
} from "@/lib/repositories/restaurant-metrics.repository";

interface Props {
    restaurants: Restaurant[];
    onDelete?: (id: string) => void;
    onToggleStatus?: (restaurant: Restaurant) => void;
}

export default function RestaurantList({
    restaurants,
    onDelete,
    onToggleStatus,
}: Props) {
    const [metrics, setMetrics] = useState<
        Record<string, RestaurantMetricsSummary>
    >({});

    useEffect(() => {
        let cancelled = false;

        async function loadMetrics() {

            const restaurantIds =
                restaurants.map(
                    (restaurant) =>
                        restaurant.id
                );

            const result =
                await getRestaurantsMetrics(
                    restaurantIds
                );

            if (cancelled) {
                return;
            }

            setMetrics(result);
        }

        if (restaurants.length > 0) {
            loadMetrics();
        } else {
            setMetrics({});
        }

        return () => {
            cancelled = true;
        };
    }, [restaurants]);

    if (restaurants.length === 0) {
        return (
            <EmptyState
                icon={
                    <Store
                        size={48}
                        className="text-green-600"
                    />
                }
                title="No hay restaurantes"
                description="Crea tu primer restaurante para comenzar a administrar menús, categorías y productos."
            />
        );
    }

    return (
        <div className="grid gap-6">
            {restaurants.map((restaurant) => (
                <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    metrics={metrics[restaurant.id]}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                />
            ))}
        </div>
    );
}