"use server";

import {
    getDailyMenuById,
    updateDailyMenu,
} from "@/lib/repositories/daily-menu.repository";

import {
    getRestaurantById,
} from "@/lib/repositories/restaurant.repository";

import {
    generateDailyMenuImage,
} from "@/lib/services/daily-menu-image.service";

import {
    updateProductImage,
} from "@/lib/repositories/product.repository";


export async function generateDailyMenuImageAction(
    restaurantId: string,
    menuId: string
): Promise<void> {

    const menu =
        await getDailyMenuById(
            menuId
        );


    if (
        menu.restaurantId !==
        restaurantId
    ) {

        throw new Error(
            "El menú no pertenece al restaurante."
        );

    }


    const restaurant =
        await getRestaurantById(
            restaurantId
        );


    const imageUrl =
        await generateDailyMenuImage(
            restaurant,
            menu
        );


    /*
     * Cache busting.
     *
     * La imagen se genera nuevamente sobre la misma
     * ruta de Supabase. Agregamos una versión única
     * para evitar que navegador/CDN siga mostrando
     * la imagen anterior.
     */

    const versionedImageUrl =
        `${imageUrl}?v=${Date.now()}`;


    await updateProductImage(
        menu.menuProductId,
        versionedImageUrl
    );


    await updateDailyMenu(
        menu.id,
        menu.menuDate,
        menu.isPublished,
        versionedImageUrl
    );

}
