import { Product } from "@/types/product";

import { updateProduct } from "@/lib/repositories/product.repository";

import {
    getIngredients,
    createIngredient,
    deleteIngredient,
} from "@/lib/repositories/ingredient.repository";

import {
    getExtras,
    createExtra,
    deleteExtra,
} from "@/lib/repositories/extra.repository";

export async function saveCompleteProduct(
    product: Product
): Promise<Product> {

    const updatedProduct =
        await updateProduct(product);

    // ============================
    // INGREDIENTES
    // ============================

    const currentIngredients =
        await getIngredients(product.id);

    const currentIngredientIds =
        new Set(
            currentIngredients.map(
                ingredient => ingredient.id
            )
        );

    const newIngredientIds =
        new Set(
            (product.ingredients ?? []).map(
                ingredient => ingredient.id
            )
        );

    let ingredientSortOrder = 0;

    for (const ingredient of product.ingredients ?? []) {

        if (!currentIngredientIds.has(ingredient.id)) {

            await createIngredient(
                product.id,
                ingredient,
                ingredientSortOrder
            );

        }

        ingredientSortOrder++;

    }

    for (const ingredient of currentIngredients) {

        if (!newIngredientIds.has(ingredient.id)) {

            await deleteIngredient(
                ingredient.id
            );

        }

    }

    // ============================
    // EXTRAS
    // ============================

    const currentExtras =
        await getExtras(product.id);

    const currentExtraIds =
        new Set(
            currentExtras.map(
                extra => extra.id
            )
        );

    const newExtraIds =
        new Set(
            (product.extras ?? []).map(
                extra => extra.id
            )
        );

    let extraSortOrder = 0;

    for (const extra of product.extras ?? []) {

        if (!currentExtraIds.has(extra.id)) {

            await createExtra(
                product.id,
                extra,
                extraSortOrder
            );

        }

        extraSortOrder++;

    }

    for (const extra of currentExtras) {

        if (!newExtraIds.has(extra.id)) {

            await deleteExtra(
                extra.id
            );

        }

    }

    return updatedProduct;

}