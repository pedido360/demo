import { Category } from "@/types/category";
import { Product } from "@/types/product";
import {
    MenuCategory,
    MenuStats,
} from "@/types/menu";

export function buildMenu(
    categories: Category[],
    products: Product[]
): MenuCategory[] {

    return categories.map((category) => ({

        category,

        products: products
            .filter(
                (product) =>
                    product.categoryId === category.id
            )
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            ),

    }));

}

export function buildMenuStats(
    products: Product[]
): MenuStats {

    return {

        totalCategories: 0,

        totalProducts: products.length,

        activeProducts:
            products.filter(
                (product) => product.isAvailable
            ).length,

        pausedProducts:
            products.filter(
                (product) => !product.isAvailable
            ).length,

        productsWithoutImage:
            products.filter(
                (product) => !product.image
            ).length,

        productsWithoutIngredients:
            products.filter(
                (product) =>
                    (product.ingredients?.length ?? 0) === 0
            ).length,

        productsWithoutExtras:
            products.filter(
                (product) =>
                    (product.extras?.length ?? 0) === 0
            ).length,

    };

}