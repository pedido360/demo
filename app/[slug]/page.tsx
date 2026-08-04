import { notFound } from "next/navigation";

import RestaurantApp from "@/components/restaurant/RestaurantApp";

import { RestaurantPageData } from "@/types/restaurant-page";

import {
    getRestaurantBySlug,
} from "@/lib/repositories/restaurant.repository";

import {
    getCategories,
} from "@/lib/repositories/category.repository";

import {
    getProducts,
} from "@/lib/repositories/product.repository";

interface RestaurantPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function RestaurantPage({
    params,
}: RestaurantPageProps) {

    try {

        const { slug } = await params;

        const restaurant =
            await getRestaurantBySlug(slug);

        const categories =
            await getCategories(
                restaurant.id
            );

        const products =
            await getProducts(
                restaurant.id
            );

        const data: RestaurantPageData = {
            restaurant,
            categories,
            products,
        };

        return (
            <RestaurantApp
                data={data}
            />
        );

    } catch (error) {

        console.error(error);

        notFound();

    }

}