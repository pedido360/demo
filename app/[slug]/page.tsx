import type { Metadata } from "next";
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

import {
    getRestaurantHours,
} from "@/lib/repositories/restaurant-hours.repository";

interface RestaurantPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({
    params,
}: RestaurantPageProps): Promise<Metadata> {

    try {

        const { slug } = await params;

        const restaurant =
            await getRestaurantBySlug(slug);

        const image = restaurant.logo?.trim()
            ? restaurant.logo
            : "https://pedidos360.shop/logo-demo.png";

        const url =
            `https://pedidos360.shop/${slug}`;

        return {

            metadataBase:
                new URL("https://pedidos360.shop"),

            title:
                `${restaurant.name} | Pedidos360`,

            description:
                restaurant.description,

            openGraph: {

                title:
                    `${restaurant.name} | Pedidos360`,

                description:
                    restaurant.description,

                url,

                siteName:
                    "Pedidos360",

                locale:
                    "es_CO",

                type:
                    "website",

                images: [
                    {
                        url: image,
                        width: 512,
                        height: 512,
                        alt: restaurant.name,
                    },
                ],

            },

            twitter: {

                card:
                    "summary_large_image",

                title:
                    `${restaurant.name} | Pedidos360`,

                description:
                    restaurant.description,

                images: [
                    image,
                ],

            },

        };

    } catch {

        return {

            metadataBase:
                new URL("https://pedidos360.shop"),

            title:
                "Pedidos360",

            description:
                "Haz tu pedido en línea.",

        };

    }

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

        const availableProducts =
            products.filter(
                product => product.isAvailable
            );

        const hours =
            await getRestaurantHours(
                restaurant.id
            );

        const data: RestaurantPageData = {

            restaurant,

            categories,

            products:
                availableProducts,

            hours,

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