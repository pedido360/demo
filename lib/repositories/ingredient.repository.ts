import { supabase } from "@/lib/supabase";

import { Ingredient } from "@/types/product";

export async function getIngredients(
    productId: string
): Promise<Ingredient[]> {

    const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", {
            ascending: true,
        });

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return (data ?? []).map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
    }));

}

export async function createIngredient(
    productId: string,
    ingredient: Ingredient,
    sortOrder: number
): Promise<void> {

    const { error } = await supabase
        .from("ingredients")
        .insert({
            product_id: productId,

            name: ingredient.name,

            is_removable: true,

            sort_order: sortOrder,
        });

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

}