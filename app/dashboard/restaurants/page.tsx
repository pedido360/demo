"use client";

import { useEffect, useState } from "react";

import { Plus } from "lucide-react";

import Card from "@/components/ui/Card";
import LinkButton from "@/components/ui/LinkButton";
import Loading from "@/components/ui/feedback/Loading";

import RestaurantList from "@/components/admin/restaurants/list/RestaurantList";

import {
    deleteRestaurant,
    getRestaurants,
    pauseRestaurant,
    resumeRestaurant,
} from "@/lib/repositories/restaurant.repository";

import { Restaurant } from "@/types/restaurant";

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadRestaurants() {
        try {
            setLoading(true);

            const data = await getRestaurants();

            setRestaurants(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRestaurants();
    }, []);

    async function handleDelete(id: string) {
        const confirmed = window.confirm(
            "¿Deseas eliminar este restaurante?"
        );

        if (!confirmed) return;

        try {
            await deleteRestaurant(id);

            await loadRestaurants();
        } catch (error) {
            console.error(error);
            alert("No fue posible eliminar el restaurante.");
        }
    }

    async function handleToggleStatus(
        restaurant: Restaurant
    ) {
        try {
            if (restaurant.status === "paused") {
                await resumeRestaurant(restaurant.id);
            } else {
                await pauseRestaurant(
                    restaurant.id,
                    "Cuenta suspendida temporalmente."
                );
            }

            await loadRestaurants();
        } catch (error) {
            console.error(error);
            alert("No fue posible actualizar el estado.");
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Restaurantes
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Administra todos los restaurantes de
                        Pedidos360.
                    </p>
                </div>

                <LinkButton
                    href="/dashboard/restaurants/new"
                    leftIcon={<Plus size={18} />}
                >
                    Nuevo restaurante
                </LinkButton>
            </div>

            <Card
                title="Restaurantes"
                description="Listado de restaurantes registrados."
            >
                {loading ? (
                    <Loading
                        title="Cargando restaurantes..."
                    />
                ) : (
                    <RestaurantList
                        restaurants={restaurants}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                    />
                )}
            </Card>
        </div>
    );
}