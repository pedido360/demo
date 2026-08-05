import { Restaurant } from "@/types/restaurant";
import { RestaurantHour } from "@/types/restaurant-hour";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

import {
    createRestaurant,
} from "@/lib/repositories/restaurant.repository";

import {
    createRestaurantHours,
} from "@/lib/repositories/restaurant-hours.repository";

import {
    createCategory,
} from "@/lib/repositories/category.repository";

import {
    createIngredient,
} from "@/lib/repositories/ingredient.repository";

import {
    createExtra,
} from "@/lib/repositories/extra.repository";

import {
    createProduct,
} from "@/lib/repositories/product.repository";

import { uploadImage } from "@/lib/repositories/storage.repository";

import { generateSlug } from "@/lib/utils/slug";

interface CreateRestaurantData {
    restaurant: Restaurant;
    hours: RestaurantHour[];
    categories: Category[];
    products: Product[];
}

export async function createCompleteRestaurant({
    restaurant,
    hours,
    categories,
    products,
}: CreateRestaurantData) {

    console.log("=== RestaurantService ===");
    console.log("Productos recibidos:", products.length);
    console.log(products);

    // 1. Crear restaurante
    const savedRestaurant =
        await createRestaurant(restaurant);

    // 2. Crear horarios
    await createRestaurantHours(
        savedRestaurant.id,
        hours
    );

    // 3. Crear categorías
    const categoryMap = new Map<string, string>();

    for (const category of categories) {

        const savedCategory =
            await createCategory(
                savedRestaurant.id,
                category
            );

        categoryMap.set(
            category.id,
            savedCategory.id
        );
    }

    // 4. Crear productos
    for (const product of products) {

        console.log("Creando producto:", product.name);

        const categoryId =
            categoryMap.get(product.categoryId);

        if (!categoryId) {
            continue;
        }

        if (product.imageFile) {

            const extension =
                product.imageFile.name
                    .split(".")
                    .pop()
                    ?.toLowerCase() ?? "jpg";

            const filename =
                `${Date.now()}-${generateSlug(product.name)}.${extension}`;

            product.image =
                await uploadImage(
                    product.imageFile,
                    `restaurants/${savedRestaurant.slug}/products/${filename}`
                );

        }

        const savedProduct =
            await createProduct(
                savedRestaurant.id,
                categoryId,
                product
            );

        // Guardar ingredientes
        for (
            let index = 0;
            index < (product.ingredients?.length ?? 0);
            index++
        ) {

            await createIngredient(
                savedProduct.id,
                product.ingredients![index],
                index
            );

        }

        // Guardar extras
        for (
            let index = 0;
            index < (product.extras?.length ?? 0);
            index++
        ) {

            await createExtra(
                savedProduct.id,
                product.extras![index],
                index
            );

        }
    }

    return {
        restaurant: savedRestaurant,
        categoryMap,
    };
}