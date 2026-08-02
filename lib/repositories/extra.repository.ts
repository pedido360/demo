import { supabase } from "@/lib/supabase";

import { Extra } from "@/types/product";

export async function getExtras(
    productId: string
): Promise<Extra[]> {

    const { data, error } = await supabase
        .from("extras")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", {
            ascending: true,
        });

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return (data ?? []).map((extra) => ({
        id: extra.id,
        name: extra.name,
        price: Number(extra.price),
    }));

}

export async function createExtra(
    productId: string,
    extra: Extra,
    sortOrder: number
): Promise<void> {

    const { error } = await supabase
        .from("extras")
        .insert({
            product_id: productId,

            name: extra.name,

            price: extra.price,

            is_active: true,

            sort_order: sortOrder,
        });

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

}