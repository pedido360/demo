import { supabase } from "@/lib/supabase";

import { ProductVariant } from "@/types/product-variant";

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

export async function getVariants(
    productId: string
): Promise<ProductVariant[]> {

    const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", {
            ascending: true,
        });

    if (error) {

        console.error(error);

        throw new Error(error.message);

    }

    return (data ?? []).map(mapVariant);

}

export async function replaceVariants(
    productId: string,
    variants: ProductVariant[]
): Promise<void> {

    const { error: deleteError } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId);

    if (deleteError) {

        console.error(deleteError);

        throw new Error(deleteError.message);

    }

    if (variants.length === 0) {

        return;

    }

    const { error: insertError } = await supabase
        .from("product_variants")
        .insert(

            variants.map((variant) => ({

                product_id: productId,

                label: variant.label,

                price: variant.price,

                is_default: variant.isDefault,

                is_available: variant.isAvailable,

                sort_order: variant.sortOrder,

            }))

        );

    if (insertError) {

        console.error(insertError);

        throw new Error(insertError.message);

    }

}