import { supabase } from "@/lib/supabase";

import {
    ExtraCatalogItem,
    ExtraGroup,
    ExtraGroupItem,
    ProductExtraGroup,
} from "@/types/extra-catalog";


export async function getExtraCatalog(
    restaurantId: string
): Promise<ExtraCatalogItem[]> {

    const { data, error } = await supabase
        .from("extra_catalog")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", {
            ascending: true,
        });

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return (data ?? []).map((extra) => ({
        id: extra.id,
        restaurantId: extra.restaurant_id,
        name: extra.name,
        price: Number(extra.price),
        isActive: extra.is_active,
        sortOrder: extra.sort_order,
    }));

}


export async function createExtraCatalogItem(
    extra: ExtraCatalogItem
): Promise<ExtraCatalogItem> {

    const { data, error } = await supabase
        .from("extra_catalog")
        .insert({
            restaurant_id: extra.restaurantId,
            name: extra.name,
            price: extra.price,
            is_active: extra.isActive,
            sort_order: extra.sortOrder,
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return {
        id: data.id,
        restaurantId: data.restaurant_id,
        name: data.name,
        price: Number(data.price),
        isActive: data.is_active,
        sortOrder: data.sort_order,
    };

}


export async function updateExtraCatalogItem(
    extra: ExtraCatalogItem
): Promise<void> {

    const { error } = await supabase
        .from("extra_catalog")
        .update({
            name: extra.name,
            price: extra.price,
            is_active: extra.isActive,
            sort_order: extra.sortOrder,
            updated_at: new Date().toISOString(),
        })
        .eq("id", extra.id);

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

}


export async function deleteExtraCatalogItem(
    id: string
): Promise<void> {

    const { error } = await supabase
        .from("extra_catalog")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

}


export async function getExtraGroups(
    restaurantId: string
): Promise<ExtraGroup[]> {

    const { data, error } = await supabase
        .from("extra_groups")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", {
            ascending: true,
        });

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return (data ?? []).map((group) => ({
        id: group.id,
        restaurantId: group.restaurant_id,
        name: group.name,
        isActive: group.is_active,
        sortOrder: group.sort_order,
    }));

}


export async function createExtraGroup(
    group: ExtraGroup
): Promise<ExtraGroup> {

    const { data, error } = await supabase
        .from("extra_groups")
        .insert({
            restaurant_id: group.restaurantId,
            name: group.name,
            is_active: group.isActive,
            sort_order: group.sortOrder,
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return {
        id: data.id,
        restaurantId: data.restaurant_id,
        name: data.name,
        isActive: data.is_active,
        sortOrder: data.sort_order,
    };

}


export async function updateExtraGroup(
    group: ExtraGroup
): Promise<void> {

    const { error } = await supabase
        .from("extra_groups")
        .update({
            name: group.name,
            is_active: group.isActive,
            sort_order: group.sortOrder,
            updated_at: new Date().toISOString(),
        })
        .eq("id", group.id);

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

}


export async function deleteExtraGroup(
    id: string
): Promise<void> {

    const { error } = await supabase
        .from("extra_groups")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

}


export async function getExtraGroupItems(
    groupId: string
): Promise<ExtraGroupItem[]> {

    const { data, error } = await supabase
        .from("extra_group_items")
        .select("*")
        .eq("group_id", groupId)
        .order("sort_order", {
            ascending: true,
        });

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return (data ?? []).map((item) => ({
        groupId: item.group_id,
        extraId: item.extra_id,
        sortOrder: item.sort_order,
    }));

}


export async function replaceExtraGroupItems(
    groupId: string,
    items: ExtraGroupItem[]
): Promise<void> {

    const { error: deleteError } = await supabase
        .from("extra_group_items")
        .delete()
        .eq("group_id", groupId);

    if (deleteError) {
        console.error(deleteError);
        throw new Error(deleteError.message);
    }

    if (items.length === 0) {
        return;
    }

    const { error: insertError } = await supabase
        .from("extra_group_items")
        .insert(
            items.map((item) => ({
                group_id: groupId,
                extra_id: item.extraId,
                sort_order: item.sortOrder,
            }))
        );

    if (insertError) {
        console.error(insertError);
        throw new Error(insertError.message);
    }

}


export async function getProductExtraGroups(
    productId: string
): Promise<ProductExtraGroup[]> {

    const { data, error } = await supabase
        .from("product_extra_groups")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", {
            ascending: true,
        });

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return (data ?? []).map((item) => ({
        productId: item.product_id,
        groupId: item.group_id,
        sortOrder: item.sort_order,
    }));

}


export async function replaceProductExtraGroups(
    productId: string,
    groups: ProductExtraGroup[]
): Promise<void> {

    const { error: deleteError } = await supabase
        .from("product_extra_groups")
        .delete()
        .eq("product_id", productId);

    if (deleteError) {
        console.error(deleteError);
        throw new Error(deleteError.message);
    }

    if (groups.length === 0) {
        return;
    }

    const { error: insertError } = await supabase
        .from("product_extra_groups")
        .insert(
            groups.map((group) => ({
                product_id: productId,
                group_id: group.groupId,
                sort_order: group.sortOrder,
            }))
        );

    if (insertError) {
        console.error(insertError);
        throw new Error(insertError.message);
    }

}
