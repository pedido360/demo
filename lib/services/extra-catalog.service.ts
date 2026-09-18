import {
    ExtraCatalogItem,
    ExtraGroup,
    ExtraGroupItem,
    ProductExtraGroup,
} from "@/types/extra-catalog";

import {
    getExtraCatalog,
    createExtraCatalogItem,
    updateExtraCatalogItem,
    deleteExtraCatalogItem,
    getExtraGroups,
    createExtraGroup,
    updateExtraGroup,
    deleteExtraGroup,
    getExtraGroupItems,
    replaceExtraGroupItems,
    getProductExtraGroups,
    replaceProductExtraGroups,
} from "@/lib/repositories/extra-catalog.repository";


export async function listExtraCatalog(
    restaurantId: string
): Promise<ExtraCatalogItem[]> {

    return await getExtraCatalog(restaurantId);

}


export async function saveExtraCatalogItem(
    extra: ExtraCatalogItem
): Promise<ExtraCatalogItem> {

    if (!extra.name.trim()) {
        throw new Error("El nombre del extra es obligatorio.");
    }

    if (extra.price < 0) {
        throw new Error("El precio del extra no puede ser negativo.");
    }

    if (!extra.id) {
        return await createExtraCatalogItem(extra);
    }

    await updateExtraCatalogItem(extra);

    return extra;

}


export async function removeExtraCatalogItem(
    id: string
): Promise<void> {

    await deleteExtraCatalogItem(id);

}


export async function listExtraGroups(
    restaurantId: string
): Promise<ExtraGroup[]> {

    return await getExtraGroups(restaurantId);

}


export async function saveExtraGroup(
    group: ExtraGroup
): Promise<ExtraGroup> {

    if (!group.name.trim()) {
        throw new Error("El nombre del grupo es obligatorio.");
    }

    if (!group.id) {
        return await createExtraGroup(group);
    }

    await updateExtraGroup(group);

    return group;

}


export async function removeExtraGroup(
    id: string
): Promise<void> {

    await deleteExtraGroup(id);

}


export async function listExtraGroupItems(
    groupId: string
): Promise<ExtraGroupItem[]> {

    return await getExtraGroupItems(groupId);

}


export async function saveExtraGroupItems(
    groupId: string,
    items: ExtraGroupItem[]
): Promise<void> {

    await replaceExtraGroupItems(
        groupId,
        items
    );

}


export async function listProductExtraGroups(
    productId: string
): Promise<ProductExtraGroup[]> {

    return await getProductExtraGroups(productId);

}


export async function saveProductExtraGroups(
    productId: string,
    groups: ProductExtraGroup[]
): Promise<void> {

    await replaceProductExtraGroups(
        productId,
        groups
    );

}
