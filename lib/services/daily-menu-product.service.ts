import { Product } from "@/types/product";
import { Category } from "@/types/category";

import {
    getProducts,
    createProduct,
} from "@/lib/repositories/product.repository";

import {
    getCategories,
    createCategory,
} from "@/lib/repositories/category.repository";


const DAILY_MENU_PRODUCT_NAME =
    "Menú del Día";

const DAILY_MENU_CATEGORY_NAME =
    "Menú del Día";


/**
 * Busca la categoría especial
 * Menú del Día de un restaurante.
 */
async function getDailyMenuCategory(
    restaurantId: string
): Promise<Category | null> {

    const categories =
        await getCategories(
            restaurantId
        );

    return (
        categories.find(
            category =>
                category.name
                    .trim()
                    .toLowerCase() ===
                DAILY_MENU_CATEGORY_NAME
                    .toLowerCase()
        ) ?? null
    );

}


/**
 * Obtiene la categoría Menú del Día.
 *
 * Si todavía no existe, la crea.
 */
async function getOrCreateDailyMenuCategory(
    restaurantId: string
): Promise<Category> {

    const existing =
        await getDailyMenuCategory(
            restaurantId
        );

    if (existing) {

        return existing;

    }


    const category: Category = {

        id: "",

        name:
            DAILY_MENU_CATEGORY_NAME,

        description:
            "Menú especial disponible por día.",

        emoji:
            "🍽️",

        isActive:
            true,

    };


    return createCategory(
        restaurantId,
        category
    );

}


/**
 * Busca el producto especial
 * Menú del Día de un restaurante.
 */
export async function getDailyMenuProduct(
    restaurantId: string
): Promise<Product | null> {

    const products =
        await getProducts(
            restaurantId
        );

    return (
        products.find(
            product =>
                product.productType ===
                "daily_menu"
        ) ?? null
    );

}


/**
 * Obtiene el producto Menú del Día.
 *
 * Si la categoría o el producto
 * todavía no existen, los crea.
 */
export async function getOrCreateDailyMenuProduct(
    restaurantId: string
): Promise<Product> {

    const category =
        await getOrCreateDailyMenuCategory(
            restaurantId
        );


    const products =
        await getProducts(
            restaurantId
        );


    const existing =
        products.find(
            product =>
                product.productType ===
                "daily_menu"
        );


    if (existing) {

        return existing;

    }


    const product: Product = {

        id: "",

        categoryId:
            category.id,

        name:
            DAILY_MENU_PRODUCT_NAME,

        productType:
            "daily_menu",

        description:
            "Menú especial del día. Selecciona las opciones disponibles.",

        price:
            0,

        image:
            "/images/daily-menu.png",

        featured:
            true,

        isAvailable:
            true,

        ingredients:
            [],

        extras:
            [],

        variants:
            [],

    };


    return createProduct(
        restaurantId,
        category.id,
        product
    );

}