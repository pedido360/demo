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

import {
    getRestaurantDailyMenuClient,
} from "@/lib/services/daily-menu.service";

import {
    getColombiaDate,
} from "@/lib/utils/getColombiaDate";

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
                        url: `https://pedidos360.shop/${slug}/opengraph-image`,
                        width: 1200,
                        height: 630,
                        alt: `${restaurant.name} | Pedidos360`,
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
                    `https://pedidos360.shop/${slug}/opengraph-image`,
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

        const [
            categories,
            products,
            hours,
            dailyMenu,
        ] = await Promise.all([

            getCategories(
                restaurant.id
            ),

            getProducts(
                restaurant.id
            ),

            getRestaurantHours(
                restaurant.id
            ),

            getRestaurantDailyMenuClient(
                restaurant.id,
                getColombiaDate()
            ),
        ]);

        const availableProducts =
            products.filter(
                (product) => product.isAvailable
            );

        const data: RestaurantPageData = {

            restaurant,

            categories,

            products:
                availableProducts,

            hours,

            dailyMenu,

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