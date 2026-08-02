import { supabase } from "@/lib/supabase";

import { Product } from "@/types/product";

import {
    getIngredients,
} from "@/lib/repositories/ingredient.repository";

import {
    getExtras,
} from "@/lib/repositories/extra.repository";

function mapProduct(data: any): Product {
    return {
        id: data.id,

        categoryId: data.category_id,

        name: data.name,

        description: data.description ?? "",

        image: data.image ?? "",

        price: Number(data.price),

        featured: data.is_featured,

        isAvailable: data.is_available,

        ingredients: [],

        extras: [],
    };
}

export async function getProducts(
    restaurantId: string
): Promise<Product[]> {

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", {
            ascending: true,
        });

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    const products: Product[] = [];

    for (const row of data ?? []) {

        const product = mapProduct(row);

        product.ingredients =
            await getIngredients(product.id);

        product.extras =
            await getExtras(product.id);

        products.push(product);

    }

    return products;

}

export async function createProduct(
    restaurantId: string,
    categoryId: string,
    product: Product
): Promise<Product> {

    const { data, error } = await supabase
        .from("products")
        .insert({
            restaurant_id: restaurantId,

            category_id: categoryId,

            name: product.name,

            description: product.description,

            image: product.image,

            price: product.price,

            is_featured: product.featured,

            is_available: product.isAvailable,
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    const created = mapProduct(data);

    created.ingredients =
        product.ingredients ?? [];

    created.extras =
        product.extras ?? [];

    return created;

}

export async function updateProduct(
    product: Product
): Promise<Product> {

    const { data, error } = await supabase
        .from("products")
        .update({
            category_id: product.categoryId,

            name: product.name,

            description: product.description,

            image: product.image,

            price: product.price,

            is_featured: product.featured,

            is_available: product.isAvailable,
        })
        .eq("id", product.id)
        .select()
        .single();

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    const updated = mapProduct(data);

    updated.ingredients =
        product.ingredients ?? [];

    updated.extras =
        product.extras ?? [];

    return updated;

}

export async function deleteProduct(
    id: string
): Promise<void> {

    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

}

export async function pauseProduct(
    id: string
): Promise<void> {

    const { error } = await supabase
        .from("products")
        .update({
            is_available: false,
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

}

export async function resumeProduct(
    id: string
): Promise<void> {

    const { error } = await supabase
        .from("products")
        .update({
            is_available: true,
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

}