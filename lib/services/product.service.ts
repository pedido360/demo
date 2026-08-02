import { Product } from "@/types/product";

import { updateProduct } from "@/lib/repositories/product.repository";

import {
    getIngredients,
    createIngredient,
    deleteIngredient,
} from "@/lib/repositories/ingredient.repository";

export async function saveCompleteProduct(
    product: Product
): Promise<Product> {

    const updatedProduct =
        await updateProduct(product);

    const currentIngredients =
        await getIngredients(product.id);

    const currentIds =
        new Set(
            currentIngredients.map(
                ingredient => ingredient.id
            )
        );

    const newIds =
        new Set(
            (product.ingredients ?? []).map(
                ingredient => ingredient.id
            )
        );

    // Crear ingredientes nuevos

    let sortOrder = 0;

    for (const ingredient of product.ingredients ?? []) {

        if (!currentIds.has(ingredient.id)) {

            await createIngredient(
                product.id,
                ingredient,
                sortOrder
            );

        }

        sortOrder++;

    }

    // Eliminar ingredientes borrados

    for (const ingredient of currentIngredients) {

        if (!newIds.has(ingredient.id)) {

            await deleteIngredient(
                ingredient.id
            );

        }

    }

    return updatedProduct;

}