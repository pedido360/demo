"use client";

import { useEffect, useState } from "react";
import { getRestaurants } from "@/lib/repositories/restaurant.repository";
import { Restaurant } from "@/types/restaurant";
import WaiterManagement from "./WaiterManagement";

export default function SuperAdminWaiterManagement() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        async function loadRestaurants() {
            try {
                const data = await getRestaurants();
                if (mounted) setRestaurants(data);
            } catch (err) {
                console.error("Error cargando restaurantes:", err);
                if (mounted) setError("No fue posible cargar los restaurantes.");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadRestaurants();

        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return <p className="text-sm text-gray-500">Cargando restaurantes...</p>;
    }

    if (error) {
        return <p className="text-sm text-red-600">{error}</p>;
    }

    return (
        <WaiterManagement
            restaurants={restaurants.map((restaurant) => ({
                id: restaurant.id,
                name: restaurant.name,
            }))}
            isSuperAdmin={true}
        />
    );
}
