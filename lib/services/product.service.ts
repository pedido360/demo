import { Product } from "@/types/product";

import {
    createProduct,
    updateProduct,
} from "@/lib/repositories/product.repository";

import {
    uploadImage,
} from "@/lib/repositories/storage.repository";

import {
    getIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
} from "@/lib/repositories/ingredient.repository";

import {
    getExtras,
    createExtra,
    updateExtra,
    deleteExtra,
} from "@/lib/repositories/extra.repository";

export async function createCompleteProduct(
    restaurantId: string,
    product: Product
): Promise<Product> {

    let productToCreate = {
        ...product,
    };

    if (product.imageFile) {

        const extension =
            product.imageFile.name
                .split(".")
                .pop()
                ?.toLowerCase() ?? "jpg";

        productToCreate.image =
            await uploadImage(
                product.imageFile,
                `restaurants/${restaurantId}/products/${crypto.randomUUID()}.${extension}`
            );

    }

    const createdProduct =
        await createProduct(
            restaurantId,
            product.categoryId,
            productToCreate
        );

    let ingredientSortOrder = 0;

    for (const ingredient of product.ingredients ?? []) {

        await createIngredient(
            createdProduct.id,
            ingredient,
            ingredientSortOrder++
        );

    }

    let extraSortOrder = 0;

    for (const extra of product.extras ?? []) {

        await createExtra(
            createdProduct.id,
            extra,
            extraSortOrder++
        );

    }

    createdProduct.ingredients =
        await getIngredients(createdProduct.id);

    createdProduct.extras =
        await getExtras(createdProduct.id);

    return createdProduct;

}

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

        } else {

            await updateIngredient(
                ingredient
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

        } else {

            await updateExtra(
                extra
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