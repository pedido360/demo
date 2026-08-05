import { supabase } from "@/lib/supabase";

/**
 * Sube una imagen del restaurante.
 */
export async function uploadRestaurantImage(
    restaurantSlug: string,
    type: "logo" | "banner",
    file: File
): Promise<string> {

    const extension =
        file.name.split(".").pop()?.toLowerCase() ?? "jpg";

    const path =
        `restaurants/${restaurantSlug}/${type}.${extension}`;

    const { error } =
        await supabase.storage
            .from("restaurant-images")
            .upload(
                path,
                file,
                {
                    upsert: true,
                }
            );

    if (error) {

        console.error(error);

        throw new Error(error.message);

    }

    const {
        data,
    } =
        supabase.storage
            .from("restaurant-images")
            .getPublicUrl(path);

    return data.publicUrl;

}

/**
 * Elimina una imagen.
 */
export async function deleteRestaurantImage(
    path: string
): Promise<void> {

    const { error } =
        await supabase.storage
            .from("restaurant-images")
            .remove([path]);

    if (error) {

        console.error(error);

        throw new Error(error.message);

    }

}