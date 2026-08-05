import { supabase } from "@/lib/supabase";

/**
 * Sube cualquier imagen al Storage y retorna la URL pública.
 */
export async function uploadImage(
    file: File,
    path: string
): Promise<string> {

    const { error } =
        await supabase.storage
            .from("restaurant-images")
            .upload(path, file, {
                upsert: true,
            });

    if (error) {

        console.error(error);

        throw new Error(error.message);

    }

    const { data } =
        supabase.storage
            .from("restaurant-images")
            .getPublicUrl(path);

    return data.publicUrl;

}

/**
 * Elimina cualquier imagen del Storage.
 */
export async function deleteImage(
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