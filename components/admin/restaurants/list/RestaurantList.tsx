"use client";

import { Store } from "lucide-react";

import EmptyState from "@/components/ui/feedback/EmptyState";

import RestaurantCard from "./RestaurantCard";

import { Restaurant } from "@/types/restaurant";

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
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                />
            ))}
        </div>
    );
}