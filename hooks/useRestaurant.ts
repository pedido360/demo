"use client";

import { useEffect, useState } from "react";

import { Restaurant } from "@/types/restaurant";
import { RestaurantHour } from "@/types/restaurant-hour";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

import {
    getRestaurantById,
} from "@/lib/repositories/restaurant.repository";

import {
    getRestaurantHours,
} from "@/lib/repositories/restaurant-hours.repository";

import {
    getCategories,
} from "@/lib/repositories/category.repository";

import {
    getProducts,
} from "@/lib/repositories/product.repository";

interface UseRestaurantReturn {

    loading: boolean;

    restaurant: Restaurant | null;

    hours: RestaurantHour[];

    categories: Category[];

    products: Product[];

    reload: () => Promise<void>;

}

export function useRestaurant(
    restaurantId?: string
): UseRestaurantReturn {

    const [loading, setLoading] =
        useState(true);

    const [restaurant, setRestaurant] =
        useState<Restaurant | null>(null);

    const [hours, setHours] =
        useState<RestaurantHour[]>([]);

    const [categories, setCategories] =
        useState<Category[]>([]);

    const [products, setProducts] =
        useState<Product[]>([]);

    async function reload() {

        if (!restaurantId) {

            setLoading(false);
            return;

        }

        try {

            setLoading(true);

            const restaurantData =
                await getRestaurantById(restaurantId);

            const hoursData =
                await getRestaurantHours(restaurantId);

            const categoriesData =
                await getCategories(restaurantId);

            const productsData =
                await getProducts(restaurantId);

            setRestaurant(restaurantData);

            setHours(hoursData);

            setCategories(categoriesData);

            setProducts(productsData);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        reload();

    }, [restaurantId]);

    return {

        loading,

        restaurant,

        hours,

        categories,

        products,

        reload,

    };

}