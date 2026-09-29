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

import {
    ProductExtraSelectionGroup,
} from "@/types/product-extra-selection";

import {
    getProductExtraSelectionGroups,
    createProductExtraSelectionGroup,
    updateProductExtraSelectionGroup,
    deleteProductExtraSelectionGroup,
} from "@/lib/repositories/product-extra-selection.repository";

function validateProductExtraSelectionGroup(
    group: ProductExtraSelectionGroup,
    validExtraIds: Set<string>
) {

    const name = group.name.trim();

    if (!name) {
        throw new Error(
            "El nombre del grupo de extras es obligatorio."
        );
    }

    const minSelections = Number(
        group.minSelections
    );

    const maxSelections = Number(
        group.maxSelections
    );

    if (
        !Number.isInteger(minSelections) ||
        minSelections < 1
    ) {
        throw new Error(
            `El grupo "${name}" debe exigir al menos 1 selección.`
        );
    }

    if (
        !Number.isInteger(maxSelections) ||
        maxSelections < minSelections
    ) {
        throw new Error(
            `La selección máxima del grupo "${name}" no puede ser menor que la mínima.`
        );
    }

    const extraIds = Array.from(
        new Set(
            (group.items ?? []).map(
                item => item.extraId
            )
        )
    );

    if (extraIds.length === 0) {
        throw new Error(
            `El grupo "${name}" debe tener al menos un extra.`
        );
    }

    if (minSelections > extraIds.length) {
        throw new Error(
            `El grupo "${name}" no tiene suficientes extras para la selección mínima.`
        );
    }

    if (maxSelections > extraIds.length) {
        throw new Error(
            `El grupo "${name}" no tiene suficientes extras para la selección máxima.`
        );
    }

    for (const extraId of extraIds) {

        if (!validExtraIds.has(extraId)) {
            throw new Error(
                `El grupo "${name}" contiene un extra que no pertenece al producto.`
            );
        }

    }

}


async function createProductExtraSelectionGroups(
    productId: string,
    groups: ProductExtraSelectionGroup[],
    validExtraIds: Set<string>
) {

    for (const group of groups) {

        validateProductExtraSelectionGroup(
            group,
            validExtraIds
        );

        await createProductExtraSelectionGroup({
            ...group,
            productId,
            items: group.items ?? [],
        });

    }

}


async function saveProductExtraSelectionGroups(
    productId: string,
    groups: ProductExtraSelectionGroup[],
    validExtraIds: Set<string>
) {

    const currentGroups =
        await getProductExtraSelectionGroups(
            productId
        );

    const currentGroupIds = new Set(
        currentGroups.map(
            group => group.id
        )
    );

    const newGroupIds = new Set(
        groups.map(
            group => group.id
        )
    );

    for (const group of groups) {

        validateProductExtraSelectionGroup(
            group,
            validExtraIds
        );

        if (currentGroupIds.has(group.id)) {

            await updateProductExtraSelectionGroup({
                ...group,
                productId,
                items: group.items ?? [],
            });

        } else {

            await createProductExtraSelectionGroup({
                ...group,
                productId,
                items: group.items ?? [],
            });

        }

    }

    for (const currentGroup of currentGroups) {

        if (!newGroupIds.has(currentGroup.id)) {

            await deleteProductExtraSelectionGroup(
                currentGroup.id
            );

        }

    }

}


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

    const createdExtraIds =
        new Set(
            createdProduct.extras.map(
                extra => extra.id
            )
        );

    await createProductExtraSelectionGroups(
        createdProduct.id,
        product.extraSelectionGroups ?? [],
        createdExtraIds
    );

    createdProduct.extraSelectionGroups =
        await getProductExtraSelectionGroups(
            createdProduct.id
        );


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

    const savedExtras =
        await getExtras(product.id);

    const validExtraIds =
        new Set(
            savedExtras.map(
                extra => extra.id
            )
        );

    await saveProductExtraSelectionGroups(
        product.id,
        product.extraSelectionGroups ?? [],
        validExtraIds
    );

    updatedProduct.extraSelectionGroups =
        await getProductExtraSelectionGroups(
            product.id
        );

    return updatedProduct;

}