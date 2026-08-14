import { supabase } from "@/lib/supabase";

import { Product } from "@/types/product";

import {
    ProductVariant,
} from "@/types/product-variant";

import {
    replaceVariants,
} from "@/lib/repositories/product-variant.repository";

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

        variants: [],
    };
}

function mapIngredient(data: any) {
    return {
        id: data.id,
        name: data.name,
        isActive: data.is_active,
    };
}

function mapExtra(data: any) {
    return {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        isActive: data.is_active,
    };
}

function mapVariant(data: any): ProductVariant {
    return {
        id: data.id,
        productId: data.product_id,
        label: data.label,
        price: Number(data.price),
        isDefault: data.is_default,
        isAvailable: data.is_available,
        sortOrder: data.sort_order,
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

    const products = (data ?? []).map(mapProduct);

    if (products.length === 0) {
        return [];
    }

    const productIds = products.map(
        (product) => product.id
    );

    /*
     * Cargamos ingredientes, extras y variantes
     * de todos los productos en paralelo.
     */

    const [
        ingredientsResult,
        extrasResult,
        variantsResult,
    ] = await Promise.all([

        supabase
            .from("ingredients")
            .select("*")
            .in("product_id", productIds)
            .order("sort_order", {
                ascending: true,
            }),

        supabase
            .from("extras")
            .select("*")
            .in("product_id", productIds)
            .order("sort_order", {
                ascending: true,
            }),

        supabase
            .from("product_variants")
            .select("*")
            .in("product_id", productIds)
            .order("sort_order", {
                ascending: true,
            }),

    ]);

    if (ingredientsResult.error) {
        console.error(ingredientsResult.error);
        throw new Error(
            ingredientsResult.error.message
        );
    }

    if (extrasResult.error) {
        console.error(extrasResult.error);
        throw new Error(
            extrasResult.error.message
        );
    }

    if (variantsResult.error) {
        console.error(variantsResult.error);
        throw new Error(
            variantsResult.error.message
        );
    }

    /*
     * Agrupamos los resultados por product_id.
     */

    const ingredientsByProduct =
        new Map<string, any[]>();

    for (
        const ingredient
        of ingredientsResult.data ?? []
    ) {

        const list =
            ingredientsByProduct.get(
                ingredient.product_id
            ) ?? [];

        list.push(
            mapIngredient(ingredient)
        );

        ingredientsByProduct.set(
            ingredient.product_id,
            list
        );

    }

    const extrasByProduct =
        new Map<string, any[]>();

    for (
        const extra
        of extrasResult.data ?? []
    ) {

        const list =
            extrasByProduct.get(
                extra.product_id
            ) ?? [];

        list.push(
            mapExtra(extra)
        );

        extrasByProduct.set(
            extra.product_id,
            list
        );

    }

    const variantsByProduct =
        new Map<string, ProductVariant[]>();

    for (
        const variant
        of variantsResult.data ?? []
    ) {

        const list =
            variantsByProduct.get(
                variant.product_id
            ) ?? [];

        list.push(
            mapVariant(variant)
        );

        variantsByProduct.set(
            variant.product_id,
            list
        );

    }

    /*
     * Completamos cada producto.
     */

    for (const product of products) {

        product.ingredients =
            ingredientsByProduct.get(
                product.id
            ) ?? [];

        product.extras =
            extrasByProduct.get(
                product.id
            ) ?? [];

        product.variants =
            variantsByProduct.get(
                product.id
            ) ?? [];

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

    await replaceVariants(
        created.id,
        product.variants ?? []
    );

    created.ingredients =
        product.ingredients ?? [];

    created.extras =
        product.extras ?? [];

    created.variants =
        product.variants ?? [];

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

    await replaceVariants(
        updated.id,
        product.variants ?? []
    );

    updated.ingredients =
        product.ingredients ?? [];

    updated.extras =
        product.extras ?? [];

    updated.variants =
        product.variants ?? [];

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