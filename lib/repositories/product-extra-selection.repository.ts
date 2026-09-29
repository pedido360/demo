import { supabase } from "@/lib/supabase";

import {
    ProductExtraSelectionGroup,
    ProductExtraSelectionGroupItem,
} from "@/types/product-extra-selection";

function mapGroup(row: any): ProductExtraSelectionGroup {
    return {
        id: row.id,
        productId: row.product_id,
        name: row.name,
        minSelections: Number(row.min_selections),
        maxSelections: Number(row.max_selections),
        isActive: row.is_active,
        sortOrder: Number(row.sort_order),
        items: [],
    };
}

function mapItem(row: any): ProductExtraSelectionGroupItem {
    return {
        id: row.id,
        groupId: row.group_id,
        extraId: row.extra_id,
        sortOrder: Number(row.sort_order),
    };
}

export async function getProductExtraSelectionGroups(
    productId: string
): Promise<ProductExtraSelectionGroup[]> {

    const { data: groups, error: groupsError } =
        await supabase
            .from("product_extra_selection_groups")
            .select("*")
            .eq("product_id", productId)
            .order("sort_order", {
                ascending: true,
            });

    if (groupsError) {
        console.error(groupsError);
        throw new Error(groupsError.message);
    }

    const mappedGroups =
        (groups ?? []).map(mapGroup);

    if (mappedGroups.length === 0) {
        return [];
    }

    const groupIds =
        mappedGroups.map(group => group.id);

    const { data: items, error: itemsError } =
        await supabase
            .from("product_extra_selection_group_items")
            .select("*")
            .in("group_id", groupIds)
            .order("sort_order", {
                ascending: true,
            });

    if (itemsError) {
        console.error(itemsError);
        throw new Error(itemsError.message);
    }

    const itemsByGroup =
        new Map<string, ProductExtraSelectionGroupItem[]>();

    for (const row of items ?? []) {

        const item = mapItem(row);

        const list =
            itemsByGroup.get(item.groupId) ?? [];

        list.push(item);

        itemsByGroup.set(
            item.groupId,
            list
        );
    }

    return mappedGroups.map(group => ({
        ...group,
        items:
            itemsByGroup.get(group.id) ?? [],
    }));

}

export async function createProductExtraSelectionGroup(
    group: ProductExtraSelectionGroup
): Promise<ProductExtraSelectionGroup> {

    const { data, error } =
        await supabase
            .from("product_extra_selection_groups")
            .insert({
                product_id: group.productId,
                name: group.name.trim(),
                min_selections: group.minSelections,
                max_selections: group.maxSelections,
                is_active: group.isActive,
                sort_order: group.sortOrder,
            })
            .select()
            .single();

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    const created = mapGroup(data);

    await replaceProductExtraSelectionGroupItems(
        created.id,
        group.items ?? []
    );

    created.items =
        group.items ?? [];

    return created;

}

export async function updateProductExtraSelectionGroup(
    group: ProductExtraSelectionGroup
): Promise<void> {

    const { error } =
        await supabase
            .from("product_extra_selection_groups")
            .update({
                name: group.name.trim(),
                min_selections: group.minSelections,
                max_selections: group.maxSelections,
                is_active: group.isActive,
                sort_order: group.sortOrder,
                updated_at: new Date().toISOString(),
            })
            .eq("id", group.id);

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    await replaceProductExtraSelectionGroupItems(
        group.id,
        group.items ?? []
    );

}

export async function deleteProductExtraSelectionGroup(
    id: string
): Promise<void> {

    const { error } =
        await supabase
            .from("product_extra_selection_groups")
            .delete()
            .eq("id", id);

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

}

export async function replaceProductExtraSelectionGroupItems(
    groupId: string,
    items: ProductExtraSelectionGroupItem[]
): Promise<void> {

    const uniqueItems =
        Array.from(
            new Map(
                items.map(item => [
                    item.extraId,
                    item,
                ])
            ).values()
        );

    const { error: deleteError } =
        await supabase
            .from("product_extra_selection_group_items")
            .delete()
            .eq("group_id", groupId);

    if (deleteError) {
        console.error(deleteError);
        throw new Error(deleteError.message);
    }

    if (uniqueItems.length === 0) {
        return;
    }

    const rows =
        uniqueItems.map(
            (item, index) => ({
                group_id: groupId,
                extra_id: item.extraId,
                sort_order:
                    Number.isInteger(item.sortOrder)
                        ? item.sortOrder
                        : index,
            })
        );

    const { error: insertError } =
        await supabase
            .from("product_extra_selection_group_items")
            .insert(rows);

    if (insertError) {
        console.error(insertError);
        throw new Error(insertError.message);
    }

}
