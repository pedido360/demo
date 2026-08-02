import { supabase } from "@/lib/supabase";

import { getCategoryEmoji } from "@/lib/getCategoryEmoji";

import { Category } from "@/types/category";

function mapCategory(data: any): Category {
    return {
        id: data.id,

        name: data.name,

        description: "",

        emoji: getCategoryEmoji(data.name),

        isActive: data.is_active,
    };
}

export async function getCategories(
    restaurantId: string
): Promise<Category[]> {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", {
            ascending: true,
        });

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

    return (data ?? []).map(mapCategory);
}

export async function createCategory(
    restaurantId: string,
    category: Category
): Promise<Category> {
    const { data, error } = await supabase
        .from("categories")
        .insert({
            restaurant_id: restaurantId,

            name: category.name,

            is_active: category.isActive,
        })
        .select()
        .single();

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

    return mapCategory(data);
}

export async function updateCategory(
    category: Category
): Promise<Category> {
    const { data, error } = await supabase
        .from("categories")
        .update({
            name: category.name,

            is_active: category.isActive,
        })
        .eq("id", category.id)
        .select()
        .single();

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

    return mapCategory(data);
}

export async function deleteCategory(
    id: string
): Promise<void> {
    const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }
}

export async function pauseCategory(
    id: string
): Promise<void> {
    const { error } = await supabase
        .from("categories")
        .update({
            is_active: false,
        })
        .eq("id", id);

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }
}

export async function resumeCategory(
    id: string
): Promise<void> {
    const { error } = await supabase
        .from("categories")
        .update({
            is_active: true,
        })
        .eq("id", id);

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }
}